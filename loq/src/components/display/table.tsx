import { CSSProperties, ReactNode } from "react";
import { concatClasses } from "../../functions/functions";
import { Link } from "react-router-dom";

export default function Table<T extends string>(
  props: {
    columns: {
      [id in T]: {
        display: ReactNode;
        style: CSSProperties;
        headerStyle?: CSSProperties;
      };
    };
    getCell: (row: number, column: T, columnNumber: number) => ReactNode;
    rows: number;
    className?: string;
    changeBackgroundOnHover?: "row" | "cell" | "none";
    rowStyle?: CSSProperties;
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
        <div className="row" role="row" style={props.rowStyle}>
          {(Object.keys(props.columns) as T[]).map((e, i) => (
            <div
              className="cell"
              key={i}
              style={{
                ...props.columns[e].style,
                ...props.columns[e].headerStyle,
              }}
              role="cell"
            >
              <span> {props.columns[e].display} </span>
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
                    <span>
                      {props.getCell(rowNumber, columnName, columnNumber)}
                    </span>
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
                  <span>
                    {" "}
                    {props.getCell(rowNumber, columnName, columnNumber)}
                  </span>
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
                style={props.rowStyle}
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
              style={props.rowStyle}
            >
              {rowContents}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
