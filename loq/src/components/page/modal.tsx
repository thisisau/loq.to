import { useClearAlert } from "../alerts/alert_hooks";

export function Modal(props: {
  title: string;
  children: React.ReactNode;
  uncloseable?: boolean;
  width?: number;
  flexibleHeight?: boolean;
  height?: number;
  dontGetTooBig?: boolean;
  onClose?: () => void;
}) {
  const clearAlert = useClearAlert();
  const closeFunc = props.uncloseable
    ? () => {}
    : props.onClose ?? (() => clearAlert());
  return (
    <div className="modal" onClick={closeFunc}>
      <div
        className="modal-body shadow hide-scrollbar"
        style={{
          width: `${props.width}px`,
          maxWidth: `min(80%, ${props.width}px)`,
          height: props.flexibleHeight
            ? "fit-content"
            : props.height
            ? `${props.height}px`
            : undefined,
          maxHeight: "fit-content",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head" aria-label="Modal Header">
          <div className="modal-head-content">{props.title}</div>
          {props.uncloseable ? null : (
            <button className="modal-head-close" onClick={closeFunc} aria-label="Close Modal">
              <img src="/icons/xmark.svg" draggable={false} width="25" height="25" aria-hidden />
            </button>
          )}
        </div>
        <div className="modal-content">{props.children}</div>
      </div>
    </div>
  );
}
