import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import { useAlert, useClearAlert } from "../../alerts/alert_hooks";
import { NotificationContext } from "./hooks";
import { AnimatePresence, motion } from "motion/react";

export default function Notification(props: {
  title: ReactNode;
  children: ReactNode;
  time?: number;
  uncloseable?: boolean;
}) {
  const activeTimeout = useRef<NodeJS.Timeout | null>(null);
  const [shouldTimerAnimate, setShouldTimerAnimate] = useState<boolean>(true);
  const [isShown, setIsShown] = useState(true);
  const thisAlert = useAlert();
  const notifications = useContext(NotificationContext)!;

  const clearAlert = useClearAlert();

  const [index, setIndex] = useState(
    notifications.current.notifications.findIndex((e) => e.id === thisAlert.id)
  );

  useEffect(() => {
    if (props.time) {
      resetTimer();
    }

    setInterval(() => {
      const newIndex = notifications.current.notifications.findIndex(
        (e) => e.id === thisAlert.id
      );
      if (index !== newIndex) setIndex(newIndex);
    }, 50);
  }, []);

  function removeThisNotification() {
    const index = notifications.current.notifications.findIndex(
      (e) => e.id === thisAlert.id
    );
    if (index >= 0) notifications.current.notifications.splice(index, 1);
    clearAlert();
  }

  const clearTimer = () => {
    if (activeTimeout.current) clearTimeout(activeTimeout.current);
    activeTimeout.current = null;
    setShouldTimerAnimate(false);
  };

  const resetTimer = () => {
    if (props.time === undefined) return;
    clearTimer();
    const timeout = setTimeout(() => {
      if (activeTimeout.current !== timeout) return;
      setIsShown(false);
      setTimeout(removeThisNotification, 100);
    }, props.time);
    activeTimeout.current = timeout;
    setShouldTimerAnimate(true);
  };

  return (
    <AnimatePresence>
      {isShown && (
        <motion.div
          className="notification"
          onMouseEnter={clearTimer}
          onMouseLeave={resetTimer}
          style={{
            maxWidth: "calc(100vw - 48px)",
            right: 24,
            bottom: 24 + 104 * index,
          }}
          initial={{
            scale: 0.5,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
            transition: {
              duration: 0.1,
              ease: "easeOut",
              bottom: {
                duration: 0.3,
              },
            },
            bottom: 24 + 104 * index,
          }}
          exit={{
            scale: 0.5,
            opacity: 0,
          }}
        >
          <motion.div
            className="progress"
            key={shouldTimerAnimate ? 1 : 0}
            initial={{
              scaleX: 1,
              transformOrigin: "center left",
            }}
            animate={{
              scaleX: shouldTimerAnimate ? 0 : undefined,
              transition: {
                duration: props.time && props.time / 1000,
                ease: "easeOut",
              },
            }}
          />
          {props.uncloseable ? null : (
            <button
              className="button-icon-container notification-close"
              onClick={() => {
                setIsShown(false);
                setTimeout(removeThisNotification, 100);
              }}
              aria-label="Close Notification"
            >
              <img src="/icons/xmark.svg" draggable={false} aria-hidden />
            </button>
          )}
          <div className="notification-title">{props.title}</div>
          <div className="notification-body">{props.children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
