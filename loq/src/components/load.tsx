import { treadmill } from "ldrs";
import { ReactNode } from "react";
treadmill.register();
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "l-treadmill": {
        size?: string | number;
        color?: string | number;
        speed?: string | number;
      };
    }
  }
}
export function Loader(props: {
  children?: ReactNode;
  color?: string | number;
}) {
  return (
    <div className="loader-container">
      <l-treadmill color={props.color ?? "white"} />
      {props.children}
    </div>
  );
}

export function FullscreenLoader(props: Parameters<typeof Loader>[0]) {
  return (
    <div className="loading">
      <Loader {...props}/>
    </div>
  );
}
