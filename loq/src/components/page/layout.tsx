import { ReactNode } from "react";
import Header from "./header";

export default function Layout(props: {
  hideHeader?: boolean;
  children?: ReactNode;
}) {
  return (
    <div id="container">
      {props.hideHeader ? null : <Header />}
      <div id="content">{props.children}</div>
    </div>
  );
}
