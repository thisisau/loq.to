import { RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import type { UUID } from "crypto";
import { Database } from "../../../supabase/database.types";
import {
  testOrderedArrayEquality,
  testUnorderedArrayEquality,
} from "../../../functions/functions";
import { Question } from "../../editor/editor.types";
import { useGameState } from "./host";

export default function onGameEvent(
  state: ReturnType<typeof useGameState>,
  payload: RealtimePostgresInsertPayload<{
    [key: string]: any;
  }>
) {
  const [game, updateGame] = state;

  // if (handler.current !== newHandler) return;
  const event =
    payload.new as Database["public"]["Tables"]["live_events"]["Row"];
  console.log("An event happened", payload);
  switch (event.event_type) {
    case "user_join":
      const joinPayload = event.payload as {
        display_name: string;
        user_id: UUID;
      };
      updateGame((game) => {
        game.users.push({
          userName: joinPayload["display_name"],
          userID: joinPayload["user_id"],
          points: 0,
          joined: new Date(event.created_at),
        });
      });
      break;
    case "user_answer":
      console.log("User answer!");
      console.log(game);
      if (game.game.status.mode !== "question") return;
      console.log("Going!");
      const questionNumber = game.game.status.question;
      const currentQuestion = game.loq.questions[questionNumber];
      const answerPayload = event.payload as {
        answer: string | Array<number> | number;
      };
      const isCorrect = answerIsCorrect(
        currentQuestion,
        answerPayload,
        game.game.status.displayAnswers
      );
      const timeAnswered = new Date();

      const timeLimitMilliseconds = currentQuestion.timeLimit * 1000;
      const answerTime =
        timeAnswered.getTime() - game.game.status.startTime.getTime();
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

      updateGame((game) => {
        if (game.game.status.mode !== "question") throw new Error("Bad state.");
        game.game.status.userAnswers.push({
          type: currentQuestion.questionType as any,
          answer: answerPayload.answer as any,
          author: event.user_id! as UUID,
          isCorrect: isCorrect,
          answeredAt: timeAnswered,
          points,
        });
      });

      break;
  }
}

function answerIsCorrect(
  currentQuestion: Question,
  answerPayload: { answer: string | Array<number> | number },
  answerOrder: Array<number>
): boolean {
  // Validate answer
  switch (currentQuestion.questionType) {
    case "multiple-choice":
    case "true-false":
      if (typeof answerPayload.answer !== "number") return false;
      break;
    case "arrange":
    case "multi-select":
      if (!(answerPayload.answer instanceof Array)) return false;
      for (let i = 0; i < answerPayload.answer.length; i++) {
        if (i >= currentQuestion.answers.length || typeof i !== "number")
          return false;
      }
      break;
    case "open-ended":
      if (
        typeof answerPayload.answer !== "string" ||
        answerPayload.answer.length > 100
      )
        return false;
      break;
  }

  if (currentQuestion.questionType === "open-ended") {
    let userTextAnswer = answerPayload.answer as string;
    userTextAnswer = userTextAnswer.trim().normalize();
    if (!currentQuestion.options.caseSensitive)
      userTextAnswer = userTextAnswer.toLowerCase();
    return currentQuestion.answers
      .map((answer) => {
        let text = answer.text;
        text = text.trim().normalize();
        if (!currentQuestion.options.caseSensitive) text = text.toLowerCase();
        return text;
      }).filter(answer => answer.length > 0)
      .includes(userTextAnswer);
  }

  // Unshuffle user answers
  let userAnswer = answerPayload.answer as number[] | number;

  if (typeof userAnswer === "number") {
    userAnswer = answerOrder[userAnswer];
  } else {
    userAnswer = userAnswer.map((e) => answerOrder[e]);
  }

  // Test if answer is correct
  switch (currentQuestion.questionType) {
    case "multiple-choice":
    case "true-false":
      return currentQuestion.answers[userAnswer as number].correct;
    case "multi-select":
      return testUnorderedArrayEquality(
        userAnswer as number[],
        currentQuestion.answers
          .map((e, i) => {
            return { index: i, correct: e.correct };
          })
          .filter((e) => e.correct)
          .map((e) => e.index)
      );
    case "arrange":
      return testOrderedArrayEquality(
        userAnswer as number[],
        Array.apply(null, new Array(currentQuestion.answers.length)).map(
          (_, i) => i
        )
      );
  }
}
