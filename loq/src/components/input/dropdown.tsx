import { ReactNode, CSSProperties, useState, useRef, useEffect } from "react";
import { concatClasses } from "../../functions/functions";
import { AnimatePresence, motion } from "motion/react";

function AnimatedDropdownBody(props: { children?: ReactNode }) {
  return (
    <motion.div
      className="dropdown-body"
      initial={{
        scaleY: 0,
        transformOrigin: "top center",
        translateY: 8,
      }}
      animate={{
        scaleY: 1,
        transition: {
          duration: 0.1,
          ease: "easeOut",
        },
      }}
      exit={{
        scaleY: 0,
        transition: {
          duration: 0.1,
          ease: "easeOut",
        },
      }}
    >
      {props.children}
    </motion.div>
  );
}

export function DropdownWithoutInput(props: {
  title: string;
  children: ReactNode;
  containerClass?: string;
  containerStyle?: CSSProperties;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener: (this: Document, ev: MouseEvent) => any = (e) => {
      if (
        dropdownRef.current !== null &&
        e.target instanceof Node &&
        !dropdownRef.current.contains(e.target)
      )
        setIsOpen(false);
    };

    document.addEventListener("click", listener);

    return () => document.removeEventListener("click", listener);
  }, []);

  return (
    <div
      className={concatClasses(
        "dropdown",
        isOpen && "open",
        props.containerClass
      )}
      ref={dropdownRef}
      style={props.containerStyle}
    >
      <div className="dropdown-head">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <span>{props.title}</span>
          <img src={"/icons/nav-arrow-right.svg"} className="accent-icon" />
        </button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <AnimatedDropdownBody>{props.children}</AnimatedDropdownBody>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownInput(props: {
  options: Array<ReactNode>;
  onUpdate?: (value: number) => void;
  defaultOption?: number;
  headAriaLabel?: string
}) {
  const [value, setValue] = useState(props.defaultOption ?? 0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [lastEvent, setLastEvent] = useState<{
    value: number;
    event: React.MouseEvent<HTMLButtonElement>;
  } | null>(null);

  useEffect(() => {
    if (lastEvent !== null) if (props.onUpdate) props.onUpdate(lastEvent.value);
  }, [lastEvent]);

  useEffect(() => {
    const listener: (this: Document, ev: MouseEvent) => any = (e) => {
      if (
        dropdownRef.current !== null &&
        e.target instanceof Node &&
        !dropdownRef.current.contains(e.target)
      )
        setIsOpen(false);
    };

    document.addEventListener("click", listener);

    return () => document.removeEventListener("click", listener);
  }, []);

  return (
    <div
      className={concatClasses("dropdown", isOpen && "open")}
      ref={dropdownRef}
    >
      <div className="dropdown-head">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          aria-label={props.headAriaLabel}
        >
          <span>{props.options[value]}</span>
          <img src={"/icons/nav-arrow-right.svg"} className="accent-icon" />
        </button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <AnimatedDropdownBody>
            {props.options.map((e, i) => (
              <button
                className={concatClasses(i === value && "active")}
                key={i}
                onClick={(ev) => {
                  setValue(i);
                  setIsOpen(false);
                  setLastEvent({
                    event: ev,
                    value: i,
                  });
                }}
              >
                <span>{e}</span>
              </button>
            ))}
          </AnimatedDropdownBody>
        )}
      </AnimatePresence>
    </div>
  );
}
