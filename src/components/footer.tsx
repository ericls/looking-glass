import React from "https://esm.sh/react@17.0.2?dts";
import { sheet } from "../style.tsx";

export default function Footer() {
  return (
    <footer className={sheet.classes.footer}>
      <div className={sheet.classes.footerLeft}>
        Powered by{" "}
        <a href="https://github.com/ericls/looking-glass">LookingGlass</a>
      </div>
      <div className={sheet.classes.footerRight}></div>
    </footer>
  );
}
