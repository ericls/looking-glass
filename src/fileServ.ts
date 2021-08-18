import {
  Application,
  parseRange,
  Router,
} from "https://deno.land/x/oak@v9.0.0/mod.ts";

const FILLER_LENGTH = 32768;
const FILLER_BYTES: Readonly<Uint8Array> = new Uint8Array(FILLER_LENGTH);
crypto.getRandomValues(FILLER_BYTES);

function fill(p: Uint8Array) {
  let remLength = p.byteLength;
  while (remLength) {
    if (remLength >= FILLER_LENGTH) {
      p.set(FILLER_BYTES, p.byteLength - remLength);
      remLength -= FILLER_LENGTH;
    } else {
      p.set(FILLER_BYTES.slice(0, remLength), p.byteLength - remLength);
      remLength = 0;
    }
  }
}

class FakeFileReader implements Deno.Reader {
  private readBytes = 0;
  constructor(private size: number) {}
  // deno-lint-ignore require-await
  read = async (p: Uint8Array): Promise<number | null> => {
    const remLength = this.size - this.readBytes;
    if (remLength <= 0) return null;
    fill(p)
    const reportingLength = Math.min(p.byteLength, remLength);
    this.readBytes += reportingLength;
    return reportingLength;
  };
}

export const SIZES: [string, number][] = [
  ["10MB", 10_000_000],
  ["50MB", 50_000_000],
  ["100MB", 100_000_000],
  ["200MB", 200_000_000],
  ["500MB", 500_000_000],
  ["1000MB", 1_000_000_000],
];

export function useFileServe(app: Application) {
  const router = new Router({ prefix: "/file" });
  SIZES.forEach(([url, size]) => {
    router.get(`/${url}.test`, (context) => {
      const rangeHeader = context.request.headers.get("range");
      if (rangeHeader) {
        const ranges = parseRange(rangeHeader, size);
        const actualSise = ranges.map((range) => range.end - range.start)
          .reduce((acc, i) => acc + i, 0);
        context.response.body = new FakeFileReader(actualSise);
        return;
      }
      context.response.body = new FakeFileReader(size);
    });
  });
  app.use(router.routes());
}
