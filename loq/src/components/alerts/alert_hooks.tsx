import { ReactNode, useContext, useRef } from "react";
import {
  AlertHandlerContext,
  AlertsContext,
  AlertHandler,
} from "./alert_context";
import { UUID } from "crypto";
import { AlertInfo } from "./alert_types";

export function useClearAlert(): () => void {
  const alertHandler = useContext(AlertHandlerContext);
  const thisAlert = useContext(AlertsContext);
  if (alertHandler === undefined) {
    console.error("ERROR: No alert handler!");
    return () => {};
  }
  if (thisAlert === null) {
    console.error("ERROR: No alert to remove!");
    return () => {};
  }
  return () => alertHandler.removeAlert(thisAlert.id);
}

export function useClearAlertID(): (id: string) => void {
  const alertHandler = useAlertHandler();
  return (id) => alertHandler.removeAlert(id);
}

export function useAlertHandler(): AlertHandler {
  const alertHandler = useContext(AlertHandlerContext);
  if (alertHandler === undefined) {
    throw new Error("ERROR: No alert handler!");
  }
  return alertHandler;
}

export function useAddAlert(): (
  alert:
    | ReactNode
    | ((
        clearAlert: () => void,
        replaceAlert: (newContent: ReactNode) => void
      ) => ReactNode)
) => {
  id: UUID;
  // clearAlert: () => void;
  // replaceAlert: (newContent: ReactNode) => void;
} {
  const alertHandler = useAlertHandler();
  const thisAlertKey = useRef<string | undefined>(undefined);
  return (alert) => {
    const returnValue = (id: UUID) => {
      return {
        id,
        clearAlert: () => {
          if (thisAlertKey.current)
            alertHandler.removeAlert(thisAlertKey.current);
        },
        replaceAlert: (newContent: ReactNode) => {
          if (thisAlertKey.current)
            alertHandler.replaceAlert(thisAlertKey.current, newContent);
        },
      };
    };
    if (typeof alert !== "function") {
      const id = alertHandler.addAlert(alert);
      return returnValue(id);
    }

    const alertElement = alert(
      () => {
        if (thisAlertKey.current)
          alertHandler.removeAlert(thisAlertKey.current);
      },
      (newContent) => {
        if (thisAlertKey.current)
          alertHandler.replaceAlert(thisAlertKey.current, newContent);
      }
    );

    const id = alertHandler.addAlert(alertElement);

    thisAlertKey.current = id;

    return returnValue(id);
  };
}

export function useAlert(): AlertInfo {
  const thisAlert = useContext(AlertsContext);
  if (thisAlert === null)
    throw new Error(
      "Error: useAlert() hook called when no alert context is present."
    );
  return thisAlert;
}
