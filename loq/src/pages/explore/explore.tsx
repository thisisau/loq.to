import { Suspense, useEffect, useState } from "react";
import { FullscreenLoader } from "../../components/load";
import Layout from "../../components/page/layout";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  useMutableState,
} from "../../functions/hooks";
import supabase from "../../supabase/client";
import Table from "../../components/display/table";
import { formatDate, replaceAll } from "../../functions/functions";
import {
  ElementWithTooltip,
  LinkIconWithTooltip,
} from "../../components/tooltip";
import { getImageURL } from "../../functions/database";
import { Link } from "react-router-dom";
import { TextInput } from "../../components/input/text";

export default function Explore() {
  const params = new URLSearchParams(window.location.search);
  // const pageParams = params.get("page");
  const defaultPage =
    // isNaN(Number(pageParams)) && Number(pageParams) >= 0
    //   ? 0
    //   : Number(pageParams);
    0;
  const searchQuery = params.get("query");

  const [query, setQuery] = useState(searchQuery ?? "");

  return (
    <Layout className="saved">
      <h1>Explore LOQs</h1>
      <div className="explore-search">
        <TextInput
          placeholder="Search…"
          textAlign="center"
          defaultValue={query}
          onBlur={(text, set) => {
            text = text.trim();
            set(text);
            setQuery(text);
          }}
          onKeyDown={(_text, _set, e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
      </div>
      <Suspense fallback={<FullscreenLoader />}>
        <ExploreContent page={defaultPage} count={10} query={query} />
      </Suspense>
      <title>Explore LOQs - loq.to</title>
      <meta
        name="description"
        content={`Explore different quizzes created by the loq.to community!`}
      />
    </Layout>
  );
}

function ExploreContent(props: { page: number; count: number; query: string }) {
  const [range, updateRange] = useMutableState({
    page: props.page,
    count: props.count,
    totalPages: null as null | number,
  });
  const { data } = useSuspenseQuery({
    queryKey: [
      "public",
      "quizzes",
      `page-${range.page}`,
      `count-${range.count}`,
      `query-${props.query}`,
    ],
    queryFn: async () => {
      const { data: searchIDs, error: searchError } = await supabase.rpc(
        "search_public_quizzes",
        {
          page_number: range.page,
          search_query_string: replaceAll(props.query, " ", " & "),
        }
      );
      if (searchIDs === null) {
        return { data: [], error: searchError };
      }
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, author, last_updated, title, quiz_description, thumbnail")
        .in("id", searchIDs)
        .order("last_updated", {
          ascending: false,
        });
      return { data: data ?? [], error };
    },
  }).data;

  useEffect(() => {
    if (range.page > 0 && data.length === 0) {
      updateRange((range) => {
        range.page--;
        range.totalPages = range.page;
      });
    }
  }, [range]);

  return (
    <>
      <Table
        columns={{
          thumbnail: {
            display: (
              <LinkIconWithTooltip
                className="icon"
                src="/icons/plus.svg"
                tooltip="Create a new loq"
                to={"/editor"}
                target="_blank"
              />
            ),
            style: {
              flex: "0 0 48px",
              alignItems: "center",
              justifyContent: "center",
            },
            headerStyle: {},
          },
          title: {
            display: "Title",
            style: {
              flex: "0 1 192px",
            },
          },
          description: {
            display: "Description",
            style: {
              flex: "1 2 384px",
            },
          },
          lastUpdated: {
            display: "Last Updated",
            style: {
              flex: "0 1 112px",
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
            case "lastUpdated":
              return (
                <ElementWithTooltip
                  tooltip={formatDate(
                    new Date(data[row].last_updated),
                    "very-long"
                  )}
                >
                  <span className="full-size">
                    {formatDate(
                      new Date(data[row].last_updated),
                      "short-adapt"
                    )}
                  </span>
                </ElementWithTooltip>
              );
            case "thumbnail":
              return (
                <img
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  src={getImageURL(
                    data[row].thumbnail
                      ? JSON.parse(data[row].thumbnail as string)
                      : null
                  )}
                />
              );
          }
        }}
        getRowLink={(row) => {
          const params = new URLSearchParams();

          params.set("explorePage", `${range.page}`);
          if (props.query) params.set("exploreQuery", props.query);

          return `/view/${data[row].id}?${params.toString()}`;
        }}
        changeBackgroundOnHover="row"
      />
      <div className="vertical-margin">
        {range.page > 0 && (
          <ElementWithTooltip tooltip={`Page ${range.page}`}>
            <Link
              to="."
              onClick={(e) => {
                e.preventDefault();
                updateRange((range) => {
                  range.page--;
                });
              }}
            >
              {"<"}
            </Link>
          </ElementWithTooltip>
        )}{" "}
        Page {range.page + 1}{" "}
        {data.length >= range.count &&
          (range.totalPages === null || range.totalPages > range.page) && (
            <ElementWithTooltip tooltip={`Page ${range.page + 2}`}>
              <Link
                to="."
                onClick={(e) => {
                  e.preventDefault();
                  updateRange((range) => {
                    range.page++;
                  });
                }}
              >
                {">"}
              </Link>
            </ElementWithTooltip>
          )}
      </div>
    </>
  );
}
