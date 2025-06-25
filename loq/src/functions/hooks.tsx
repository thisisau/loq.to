import { useState } from "react";

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