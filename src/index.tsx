/// <reference path="./global.d.ts" />
import { join, resolve } from "https://deno.land/std@0.104.0/path/mod.ts";
import { yellow } from "https://deno.land/std@0.104.0/fmt/colors.ts";
import { existsSync } from "https://deno.land/std@0.104.0/fs/mod.ts";
import { parse as parseToml } from "https://deno.land/std@0.104.0/encoding/toml.ts";
import React from "https://esm.sh/react@17.0.2?dts";
import { renderToString } from "https://esm.sh/react-dom@17.0.2/server?dts";
import {
  Application,
  HttpServerStd,
  Request,
  Response,
  Router,
} from "https://deno.land/x/oak@v8.0.0/mod.ts";
import { cac } from "https://unpkg.com/cac/mod.ts";

import { OakReactContext } from "./components/context.tsx";
import { Root } from "./components/root.tsx";

import { Leaf } from "./leafCompiler.ts";
import { handleSocket } from "./socket.ts";
import { useFileServe } from "./fileServ.ts";
import { sheet } from "./style.tsx";

const defaultConfigContent = Leaf.readTextFileSync("./assets/defaultConfig.toml");

window.siteSettings = {
  siteTitle: "",
  serverLocation: "",
  sitePageHeader: "",
  ipAddress: [],
  links: [],
  jsVer: "",
};

const encoder = new TextEncoder();
const denoLogger = async (
  { response, request }: { response: Response; request: Request },
  next: () => unknown,
) => {
  const start = performance.now();
  await next();
  const end = performance.now();
  const ua = request.headers.get("user-agent") || "-";
  const ref = request.headers.get("referer") || "-";
  const status = response.status;
  const logString = `${request.ip} - - [${
    new Date().toLocaleString()
  }] "${request.method} ${request.url.pathname}" ${
    status.toString(10)
  }  ${ua} ${ref} ${(end -
    start).toFixed(3)}ms`;
  Deno.stdout.write(encoder.encode(logString + "\n"));
};

const router = new Router();
const jsContent = Leaf.readTextFileSync("./client/build/index.js");
router.get("/", (context) => {
  context.response.body = renderToString(
    <OakReactContext.Provider value={context}>
      <Root />
    </OakReactContext.Provider>,
  );
});
router.get("/ws", async (context) => {
  if (context.isUpgradable) {
    const socket = await context.upgrade();
    handleSocket(socket, context.request.ip);
  }
  context.response.body = "not found";
});
router.get("/index.js", (context) => {
  context.response.body = `window.siteSettings=JSON.parse('${
    JSON.stringify(
      window.siteSettings,
    )
  }');` +
    `
      window.classes = JSON.parse('${JSON.stringify(sheet.classes)}');
    ` +
    jsContent;
});

const app = cac("Looking glass");
app
  .command("")
  .option("--config <configPath>", "Config file path", {
    default: "./config.toml",
  })
  .action((options) => {
    const configFilePath = resolve(join(Deno.cwd(), options.config));
    if (!existsSync(configFilePath)) {
      console.log(yellow("Creating default config at: " + configFilePath));
      const file = Deno.openSync(configFilePath, {create: true, write: true});
      file.writeSync(encoder.encode(defaultConfigContent));
      file.close();
    }
    console.log("Reading config from:", configFilePath);
    const configString = Deno.readTextFileSync(configFilePath);
    const config = parseToml(configString) as {
      lg: Window["siteSettings"] & {
        server?: { bind: string };
      };
    };
    window.siteSettings = config.lg;
    // @ts-ignore: "input"
    const { bind } = config.lg.server;
    // @ts-ignore: "input"
    delete window.siteSettings.server
    const httpServer = new Application({ serverConstructor: HttpServerStd });
    httpServer.use(denoLogger);
    useFileServe(httpServer);
    httpServer.use(router.routes());
    httpServer.use(router.allowedMethods());
    httpServer.listen(bind);
  });

app.version("0.1.3");
app.parse();
