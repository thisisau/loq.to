import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { asyncGetUserInfo, defaultInfo } from "./userInfo";

export function useMutableState<T>(
  defaultValue: T
): [T, (callback: (state: T) => void) => void, (state: T) => void] {
  const [state, setState] = useState(defaultValue);
  function updateState(modificationCallback: (state: T) => void) {
    const duplicateState = structuredClone(state);
    modificationCallback(duplicateState);
    setState(structuredClone(duplicateState));
  }
  return [state, updateState, setState];
}

export function useSuspenseLoggedInUserInfo() {
  const user = useSuspenseQuery({
    queryKey: ["public", "profiles", "[current]"],
    queryFn: asyncGetUserInfo,
  }).data;
  if (user === null) {
    window.location.href = `/login?redirect=${window.location.pathname}`;
    throw new Error("Login required on this page.");
  }

  return user;
}
