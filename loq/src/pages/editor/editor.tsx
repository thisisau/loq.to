import {
  createContext,
  CSSProperties,
  useContext,
  useEffect,
  useState,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Contents,
  Image,
  MultipleChoiceAnswer,
  OpenEndedAnswer,
  Question,
  QuestionType,
  TextImageAnswerContent,
  TrueFalseAnswer,
  Video,
  Visibility,
} from "./editor.types";

import Loader from "../../components/load";
import { useMutableState } from "../../functions/hooks";
import Layout from "../../components/page/layout";
import { PaginateContainer } from "../../components/paginate/paginate";
import {
  ButtonIconWithTooltip,
  ElementWithTooltip,
} from "../../components/tooltip";
import { TextInput } from "../../components/input/text";
import { Checkbox } from "../../components/input/clickable";
import { DropdownInput } from "../../components/input/dropdown";
import { FormItem, FormItemWithTitle } from "../../components/input/form";
import { useAddAlert } from "../../components/alerts/alert_hooks";
import { Modal } from "../../components/page/modal";
import {
  concatClasses,
  copyToClipboard,
  getYoutubeVideoID,
} from "../../functions/functions";
import Button from "../../components/input/button";
import { useAddNotification } from "../../components/page/notification/hooks";
import Notification from "../../components/page/notification/notification";
import { AnimatePresence, motion } from "motion/react";
import supabase from "../../supabase/client";
import { useUserInfo } from "../../functions/userInfo";

const questionTypes: Array<{ type: QuestionType; display: string }> = [
  {
    type: "multiple-choice",
    display: "Multiple Choice",
  },
  {
    type: "true-false",
    display: "True/False",
  },
  {
    type: "open-ended",
    display: "Open-ended",
  },
  {
    type: "multi-select",
    display: "Multi-select",
  },
  {
    type: "arrange",
    display: "Arrange",
  },
];

function getEmptyAnswer(type: QuestionType): Question["answers"][number] {
  switch (type) {
    case "multiple-choice":
    case "multi-select":
    case "true-false":
      return {
        text: "",
        correct: false,
      };
    case "arrange": {
      return {
        text: "",
      };
    }
    case "open-ended": {
      return {
        text: "",
        type: "string",
      };
    }
  }
}

function getEmptyQuestion(): Question {
  return {
    title: "Untitled Question",
    description: "",
    timeLimit: 15,
    showInIntroduction: {
      image: true,
      description: true,
    },
    points: {
      base: 750,
      bonus: 250,
    },
    questionType: "multiple-choice",
    options: {
      randomizeAnswerOrder: false,
    },
    answers: [
      {
        correct: false,
        text: "",
      },
      {
        correct: false,
        text: "",
      },
    ],
  };
}

function getEmptyLOQ(): Contents {
  return {
    settings: {
      title: "Untitled LOQ",
      description: "",
      options: {
        randomizeQuestionOrder: false,
        visibility: "public",
        copyProtect: false,
      },
    },
    questions: [getEmptyQuestion()],
  };
}

export default function EditorContainer(props: { initialID?: string }) {
  const params = useParams();
  const [id, setID] = useState(params.id ?? null);

  console.log("id is", id);

  // return <div><Loader /></div>;

  return <Editor initialContents={getEmptyLOQ()} />;
}

const LOQContext = createContext<
  ReturnType<typeof useMutableState<Contents>> | undefined
>(undefined);

function useLOQ(): ReturnType<typeof useMutableState<Contents>> {
  const loq = useContext(LOQContext);
  const [page, setPage] = useActivePage();

  useEffect(() => {
    console.log("unsaved?", page.unsavedChanges);

    if (page.unsavedChanges) window.onbeforeunload = () => true;
    else window.onbeforeunload = null;
  }, [page]);

  if (loq === undefined) {
    throw new Error("useLOQ called outside of context.");
  }
  return [
    loq[0],
    (callback: (state: Contents) => void) => {
      loq[1](callback);
      setPage({ ...page, unsavedChanges: true });
    },
    loq[2],
  ];
}

type EditorPage = (
  | {
      mode: "settings";
    }
  | { mode: "question"; question: number }
) & {
  unsavedChanges: boolean;
};

const ActivePageContext = createContext<
  [EditorPage, (newPage: EditorPage) => void] | undefined
>(undefined);

function useActivePage() {
  const activePage = useContext(ActivePageContext);
  if (activePage === undefined) {
    throw new Error("useActivePage called outside of context.");
  }
  return activePage;
}

function Editor(props: { initialContents: Contents }) {
  const loq = useMutableState(props.initialContents);
  const page = useState<EditorPage>(
    loq[0].questions.length > 0
      ? {
          mode: "question",
          question: 0,
          unsavedChanges: false,
        }
      : { mode: "settings", unsavedChanges: false }
  );

  return (
    <LOQContext.Provider value={loq}>
      <ActivePageContext.Provider value={page}>
        <Layout hideHeader>
          <div className="loq-editor">
            <EditorSidebar />
            {page[0].mode === "settings" ? <Settings /> : <Questions />}
          </div>
        </Layout>
      </ActivePageContext.Provider>
    </LOQContext.Provider>
  );
}

function EditorSidebar() {
  const [quiz, updateQuiz] = useLOQ();
  const [page, setPage] = useActivePage();

  const user = useUserInfo();

  const addNotification = useAddNotification();

  const params = useParams();
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Link to="/" draggable={false}>
          <img
            src="/assets/logos/loq/white.svg"
            alt="loq.to Logo"
            draggable={false}
          />
        </Link>
      </div>
      <div className="sidebar-buttons sidebar-subheader">
        <button
          className={concatClasses(
            "settings-button nav-button",
            page.mode === "settings" && "active"
          )}
          onClick={() => {
            setPage({
              mode: "settings",
              unsavedChanges: page.unsavedChanges,
            });
          }}
        >
          <span>{quiz.settings.title}</span>
          <img src="/icons/settings.svg" alt="Settings" className="icon" />
        </button>
        <button
          className={concatClasses(
            "save-button nav-button",
            page.unsavedChanges && "attention-needed"
          )}
          onClick={async () => {
            if (user.id === "") {
              addNotification(
                <Notification title="Error">
                  You must be logged in to perform this action.
                </Notification>
              );
              return;
            }
            const id = isNaN(Number(params.id)) ? -1 : Number(params.id);
            addNotification(
              <Notification title="Uploading..." time={4000}>
                Saving your loq...
              </Notification>
            );

            const { data, error } = await supabase.rpc("upload_loq", {
              loq_id: id,
              loq_contents: quiz,
            });
            if (error) {
              addNotification(
                <Notification title="Error">
                  An error occured: {error.message}
                </Notification>
              );
              return;
            }
            addNotification(
              <Notification title="Success!" time={4000}>
                Your loq has been saved.
              </Notification>
            );
            setPage({
              ...page,
              unsavedChanges: false
            })
            if (data && data !== id) {
              navigate(`/editor/${data}`);
            }
          }}
        >
          Save
        </button>
      </div>
      <div className="sidebar-buttons sidebar-questions">
        {quiz.questions.map((question, i) => (
          <button
            key={i}
            onClick={() => {
              setPage({
                mode: "question",
                question: i,
                unsavedChanges: page.unsavedChanges,
              });
            }}
            className={concatClasses(
              "nav-button",
              page.mode === "question" && i === page.question && "active"
            )}
          >
            <span>
              {i + 1}. {question.title}
            </span>
          </button>
        ))}
      </div>
      <div className="sidebar-buttons sidebar-footer">
        <button
          className="nav-button settings-button add-question-button"
          onClick={() => {
            updateQuiz((loq) => {
              loq.questions.push(getEmptyQuestion());
            });
            setPage({
              mode: "question",
              question: quiz.questions.length,
              unsavedChanges: page.unsavedChanges,
            });
          }}
        >
          <img className="icon" alt="Trash can" src="/icons/plus.svg" />
          <span>Add question</span>
        </button>
        <ElementWithTooltip tooltip="Delete question">
          <button
            className={concatClasses(
              "nav-button remove-question-button",
              page.mode !== "question" && "no-access"
            )}
            onClick={() => {
              if (page.mode !== "question" || quiz.questions.length === 0)
                return;
              updateQuiz((loq) => {
                loq.questions.splice(page.question, 1);
              });
              if (page.question === quiz.questions.length - 1) {
                if (quiz.questions.length > 1)
                  setPage({
                    mode: "question",
                    question: Math.max(page.question - 1),
                    unsavedChanges: page.unsavedChanges,
                  });
                else
                  setPage({
                    mode: "settings",
                    unsavedChanges: page.unsavedChanges,
                  });
              }
            }}
          >
            <img className="icon" alt="Trash can" src="/icons/trash.svg" />
          </button>
        </ElementWithTooltip>
      </div>
    </div>
  );
}

function Settings() {
  const [quiz, updateQuiz] = useLOQ();
  const addAlert = useAddAlert();
  return (
    <div className="editor-content settings">
      <TextInput
        placeholder="Add a title…"
        maxLength={120}
        defaultValue={quiz.settings.title}
        onUpdate={(val) => updateQuiz((loq) => (loq.settings.title = val))}
        onBlur={(val) => {
          val = val.trim();
          if (val === "") val = getEmptyLOQ().settings.title;
          updateQuiz((loq) => (loq.settings.title = val));
        }}
        onFocus={(val, _, e) => {
          if (val === getEmptyLOQ().settings.title) {
            e.target.select();
          }
        }}
        className="title-input"
        textAlign="center"
      />
      <TextInput
        placeholder="Add a description…"
        maxLength={240}
        defaultValue={quiz.settings.description}
        onUpdate={(val) =>
          updateQuiz((loq) => (loq.settings.description = val))
        }
        onBlur={(val) => {
          val = val.trim();
          updateQuiz((loq) => (loq.settings.description = val));
        }}
        className="description-input"
        textAlign="center"
        textArea
      />
      <div className="question-image-upload section">
        <ButtonIconWithTooltip
          src="/icons/media-image-plus.svg"
          tooltip="Add a thumbnail for this loq"
          onClick={() =>
            addAlert((clear) => (
              <ImageManager
                onSubmit={(image) => {
                  updateQuiz((loq) => (loq.settings.thumbnail = image));
                  clear();
                }}
              />
            ))
          }
        />
      </div>
      <div className="question-options section">
        <FormItem>
          <Checkbox
            label="Randomize question order"
            onChange={(val) => {
              updateQuiz(
                (loq) => (loq.settings.options.randomizeQuestionOrder = val)
              );
            }}
            defaultValue={quiz.settings.options.randomizeQuestionOrder}
          />
        </FormItem>
        <FormItem>
          <Checkbox
            label="Copy-protect"
            onChange={(val) => {
              updateQuiz((loq) => (loq.settings.options.copyProtect = val));
            }}
            defaultValue={quiz.settings.options.copyProtect}
          />
        </FormItem>
        <FormItemWithTitle title="Visibility">
          <DropdownInput
            headAriaLabel="Visibility dropdown"
            options={["Public", "Unlisted", "Private"]}
            defaultOption={
              quiz.settings.options.visibility === "public"
                ? 0
                : quiz.settings.options.visibility === "unlisted"
                ? 1
                : 2
            }
            onUpdate={(val) => {
              updateQuiz((loq) => {
                switch (val) {
                  case 0:
                    loq.settings.options.visibility = "public";
                    break;
                  case 1:
                    loq.settings.options.visibility = "unlisted";
                    break;
                  case 2:
                    loq.settings.options.visibility = "private";
                    break;
                }
              });
            }}
          />
        </FormItemWithTitle>
      </div>
    </div>
  );
}

function Questions() {
  const [quiz, updateQuiz] = useLOQ();
  const [page] = useActivePage();
  const addAlert = useAddAlert();
  const addNotification = useAddNotification();

  if (page.mode === "settings")
    throw new Error("Questions component called in settings mode");

  const currentQuestion = page.question;

  return (
    <div
      className={concatClasses(
        "editor-content questions",
        quiz.questions[currentQuestion].questionType
      )}
    >
      <TextInput
        placeholder="Add a title…"
        maxLength={120}
        defaultValue={quiz.questions[currentQuestion].title}
        onUpdate={(val) =>
          updateQuiz((loq) => (loq.questions[currentQuestion].title = val))
        }
        onBlur={(val) => {
          val = val.trim();
          if (val === "") val = getEmptyQuestion().title;
          updateQuiz((loq) => (loq.questions[currentQuestion].title = val));
        }}
        onFocus={(val, _, e) => {
          if (val === getEmptyQuestion().title) {
            e.target.select();
          }
        }}
        className="title-input"
        textAlign="center"
      />
      <TextInput
        placeholder="Add a description…"
        maxLength={240}
        defaultValue={quiz.questions[currentQuestion].description}
        onUpdate={(val) =>
          updateQuiz(
            (loq) => (loq.questions[currentQuestion].description = val)
          )
        }
        onBlur={(val) => {
          val = val.trim();
          updateQuiz(
            (loq) => (loq.questions[currentQuestion].description = val)
          );
        }}
        className="description-input"
        textAlign="center"
        textArea
      />
      <div className="question-image-upload section">
        {quiz.questions[currentQuestion].media === undefined ? (
          <>
            <ButtonIconWithTooltip
              src="/icons/media-image-plus.svg"
              tooltip="Add an image for this question"
              onClick={() =>
                addAlert((clear) => (
                  <ImageManager
                    onSubmit={(image) => {
                      updateQuiz(
                        (loq) =>
                          (loq.questions[currentQuestion].media = {
                            type: "image",
                            data: image,
                          })
                      );
                      clear();
                    }}
                  />
                ))
              }
            />
            <ButtonIconWithTooltip
              src="/icons/youtube.svg"
              tooltip="Add a YouTube video for this question"
              onClick={() => {
                addAlert((clear) => (
                  <YoutubeLinkInputModal
                    onSubmit={(val) => {
                      updateQuiz(
                        (loq) =>
                          (loq.questions[currentQuestion].media = {
                            type: "video",
                            data: {
                              provider: "youtube",
                              id: val,
                              startTime: 0,
                            },
                          })
                      );
                      clear();
                    }}
                  />
                ));
              }}
            />
          </>
        ) : (
          <>
            <div className="media-preview">
              {quiz.questions[currentQuestion].media.type === "video" ? (
                <iframe
                  src={getVideoURL(
                    quiz.questions[currentQuestion].media.data,
                    true
                  )}
                />
              ) : (
                <img
                  src={getImageURL(quiz.questions[currentQuestion].media.data)}
                />
              )}
            </div>
            <div className="controls">
              <ButtonIconWithTooltip
                src="/icons/xmark.svg"
                tooltip={`Remove this ${quiz.questions[currentQuestion].media.type}`}
                onClick={() =>
                  updateQuiz(
                    (loq) => delete loq.questions[currentQuestion].media
                  )
                }
              />
              <ButtonIconWithTooltip
                src="/icons/copy.svg"
                tooltip={`Copy media URL`}
                onClick={async () => {
                  const questionMedia = quiz.questions[currentQuestion].media!;
                  if (questionMedia.type === "image") {
                    await copyToClipboard(getImageURL(questionMedia.data));
                  } else {
                    await copyToClipboard(
                      getVideoURL(questionMedia.data, false)
                    );
                  }
                  addNotification(
                    <Notification title="Notification" time={4000}>
                      Copied link to clipboard!
                    </Notification>
                  );
                }}
              />
            </div>
          </>
        )}
      </div>
      <AnswerEditor />
      <div className="question-options section">
        <FormItemWithTitle title="Question Type">
          <DropdownInput
            headAriaLabel="Question Type dropdown"
            options={questionTypes.map((e) => e.display)}
            defaultOption={questionTypes.findIndex(
              (e) => e.type === quiz.questions[currentQuestion].questionType
            )}
            onUpdate={(newType) => {
              updateQuiz(
                (loq) =>
                  (loq.questions[currentQuestion] = transformQuestion(
                    loq.questions[currentQuestion],
                    questionTypes[newType].type
                  ))
              );
            }}
          />
        </FormItemWithTitle>
        <FormItemWithTitle title="Time Limit (seconds)">
          <TextInput
            textAlign="center"
            defaultValue={"" + quiz.questions[currentQuestion].timeLimit}
            onBlur={(val, set) => {
              let userInput = Number(val);
              if (!isFinite(userInput)) {
                set("" + quiz.questions[currentQuestion].timeLimit);
                return;
              }
              userInput = Math.floor(userInput);
              if (userInput < 1) userInput = 1;
              if (userInput > 300) userInput = 300;
              set("" + userInput);
              updateQuiz(
                (loq) => (loq.questions[currentQuestion].timeLimit = userInput)
              );
            }}
          />
        </FormItemWithTitle>
        <FormItemWithTitle title="Total Points">
          <TextInput
            textAlign="center"
            defaultValue={
              "" +
              (quiz.questions[currentQuestion].points.base +
                quiz.questions[currentQuestion].points.bonus)
            }
            onBlur={(val, set) => {
              let userInput = Number(val);
              const questionPoints = quiz.questions[currentQuestion].points;
              if (userInput === questionPoints.base + questionPoints.bonus)
                return;
              if (!isFinite(userInput)) {
                set("" + (questionPoints.base + questionPoints.bonus));
                return;
              }
              userInput = Math.floor(userInput);
              if (userInput < 0) userInput = 0;
              if (userInput > 100000) userInput = 100000;

              const bonusPercentOfTotalPoints = 0.25;

              const bonusPoints = Math.ceil(
                userInput * bonusPercentOfTotalPoints
              );

              set("" + userInput);
              updateQuiz(
                (loq) =>
                  (loq.questions[currentQuestion].points = {
                    base: userInput - bonusPoints,
                    bonus: bonusPoints,
                  })
              );
            }}
          />
        </FormItemWithTitle>
        {"randomizeAnswerOrder" in quiz.questions[currentQuestion].options && (
          <FormItem>
            <Checkbox
              label="Answers appear in random order"
              defaultValue={
                quiz.questions[currentQuestion].options.randomizeAnswerOrder
              }
              onChange={(e) => {
                updateQuiz(
                  (loq) =>
                    ((
                      loq.questions[currentQuestion].options as {
                        randomizeAnswerOrder: boolean;
                      }
                    ).randomizeAnswerOrder = e)
                );
              }}
            />
          </FormItem>
        )}
        {"caseSensitive" in quiz.questions[currentQuestion].options && (
          <FormItem>
            <Checkbox
              label="Player input is case-sensitive"
              defaultValue={
                quiz.questions[currentQuestion].options.caseSensitive
              }
              onChange={(e) => {
                updateQuiz(
                  (loq) =>
                    ((
                      loq.questions[currentQuestion].options as {
                        caseSensitive: boolean;
                      }
                    ).caseSensitive = e)
                );
              }}
            />
          </FormItem>
        )}
        <FormItem>
          <Checkbox
            label="Show description in question intro"
            defaultValue={
              quiz.questions[currentQuestion].showInIntroduction.description
            }
            onChange={(e) => {
              updateQuiz(
                (loq) =>
                  (loq.questions[
                    currentQuestion
                  ].showInIntroduction.description = e)
              );
            }}
          />
        </FormItem>
        <FormItem>
          <Checkbox
            label="Show image in question intro"
            defaultValue={
              quiz.questions[currentQuestion].showInIntroduction.image
            }
            onChange={(e) => {
              updateQuiz(
                (loq) =>
                  (loq.questions[currentQuestion].showInIntroduction.image = e)
              );
            }}
          />
        </FormItem>
        <FormItemWithTitle title="Base Points">
          <TextInput
            textAlign="center"
            defaultValue={"" + quiz.questions[currentQuestion].points.base}
            onBlur={(val, set) => {
              let userInput = Number(val);
              if (!isFinite(userInput)) {
                set("" + quiz.questions[currentQuestion].points.base);
                return;
              }
              userInput = Math.floor(userInput);
              if (userInput < 0) userInput = 0;
              if (userInput > 75000) userInput = 75000;
              set("" + userInput);
              updateQuiz(
                (loq) =>
                  (loq.questions[currentQuestion].points.base = userInput)
              );
            }}
          />
        </FormItemWithTitle>
        <FormItemWithTitle title="Time Bonus">
          <TextInput
            textAlign="center"
            defaultValue={"" + quiz.questions[currentQuestion].points.bonus}
            onBlur={(val, set) => {
              let userInput = Number(val);
              if (!isFinite(userInput)) {
                set("" + quiz.questions[currentQuestion].points.bonus);
                return;
              }
              userInput = Math.floor(userInput);
              if (userInput < 0) userInput = 0;
              if (userInput > 25000) userInput = 25000;
              set("" + userInput);
              updateQuiz(
                (loq) =>
                  (loq.questions[currentQuestion].points.bonus = userInput)
              );
            }}
          />
        </FormItemWithTitle>
      </div>
    </div>
  );
}

function AnswerEditor() {
  const [quiz, updateQuiz] = useLOQ();
  const [page] = useActivePage();

  if (page.mode === "settings")
    throw new Error("Answer editor component called in settings mode");

  const currentQuestion = page.question;

  const questionType = quiz.questions[currentQuestion].questionType;

  return (
    <div className="answers">
      {quiz.questions[currentQuestion].answers.map((currentAnswer, index) => {
        return (
          <div
            className="answer section"
            style={{ backgroundColor: `var(--answer-${index % 12})` }}
            key={index}
          >
            <AnswerOptionsPopout
              index={index}
              currentAnswer={currentAnswer}
              key={`desktop-popout-${index}-of-${quiz.questions[currentQuestion].answers.length}`}
              className="desktop"
            />

            <AnswerOptionsPopout
              index={index}
              currentAnswer={currentAnswer}
              key={`mobile-popout-${index}-of-${quiz.questions[currentQuestion].answers.length}`}
              isOpen
              className="mobile"
            />

            {questionProperties[questionType].editable ? (
              <TextInput
                className="answer-input"
                defaultValue={currentAnswer.text}
                maxLength={100}
                onUpdate={(e) =>
                  updateQuiz(
                    (loq) =>
                      (loq.questions[currentQuestion].answers[index].text = e)
                  )
                }
                onBlur={(val) => {
                  val = val.trim();
                  updateQuiz(
                    (loq) =>
                      (loq.questions[currentQuestion].answers[index].text = val)
                  );
                }}
                placeholder={
                  questionType === "arrange"
                    ? `Item #${index + 1}`
                    : questionType === "open-ended"
                    ? index === 0
                      ? "Add answer"
                      : "Add alternate answer"
                    : `Option ${index + 1}`
                }
              />
            ) : (
              <div className="answer-input">{currentAnswer.text}</div>
            )}
          </div>
        );
      })}
      {quiz.questions[currentQuestion].answers.length <
        questionProperties[questionType].maxAnswers && (
        <Button
          className="add-answer section"
          style={{
            backgroundColor: `var(--answer-${
              quiz.questions[currentQuestion].answers.length % 12
            })`,
          }}
          onClick={() =>
            updateQuiz((loq) =>
              loq.questions[currentQuestion].answers.push(
                getEmptyAnswer(questionType) as any
              )
            )
          }
        >
          Add answer
        </Button>
      )}
    </div>
  );
}

function AnswerOptionsPopout(props: {
  index: number;
  currentAnswer:
    | TextImageAnswerContent
    | OpenEndedAnswer
    | MultipleChoiceAnswer
    | TrueFalseAnswer;
  isOpen?: boolean;
  className?: string;
}) {
  const [isOpen, changeIsOpen] = useState(props.isOpen ?? false);
  const setIsOpen = (newValue: boolean) => {
    changeIsOpen(props.isOpen ?? newValue);
  };
  const addAlert = useAddAlert();
  const [quiz, updateQuiz] = useLOQ();
  const [page] = useActivePage();

  const { index, currentAnswer } = props;

  if (page.mode === "settings")
    throw new Error("Answer editor component called in settings mode");

  const currentQuestion = page.question;

  return (
    <div
      className={concatClasses(
        "popout dropdown",
        isOpen && "open",
        props.className
      )}
      key={index}
      style={
        {
          "--answer-theme-color": `var(--answer-${index})`,
        } as CSSProperties
      }
    >
      <div
        className="dropdown-head"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        style={{
          backgroundColor: `var(--answer-${index})`,
        }}
      >
        <ButtonIconWithTooltip
          aria-label={
            "correct" in currentAnswer
              ? `Button to mark answer as ${
                  !currentAnswer.correct ? "correct" : "incorrect"
                }. Answer is currently marked as ${
                  currentAnswer.correct ? "correct" : "incorrect"
                }`
              : `Options for answer #${index + 1}`
          }
          src={
            "correct" in currentAnswer
              ? currentAnswer.correct
                ? "/icons/check-circle-solid.svg"
                : "/icons/circle.svg"
              : `/icons/numbers/${Math.min(16, index + 1)}.svg`
          }
          className={concatClasses(
            "correct" in currentAnswer && currentAnswer.correct && "checked",
            "correct" in currentAnswer && "checkbox"
          )}
          onClick={() => {
            updateQuiz((loq) => {
              const answer = loq.questions[currentQuestion].answers[index];

              if (!("correct" in answer)) return;

              answer.correct = !answer.correct;
            });
          }}
        />
      </div>
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
              style={{
                width: 8,
                left: "100%",
                top: "-100%",
                position: "relative",
                height: "100%",
              }}
              className="desktop"
            />
            <motion.div
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setIsOpen(false)}
              className="dropdown-body"
              // style={{
              //   backgroundColor: `var(--answer-${index})`,
              // }}
              initial={{
                scaleX: props.isOpen !== true ? 0 : undefined,
                transformOrigin: "center left",
                // translateX: 8,
              }}
              animate={{
                scaleX: 1,
                transition: {
                  duration: 0.1,
                  ease: "easeOut",
                },
              }}
              exit={{
                scaleX: 0,
                transition: {
                  duration: 0.1,
                  ease: "easeOut",
                },
              }}
            >
              {quiz.questions[currentQuestion].answers.length >
                questionProperties[quiz.questions[currentQuestion].questionType]
                  .minAnswers && (
                <ButtonIconWithTooltip
                  aria-label="Remove this answer"
                  src={"/icons/trash.svg"}
                  onClick={() => {
                    updateQuiz((loq) => {
                      loq.questions[currentQuestion].answers.splice(index, 1);
                    });
                  }}
                />
              )}
              {questionProperties[quiz.questions[currentQuestion].questionType]
                .supportsImageAnswer && (
                <ButtonIconWithTooltip
                  aria-label={`Button to ${
                    (currentAnswer as TextImageAnswerContent).image
                      ? "remove an image from"
                      : "add an image to"
                  } this answer.`}
                  src={
                    (currentAnswer as TextImageAnswerContent).image
                      ? "/icons/media-image-xmark.svg"
                      : "/icons/media-image-plus.svg"
                  }
                  onClick={() => {
                    if ((currentAnswer as TextImageAnswerContent).image)
                      updateQuiz(
                        (loq) =>
                          delete (
                            loq.questions[currentQuestion].answers[
                              index
                            ] as TextImageAnswerContent
                          ).image
                      );
                    else
                      addAlert(
                        <ImageManager
                          onSubmit={(image) =>
                            updateQuiz(
                              (loq) =>
                                ((
                                  loq.questions[currentQuestion].answers[
                                    index
                                  ] as TextImageAnswerContent
                                ).image = image)
                            )
                          }
                        />
                      );
                  }}
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function transformQuestion(question: Question, targetType: QuestionType) {
  const newQuestion = structuredClone(question);
  newQuestion.questionType = targetType;
  switch (targetType) {
    case "multiple-choice":
    case "multi-select":
      newQuestion.options = {
        randomizeAnswerOrder:
          "randomizeAnswerOrder" in question.options
            ? question.options.randomizeAnswerOrder
            : false,
      };
      break;
    case "open-ended":
      newQuestion.options = {
        caseSensitive:
          "caseSensitive" in question.options
            ? question.options.caseSensitive
            : false,
      };
      break;
    default:
      newQuestion.options = {};
  }
  if (targetType == "true-false") {
    newQuestion.answers = [
      {
        text: "True",
        correct: false,
      },
      {
        text: "False",
        correct: false,
      },
    ];
  } else {
    newQuestion.answers = newQuestion.answers.map((answer) => {
      switch (targetType) {
        case "multiple-choice":
        case "multi-select":
          return {
            text: answer.text,
            correct: "correct" in answer ? answer.correct : false,
            image: "image" in answer ? answer.image : undefined,
          };
        case "arrange":
          return {
            text: answer.text,
            image: "image" in answer ? answer.image : undefined,
          };
        case "open-ended":
          return {
            text: answer.text,
            type: "string",
          };
      }
    });
    const maxAnswers = questionProperties[targetType].maxAnswers;
    const minAnswers = questionProperties[targetType].minAnswers;
    if (newQuestion.answers.length > maxAnswers) {
      newQuestion.answers.splice(maxAnswers);
    } else
      while (newQuestion.answers.length < minAnswers) {
        newQuestion.answers.push(getEmptyAnswer(targetType));
      }
  }

  return newQuestion;
}

const questionProperties: {
  [k in QuestionType]: {
    maxAnswers: number;
    minAnswers: number;
    defaultAnswer: Question["answers"][number];
    supportsImageAnswer: boolean;
    editable: boolean;
  };
} = {
  "multiple-choice": {
    maxAnswers: 12,
    minAnswers: 2,
    defaultAnswer: {
      text: "",
      correct: false,
    },
    supportsImageAnswer: true,
    editable: true,
  },
  "multi-select": {
    maxAnswers: 12,
    minAnswers: 2,
    defaultAnswer: {
      text: "",
      correct: false,
    },
    supportsImageAnswer: true,
    editable: true,
  },
  "true-false": {
    maxAnswers: 2,
    minAnswers: 2,
    defaultAnswer: {
      text: "True",
      correct: false,
    },
    supportsImageAnswer: false,
    editable: false,
  },
  "open-ended": {
    maxAnswers: 50,
    minAnswers: 1,
    defaultAnswer: {
      text: "",
      type: "string",
    },
    supportsImageAnswer: false,
    editable: true,
  },
  arrange: {
    maxAnswers: 9,
    minAnswers: 2,
    defaultAnswer: {
      text: "",
    },
    supportsImageAnswer: true,
    editable: true,
  },
};

function YoutubeLinkInputModal(props: { onSubmit: (id: string) => void }) {
  const [url, setURL] = useState("");

  const videoID = getYoutubeVideoID(url);

  return (
    <Modal title="YouTube URL" flexibleHeight>
      <div className="modal-input-container">
        {videoID ? (
          <div className="preview">
            <iframe
              src={`https://www.youtube.com/embed/${videoID}?autoplay=0`}
            />
          </div>
        ) : (
          <div className="preview">
            <img
              src="/icons/youtube.svg"
              className="placeholder-icon"
              draggable={false}
            />
          </div>
        )}
        <div className="modal-input">
          <TextInput
            defaultValue={url}
            onUpdate={(val) => setURL(val)}
            placeholder="Add a YouTube URL..."
          />
          <Button
            className={concatClasses(videoID === null && "no-access")}
            onClick={() => {
              if (videoID !== null) props.onSubmit(videoID);
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ImageManager(props: { onSubmit: (image: Image) => void }) {
  return <Modal title="Image Manager">Coming soon!</Modal>;
}

function getImageURL(image: Image): string {
  return "";
}

function getVideoURL(video: Video, embed: boolean): string {
  switch (video.provider) {
    case "youtube":
      if (embed)
        return `https://www.youtube.com/embed/${video.id}?autoplay=0&t=${video.startTime}`;
      return `https://www.youtube.com/watch?v=${video.id}&t=${video.startTime}`;
  }
}
