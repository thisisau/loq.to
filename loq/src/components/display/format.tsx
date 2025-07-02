import { ReactNode } from "react";
import { concatClasses } from "../../functions/functions";

export function DualColumn(props: {
  left: ReactNode;
  right: ReactNode;
  className?: string;
}) {
  return <span className={concatClasses("dual-column", props.className)}>
    <span>{props.left}</span>
    <span>{props.right}</span>
  </span>
}