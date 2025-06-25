import { ReactNode } from "react";

export function FormItem(props: { children?: ReactNode }) {
  return (
    <div className="form-item">
      {props.children}
      <hr />
    </div>
  );
}

export function FormItemWithTitle(props: {
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="multiline-form-item">
      <FormItem>{props.title}</FormItem>
      {props.children}
    </div>
  );
}
