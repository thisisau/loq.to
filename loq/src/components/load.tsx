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
export function Loader(props: { children?: ReactNode }) {
  return (
    <div className="loader-container">
      <l-treadmill color="white" />
      {props.children}
    </div>
  );
}

export function FullscreenLoader() {
  return (
    <div className="loading">
      <Loader />
    </div>
  );
}
