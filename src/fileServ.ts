import {
  Application,
  parseRange,
  Router,
} from "https://deno.land/x/oak@v8.0.0/mod.ts";

class FakeFileReader implements Deno.Reader {
  private readBytes = 0;
  constructor(private size: number) {}
  // deno-lint-ignore require-await
  read = async (p: Uint8Array): Promise<number | null> => {
    const remLength = this.size - this.readBytes;
    if (remLength <= 0) return null;
    crypto.getRandomValues(p);
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
