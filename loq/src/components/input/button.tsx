import { ButtonHTMLAttributes, CSSProperties, DetailedHTMLProps, MouseEventHandler, ReactNode, Ref } from "react";
import { ClassArray, RecursiveArray } from "../../functions/types";
import { concatClasses } from "../../functions/functions";

export default function Button(props: {
  children: string | RecursiveArray<String> | ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string | ClassArray;
  type?: "button" | "submit" | "reset";
  id?: string;
  color?: "default" | "dark";
  style?: CSSProperties;
  ref?: Ref<HTMLButtonElement>
} & {
  elementProps?: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
}) {
  return (
    <button
      {...props.elementProps}
      type={props.type}
      id={props.id}
      className={concatClasses(
        "button-component",
        props.color && props.color !== "default" && props.color,
        props.className
      )}
      onClick={props.onClick}
      style={props.style}
      ref={props.ref}
    >
      {props.children}
    </button>
  );
}
