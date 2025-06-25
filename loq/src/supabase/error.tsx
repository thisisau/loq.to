import { ReactNode } from "react";

export const errorCodes: {[key: string]: ReactNode} = {
  "invalid_credentials": "Your email or password is incorrect.",
  "validation_failed": "Please fill out all required fields."
}

export function errorCodeExists(key: any) {
  return typeof key === "string" && key in errorCodes;
}