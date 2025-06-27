import { ReactNode } from "react";
import { BackendResponse } from "./types";
import supabase from "../supabase/client";
import { errorCodeExists, errorCodes } from "../supabase/error";

export function isValidPassword(password: string): boolean {
  switch (true) {
    case password.length < 8:
      return false;
  }
  return true;
}

export function isValidEmail(email: string): boolean {
  return !!email.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
}

export async function attemptAuthentication(
  mode: "login" | "signup",
  credentials: {
    email: string;
    password: string;
  },
  setErrorContent: (content: ReactNode) => void
): Promise<BackendResponse<null>> {
  if (mode === "signup") {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });
    if (error !== null) {
      setErrorContent(errorCodeExists(error.code) ? errorCodes[error.code!] :
        `An error with code ${error.code} occurred: ${error.message}`
      );
      return {
        success: false,
        error: {
          code: error.status ?? 400,
          message: error.message,
          id: error.name,
        },
        data: null,
      };
    }
    return {
      success: true,
      data: null,
      error: null,
    };
  } else {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error !== null) {
      setErrorContent(errorCodeExists(error.code) ? errorCodes[error.code!] :
        `An error with code ${error.code} occurred: ${error.message}`
      );
      return {
        success: false,
        error: {
          code: error.status ?? 400,
          message: error.message,
          id: error.name,
        },
        data: null,
      };
    }
    console.log("Authentication success")
    return {
      success: true,
      data: null,
      error: null,
    };
  }
}
