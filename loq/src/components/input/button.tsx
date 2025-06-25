import { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { ClassArray, RecursiveArray } from "../../functions/types";
import { concatClasses } from "../../functions/functions";

export default function Button(props: {
  children: string | RecursiveArray<String> | ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string | ClassArray;
  type?: "button" | "submit" | "reset";
  id?: string;
  color?: "default" | "dark";
  style?: CSSProperties
}) {
  return (
    <button
      type={props.type}
      id={props.id}
      className={concatClasses(
        "button-component",
        props.color && props.color !== "default" && props.color,
        props.className
      )}
      onClick={props.onClick}
      style={props.style}
    >
      {props.children}
    </button>
  );
}
