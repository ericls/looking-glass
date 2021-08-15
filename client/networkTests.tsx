import React from "react";
import cx from "classnames";
import { ReplaySubject } from "rxjs";
import ReconnectingWebSocket from "reconnecting-websocket";

type Command = "ping" | "pin6" | "host" | "traceroute";
type ReceivedMessage = {
  id: string;
} & (
  | {
      type: "ERROR";
    }
  | { type: "LINE"; text: string }
  | {
      type: "EOF";
    }
);

class SocketClient {
  socket: ReconnectingWebSocket;
  executionOutput: { [key: string]: ReplaySubject<string> } = {};
  static instance?: SocketClient;
  constructor() {
    const scheme = window.location.protocol === "https:" ? "wss" : "ws";
    this.socket = new ReconnectingWebSocket(
      `${scheme}://${window.location.host}/ws`
    );
    this.socket.addEventListener("message", this.onMessage);
  }
  static getClient = () => {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  };
  onMessage = (event: MessageEvent<string>) => {
    const message = JSON.parse(event.data) as ReceivedMessage;
    const { id, type } = message;
    if (!(id in this.executionOutput)) return;
    const subject = this.executionOutput[id];
    if (type === "EOF" || type === "ERROR") {
      subject.complete();
      delete this.executionOutput[id];
    } else if (type === "LINE") {
      subject.next(message.text);
    } else {
      throw new Error("unknown message type: " + type);
    }
  };
  executeCommand = (command: Command, args: string[]) => {
    const id = (Math.random() + 1).toString(36).substring(7);
    const subject = new ReplaySubject<string>(undefined, 3600);
    this.executionOutput[id] = subject;
    this.socket.send(JSON.stringify({ type: "EXECUTE", command, args, id }));
    return id;
  };
}

function NetworkTestResult({ id }: { id: string }) {
  const [lines, setLines] = React.useState<string[]>([]);
  const addLine = React.useCallback(
    (line: string) => {
      setLines((v) => [...v, line]);
    },
    [setLines]
  );
  React.useEffect(() => {
    setLines([]);
  }, [id, setLines]);
  React.useEffect(() => {
    const sub = SocketClient.getClient().executionOutput[id].subscribe(addLine);
    return () => {
      sub.unsubscribe();
    };
  }, [addLine, id]);
  if (!lines.length) return null;
  return <pre className={window.classes.resultBox}>{lines.join("\n")}</pre>;
}

export default function NetworkTests() {
  const client = SocketClient.getClient();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [currentResultId, setCurrentResultId] = React.useState<null | string>(
    null
  );
  const onSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!formRef.current) return;
      const formData = new FormData(formRef.current);
      const args = formData.get("args");
      const command = formData.get("command");
      const id = client.executeCommand(command as Command, [String(args)]);
      setCurrentResultId(id);
      e.stopPropagation();
    },
    [client, setCurrentResultId]
  );
  return (
    <>
      <h3 className={cx(window.classes.h3)}>Network Tests</h3>
      <form
        className={cx(window.classes.networkTestsForm)}
        onSubmit={onSubmit}
        ref={formRef}
      >
        <input name="args" placeholder="Host or IP address"></input>
        <select name="command">
          <option value="ping">ping</option>
          <option value="ping6">ping6</option>
          <option value="host">host</option>
          <option value="traceroute4">traceroute</option>
          <option value="traceroute6">traceroute6</option>
        </select>
        <button type="submit">Run</button>
      </form>
      {currentResultId && <NetworkTestResult id={currentResultId} />}
    </>
  );
}
