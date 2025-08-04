import {
  cloneElement,
  DetailedHTMLProps,
  HTMLAttributeAnchorTarget,
  ImgHTMLAttributes,
  MouseEventHandler,
  ReactElement,
  useState,
} from "react";
import { Link, To } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { concatClasses } from "../functions/functions";
import Button from "./input/button";

const tooltipStyle = {
  fontSize: "12pt",
};

export function LinkIconWithTooltip(props: {
  className?: string;
  to?: To;
  src: string;
  tooltip?: string;
  draggable?: boolean;
  imageProps?: DetailedHTMLProps<
    ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >;
  linkProps?: Omit<Parameters<typeof Link>[0], "to">;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  target?: HTMLAttributeAnchorTarget;
}) {
  const [uuid] = useState(window.crypto.randomUUID());

  return props.to === undefined ? (
    <a
      {...props.linkProps}
      target={props.target}
      className={props.className}
      onClick={props.onClick}
      data-tooltip-id={`tooltip-${uuid}`}
      data-tooltip-content={props.tooltip}
      draggable={props.draggable ?? false}
      aria-label={props.tooltip}
      tabIndex={0}
    >
      <img
        {...props.imageProps}
        src={props.src}
        alt={props.tooltip}
        draggable={props.draggable ?? false}
      />
      <Tooltip id={`tooltip-${uuid}`} style={tooltipStyle} />
    </a>
  ) : (
    <Link
      {...props.linkProps}
      target={props.target}
      to={props.to}
      className={props.className}
      onClick={props.onClick}
      data-tooltip-id={`tooltip-${uuid}`}
      data-tooltip-content={props.tooltip}
      draggable={props.draggable ?? false}
      aria-label={props.tooltip}
    >
      <img
        {...props.imageProps}
        src={props.src}
        alt={props.tooltip}
        draggable={props.draggable ?? false}
      />
      <Tooltip id={`tooltip-${uuid}`} style={tooltipStyle} />
    </Link>
  );
}

export function ButtonIconWithTooltip(props: {
  className?: string;
  src: string;
  tooltip?: string;
  draggable?: boolean;
  imageProps?: DetailedHTMLProps<
    ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  "aria-label"?: string;
  color? : Parameters<typeof Button>[0]["color"]
}) {
  const [uuid] = useState(window.crypto.randomUUID());
  return (
    <button
      className={concatClasses("button-icon-container", props.className)}
      onClick={props.onClick}
      data-tooltip-id={`tooltip-${uuid}`}
      data-tooltip-content={props.tooltip}
      draggable={props.draggable ?? false}
      aria-label={props["aria-label"] ?? props.tooltip}
      tabIndex={0}
      color={props.color}
    >
      <img
        {...props.imageProps}
        src={props.src}
        alt={props.tooltip}
        draggable={props.draggable ?? false}
      />
      <Tooltip id={`tooltip-${uuid}`} style={tooltipStyle} />
    </button>
  );
}

export function ElementWithTooltip(
  props: {
    tooltip?: string;
    children: ReactElement;
  } & {
    isOpen?: boolean;
  }
) {
  const [uuid] = useState(window.crypto.randomUUID());

  return (
    <>
      {cloneElement(props.children, {
        // @ts-expect-error
        "data-tooltip-id": `tooltip-${uuid}`,
        "data-tooltip-content": props.tooltip,
        "aria-label": props.tooltip,
      })}
      <Tooltip {...props} id={`tooltip-${uuid}`} style={tooltipStyle} />
    </>
  );
}
