import { useState } from "react";
import { useAlertHandler } from "./alert_hooks";
import React from "react";
import { AlertsContext } from "./alert_context";

export function GlobalElement() {
    const alertHandler = useAlertHandler();
    const [elements, setElements] = useState(
        Object.values(alertHandler?.alerts)
    );
    React.useEffect(() => {
        alertHandler?.onChange((e) => setElements(Object.values(e)));
    }, []);

    return (
        <>
            {elements.map((e) => (
                <AlertsContext.Provider value={e} key={e.id}>
                    {e.content}
                </AlertsContext.Provider>
            ))}
        </>
    );
}