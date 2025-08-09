import {
  Fragment,
  MouseEventHandler,
  ReactNode,
  useState,
} from "react";
import { concatClasses } from "../../functions/functions";
import { Link, LinkProps } from "react-router-dom";

export function DualColumn(
  props: {
    className?: string;
  } & (
    | {
        left: ReactNode;
        right: ReactNode;
      }
    | {
        columns: ReactNode[];
      }
  )
) {
  return (
    <span className={concatClasses("dual-column", props.className)}>
      {"columns" in props ? (
        <>
          {props.columns.map((e, i) => (
            <Fragment key={i}>{e}</Fragment>
          ))}
        </>
      ) : (
        <>
          {" "}
          <span>{props.left}</span>
          <span>{props.right}</span>
        </>
      )}
    </span>
  );
}

export function Card(
  props: {
    title: ReactNode;
    children: ReactNode;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
  } & (
    | {
        link: string;
        target?: LinkProps["target"];
      }
    | { link?: never }
  )
) {
  const [vars, setVars] = useState<{
    x: number;
    y: number;
    angle: number;
    distance: number;
  }>();

  // if (props.link) {
  return (
    <div className="card-container">
    <Link
      className="card section"
      onMouseMove={(e) => {
        const target = (e.target as HTMLAnchorElement).closest(
          ".card.section"
        )!;
        const targetBounds = target.getBoundingClientRect();
        const x = (e.clientX - targetBounds.left) / targetBounds.width,
          y = (e.clientY - targetBounds.top) / targetBounds.height,
          ratio = (y - 0.5) / (x - 0.5),
          angle = Math.min(
            1,
            Math.max(
              Math.atan(ratio < 1 ? ratio : ratio > 100 ? 0 : 1 / ratio),
              -1
            )
          ),
          distance = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2);
        setVars({
          x,
          y,
          angle,
          distance,
        });
      }}
      onMouseLeave={() => {
        setVars(undefined);
      }}
      to={props.link ?? ""}
      onClick={props.onClick}
      target={"target" in props ? props.target : undefined}
      draggable={false}
      style={
        vars && {
          transform: `rotateX(${(vars.y -.5) / 6}rad) rotateY(${
            (vars.x -.5) / -6
          }rad) perspective(1px)`,
        }
      }
    >
      <div className="card-title">{props.title}</div>
      <div className="card-body">{props.children}</div>
    </Link>
    </div>
  );
  // }
  // return (
  //   <div className="card section" onClick={props.onClick}>
  //     <div className="card-title">{props.title}</div>
  //     <div className="card-body">{props.children}</div>
  //   </div>
  // );
}
