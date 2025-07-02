import { Suspense, useState } from "react";
import Layout from "../../components/page/layout";
import { FullscreenLoader } from "../../components/load";
import { useNavigate, useParams } from "react-router-dom";
import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchLOQ, fetchLOQContents } from "../../functions/database";
import { Username } from "../../components/display/user";
import { DualColumn } from "../../components/display/format";
import { concatClasses, formatDate } from "../../functions/functions";
import {
  ButtonIconWithTooltip,
  ElementWithTooltip,
  LinkIconWithTooltip,
} from "../../components/tooltip";
import { useUserInfo } from "../../functions/userInfo";
import { useAddAlert } from "../../components/alerts/alert_hooks";
import { Confirm } from "../../components/page/modal";
import supabase from "../../supabase/client";
import { useAddNotification } from "../../components/page/notification/hooks";
import Notification from "../../components/page/notification/notification";
import { Contents } from "../editor/editor.types";
import { AnimatePresence, motion } from "motion/react";
import { questionTypes } from "../editor/editor";

export default function Viewer() {
  return (
    <Layout className="viewer">
      <Suspense fallback={<FullscreenLoader />}>
        <ViewerContent />
      </Suspense>
    </Layout>
  );
}

function ViewerContent() {
  const params = useParams();
  const id = params.id ?? null;

  const userInfo = useUserInfo();
  const addAlert = useAddAlert();
  const addNotification = useAddNotification();
  const navigate = useNavigate();

  const { data } = useSuspenseQuery({
    queryKey: ["public", "quizzes", "id", id],
    queryFn: () => fetchLOQ(id ?? NaN),
  }).data;

  if (data === null) {
    return (
      <>
        <h1>Not Found</h1>
        <span>
          This loq could not be found. It might be private or deleted.
        </span>
      </>
    );
  }

  const loq = data.contents;

  // Workaround since the <title> tag doesn't work consistently
  document.title = `${data.title} - loq.to`

  return (
    <>
      <title>{data.title} - loq.to</title>
      <meta
        name="description"
        content={`View, play, and share ${loq.settings.title} on loq.to${
          loq.settings.description ? `: ${loq.settings.description}` : ""
        }.${loq.questions.map((e, i) => ` ${i + 1}. ${e.title}`)}
        `.substring(0, 150)}
      />
      <h1>{loq.settings.title}</h1>
      <span>
        By <Username id={data?.author ?? "----"} />
      </span>
      <span>{loq.settings.description}</span>
      {data.createdAt.getTime() === data.lastUpdated.getTime() ? (
        `Created at ${formatDate(data.createdAt, "long")}`
      ) : (
        <DualColumn
          left={`Created on ${formatDate(data.createdAt, "long")}`}
          right={`Last updated ${formatDate(data.lastUpdated, "long")}`}
        />
      )}
      <div className="actions">
        {userInfo.id === data.author && (
          <ButtonIconWithTooltip
            src="/icons/trash.svg"
            tooltip="Delete this loq"
            onClick={() => {
              addAlert(
                <Confirm
                  title="Confirm Deletion"
                  onAction={async (choice) => {
                    if (choice) {
                      addNotification(
                        <Notification title="Working…" time={4000}>
                          Deleting {loq.settings.title}…
                        </Notification>
                      );
                      const { error } = await supabase.rpc("delete_quiz", {
                        loq_id: data.id,
                      });
                      if (error) {
                        addNotification(
                          <Notification title="Error">
                            An error occured when saving your loq:{" "}
                            {error.message}
                          </Notification>
                        );
                        return;
                      }
                      addNotification(
                        <Notification title="Success!" time={4000}>
                          {loq.settings.title} has been deleted.
                        </Notification>
                      );
                      navigate("/saved");
                    }
                  }}
                >
                  Are you sure that you would like to delete this loq?
                </Confirm>
              );
            }}
          />
        )}
        {(userInfo.id === data.author || !loq.settings.options.copyProtect) && (
          <LinkIconWithTooltip
            className="button-icon-container"
            src="/icons/edit-pencil.svg"
            to={`/editor/${data.id}`}
            tooltip={
              userInfo.id === data.author
                ? "Edit this loq"
                : "Copy and edit this loq"
            }
          />
        )}
        <ButtonIconWithTooltip
          src="/icons/share-android.svg"
          tooltip="Share this loq"
          onClick={async () => {
            const url = `${window.location.protocol}//${window.location.host}/view/${data.id}`;
            if (navigator.canShare && navigator.canShare())
              await navigator.share({
                url: `${window.location.protocol}//${window.location.host}/view/${data.id}`,
              });
            else {
              await navigator.clipboard.writeText(url);

              addNotification(
                <Notification title="Copied!" time={4000}>
                  Copied URL to clipboard!
                </Notification>
              );
            }
          }}
        />
        <LinkIconWithTooltip
          className="button-icon-container"
          src="/icons/play.svg"
          to={`/host/${data.id}`}
          tooltip="Play this loq"
          target="_blank"
        />
      </div>
      <LOQViewer contents={loq} />
    </>
  );
}

function LOQViewer(props: { contents: Contents }) {
  const loq = props.contents;
  const [shown, setShown] = useState<number | null>(null);
  return (
    <div className="questions-list">
      {props.contents.questions.map((question, i) => {
        const currentQuestion = loq.questions[i];

        return (
          <div key={i} className={concatClasses(shown === i && "selected")}>
            <button
              className="section title"
              onClick={() => {
                if (shown === i) setShown(null);
                else setShown(i);
              }}
            >
              {i + 1}. {question.title}
            </button>
            <AnimatePresence mode="wait">
              {shown === i && (
                <motion.div
                  initial={{
                    scaleY: 0,
                    height: 0,
                    transformOrigin: "top center",
                  }}
                  animate={{
                    scaleY: 1,
                    height: "auto",
                    transition: {
                      duration: 0.1,
                      ease: "easeOut",
                    },
                  }}
                  exit={{
                    scaleY: 0,
                    height: 0,
                    transition: {
                      duration: 0.1,
                      ease: "easeOut",
                    },
                  }}
                  className="section body"
                >
                  {currentQuestion.description.length > 0 && (
                    <div className="description">
                      {currentQuestion.description}
                    </div>
                  )}
                  <div className="details">
                    <div className="answers">
                      {currentQuestion.answers.map((answer, i) => (
                        <div
                          key={i}
                          className="section"
                          style={{ backgroundColor: `var(--answer-${i})` }}
                        >
                          <div className="icon-container section">
                            <img
                              src={
                                "correct" in answer
                                  ? answer.correct
                                    ? "/icons/check-circle-solid.svg"
                                    : "/icons/xmark-circle-solid.svg"
                                  : `/icons/numbers/${Math.min(16, i + 1)}.svg`
                              }
                            />
                          </div>
                          <span>{answer.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="properties">
                      <span>
                        {
                          questionTypes.find(
                            (e) => e.type === currentQuestion.questionType
                          )?.display
                        }
                      </span>
                      {"randomizeAnswerOrder" in currentQuestion.options && (
                        <span>
                          Answers appear in random order:{" "}
                          {currentQuestion.options.randomizeAnswerOrder
                            ? "Yes"
                            : "No"}
                        </span>
                      )}
                      {"caseSensitive" in currentQuestion.options && (
                        <span>
                          Answers are case-sensitive:{" "}
                          {currentQuestion.options.caseSensitive ? "Yes" : "No"}
                        </span>
                      )}
                      <span>
                        Points:{" "}
                        <ElementWithTooltip
                          tooltip={`Base Points: ${currentQuestion.points.base}, Time Bonus: ${currentQuestion.points.bonus}`}
                        >
                          <span>
                            {currentQuestion.points.base +
                              currentQuestion.points.bonus}
                          </span>
                        </ElementWithTooltip>
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
