import Table from "../../../components/display/table";
import { ElementWithTooltip } from "../../../components/tooltip";
import { useGameState } from "./host";

export default function AdvancedAnswerInfo() {
  const [game] = useGameState();

  if (game.game.status.mode !== "post-question") {
    return null;
  }

  return (
    <Table
      className="advanced-question-details"
      columns={{
        user: {
          display: "Player",
          style: {
            flex: "0 0 192px",
            alignItems: "center",
            justifyContent: "center",
          },
        },
        answerTime: {
          display: "Speed",
          style: {
            flex: "0 0 96px",
            alignItems: "center",
            justifyContent: "center",
          },
        },
        pointsEarned: {
          display: "Points",
          style: {
            flex: "0 0 64px",
            alignItems: "center",
            justifyContent: "center",
          },
        },
        correct: {
          display: "Correct?",
          style: {
            flex: "0 0 96px",
            alignItems: "center",
            justifyContent: "center",
          },
        },
        answer: {
          display: "Answer",
          style: {
            flex: "1 1 96px",
            alignItems: "center",
            justifyContent: "center",
          },
        },
      }}
      rows={game.game.status.userAnswers.length}
      changeBackgroundOnHover="row"
      getCell={(row, column) => {
        if (game.game.status.mode !== "post-question") {
          throw new Error();
        }

        const answer = game.game.status.userAnswers[row];

        if (column === "user") {
          const userName = game.users.find(
            (e) => e.userID === answer.author
          )?.userName;
          if (userName !== undefined) {
            return (
              <ElementWithTooltip tooltip={userName}>
                <span>{userName}</span>
              </ElementWithTooltip>
            );
          }
          return <span className="faded-italic">unknown</span>;
        } else if (column === "answerTime") {
          return (
            <span>
              {Math.round(
                answer.answeredAt.getTime() -
                  game.game.status.startTime.getTime()
              ) / 1000}
              s
            </span>
          );
        } else if (column === "pointsEarned") {
          return (
            <ElementWithTooltip
              tooltip={`${answer.points.base} base, ${answer.points.bonus} bonus`}
            >
              <span>{answer.points.base + answer.points.bonus}</span>
            </ElementWithTooltip>
          );
        } else if (column === "correct") {
          return answer.isCorrect ? "\u2713" : "\u2717";
        } else if (column === "answer") {
          const currentQuestion = game.loq.questions[game.game.status.question];
          if (
            currentQuestion.questionType === "multiple-choice" ||
            currentQuestion.questionType === "true-false"
          ) {
            const userAnswer = answer.answer as number;
            return (
              <div className="advanced-info-answer-list individual">
                <div
                  className="advanced-info-answer"
                  style={{ backgroundColor: `var(--answer-${userAnswer})` }}
                >
                  <img
                    src={`/icons/numbers/${userAnswer + 1}.svg`}
                    draggable={false}
                  />
                </div>
                <span>
                  {
                    currentQuestion.answers[
                      game.game.status.displayAnswers[userAnswer]
                    ].text
                  }
                </span>
              </div>
            );
          } else if (currentQuestion.questionType === "open-ended") {
            return <span>{answer.answer}</span>;
          } else {
            const allAnswers = [...(answer.answer as number[])];

            if (currentQuestion.questionType === "multi-select")
              allAnswers.sort((a, b) => a - b);

            return (
              <div className="advanced-info-answer-list">
                {allAnswers.map((userAnswer, i) => {
                  if (game.game.status.mode !== "post-question")
                    throw new Error();
                  return (
                    <ElementWithTooltip
                      key={i}
                      tooltip={
                        currentQuestion.answers[
                          game.game.status.displayAnswers[userAnswer]
                        ].text
                      }
                    >
                      <div
                        className="advanced-info-answer"
                        style={{
                          backgroundColor: `var(--answer-${userAnswer})`,
                        }}
                      >
                        <img
                          draggable={false}
                          src={`/icons/numbers/${userAnswer + 1}.svg`}
                        />
                      </div>
                    </ElementWithTooltip>
                  );
                })}
              </div>
            );
          }
        }
      }}
    />
  );
}
