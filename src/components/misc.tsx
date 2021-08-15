import React from "https://esm.sh/react@17.0.2?dts";
import { sheet } from "../style.tsx";

export function DataItem({
    label,
    value,
    className,
  }: {
    label: string | React.ReactNode;
    value: string | React.ReactNode;
    className?: string;
  }) {
    return (
      <div className={sheet.classes.dataItem + (className ? " " + className : "")}>
        <div className={sheet.classes.dataLabel}>{label}:</div>
        <div className={sheet.classes.dataValue}>{value}</div>
      </div>
    );
  }