import { createContext, ReactNode, RefObject, useContext } from "react";
import type { UUID } from "crypto";
import { useAddAlert } from "../../alerts/alert_hooks";

export const NotificationContext = createContext<
  | RefObject<{
      notifications: {
        id: UUID;
      }[];
    }>
  | undefined
>(undefined);

export function useAddNotification(): (
  notification:
    | ReactNode
    | ((
        clearAlert: () => void,
        replaceAlert: (newContent: ReactNode) => void
      ) => ReactNode)
) => UUID {
  const addAlert = useAddAlert();
  const notifications = useContext(NotificationContext);
  if (notifications === undefined) {
    throw new Error("No notification context!");
  }

  return (notification) => {
    const alert = addAlert(notification);
    notifications.current.notifications.push({id: alert.id});
    return alert.id;
  };
}
