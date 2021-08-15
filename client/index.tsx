import React from "react";
import ReactDOM from "react-dom";
import NetworkTests from "./networkTests";

window.addEventListener("load", () => {
  const ntContainer = document.getElementById("ntest")!;
  ReactDOM.render(<NetworkTests />, ntContainer);
});
