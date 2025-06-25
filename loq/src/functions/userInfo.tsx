import { useEffect, useState } from "react";
import { Database } from "../supabase/database.types";
import supabase from "../supabase/client";

export type UserInfo = {
  displayName: string | null;
  id: string;
  lastUpdated: Date;
  username: string;
};

const cachedInfo: {
  value: UserInfo | undefined;
} = { value: undefined };

export function useUserInfo() {
  const [info, setInfo] = useState<UserInfo>(
    cachedInfo.value ?? {
      displayName: "LOQ User",
      id: "",
      username: "deleted",
      lastUpdated: new Date(),
    }
  );

  useEffect(() => {
    if (cachedInfo.value === undefined) {
      supabase.auth.getSession().then(({ data, error }) => {
        if (error) return;
        const userID = data.session?.user.id;
        if (userID === undefined) return;
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
              return;
            }
            setInfo({
              displayName: data[0].display_name,
              id: data[0].id,
              lastUpdated: new Date(data[0].last_updated),
              username: data[0].username,
            });
          });
      });
    }
  }, []);

  return info;
}
