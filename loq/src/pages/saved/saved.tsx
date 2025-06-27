import { Suspense } from "react";
import { FullscreenLoader } from "../../components/load";
import Layout from "../../components/page/layout";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useSuspenseLoggedInUserInfo } from "../../functions/hooks";
import supabase from "../../supabase/client";
import Table from "../../components/display/table";

export default function Saved() {
  return (
    <Layout className="saved">
      <Suspense fallback={<FullscreenLoader />}>
        <h1>Your LOQs</h1>
        <SavedContent start={0} count={10} />
      </Suspense>
    </Layout>
  );
}

function SavedContent(props: { start: number; count: number }) {
  const user = useSuspenseLoggedInUserInfo();
  const { data, error } = useSuspenseQuery({
    queryKey: ["public", "quizzes", "author", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, author, last_updated, title, quiz_description, thumbnail")
        .eq("author", user.id)
        .order("last_updated", {
          ascending: false,
        })
        .range(props.start, props.start + props.count - 1);
      return { data: data ?? [], error };
    },
  }).data;
  return (
    <Table
      columns={{
        title: {
          display: "Title",
          style: {
            width: 192,
          },
        },
        description: {
          display: "Description",
          style: {
            width: 384,
          },
        },
      }}
      rows={data.length}
      getCell={(row, column) => {
        switch (column) {
          case "title":
            return data[row].title;
          case "description":
            return data[row].quiz_description;
        }
      }}
      getRowLink={(row) => `/editor/${data[row].id}`}
      changeBackgroundOnHover="row"
    />
  );
  return JSON.stringify({ data, error });
}
