import { CSSProperties, ReactNode } from "react";
import { concatClasses } from "../../functions/functions";
import { Link } from "react-router-dom";

export default function Table<T extends string>(
  props: {
    columns: {
      [id in T]: {
        display: ReactNode;
        style: CSSProperties;
      };
    };
    getCell: (row: number, column: T, columnNumber: number) => ReactNode;
    rows: number;
    className?: string;
    changeBackgroundOnHover?: "row" | "cell" | "none";
  } & (
    | {
        getCellLink?: (
          row: number,
          column: T,
          columnNumber: number
        ) => string | null;
        getRowLink?: never;
      }
    | {
        getCellLink?: never;
        getRowLink?: (row: number) => string | null;
      }
  )
) {
  return (
    <div
      className={concatClasses("table section", props.className)}
      role="table"
    >
      <div className="header" role="rowheader">
        <div className="row" role="row">
          {(Object.keys(props.columns) as T[]).map((e, i) => (
            <div
              className="cell"
              key={i}
              style={props.columns[e].style}
              role="cell"
            >
              {props.columns[e].display}
            </div>
          ))}
        </div>
      </div>
      <div className="body" role="rowgroup">
        {new Array(props.rows).fill(null).map((_, rowNumber) => {
          const rowContents = (Object.keys(props.columns) as T[]).map(
            (columnName, columnNumber) => {
              const link =
                props.getCellLink &&
                props.getCellLink(rowNumber, columnName, columnNumber);

              if (!link)
                return (
                  <div
                    className={concatClasses(
                      "cell",
                      props.changeBackgroundOnHover === "cell" &&
                        "hover-animation"
                    )}
                    role="cell"
                    key={columnNumber}
                    style={props.columns[columnName].style}
                  >
                    {props.getCell(rowNumber, columnName, columnNumber)}
                  </div>
                );

              return (
                <Link
                  className={concatClasses(
                    "cell link",
                    props.changeBackgroundOnHover === "cell" &&
                      "hover-animation"
                  )}
                  key={columnNumber}
                  style={props.columns[columnName].style}
                  role="cell"
                  to={link}
                >
                  {props.getCell(rowNumber, columnName, columnNumber)}
                </Link>
              );
            }
          );

          const link = props.getRowLink && props.getRowLink(rowNumber);

          if (!link)
            return (
              <div
                className={concatClasses(
                  "row",
                  props.changeBackgroundOnHover === "row" && "hover-animation"
                )}
                key={rowNumber}
                role="row"
              >
                {rowContents}
              </div>
            );

          return (
            <Link
              className={concatClasses(
                "row link",
                props.changeBackgroundOnHover === "row" && "hover-animation"
              )}
              key={rowNumber}
              role="row"
              to={link}
            >
              {rowContents}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
