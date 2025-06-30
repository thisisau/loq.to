import { Suspense, useEffect, useState } from "react";
import { FullscreenLoader } from "../../components/load";
import Layout from "../../components/page/layout";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  useMutableState,
  useSuspenseLoggedInUserInfo,
} from "../../functions/hooks";
import supabase from "../../supabase/client";
import Table from "../../components/display/table";
import { formatDate } from "../../functions/functions";
import {
  ElementWithTooltip,
  LinkIconWithTooltip,
} from "../../components/tooltip";
import { getImageURL } from "../../functions/database";
import { Image } from "../editor/editor.types";
import { Link } from "react-router-dom";

export default function Saved() {
  return (
    <Layout className="saved">
      <h1>Your LOQs</h1>
      <Suspense fallback={<FullscreenLoader />}>
        <SavedContent page={0} count={10} />
      </Suspense>
      <title>Saved LOQs - loq.to</title>
      <meta
        name="description"
        content={`View, share, and fine-tune all of your loq quizzes on loq.to!`}
      />
    </Layout>
  );
}

function SavedContent(props: { page: number; count: number }) {
  const [range, updateRange] = useMutableState({
    page: props.page,
    count: props.count,
    totalPages: null as null | number,
  });
  const user = useSuspenseLoggedInUserInfo();
  const { data, error } = useSuspenseQuery({
    queryKey: [
      "public",
      "quizzes",
      "author",
      user.id,
      `page-${range.page}`,
      `count-${range.count}`,
    ],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("id, author, last_updated, title, quiz_description, thumbnail")
        .eq("author", user.id)
        .order("last_updated", {
          ascending: false,
        })
        .range(range.page * range.count, (range.page + 1) * range.count - 1);
      return { data: data ?? [], error };
    },
  }).data;

  useEffect(() => {
    console.log(range.page, data.length);
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
              return <img src={getImageURL(data[row].thumbnail as Image)} />;
          }
        }}
        getRowLink={(row) => `/view/${data[row].id}`}
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
