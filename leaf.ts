import { Leaf } from "./src/leafCompiler.ts";

Leaf.compile({
  modulePath: "./src/index.tsx",
  contentFolders: ["./client/build", "./assets"],
  output: "./dist/looking_glass",
  flags: Deno.args,
});
