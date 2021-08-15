import { BufReader } from "https://deno.land/std@0.104.0/io/bufio.ts";
import { Buffer } from "https://deno.land/std@0.104.0/io/buffer.ts";
import { copy } from "https://deno.land/std@0.104.0/io/util.ts";
import { concat } from "https://deno.land/std@0.104.0/bytes/mod.ts";
import { IPv6, IPv6CidrRange, Validator } from "https://esm.sh/ip-num@1.3.3";

import RateLimiter from "./rateLimit.ts"

const privateIPv6Range = IPv6CidrRange.fromCidr("fd00::/7");

const PRIVATE_IP_REGEX =
  /^(?:10|127|172\.(?:1[6-9]|2[0-9]|3[01])|192\.168)\..*/;

const isPrivateV4 = (ip: string) => {
  return !!PRIVATE_IP_REGEX.exec(ip);
};

const isPrivateV6 = (ip: string) => {
  const ipv6 = IPv6.fromString(ip);
  return ipv6.isGreaterThanOrEquals(privateIPv6Range.getFirst()) &&
    ipv6.isLessThanOrEquals(privateIPv6Range.getLast());
};

const isValidV4 = (ip: string) => {
  try {
    return Validator.isValidIPv4String(ip) && !isPrivateV4(ip);
  } catch {
    return false;
  }
};

const isValidV6 = (ip: string) => {
  try {
    return Validator.isValidIPv6String(ip) && !isPrivateV6(ip);
  } catch {
    return false;
  }
};

const isValidHost = (host: string) => {
  return (isValidV4(host) || isValidV6(host)) ||
    (host.includes(".") && !host.endsWith(".local"));
};

type ReceivedMessage = {
  type: "EXECUTE";
  command: string;
  args: string[];
  id: string;
};

const decoder = new TextDecoder();

// Executors
type Executor = (...args: any[]) => Deno.Reader | null;

const execPing: Executor = (ip: string) => {
  if (!isValidV4(ip)) return null;
  const process = Deno.run({
    cmd: ["ping", ip, "-t", "4"],
    stdin: "piped",
    stderr: "piped",
    stdout: "piped",
  });
  process.stderr.read(new Uint8Array(10)).then(() => process.kill(9));
  return process.stdout!;
};

const execPing6: Executor = (ip: string) => {
  if (!isValidV6(ip)) return null;
  const process = Deno.run({
    cmd: ["ping6", ip, "-t", "4"],
    stdin: "piped",
    stderr: "piped",
    stdout: "piped",
  });
  process.stderr.read(new Uint8Array(10)).then(() => process.kill(9));
  return process.stdout!;
};

const execHost: Executor = (host: string) => {
  if (!isValidHost(host)) return null;
  const process = Deno.run({
    cmd: ["host", "-W", "10", host],
    stdin: "piped",
    stderr: "piped",
    stdout: "piped",
  });
  process.stderr.read(new Uint8Array(10)).then(() => process.kill(9));
  return process.stdout!;
};

const execTraceroute4: Executor = (host: string) => {
  if (!isValidHost(host) || isValidV6(host)) return null;
  let cmd = ["traceroute", "-4", "-w2", host, "2"];
  if (Deno.build.os === "darwin") {
    cmd = ["traceroute", "-w2", host];
  }
  const process = Deno.run({
    cmd: cmd,
    stdin: "piped",
    stderr: "piped",
    stdout: "piped",
  });
  return process.stdout;
};

const execTraceroute6: Executor = (host: string) => {
  if (!isValidHost(host) || isValidV4(host)) return null;
  let cmd = ["traceroute", "-6", "-w2", host, "2"];
  if (Deno.build.os === "darwin") {
    cmd = ["traceroute6", "-w2", host];
  }
  const process = Deno.run({
    cmd: cmd,
    stdin: "piped",
    stderr: "piped",
    stdout: "piped",
  });
  const stream = new Buffer();
  stream.writeSync(new Uint8Array([63]));
  copy(process.stdout, stream);
  copy(process.stderr, stream);
  return stream;
};

async function readFullLine(bufReader: BufReader): Promise<Uint8Array | null> {
  const chunks: Uint8Array[] = [];
  let hasData = false;
  while (true) {
    const res = await bufReader.readLine();
    if (!res) break;
    chunks.push(res.line.slice());
    hasData = true;
    if (res.more) {
      continue;
    } else {
      break;
    }
  }
  if (!hasData) return null;
  return concat(...chunks);
}

async function executeCommand(
  socket: WebSocket,
  id: string,
  command: string,
  args: string[],
) {
  if (!args.length) return;
  let reader: Deno.Reader | null = null;
  if (command === "ping") {
    reader = execPing(args[0]);
  } else if (command === "ping6") {
    reader = execPing6(args[0]);
  } else if (command === "host") {
    reader = execHost(args[0]);
  } else if (command === "traceroute4") {
    reader = execTraceroute4(args[0]);
  } else if (command === "traceroute6") {
    reader = execTraceroute6(args[0]);
  }
  if (!reader) {
    socket.send(JSON.stringify({ id, type: "ERROR" }));
    return;
  }
  const bufReader = new BufReader(reader, 1024);
  while (true) {
    const line = await readFullLine(bufReader);
    if (!line) break;
    socket.send(
      JSON.stringify({
        id,
        type: "LINE",
        text: decoder.decode(line),
      }),
    );
  }
  JSON.stringify({
    id,
    type: "EOF",
  });
}

const limiter = new RateLimiter(5 * 1000);
export function handleSocket(socket: WebSocket, ip: string) {
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data) as ReceivedMessage;
    const { command, id, args } = message;
    if (limiter.get(ip) > 5) return;
    executeCommand(socket, id, command, args);
    limiter.incr(ip);
  });
}
