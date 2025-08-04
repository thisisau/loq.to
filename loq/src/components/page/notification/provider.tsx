import type { UUID } from "crypto";
import { NotificationContext } from "./hooks";
import { ReactNode, useRef } from "react";
export default function NotificationProvider(props: { children?: ReactNode }) {
  const notification = useRef<{
    notifications: {
      id: UUID;
    }[];
  }>({
    notifications: [],
  });

  return (
    <NotificationContext value={notification}>
      {props.children}
    </NotificationContext>
  );
}
