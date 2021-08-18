import cx from "https://esm.sh/classnames@2.3.1";
import React from "https://esm.sh/react@17.0.2?dts";
import { sheet } from "../style.tsx";
import LookingGlass from "./lookingGlass.tsx";
import Footer from "./footer.tsx";
import Settings from "../settings.ts";

export function Root() {
  return (
    <html lang="en">
      <head>
        <title>{Settings.getSettings().siteTitle}</title>
        <script src="/index.js"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=fallback"
          rel="stylesheet"
        ></link>
        <style type="text/css">{sheet.toString()}</style>
      </head>
      <div className={cx(sheet.classes.layout)}>
        <main>
          <LookingGlass />
        </main>
        <Footer />
      </div>
    </html>
  );
}
