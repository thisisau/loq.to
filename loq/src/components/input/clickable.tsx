import {
  ChangeEvent,
  CSSProperties,
  DetailedHTMLProps,
  HTMLAttributes,
  ReactNode,
  useRef,
  useState,
} from "react";
import { useMutableState } from "../../functions/hooks";
import { concatClasses } from "../../functions/functions";
import { defaultValueTypes } from "motion";

export function ClickableInputGroup(
  props: {
    onChange?: (
      updateInfo: {
        index: number;
        value: boolean;
      },
      groupValue: Array<boolean>,
      update: ReturnType<typeof useMutableState<Array<boolean>>>[1],
      changeEvent: ChangeEvent<HTMLInputElement>
    ) => void;
    items: ReactNode[];
    containerProps?: DetailedHTMLProps<
      HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >;

    direction?: CSSProperties["flexDirection"];
  } & (
    | { type: "checkbox"; initialValue?: Array<number> }
    | { type: "radio"; initialValue: number }
  )
) {
  const [state, updateState, setState] = useMutableState<Array<boolean>>(
    props.items.map(
      (_, i) =>
        (props.type === "checkbox" && (props.initialValue ?? []).includes(i)) ||
        (props.type === "radio" && props.initialValue === i)
    )
  );
  const groupID = useRef(window.crypto.randomUUID());

  return (
    <div
      {...props.containerProps}
      className={concatClasses("input-group", props.containerProps?.className)}
      style={{ flexDirection: props.direction, ...props.containerProps?.style }}
    >
      {props.items.map((e, i) => {
        return (
          <span key={i}>
            <input
              type={props.type}
              id={`input-group-${groupID.current}-${i}`}
              checked={state[i]}
              onChange={(e) => {
                const newValue = e.target.checked;
                let newState = structuredClone(state);
                if (props.type === "checkbox") newState[i] = newValue;
                else newState = newState.map((_, j) => i === j);
                setState(newState);
                if (props.onChange)
                  props.onChange(
                    { index: i, value: newValue },
                    newState,
                    updateState,
                    e
                  );
              }}
            />
            <label htmlFor={`input-group-${groupID.current}-${i}`}>{e}</label>
          </span>
        );
      })}
    </div>
  );
}

export function Checkbox(props: {
  label: ReactNode;
  onChange?: (newValue: boolean, event: ChangeEvent) => void;
  defaultValue: boolean;
}) {
  const [state, setState] = useState(props.defaultValue);
  const groupID = useRef(window.crypto.randomUUID());

  return (
    <div className="input-group">
      <span>
        <input
          type={"checkbox"}
          id={`input-group-${groupID.current}-${0}`}
          checked={state}
          onChange={(e) => {
            const newValue = e.target.checked;
            setState(newValue);
            if (props.onChange) props.onChange(newValue, e);
          }}
        />
        <label htmlFor={`input-group-${groupID.current}-${0}`}>
          {props.label}
        </label>
      </span>
    </div>
  );
}
