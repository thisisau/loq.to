import {
  DetailedHTMLProps,
  HTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import { concatClasses } from "../../functions/functions";

export type InputComponentCallback<T> = (
  text: string,
  updateText: (newText: string) => void,
  event: T
) => void;

export function TextInput(
  props: {
    maxLength?: number;
    textAlign?:
      | "start"
      | "end"
      | "left"
      | "right"
      | "center"
      | "justify"
      | "match-parent"
      | "inherit"
      | "unset";
    defaultValue?: string;
    placeholder?: string;
    className?: string;
    id?: string;
    "data-tooltip-id"?: string;
    "data-tooltip-content"?: string;
  } & (
    | {
        type?: "text" | "password" | "number" | "search" | "email";
        textArea?: false;
        onUpdate?: InputComponentCallback<
          React.ChangeEvent<HTMLInputElement> | undefined
        >;
        onKeyDown?: InputComponentCallback<
          React.KeyboardEvent<HTMLInputElement>
        >;
        onBlur?: InputComponentCallback<React.FocusEvent<HTMLDivElement>>;
        inputProps?: DetailedHTMLProps<
          InputHTMLAttributes<HTMLInputElement>,
          HTMLInputElement
        >;
        onFocus?: InputComponentCallback<React.FocusEvent<HTMLInputElement>>;
        containerProps?: DetailedHTMLProps<
          HTMLAttributes<HTMLDivElement>,
          HTMLDivElement
        >;
      }
    | {
        textArea: true;
        nonResizable?: boolean;
        onUpdate?: InputComponentCallback<
          React.ChangeEvent<HTMLTextAreaElement>
        >;
        onKeyDown?: InputComponentCallback<
          React.KeyboardEvent<HTMLTextAreaElement>
        >;
        onBlur?: InputComponentCallback<React.FocusEvent<HTMLTextAreaElement>>;
        onFocus?: InputComponentCallback<React.FocusEvent<HTMLTextAreaElement>>;
        textAreaProps?: DetailedHTMLProps<
          TextareaHTMLAttributes<HTMLTextAreaElement>,
          HTMLTextAreaElement
        >;
      }
  )
) {
  const [content, setContent] = useState(props.defaultValue ?? "");
  useEffect(() => {
    setContent(props.defaultValue ?? "");
  }, [props.defaultValue]);

  const inputRef = useRef<HTMLInputElement>(null);

  if (!props.textArea)
    return (
      <input
        {...props.inputProps}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            props.onBlur && props.onBlur(content, setContent, e);
          }
        }}
        data-tooltip-content={props["data-tooltip-content"]}
        data-tooltip-id={props["data-tooltip-id"]}
        type={props.type ?? "text"}
        onChange={(e) => {
          const newValue = e.target.value.substring(0, props.maxLength);
          setContent(newValue);
          props.onUpdate && props.onUpdate(newValue, setContent, e);
        }}
        placeholder={props.placeholder}
        className={concatClasses(
          "text-input-component",
          "section",
          props.className
        )}
        onFocus={(e) => {
          props.onFocus && props.onFocus(content, setContent, e);
        }}
        style={{ textAlign: props.textAlign }}
        value={content}
        id={props.id}
        onKeyDown={(e) => {
          props.onKeyDown && props.onKeyDown(content, setContent, e);
        }}
        ref={inputRef}
        aria-label={props.placeholder}
      />
    );

  return (
    <textarea
      {...props.textAreaProps}
      data-tooltip-content={props["data-tooltip-content"]}
      data-tooltip-id={props["data-tooltip-id"]}
      onChange={(e) => {
        const newValue = e.target.value.substring(0, props.maxLength);
        setContent(newValue);
        props.onUpdate && props.onUpdate(newValue, setContent, e);
      }}
      placeholder={props.placeholder}
      className={concatClasses(
        "text-input-component",
        "section",
        props.className
      )}
      style={{
        ...props.textAreaProps?.style,
        textAlign: props.textAlign,
        resize: props.nonResizable ? "none" : undefined,
      }}
      value={content}
      id={props.id}
      onKeyDown={(e) => {
        props.onKeyDown && props.onKeyDown(content, setContent, e);
      }}
      onBlur={(e) => {
        props.onBlur && props.onBlur(content, setContent, e);
      }}
      onFocus={(e) => {
        props.onFocus && props.onFocus(content, setContent, e);
      }}
      aria-label={props.placeholder}
    />
  );
}
