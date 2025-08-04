import { Suspense, useContext, useEffect, useRef, useState } from "react";
import Layout from "../../../components/page/layout";
import { FullscreenLoader, Loader } from "../../../components/load";
import {
  useMutableState,
  useSuspenseLoggedInUserInfo,
} from "../../../functions/hooks";
import Button from "../../../components/input/button";
import supabase from "../../../supabase/client";
import { useAddNotification } from "../../../components/page/notification/hooks";
import Notification from "../../../components/page/notification/notification";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  fetchLOQContents,
  getImageURL,
  getVideoURL,
} from "../../../functions/database";
import { useNavigate, useParams } from "react-router-dom";
import {
  PaginateContainer,
  usePaginate,
} from "../../../components/paginate/paginate";
import { Contents } from "../../editor/editor.types";
import type { UUID } from "crypto";
import { Confirm, LoaderModal, Modal } from "../../../components/page/modal";
import {
  useAddAlert,
  useAlertHandler,
} from "../../../components/alerts/alert_hooks";
import {
  concatClasses,
  fadeAudioOut,
  plural,
  shuffle,
  splitArrayIntoChunks,
} from "../../../functions/functions";
import { createContext } from "react";
import {
  RealtimeChannel,
  RealtimePostgresInsertPayload,
} from "@supabase/supabase-js";
import { DualColumn } from "../../../components/display/format";
import { questionTypes } from "../../editor/editor";
import { motion } from "motion/react";
import { CountdownTimer } from "../../../components/display/timer";
import onGameEvent from "./events";
import AdvancedAnswerInfo from "./advanced";

type HostPages = {
  hostContent: null;
  hostGame: {
    loq: Contents;
    data: {
      code: string;
      id: UUID;
    };
    broadcastChannel: RealtimeChannel;
  };
};

type GameState = {
  loq: Contents;
  game: {
    roomID: UUID;
    roomCode: string;
    status: HostStatus;
  };
  users: Array<{
    userName: string;
    userID: UUID;
    points: number;
    joined: Date;
  }>;
};

const joinGameURL =
  window.location.hostname === "loq.to"
    ? "play.loq.to"
    : `${window.location.host}/play`;

const GameContext = createContext<
  ReturnType<typeof useMutableState<GameState>> | undefined
>(undefined);

export function useGameState() {
  const context = useContext(GameContext);

  if (context === undefined) {
    throw new Error("No game state context!");
  }
  return context;
}

type HostStatus =
  | {
      mode: "waiting";
    }
  | {
      mode: "pre-game";
    }
  | {
      mode: "pre-question";
      question: number;
    }
  | {
      mode: "question" | "post-question" | "leaderboard";
      question: number;
      userAnswers: Array<GameAnswer>;
      displayAnswers: Array<number>;
      startTime: Date;
    };

type GameAnswer = (
  | {
      type: "multiple-choice" | "true-false";
      answer: number;
    }
  | {
      type: "arrange" | "multi-select";
      answer: Array<number>;
    }
  | {
      type: "open-ended";
      answer: string;
    }
) & {
  author: UUID;
  isCorrect: boolean;
  points: {
    base: number;
    bonus: number;
  };
  answeredAt: Date;
};

export default function Host() {
  return (
    <Suspense fallback={<FullscreenLoader />}>
      <Layout className="live host" hideHeader>
        <PaginateContainer<HostPages, "hostContent">
          pages={{
            hostContent: <HostContent />,
            hostGame: <HostGame />,
          }}
          defaultPage="hostContent"
          defaultState={null}
        />
      </Layout>
    </Suspense>
  );
}

function HostContent() {
  useSuspenseLoggedInUserInfo();
  const addNotification = useAddNotification();
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id ?? null;
  const { setPage } = usePaginate<HostPages, "hostContent">();
  const addAlert = useAddAlert();
  const alertHandler = useAlertHandler();

  const { data: loq } = useSuspenseQuery({
    queryKey: ["public", "quizzes", "id", id, "contents", "host"],
    queryFn: () => fetchLOQContents(id ?? NaN),
  }).data;

  useEffect(() => {
    if (loq === null) {
      if (id !== null)
        addNotification(
          <Notification title="Error" time={4000}>
            A loq with ID {id} could not be found.
          </Notification>
        );
      navigate(`/view/${id}`);
    }
  }, []);
  if (loq === null) return null;

  return (
    <div className="host-game accent">
      <div className="game-preview section">
        <img src="/assets/logos/loq/white.svg" draggable={false} />
        <div className="title">{loq.settings.title}</div>
        <Button
          onClick={async (e) => {
            const { id } = addAlert(<LoaderModal />);

            const { data, error } = await supabase.rpc("live_create_room");
            if (error) {
              const { error: stopHostingError } = await supabase.rpc(
                "stop_hosting"
              );
              alertHandler.removeAlert(id);

              if (stopHostingError) {
                addAlert(
                  <Modal title="Error">{stopHostingError.message}</Modal>
                );
                return;
              }
              setTimeout(() => {
                (e.target as HTMLButtonElement).click();
              }, 50);
              return;
            }

            alertHandler.removeAlert(id);

            setPage("hostGame", {
              loq,
              data: data as {
                code: string;
                id: UUID;
              },
              broadcastChannel: supabase.channel(
                `hosted-loq-${(data as { id: UUID }).id}`,
                {
                  config: {
                    private: true,
                  },
                }
              ),
            });
          }}
        >
          Play!
        </Button>
      </div>
    </div>
  );
}

function HostGame() {
  const { state } = usePaginate<HostPages, "hostGame">();

  const [game, updateGame, setGame] = useMutableState<GameState>({
    loq: state.loq,
    game: {
      roomCode: state.data.code,
      roomID: state.data.id,
      status: {
        mode: "waiting",
      },
    },
    users: [],
  });

  const [subscribed, setSubscribed] = useState(false);
  const activeAudio = useRef<HTMLAudioElement | null>(null);

  const handler = useRef<
    (payload: RealtimePostgresInsertPayload<{ [key: string]: any }>) => void
  >(() => {});

  useEffect(() => {
    const channel = supabase.channel(state.broadcastChannel.subTopic);
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_events",
          filter: `game=eq.${game.game.roomID}`,
        },
        (payload) => {
          handler.current(payload);
        }
      )
      .subscribe(() => {
        console.log("subscribed!"), setSubscribed(true);
      });

    return () => {
      setSubscribed(false);
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    handler.current = (payload) =>
      onGameEvent([game, updateGame, setGame], payload);
    console.log("Handler updated.");
  }, [game]);

  useEffect(() => {
    console.log("Mode usee ffect", game.game.status.mode);
    switch (game.game.status.mode) {
      case "waiting":
        if (activeAudio.current) {
          break;
        }
        activeAudio.current = new Audio("/music/lobby.mp3");
        activeAudio.current.play();
        break;
      case "pre-game":
        console.log(activeAudio.current);
        if (activeAudio.current !== null)
          fadeAudioOut(activeAudio.current, 3000).then(()=>activeAudio.current?.pause());
        break;
      case "pre-question":
        activeAudio.current?.pause();
        const audioFileName =
          game.game.status.question + 1 === game.loq.questions.length
            ? "end.mp3"
            : `play${Math.floor(Math.random() * 2) + 1}.mp3`;
        activeAudio.current = new Audio(`/music/${audioFileName}`);
        activeAudio.current.play();
        break;
      case "post-question":
        if (activeAudio.current !== null) {
          fadeAudioOut(activeAudio.current, 3000);
        }
        break;
      case "question":
        const questionMedia =
          game.loq.questions[game.game.status.question].media;
        if (
          questionMedia &&
          questionMedia.type === "video" &&
          activeAudio.current
        )
          fadeAudioOut(activeAudio.current, 3000);
        break;
    }

    function onEnded(this: HTMLAudioElement) {
      this.currentTime = 0;
      this.play();
    }

    if (activeAudio.current)
      activeAudio.current.addEventListener("ended", onEnded);
    return () => {
      activeAudio.current?.removeEventListener("ended", onEnded);
    };
  }, [game.game.status.mode]);

  if (!subscribed) {
    return <FullscreenLoader color={"black"} />;
  }

  return (
    <GameContext value={[game, updateGame, setGame]}>
      {(() => {
        switch (game.game.status.mode) {
          case "waiting":
            return <Waiting />;
          case "pre-game":
          case "pre-question":
            return <Preview key={game.game.status.mode} />;
          case "question":
          case "post-question":
            return <Question />;
          case "leaderboard":
            return <Leaderboard />;
        }
      })()}
    </GameContext>
  );
}

function Waiting() {
  const [game, updateGame] = useGameState();
  const addAlert = useAddAlert();
  const addNotification = useAddNotification();
  const { state } = usePaginate<HostPages, "hostGame">();
  return (
    <div className="host-game waiting">
      <div className="player-count section">
        <span className="number">{game.users.length}</span>
        <span>{plural("player", game.users.length)}</span>
      </div>
      <div className="room-code section">
        <div>
          Go to <span className="url">{joinGameURL}</span> and enter
        </div>
        <div className="number">{game.game.roomCode}</div>
      </div>
      <div className="loq-info section">
        <div className="title">{game.loq.settings.title}</div>
        <div className="description">{game.loq.settings.description}</div>
        {game.loq.settings.thumbnail && (
          <div className="media image">
            <img src={getImageURL(game.loq.settings.thumbnail)} />
          </div>
        )}
      </div>
      <div className="start-button">
        <Button
          onClick={async () => {
            const resp = await state.broadcastChannel.send({
              type: "broadcast",
              event: "game_start",
              payload: {},
            });
            if (resp !== "ok") {
              addNotification(
                <Notification title="Error">
                  An unexpected error occurred!
                </Notification>
              );
              return;
            }
            updateGame(
              (game) =>
                (game.game.status = {
                  mode: "pre-game",
                })
            );
          }}
        >
          Start!
        </Button>
      </div>
      <div className="players section">
        {game.users.length > 0 ? (
          game.users.map((player, i) => (
            <button
              className="section"
              key={i}
              onClick={() => {
                addAlert((clear, replace) => (
                  <Confirm
                    title="Kick User"
                    onAction={async (choice, preventClose) => {
                      if (choice) {
                        preventClose();
                        updateGame((game) => game.users.splice(i, 1));
                        replace(
                          <Modal title="Kick User">
                            <Loader />
                          </Modal>
                        );
                        const resp = await state.broadcastChannel.send({
                          type: "broadcast",
                          event: "user_leave",
                          payload: {
                            id: player.userID,
                          },
                        });
                        console.log(resp);
                        clear();
                      }
                    }}
                  >
                    Would you like to remove {player.userName} from the game?
                  </Confirm>
                ));
              }}
            >
              {player.userName}
            </button>
          ))
        ) : (
          <button aria-disabled tabIndex={-1} className="section">
            Waiting for players to join the game…
          </button>
        )}
      </div>
    </div>
  );
}

function Preview() {
  const [game, updateGame] = useGameState();
  const { state } = usePaginate<HostPages, "hostGame">();
  const addNotification = useAddNotification();
  const currentQuestion =
    game.game.status.mode === "pre-question"
      ? game.loq.questions[game.game.status.question]
      : null;

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (game.game.status.mode === "pre-game") {
        const resp = await state.broadcastChannel.send({
          type: "broadcast",
          event: "question_intro",
          payload: {
            question: 0,
          },
        });
        if (resp !== "ok") {
          addNotification(
            <Notification title="Error">
              An unexpected error occurred!
            </Notification>
          );
          return;
        }
        updateGame(
          (game) =>
            (game.game.status = {
              mode: "pre-question",
              question: 0,
            })
        );
      } else {
        const displayAnswers = Array.apply(
          null,
          new Array(currentQuestion!.answers.length)
        ).map((_, i) => i);
        if (
          ("randomizeAnswerOrder" in currentQuestion!.options &&
            currentQuestion!.options.randomizeAnswerOrder) ||
          currentQuestion!.questionType === "arrange"
        )
          shuffle(displayAnswers);
        const resp = await state.broadcastChannel.send({
          type: "broadcast",
          event: "question_start",
          payload: {
            type: currentQuestion!.questionType,
            answerCount:
              currentQuestion!.questionType === "open-ended"
                ? undefined
                : displayAnswers.length,
          },
        });
        if (resp !== "ok") {
          addNotification(
            <Notification title="Error">
              An unexpected error occurred!
            </Notification>
          );
          return;
        }
        updateGame((game) => {
          if (game.game.status.mode !== "pre-question") return;
          game.game.status = {
            mode: "question",
            question: game.game.status.question,
            userAnswers: [],
            displayAnswers,
            startTime: new Date(),
          };
        });
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);
  return (
    <>
      <div className="host-game accent introduction">
        {game.game.status.mode === "pre-question" ? (
          <DualColumn
            className="section question-number"
            left={`Question ${game.game.status.question + 1} of ${
              game.loq.questions.length
            }`}
            right={
              questionTypes.find(
                (e) =>
                  "question" in game.game.status &&
                  e.type ===
                    game.loq.questions[game.game.status.question].questionType
              )?.display
            }
          />
        ) : (
          <span
            className="section question-number"
            style={{ display: "flex", alignItems: "center" }}
          >
            <span>
              {game.loq.questions.length}{" "}
              {plural("question", game.loq.questions.length)}
            </span>
          </span>
        )}

        <div className="details section">
          <div className="title">
            {game.game.status.mode === "pre-question"
              ? currentQuestion!.title
              : game.loq.settings.title}
          </div>
          {game.game.status.mode === "pre-question"
            ? currentQuestion!.description.length > 0 && (
                <div className="description">
                  {currentQuestion!.description}
                </div>
              )
            : game.loq.settings.description.length > 0 && (
                <div className="description">
                  {game.loq.settings.description.length}
                </div>
              )}
          {game.game.status.mode === "pre-question"
            ? currentQuestion!.media && (
                <div className="media">
                  {currentQuestion!.media.type === "image" ? (
                    <img src={getImageURL(currentQuestion!.media.data)} />
                  ) : (
                    <iframe
                      src={getVideoURL(currentQuestion!.media.data, true)}
                    />
                  )}
                </div>
              )
            : game.loq.settings.thumbnail && (
                <div className="media">
                  {<img src={getImageURL(game.loq.settings.thumbnail)} />}
                </div>
              )}
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
      <GameFooter />
    </>
  );
}

function Question() {
  const [game, updateGame, setGame] = useGameState();
  const { state } = usePaginate<HostPages, "hostGame">();
  const addNotification = useAddNotification();
  const addAlert = useAddAlert();

  const [showingAnswers, setShowingAnswers] = useState(false);
  if (!("userAnswers" in game.game.status)) {
    throw new Error("Question component called with improper game status.");
  }
  const currentQuestion = game.loq.questions[game.game.status.question];

  async function endTimer() {
    if (game.game.status.mode !== "question") return;

    // update leaderboard with results
    const leaderboard = structuredClone(game.users);

    game.game.status.userAnswers.forEach((answer) => {
      if (game.game.status.mode !== "question")
        throw new Error("Game is not in question mode");

      const answerIndex = leaderboard.findIndex(
        (user) => user.userID === answer.author
      );
      if (answerIndex < 0) return;
      leaderboard[answerIndex].points +=
        answer.points.base + answer.points.bonus;
    });

    setShowingAnswers(true);
    updateGame((game) => {
      game.game.status.mode = "post-question";
      game.users = leaderboard;
    });
    const resp = await state.broadcastChannel.send({
      type: "broadcast",
      event: "question_end",
      payload: {
        results: game.game.status.userAnswers.map(
          ({ author, isCorrect, points }) => {
            return {
              isCorrect,
              points,
              userName: leaderboard.find((user) => user.userID === author)
                ?.userName,
            };
          }
        ),
        leaderboard: leaderboard
          .map(({ userName, points }) => {
            return { userName, points };
          })
          .sort((a, b) => b.points - a.points),
      },
    });
    if (resp !== "ok") {
      addNotification(
        <Notification title="Error">An unexpected error occurred!</Notification>
      );
      return;
    }
  }

  useEffect(() => {
    if (game.game.status.mode !== "question") return;
    if (game.game.status.userAnswers.length === game.users.length) {
      endTimer();
    }
  }, [game]);

  return (
    <>
      <div className="host-game waiting question">
        <div className="player-count">
          {game.game.status.mode === "question" ? (
            <CountdownTimer
              seconds={currentQuestion.timeLimit}
              onTimerEnd={endTimer}
              generateChildren={(countdown) => (
                <div className="section">
                  <span className="number">{countdown}</span>
                  <span>{plural("second", countdown)}</span>
                </div>
              )}
            />
          ) : (
            <button
              className="section"
              onClick={() => {
                addAlert(
                  <GameContext value={[game, updateGame, setGame]}>
                    <Modal
                      title="Question Details"
                      flexibleHeight
                      width={"calc(100vw - 120px)"}
                    >
                      <AdvancedAnswerInfo />
                    </Modal>
                  </GameContext>
                );
              }}
            >
              <span>View all answers</span>
            </button>
          )}
          <div className="section">
            <span className="number">
              {game.game.status.userAnswers.length}
            </span>
            <span>{plural("answer", game.game.status.userAnswers.length)}</span>
          </div>
        </div>
        <div className="room-code section title">
          <div>{currentQuestion.title}</div>
        </div>
        <DualColumn
          className="section question-number"
          left={`Question ${game.game.status.question + 1} of ${
            game.loq.questions.length
          }`}
          right={
            questionTypes.find(
              (e) =>
                "question" in game.game.status &&
                e.type ===
                  game.loq.questions[game.game.status.question].questionType
            )?.display
          }
        />
        {showingAnswers ? <UserAnswersGrid /> : <InfoGrid />}
        {game.game.status.mode === "question" ? (
          <div className="start-button">
            <Button onClick={endTimer}>Skip</Button>
          </div>
        ) : (
          <div className="start-button">
            <Button
              onClick={() => {
                updateGame((game) => (game.game.status.mode = "leaderboard"));
              }}
            >
              Continue
            </Button>
            <Button onClick={() => setShowingAnswers(!showingAnswers)}>
              {showingAnswers ? "Show question" : "Show answers"}
            </Button>
          </div>
        )}

        <AnswersGrid />
      </div>
      <GameFooter accent />
    </>
  );
}

function UserAnswersGrid() {
  const [game] = useGameState();
  if (!("userAnswers" in game.game.status))
    throw new Error("AnswersGrid component called with improper game status.");

  const orderedAnswers = game.game.status.displayAnswers;
  const currentQuestion = game.loq.questions[game.game.status.question];

  if (
    currentQuestion.questionType === "multiple-choice" ||
    currentQuestion.questionType === "true-false"
  )
    return (
      <div className="loq-info section user-answers">
        {splitArrayIntoChunks(orderedAnswers, {
          chunkCount: 3,
        }).map((rowValues, rowIndex) => (
          <div key={rowIndex}>
            {rowValues.map((cell) => {
              const index = orderedAnswers.findIndex((val) => val === cell);
              if (!("userAnswers" in game.game.status)) throw new Error();

              return (
                <div
                  className={concatClasses("section")}
                  key={index}
                  style={{
                    backgroundColor: `var(--answer-${index})`,
                  }}
                >
                  <div className="icon-container">
                    <img src={`/icons/numbers/${index + 1}.svg`} />
                  </div>
                  <div className="number">
                    {
                      game.game.status.userAnswers.filter(
                        (e) => e.answer === index
                      ).length
                    }
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );

  return (
    <div className="loq-info section user-answers">
      <div>
        <div className="section" style={{ backgroundColor: "var(--answer-0)" }}>
          <div className="icon-container">
            <img src={`/icons/check.svg`} />
          </div>
          <div className="number">
            {game.game.status.userAnswers.filter((e) => e.isCorrect).length}
          </div>
        </div>
        <div className="section" style={{ backgroundColor: "var(--answer-1)" }}>
          <div className="icon-container">
            <img src={`/icons/xmark.svg`} />
          </div>
          <div className="number">
            {game.game.status.userAnswers.filter((e) => !e.isCorrect).length}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoGrid() {
  const [game] = useGameState();
  if (!("userAnswers" in game.game.status))
    throw new Error("AnswersGrid component called with improper game status.");
  const currentQuestion = game.loq.questions[game.game.status.question];

  return (
    <div className="loq-info section">
      {currentQuestion.description.length > 0 && (
        <div className="description">Description</div>
      )}
      {currentQuestion.media && (
        <div className={concatClasses("media", currentQuestion.media.type)}>
          {currentQuestion.media.type === "image" ? (
            <img src={getImageURL(currentQuestion!.media.data)} />
          ) : (
            <iframe
              src={getVideoURL(currentQuestion!.media.data, true, true)}
            />
          )}
        </div>
      )}
      {currentQuestion.description.length === 0 &&
        currentQuestion.media === undefined && (
          <div className="description placeholder">
            Answer before time runs out!
          </div>
        )}
    </div>
  );
}

function AnswersGrid() {
  const [game] = useGameState();
  if (!("userAnswers" in game.game.status))
    throw new Error("AnswersGrid component called with improper game status.");
  const currentQuestion = game.loq.questions[game.game.status.question];

  if (currentQuestion.questionType === "open-ended") {
    if (game.game.status.mode === "question")
      return (
        <div className="answers">
          <div>
            <div
              className="section"
              style={{ backgroundColor: `var(--answer-0)` }}
            >
              <div className="answer-text">Type your answer on your device</div>
            </div>
          </div>
        </div>
      );
    else
      return (
        <div className="answers open-ended">
          {currentQuestion.answers
            .filter((e) => e.text.length > 0)
            .map((value, index) => (
              <div key={index}>
                <div
                  className="section"
                  style={{ backgroundColor: `var(--answer-${index % 12})` }}
                >
                  <div className="icon-container">
                    <img
                      src={`/icons/numbers/${Math.min(index + 1, 16)}.svg`}
                    />
                  </div>
                  <div className="answer-text">{value.text}</div>
                </div>
              </div>
            ))}
        </div>
      );
  }

  let orderedAnswers = game.game.status.displayAnswers;
  const isArrangePostQuestion =
    game.game.status.mode === "post-question" &&
    currentQuestion.questionType === "arrange";

  if (isArrangePostQuestion)
    // un-shuffle answers, showing users the correct order
    orderedAnswers = Array.apply(null, new Array(orderedAnswers.length)).map(
      (_, i) => i
    );

  return (
    <div className="answers">
      {splitArrayIntoChunks(orderedAnswers, {
        chunkCount: 3,
      }).map((rowValues, rowIndex) => (
        <div key={rowIndex}>
          {rowValues.map((cell) => {
            if (!("userAnswers" in game.game.status)) throw new Error();
            const index = orderedAnswers.findIndex((val) => val === cell);

            return (
              <div
                className={concatClasses(
                  "section",
                  game.game.status.mode === "post-question" &&
                    "correct" in currentQuestion.answers[cell] &&
                    currentQuestion.answers[cell].correct === false &&
                    "incorrect"
                )}
                key={index}
                style={{
                  backgroundColor: `var(--answer-${
                    isArrangePostQuestion
                      ? game.game.status.displayAnswers.indexOf(index)
                      : index
                  })`,
                }}
              >
                <div className="icon-container">
                  <img
                    src={`/icons/numbers/${
                      (isArrangePostQuestion
                        ? game.game.status.displayAnswers.indexOf(index)
                        : index) + 1
                    }.svg`}
                  />
                </div>
                <div className="answer-text">
                  {currentQuestion.answers[cell].text}
                </div>
                {"image" in currentQuestion.answers[cell] &&
                  currentQuestion.answers[cell].image !== undefined && (
                    <div className="answer-image">
                      <img
                        src={getImageURL(currentQuestion.answers[cell].image)}
                      />
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Leaderboard() {
  const [game, updateGame] = useGameState();
  const { state } = usePaginate<HostPages, "hostGame">();
  const addNotification = useAddNotification();
  if (game.game.status.mode !== "leaderboard")
    throw new Error("Leaderboard component should not be called at this time.");
  const topPlayers = structuredClone(game.users)
    .sort((a, b) => a.points - b.points)
    .slice(0, 5);
  return (
    <>
      <div className="host-game accent introduction leaderboard">
        <div className="details section">
          <div className="title">Leaderboard</div>
        </div>
        <div className="details leaderboard-content">
          {topPlayers.map((e, i) => (
            <button className="section" key={i}>
              <div>{i + 1}</div>
              <div>{e.userName}</div>
              <div>{e.points}</div>
            </button>
          ))}
        </div>
        {game.game.status.question + 1 < game.loq.questions.length && (
          <Button
            onClick={async () => {
              if (game.game.status.mode !== "leaderboard") return;
              const resp = await state.broadcastChannel.send({
                type: "broadcast",
                event: "question_intro",
                payload: {
                  question: game.game.status.question + 1,
                },
              });
              if (resp !== "ok") {
                addNotification(
                  <Notification title="Error">
                    An unexpected error occurred!
                  </Notification>
                );
                return;
              }
              updateGame((game) => {
                if (game.game.status.mode !== "leaderboard") return;
                game.game.status = {
                  mode: "pre-question",
                  question: game.game.status.question + 1,
                };
              });
            }}
          >
            Continue
          </Button>
        )}
      </div>
      <GameFooter />
    </>
  );
}

function GameFooter(props: { accent?: boolean }) {
  const [game] = useGameState();
  return (
    <div className={concatClasses("footer", props.accent && "accent")}>
      <div>
        To join, go to <span className="url">{joinGameURL}</span> and enter{" "}
        <span className="number">{game.game.roomCode}</span>.
      </div>
    </div>
  );
}
