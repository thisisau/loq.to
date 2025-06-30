import { useSuspenseQuery } from "@tanstack/react-query";
import type { UUID } from "crypto";
import supabase from "../../supabase/client";
import { Suspense } from "react";
import { Loader } from "../load";
import { PublicUserInfo } from "../../functions/userInfo";
import { PostgrestResponseFailure } from "@supabase/postgrest-js";
let a: PostgrestResponseFailure;
export function Username(props: { id: UUID }) {
  const NameViewer = () => {
    const data = useSuspenseQuery({
      queryKey: ["rpc", "get_user_info", props.id],
      queryFn: async () =>
        await supabase.rpc("get_user_info", {
          user_id: props.id,
        }),
    }).data.data as PublicUserInfo | null;

    console.log(data);

    if (data === null) {
      return "Unknown User";
    }

    return data.displayName || data.username;
  };

  return (
    <Suspense
      fallback="…"
    >
      <NameViewer />
    </Suspense>
  );
}
