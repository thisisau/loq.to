import { cache, useEffect, useState } from "react";
import { Database } from "../supabase/database.types";
import supabase from "../supabase/client";

export type UserInfo = {
  displayName: string | null;
  id: string;
  lastUpdated: Date;
  username: string;
};

const cachedInfo: {
  value: UserInfo | null;
} = { value: null };

export const defaultInfo: UserInfo = {
  displayName: "LOQ User",
  id: "",
  username: "deleted",
  lastUpdated: new Date(),
};

export function useUserInfo() {
  const [info, setInfo] = useState<UserInfo>(cachedInfo.value ?? defaultInfo);

  useEffect(() => {
    if (cachedInfo.value === null) {
      supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
          cachedInfo.value = null;
          return;
        }
        const userID = data.session?.user.id;
        if (userID === undefined) {
          cachedInfo.value = null;
          return;
        }
        supabase
          .from("profiles")
          .select()
          .eq("id", userID)
          .then(({ data, error }) => {
            if (error || data.length < 1) {
              console.error(
                "An error occured when trying to fetch the user profile: ",
                error
              );
              cachedInfo.value = null;
              return;
            }
            const newInfo = {
              displayName: data[0].display_name,
              id: data[0].id,
              lastUpdated: new Date(data[0].last_updated),
              username: data[0].username,
            };
            cachedInfo.value = newInfo;
            setInfo(newInfo);
          });
      });
    }
  }, []);

  return info;
}

export async function asyncGetUserInfo() {
  if (cachedInfo.value !== null) return cachedInfo.value;
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  if (sessionError) {
    cachedInfo.value = null;
    return null;
  }
  const userID = sessionData.session?.user.id;
  if (userID === undefined) {
    cachedInfo.value = null;
    return null;
  }
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", userID);
  if (error || data.length < 1) {
    console.error(
      "An error occured when trying to fetch the user profile: ",
      error
    );
    cachedInfo.value = null;
    return null;
  }
  const newInfo = {
    displayName: data[0].display_name,
    id: data[0].id,
    lastUpdated: new Date(data[0].last_updated),
    username: data[0].username,
  };
  cachedInfo.value = newInfo;
  return newInfo;
}
