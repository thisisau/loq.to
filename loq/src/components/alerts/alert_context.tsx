import { createContext, ReactNode } from "react";
import { AlertHandlerChangeListener, AlertInfo, AlertOptions } from "./alert_types";

export const AlertsContext = createContext<AlertInfo | null>(null);
export const AlertHandlerContext = createContext<AlertHandler | undefined>(undefined);
export class AlertHandler {
    alerts: {
        [key: string]: AlertInfo;
    } = {};
    #changeListeners: AlertHandlerChangeListener[] = [];

    addAlert(content: ReactNode, options?: AlertOptions) {
        const alertID = crypto.randomUUID();

        this.alerts[alertID] = {
            content: content,
            options: options,
            id: alertID,
        };

        this.#updateChangeListeners();

        return alertID;
    }

    removeAlert(key: string) {
        delete this.alerts[key];
        this.#updateChangeListeners();
    }

    replaceAlert(id: string, content: ReactNode, options?: AlertOptions) {
        this.alerts[id] = {
            content: content,
            options: options,
            id: id,
        };
        this.#updateChangeListeners();
    }

    #updateChangeListeners() {
        this.#changeListeners.forEach((e) => e(this.alerts));
    }

    onChange(run: AlertHandlerChangeListener) {
        this.#changeListeners.push(run);
    }
}
