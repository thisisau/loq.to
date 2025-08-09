import { motion } from "motion/react";
import { useClearAlert } from "../alerts/alert_hooks";
import Button from "../input/button";
import { Loader } from "../load";
import { CSSProperties } from "react";

export type ModalProps = {
  title: string;
  children: React.ReactNode;
  uncloseable?: boolean;
  width?: CSSProperties["width"];
  flexibleHeight?: boolean;
  height?: number;
  dontGetTooBig?: boolean;
  onClose?: () => void;
};

export function Modal(props: ModalProps) {
  const clearAlert = useClearAlert();
  const closeFunc = props.uncloseable
    ? () => {}
    : props.onClose ?? (() => clearAlert());
  return (
    <div className="modal" onClick={closeFunc}>
      <div
        className="modal-body shadow hide-scrollbar"
        style={{
          width: props.width,
          maxWidth: typeof props.width === "number" ? `min(80%, ${props.width}px)` : "calc(100vw - 12px)",
          height: props.flexibleHeight
            ? "fit-content"
            : props.height
            ? `${props.height}px`
            : undefined,
          // maxHeight: "fit-content",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head" aria-label="Modal Header">
          <div className="modal-head-content">{props.title}</div>
          {props.uncloseable ? null : (
            <button
              className="modal-head-close"
              onClick={closeFunc}
              aria-label="Close Modal"
            >
              <img
                src="/icons/xmark.svg"
                draggable={false}
                width="25"
                height="25"
                aria-hidden
              />
            </button>
          )}
        </div>
        <div className="modal-content">{props.children}</div>
      </div>
    </div>
  );
}

export function LoaderModal() {
  return (
    <motion.div
      className="modal"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
        transition: {
          duration: 0.2,
          ease: "easeOut",
        },
      }}
    >
      <Loader />
    </motion.div>
  );
}

export function Confirm(
  props: ModalProps & {
    onAction?: (choice: boolean, preventClose: () => void) => void;
    canCancel?: boolean;
  }
) {
  const clearAlert = useClearAlert();

  return (
    <Modal {...props}>
      <div className="confirm-message">{props.children}</div>
      <div className="confirm-choices">
        {props.canCancel !== false && (
          <Button
            onClick={async () => {
              let shouldClear = true;
              props.onAction &&
                props.onAction(false, () => {
                  shouldClear = false;
                });
              if (shouldClear) clearAlert();
            }}
            color="dark"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={async () => {
            let shouldClear = true;
            props.onAction &&
              props.onAction(true, () => {
                shouldClear = false;
              });
            if (shouldClear) clearAlert();
          }}
        >
          OK
        </Button>
      </div>
    </Modal>
  );
}
