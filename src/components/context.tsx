import React from "https://esm.sh/react@17.0.2?dts";

import {
    Context as OakContext,
  } from "https://deno.land/x/oak@v8.0.0/mod.ts";

// deno-lint-ignore no-explicit-any
export const OakReactContext = React.createContext<OakContext>({} as any);

export const useOakContext = () => {
  return React.useContext(OakReactContext);
};