import { ReactNode, useContext, useRef } from "react";
import { AlertHandlerContext, AlertsContext, AlertHandler } from "./alert_context";

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
) => string {
    const alertHandler = useAlertHandler();
    const thisAlertKey = useRef<string | undefined>(undefined);
    return (alert) => {
        if (typeof alert !== "function") {
            const id = alertHandler.addAlert(alert);
            return id;
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

        return id;
    };
}