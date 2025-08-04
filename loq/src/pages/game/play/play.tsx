import { Link } from "react-router-dom";
import Layout from "../../../components/page/layout";
import {
  PaginateContainer,
  usePaginate,
} from "../../../components/paginate/paginate";
import { DualColumn } from "../../../components/display/format";
import { useMutableState } from "../../../functions/hooks";
import { TextInput } from "../../../components/input/text";
import { ReactNode, useEffect, useState } from "react";
import Button from "../../../components/input/button";
import {
  blurActiveElement,
  concatClasses,
  plural,
  splitArrayIntoChunks,
} from "../../../functions/functions";
import {
  useAddAlert,
  useAlertHandler,
} from "../../../components/alerts/alert_hooks";
import { Confirm, LoaderModal, Modal } from "../../../components/page/modal";
import supabase from "../../../supabase/client";
import type { UUID } from "crypto";
import { motion } from "motion/react";
import { useAddNotification } from "../../../components/page/notification/hooks";
import Notification from "../../../components/page/notification/notification";
import { DndContext } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  restrictToHorizontalAxis,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";

type GamePages = {
  joinGame: null;
  playGame: {
    game: {
      roomID: UUID;
      roomCode: string;
      status: GameStatus;
    };
    user: {
      userName: string;
      userID: UUID;
      points: number;
    };
  };
};

type GameStatus =
  | {
      mode: "waiting";
    }
  | {
      mode: "pre-question";
      question: number;
    }
  | {
      mode: "answered-question";
    }
  | {
      mode: "post-question";
      leaderboard: GameLeaderboard;
      results: {
        userName: string;
        isCorrect: boolean;
        points: { base: number; bonus: number };
      }[];
    }
  | {
      mode: "question";
      question: GameQuestion;
    };

type GameLeaderboard = Array<{
  userName: string;
  points: number;
}>;

type GameQuestion =
  | {
      type: "multiple-choice" | "multi-select" | "true-false" | "arrange";
      answerCount: number;
    }
  | {
      type: "open-ended";
    };

export default function Play() {
  return (
    <Layout className="live play" hideHeader>
      <PaginateContainer<GamePages, "joinGame">
        pages={{
          joinGame: <JoinGame />,
          playGame: <PlayGame />,
        }}
        defaultPage="joinGame"
        defaultState={null}
      />
    </Layout>
  );
}

function JoinGame() {
  const { setPage } = usePaginate<GamePages, "joinGame">();

  const [credentials, updateCredentials] = useMutableState({
    roomCode: "",
    username: "",
  });
  const addAlert = useAddAlert();
  const alertHandler = useAlertHandler();

  return (
    <div className="join-game accent">
      <form className="join-form section" onSubmit={(e) => e.preventDefault()}>
        <img src="/assets/logos/loq/white.svg" draggable={false} />
        <TextInput
          placeholder="Room code"
          textAlign="center"
          maxLength={5}
          onUpdate={(e) => {
            updateCredentials((val) => (val.roomCode = e));
          }}
          defaultValue={credentials.roomCode}
        />
        <TextInput
          placeholder="Username"
          textAlign="center"
          maxLength={20}
          onUpdate={(e) => {
            updateCredentials((val) => (val.username = e));
          }}
          defaultValue={credentials.username}
        />
        <Button
          onClick={async () => {
            blurActiveElement();
            if (
              credentials.username.length === 0 ||
              credentials.roomCode.length !== 5
            ) {
              addAlert(
                <Modal title="Error">
                  Please enter a five-digit room code and a username.
                </Modal>
              );
              return;
            }

            const { id } = addAlert(<LoaderModal />);

            const { data: roomID, error: roomIDError } = await supabase.rpc(
              "live_get_room_id",
              {
                room_code: credentials.roomCode,
              }
            );

            if (roomIDError) {
              if (roomIDError.code === "90301")
                addAlert(
                  <Modal title="Error">
                    We couldn't find a room with code {credentials.roomCode}.
                  </Modal>
                );
              alertHandler.removeAlert(id);
              return;
            }

            const { data: userInfo, error: roomJoinError } = await supabase.rpc(
              "live_join_room",
              {
                display_name: credentials.username,
                room_id: roomID,
              }
            );

            if (roomJoinError) {
              addAlert(<Modal title="Error">{roomJoinError.message}</Modal>);
              alertHandler.removeAlert(id);
              return;
            }

            alertHandler.removeAlert(id);
            setPage("playGame", {
              user: {
                userName: (
                  userInfo as {
                    display_name: string;
                  }
                ).display_name,
                userID: (
                  userInfo as {
                    user_id: UUID;
                  }
                ).user_id,
                points: 0,
              },
              game: {
                roomID: roomID as UUID,
                roomCode: credentials.roomCode,
                status: {
                  mode: "waiting",
                },
              },
            });
          }}
          className={concatClasses(
            (credentials.username.length === 0 ||
              credentials.roomCode.length !== 5) &&
              "no-access"
          )}
          type="submit"
        >
          Join!
        </Button>
      </form>
      <div>
        <DualColumn
          left={
            <span>
              Powered by{" "}
              <Link to="/" target="_blank">
                loq.to
              </Link>
            </span>
          }
          right={<span>Join now for free!</span>}
        ></DualColumn>
      </div>
    </div>
  );
}

function PlayGame() {
  const { state, setPage, updateState } = usePaginate<GamePages, "playGame">();

  const gameContent = (() => {
    switch (state.game.status.mode) {
      case "waiting":
      case "pre-question":
      case "answered-question":
        return <Waiting />;
      case "question":
        return <Question />;
      case "post-question":
        return <PostQuestion />;
    }
  })();

  const addAlert = useAddAlert();

  useEffect(() => {
    const channel = supabase
      .channel(`hosted-loq-${state.game.roomID}`, {
        config: {
          private: true,
        },
      })
      .on(
        "broadcast",
        {
          event: "*",
        },
        (data) => {
          console.log("Something happened. ", data);

          if (
            data.event === "user_leave" &&
            data.payload.id === state.user.userID
          ) {
            setPage("joinGame", null);
            addAlert(
              <Confirm title="Notification" canCancel={false} uncloseable>
                The host has removed you from the game.
              </Confirm>
            );
          } else if (data.event === "question_intro") {
            updateState((state) => {
              state.game.status = {
                mode: "pre-question",
                question: data.payload.question,
              };
            });
          } else if (data.event === "question_start") {
            updateState((state) => {
              state.game.status = {
                mode: "question",
                question: data.payload,
              };
            });
          } else if (data.event === "question_end") {
            updateState((state) => {
              state.game.status = {
                mode: "post-question",
                leaderboard: data.payload.leaderboard,
                results: data.payload.results,
              };
            });
          }
        }
      );

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [state]);

  return (
    <>
      {gameContent}
      <GameFooter />
    </>
  );
}

function Waiting() {
  const { state } = usePaginate<GamePages, "playGame">();

  if (state.game.status.mode === "waiting") {
    return (
      <div className="play-game accent host-game introduction">
        <div className="details section">
          <div className="title">You're in!</div>
          <div className="subtitle">
            Waiting for the host to start the game…
          </div>
        </div>
      </div>
    );
  }

  if (state.game.status.mode === "answered-question") {
    return (
      <div className="play-game accent host-game introduction">
        <div className="details section">
          <div className="title">Answer submitted!</div>
          <div className="subtitle">
            Waiting for everyone to submit their answers…
          </div>
        </div>
      </div>
    );
  }

  if (state.game.status.mode !== "pre-question") throw new Error("Bad state.");

  return (
    <div className="play-game accent host-game introduction">
      <div className="details section">
        <div className="title">Question {state.game.status.question + 1}</div>
      </div>
      <div className="progress section">
        <motion.div
          initial={{
            width: 0,
          }}
          animate={{
            width: "100%",
            transition: {
              ease: "linear",
              duration: 5,
            },
          }}
        />
      </div>
    </div>
  );
}

function Question() {
  const { state } = usePaginate<GamePages, "playGame">();

  if (state.game.status.mode !== "question") throw new Error("Bad state.");

  switch (state.game.status.question.type) {
    case "multiple-choice":
    case "true-false":
      return <MultipleChoiceQuestion />;
    case "multi-select":
      return <MultipleChoiceQuestion multiSelect />;
    case "arrange":
      return <ArrangeQuestion />;
    case "open-ended":
      return <OpenEndedQuestion />;
  }
}

function useSubmitAnswer() {
  const addAlert = useAddAlert();
  const addNotification = useAddNotification();
  const alertHandler = useAlertHandler();

  const { state, updateState } = usePaginate<GamePages, "playGame">();

  async function submitAnswer(value: number | Array<number> | string) {
    const id = addAlert(<LoaderModal />);
    const { error } = await supabase.rpc("live_submit_answer", {
      submitter_user_id: state.user.userID,
      room_id: state.game.roomID,
      answer_content: {
        answer: value,
      },
    });
    alertHandler.removeAlert(id.id);
    if (error !== null) {
      addNotification(
        <Notification title="Error">
          An error occurred: {error.message}
        </Notification>
      );
      return;
    }
    updateState(
      (state) =>
        (state.game.status = {
          mode: "answered-question",
        })
    );
  }

  return submitAnswer;
}

function MultipleChoiceQuestion(props: { multiSelect?: boolean }) {
  const [selectedAnswers, updateSelectedAnswers] = useMutableState<number[]>(
    []
  );
  const submitAnswer = useSubmitAnswer();
  const { state } = usePaginate<GamePages, "playGame">();
  if (state.game.status.mode !== "question") throw new Error("Bad state.");
  if (!("answerCount" in state.game.status.question))
    throw new Error("Bad state.");
  const allAnswers = Array.apply(
    null,
    new Array(state.game.status.question.answerCount)
  ).map((_, i) => i);

  return (
    <form
      className="play-game question accent"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="answers">
        {splitArrayIntoChunks(allAnswers, {
          chunkCount: 3,
        }).map((rowValue, rowIndex) => (
          <div key={rowIndex}>
            {rowValue.map((cell, cellIndex) => (
              <Button
                className={concatClasses(
                  "section",
                  props.multiSelect &&
                    !selectedAnswers.includes(cell) &&
                    "unselected"
                )}
                key={cellIndex}
                style={{ backgroundColor: `var(--answer-${cell})` }}
                onClick={async () => {
                  if (props.multiSelect) {
                    if (selectedAnswers.includes(cell)) {
                      updateSelectedAnswers((answers) =>
                        answers.splice(answers.indexOf(cell), 1)
                      );
                    } else {
                      updateSelectedAnswers((answers) => answers.push(cell));
                    }
                  } else {
                    // submit answer
                    submitAnswer(cell);
                  }
                }}
              >
                <img src={`/icons/numbers/${cell + 1}.svg`} />
              </Button>
            ))}
          </div>
        ))}
      </div>
      {props.multiSelect && (
        <Button
          onClick={() => {
            submitAnswer(selectedAnswers);
          }}
        >
          Submit!
        </Button>
      )}
    </form>
  );
}

function ArrangeQuestion() {
  const { state } = usePaginate<GamePages, "playGame">();
  const submitAnswer = useSubmitAnswer();
  if (
    state.game.status.mode !== "question" ||
    state.game.status.question.type !== "arrange"
  )
    throw new Error("Bad state.");
  const [answers, setAnswers] = useState(
    Array.apply(null, new Array(state.game.status.question.answerCount)).map(
      (_, i) => i
    )
  );
  const [isVertical, setIsVertical] = useState(window.innerHeight >= window.innerWidth);
  useEffect(() => {
    const onResize = () => {
      if (window.innerHeight >= window.innerWidth) setIsVertical(true);
      else setIsVertical(false);
    };
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <form
      className="play-game question accent"
      onSubmit={(e) => e.preventDefault()}
    >
      <DndContext
        modifiers={[
          isVertical ? restrictToVerticalAxis : restrictToHorizontalAxis,
        ]}
        onDragEnd={(e) => {
          const { active, over } = e;

          if (over && active.id !== over.id) {
            const oldIndex = answers.indexOf(active.id as number);
            const newIndex = answers.indexOf(over.id as number);

            setAnswers(arrayMove(answers, oldIndex, newIndex));
          }
        }}
      >
        <SortableContext items={answers}>
          <div className="answers arrange">
            <div>
              {answers.map((e) => (
                <SortableItem id={e} key={e} />
              ))}
            </div>
          </div>
        </SortableContext>
      </DndContext>
      <Button
        onClick={() => {
          console.log("Submitted!", answers);
          submitAnswer(answers);
        }}
      >
        Submit!
      </Button>
    </form>
  );
}

function OpenEndedQuestion() {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<ReactNode | null>(null);
  const submitAnswer = useSubmitAnswer();

  return (
    <form
      className="play-game question accent"
      onSubmit={(e) => e.preventDefault()}
    >
      <TextInput
        maxLength={100}
        className="open-ended-input"
        placeholder="Type your answer here…"
        textAlign="center"
        defaultValue={answer}
        onUpdate={(value) => setAnswer(value)}
        onBlur={(value, updateText) => {
          value = value.trim().substring(0, 100);
          setAnswer(value);
          updateText(value);
        }}
      />
      <Button
        type="submit"
        className="open-ended-submit"
        onClick={() => {
          console.log("Submitting!", answer);
          if (answer.trim().length === 0) {
            setError("Your answer can't be empty!");
            return;
          }
          submitAnswer(answer);
        }}
      >
        Submit!
      </Button>
      {error !== null && <div className="login-error">{error}</div>}
    </form>
  );
}

function SortableItem(props: { id: number }) {
  const e = props.id;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: e });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      className="section button-component"
      key={e}
      style={{
        backgroundColor: `var(--answer-${e})`,
        ...style,
      }}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    >
      <img src={`/icons/numbers/${e + 1}.svg`} />
    </button>
  );
}

function PostQuestion() {
  const { state } = usePaginate<GamePages, "playGame">();

  if (state.game.status.mode !== "post-question") throw new Error("Bad state.");

  const results = state.game.status.results.find(
    (e) => e.userName === state.user.userName
  );
  const pointsEarned =
    results === undefined ? 0 : results.points.base + results.points.bonus;
  const placeInLeaderboard = state.game.status.leaderboard.findIndex(
    (e) => e.userName === state.user.userName
  );

  return (
    <div className="play-game accent host-game introduction">
      <div className="details section">
        <div className="title">
          {results === undefined
            ? "Time's up!"
            : results.isCorrect
            ? "Correct!"
            : "Incorrect"}
        </div>
        <div className="subtitle">
          +{pointsEarned} {plural("point", pointsEarned)}
        </div>
      </div>
      <div className="mini-leaderboard leaderboard-content">
        {placeInLeaderboard !== -1 && (
          <>
            {placeInLeaderboard !== 0 && (
              <div className="section small">
                <div>{placeInLeaderboard}</div>
                <div>
                  {
                    state.game.status.leaderboard[placeInLeaderboard - 1]
                      .userName
                  }
                </div>
                <div>
                  {state.game.status.leaderboard[placeInLeaderboard - 1].points}
                </div>
              </div>
            )}
            <div className="section">
              <div>{placeInLeaderboard + 1}</div>
              <div>
                {state.game.status.leaderboard[placeInLeaderboard].userName}
              </div>
              <div>
                {state.game.status.leaderboard[placeInLeaderboard].points}
              </div>
            </div>
            {placeInLeaderboard !==
              state.game.status.leaderboard.length - 1 && (
              <div className="section small">
                <div>{placeInLeaderboard + 2}</div>
                <div>
                  {
                    state.game.status.leaderboard[placeInLeaderboard + 1]
                      .userName
                  }
                </div>
                <div>
                  {state.game.status.leaderboard[placeInLeaderboard + 1].points}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function GameFooter() {
  const { state } = usePaginate<GamePages, "playGame">();
  return (
    <div className="footer">
      <div>
        Room code: <strong>{state.game.roomCode}</strong>
      </div>
      <div>{state.user.userName}</div>
      <div>
        <strong>{state.user.points}</strong> points
      </div>
    </div>
  );
}
