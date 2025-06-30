import { ReactNode } from "react";

export function DualColumn(props: {
  left: ReactNode;
  right: ReactNode;
}) {
  return <span className="dual-column">
    <span>{props.left}</span>
    <span>{props.right}</span>
  </span>
}