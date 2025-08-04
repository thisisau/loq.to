import { ReactNode } from "react";
import Header from "./header";

export default function Layout(props: {
  hideHeader?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div id="container">
      {props.hideHeader ? null : <Header />}
      <div id={"content"} className={props.className}>{props.children}</div>
    </div>
  );
}
