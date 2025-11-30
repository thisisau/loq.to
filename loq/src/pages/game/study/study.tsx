import {
  ReactNode,
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Layout from "../../../components/page/layout";
import { FullscreenLoader } from "../../../components/load";
import { useMutableState } from "../../../functions/hooks";
import Button from "../../../components/input/button";
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
import { Confirm, Modal } from "../../../components/page/modal";
import { useAddAlert } from "../../../components/alerts/alert_hooks";
import {
  concatClasses,
  fadeAudioOut,
  plural,
  shuffle,
  splitArrayIntoChunks,
} from "../../../functions/functions";
import { createContext } from "react";
import { DualColumn } from "../../../components/display/format";
import { questionTypes } from "../../editor/editor";
import { motion } from "motion/react";
import { CountdownTimer } from "../../../components/display/timer";
import { Checkbox } from "../../../components/input/clickable";
import { TextInput } from "../../../components/input/text";
import { answerIsCorrect } from "../host/events";

type StudyPages = {
  studyContent: null;
  studyGame: {
    loq: Contents;
    useTimer: boolean;
  };
};

type GameState = {
  loq: Contents;
  game: {
    status:
      | {
          mode: "pre-game" | "ended";
        }
      | {
          mode: "pre-question";
          question: number;
        }
      | {
          mode: "question" | "post-question";
          question: number;
          displayAnswers: Array<number>;
          startTime: Date;
        };
    userAnswers: Array<GameAnswer | null>;
  };
  useTimer: boolean;
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
  isCorrect: boolean;
  points: {
    base: number;
    bonus: number;
  };
  msTaken: number;
};

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

export default function Study() {
  return (
    <Suspense fallback={<FullscreenLoader />}>
      <Layout className="live host study" hideHeader>
        <PaginateContainer<StudyPages, "studyContent">
          pages={{
            studyContent: <StudyContent />,
            studyGame: <StudyGame />,
          }}
          defaultPage="studyContent"
          defaultState={null}
        />
      </Layout>
    </Suspense>
  );
}

function StudyContent() {
  const addNotification = useAddNotification();
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id ?? null;
  const { setPage } = usePaginate<StudyPages, "studyContent">();

  const { data: loq } = useSuspenseQuery({
    queryKey: ["public", "quizzes", "id", id, "contents", "study"],
    queryFn: () => fetchLOQContents(id ?? NaN),
  }).data;

  const [options, updateOptions] = useMutableState({
    useTimer: false,
    randomizeQuestionOrder:
      loq?.settings.options.randomizeQuestionOrder ?? false,
  });

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
    <>
      <div className="host-game accent">
        <div className="game-preview section">
          <img src="/assets/logos/loq/white.svg" draggable={false} />
          <div className="title">{loq.settings.title}</div>
          <Checkbox
            label="Randomize question order"
            defaultValue={options.randomizeQuestionOrder}
            onChange={(val) =>
              updateOptions((options) => (options.randomizeQuestionOrder = val))
            }
          />
          <Checkbox
            label="Enable time limits"
            defaultValue={options.useTimer}
            onChange={(val) =>
              updateOptions((options) => (options.useTimer = val))
            }
          />
          <Button
            onClick={() => {
              if (options.randomizeQuestionOrder) shuffle(loq.questions);
              loq.questions = loq.questions.filter((e) =>
                ["multiple-choice", "open-ended", "true-false"].includes(
                  e.questionType
                )
              );

              setPage("studyGame", {
                loq,
                useTimer: options.useTimer,
              });
            }}
          >
            Study!
          </Button>
        </div>
      </div>
      <div className="footer">
        <div style={{ textAlign: "center" }}>
          Study mode is still in <span className="url">beta</span>! Currently,
          only <span className="number">multiple-choice</span>,{" "}
          <span className="number">true-false</span>, and{" "}
          <span className="number">open-ended</span> questions are supported.
        </div>
      </div>
    </>
  );
}

function StudyGame() {
  const { state } = usePaginate<StudyPages, "studyGame">();

  const [game, updateGame, setGame] = useMutableState<GameState>({
    loq: state.loq,
    useTimer: state.useTimer,
    game: {
      status: { mode: "pre-game" },
      userAnswers: [],
    },
  });

  const activeAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    switch (game.game.status.mode) {
      case "pre-question":
        activeAudio.current?.pause();
        const audioFileName = [
          "end.mp3",
          "play1.mp3",
          "play2.mp3",
          "lobby.mp3",
        ][Math.floor(Math.random() * 4)];
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
  }, []);

  return (
    <GameContext value={[game, updateGame, setGame]}>
      {(() => {
        switch (game.game.status.mode) {
          case "pre-game":
          case "pre-question":
            return <Preview key={game.game.status.mode} />;
          case "question":
          case "post-question":
            return <Question />;
          case "ended":
            return <Results />;
        }
      })()}
    </GameContext>
  );
}

function Preview() {
  const [game, updateGame] = useGameState();
  const currentQuestion =
    game.game.status.mode === "pre-question"
      ? game.loq.questions[game.game.status.question]
      : null;

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (game.game.status.mode === "pre-game") {
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

        updateGame((game) => {
          if (game.game.status.mode !== "pre-question") return;
          game.game.status = {
            mode: "question",
            question: game.game.status.question,
            displayAnswers,
            startTime: new Date(),
          };
        });
      }
    }, 500);

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
  const [game, updateGame] = useGameState();
  const addAlert = useAddAlert();

  if (!("startTime" in game.game.status)) {
    throw new Error("Question component called with improper game status.");
  }
  const currentQuestion = game.loq.questions[game.game.status.question];

  async function endQuestion(answer: GameAnswer | null) {
    if (game.game.status.mode !== "question") return;

    console.log("QUESTION OVER!!!!!!", answer);

    const pointsGained =
      (answer?.points.base ?? 0) + (answer?.points.bonus ?? 0);

    addAlert(
      <Modal title="Question Results">
        <div>
          <b>
            {answer === null
              ? "Time's up!"
              : answer.isCorrect
              ? "Correct!"
              : "Incorrect"}
          </b>
        </div>
        <div>
          +{pointsGained} {plural("point", pointsGained)}
        </div>
        {game.useTimer && answer && (
          <div>
            Time taken: {Math.round(answer.msTaken / 1000)}/
            {game.loq.questions[game.game.status.question].timeLimit}{" "}
            {plural(
              "second",
              game.loq.questions[game.game.status.question].timeLimit
            )}
          </div>
        )}
      </Modal>
    );

    updateGame((game) => {
      game.game.status.mode = "post-question";
    });
  }

  useEffect(() => {
    console.log(game);
    if (
      game.game.status.mode === "question" &&
      game.game.userAnswers.length === game.game.status.question + 1
    )
      endQuestion(game.game.userAnswers[game.game.userAnswers.length - 1]);
  }, [game.game.userAnswers.length]);

  return (
    <>
      <div
        className={concatClasses(
          "host-game waiting question",
          (!game.useTimer || game.game.status.mode === "post-question") &&
            "no-timer"
        )}
      >
        <div className="player-count">
          {game.game.status.mode === "question" && game.useTimer ? (
            <CountdownTimer
              seconds={currentQuestion.timeLimit}
              onTimerEnd={() =>
                updateGame((game) => game.game.userAnswers.push(null))
              }
              generateChildren={(countdown) => (
                <div className="section">
                  <span className="number">{countdown}</span>
                  <span>{plural("second", countdown)}</span>
                </div>
              )}
            />
          ) : null}
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
        <InfoGrid />
        {game.game.status.mode === "question" ? (
          <div className="start-button">
            <Button
              onClick={() => {
                addAlert(
                  <Confirm
                    title="Confirm Action"
                    onAction={(action) => {
                      if (action)
                        updateGame(
                          (game) =>
                            (game.game.status = {
                              mode: "ended",
                            })
                        );
                    }}
                  >
                    Are you sure you would like to end the quiz?
                  </Confirm>
                );
              }}
            >
              End Quiz
            </Button>
          </div>
        ) : (
          <div className="start-button">
            <Button
              onClick={() => {
                updateGame((game) => {
                  if (!("question" in game.game.status)) return;
                  if (
                    game.game.status.question + 1 ===
                    game.loq.questions.length
                  )
                    game.game.status = {
                      mode: "ended",
                    };
                  else
                    game.game.status = {
                      mode: "pre-question",
                      question: game.game.status.question + 1,
                    };
                });
              }}
            >
              Continue
            </Button>
          </div>
        )}

        <AnswersGrid />
      </div>
      <GameFooter accent />
    </>
  );
}

function InfoGrid() {
  const [game] = useGameState();
  if (!("startTime" in game.game.status))
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
            {game.useTimer ? "Answer before time runs out!" : "Take your time!"}
          </div>
        )}
    </div>
  );
}

function AnswersGrid() {
  const [game, updateGame] = useGameState();
  if (!("startTime" in game.game.status))
    throw new Error("AnswersGrid component called with improper game status.");
  const currentQuestion = game.loq.questions[game.game.status.question];

  if (currentQuestion.questionType === "open-ended") {
    if (game.game.status.mode === "question")
      return (
        <div className="answers">
          <div>
            <div className="section accent">
              <OpenEndedAnswerInput />
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
            if (!("startTime" in game.game.status)) throw new Error();
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
                  cursor:
                    game.game.status.mode === "question"
                      ? "pointer"
                      : undefined,
                }}
                role={
                  game.game.status.mode === "question" ? "button" : undefined
                }
                tabIndex={game.game.status.mode === "question" ? 0 : undefined}
                onClick={
                  game.game.status.mode === "question"
                    ? () => {
                        updateGame((game) =>
                          game.game.userAnswers.push(getUserAnswer(index, game))
                        );
                      }
                    : undefined
                }
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

function OpenEndedAnswerInput() {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<ReactNode | null>(null);
  const [, updateGame] = useGameState();

  return (
    <form
      className="open-ended-input-container"
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
          updateGame((game) =>
            game.game.userAnswers.push(getUserAnswer(answer, game))
          );
        }}
      >
        Submit!
      </Button>
      {error !== null && <div className="login-error">{error}</div>}
    </form>
  );
}

function Results() {
  const [game] = useGameState();

  const score = game.game.userAnswers
            .filter((e) => e !== null)
            .map((e) => [e.points.base, e.points.bonus])
            .reduce((acc, val) => [acc[0] + val[0], acc[1] + val[1]], [0, 0])
            .reduce((acc, val) => acc + val)
  const correctAnswersCount = game.game.userAnswers
            .filter((e) => e !== null)
            .map<number>((e) => (e.isCorrect ? 1 : 0))
            .reduce((acc, val) => acc + val, 0);
  const timeTaken = Math.floor(
    game.game.userAnswers.filter(e => e !== null).map(e => e.msTaken).reduce((acc, val) => acc + val, 0)
  )

  return (
    <div className={concatClasses("host-game accent introduction")}>
      <div className="details section">
        <div className="title">{game.loq.settings.title}</div>
      </div>
      <span
        className="section question-number"
        style={{ display: "flex", alignItems: "center" }}
      >
        <span>
          Score:{" "}
          {score}
        </span>
      </span>
      <span
        className="section question-number"
        style={{ display: "flex", alignItems: "center" }}
      >
        <span>
          {correctAnswersCount}
          /{game.loq.questions.length}{" "}
          {plural("question", game.loq.questions.length)} correct
        </span>
      </span>
      {
        game.useTimer && <span>Time taken: {timeTaken} {plural("second", timeTaken)}</span>
      }
    </div>
  );
}

function GameFooter(props: { accent?: boolean }) {
  const [game] = useGameState();
  return (
    <div className={concatClasses("footer", props.accent && "accent")}>
      <div>
        You are studying{" "}
        <span className="number">{game.loq.settings.title}</span> on{" "}
        <span className="url">loq.to</span>.
      </div>
      <div>
        Score:{" "}
        <span className="number">
          {game.game.userAnswers
            .filter((e) => e !== null)
            .map((e) => [e.points.base, e.points.bonus])
            .reduce((acc, val) => [acc[0] + val[0], acc[1] + val[1]], [0, 0])
            .reduce((acc, val) => acc + val)}
        </span>
      </div>
    </div>
  );
}

function getUserAnswer(
  answer: string | Array<number> | number,
  game: GameState
) {
  if (game.game.status.mode !== "question") throw new Error();
  const questionNumber = game.game.status.question;
  const currentQuestion = game.loq.questions[questionNumber];
  const isCorrect = answerIsCorrect(
    currentQuestion,
    { answer },
    game.game.status.displayAnswers
  );
  const timeAnswered = new Date();

  const timeLimitMilliseconds = currentQuestion.timeLimit * 1000;
  const answerTime = game.useTimer
    ? timeAnswered.getTime() - game.game.status.startTime.getTime()
    : 0;
  let portionOfAvailableTimeTaken = answerTime / timeLimitMilliseconds;
  if (portionOfAvailableTimeTaken > 1) portionOfAvailableTimeTaken = 1;
  else if (portionOfAvailableTimeTaken < 0) portionOfAvailableTimeTaken = 0;

  const points = {
    base: isCorrect ? currentQuestion.points.base : 0,
    bonus: isCorrect
      ? currentQuestion.points.bonus * (1 - portionOfAvailableTimeTaken)
      : 0,
  };

  points.base = Math.round(points.base);
  points.bonus = Math.round(points.bonus);

  return {
    type: currentQuestion.questionType as any,
    answer: answer as any,
    isCorrect,
    msTaken: answerTime,
    points,
  };
}
