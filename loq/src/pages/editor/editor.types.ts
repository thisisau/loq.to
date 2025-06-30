import type { UUID } from "crypto";

export type LOQ = {
  id: number;
  title: string;
  description: string;
  contents: Contents;
  interactions: number;
  likes: number;
  createdAt: Date;
  lastUpdated: Date;
  lastUsed: Date | null;
  visibility: Visibility;
  copyProtect: boolean;
  author: UUID;
  thumbnail: Image | null;
};

export type Contents = {
  settings: Settings;
  questions: Array<Question>;
};

export type Settings = {
  thumbnail: Image | null;
  title: string;
  description: string;
  options: {
    randomizeQuestionOrder: boolean;
    visibility: Visibility;
    copyProtect: boolean;
  };
};

export type Image = {
  type: "upload";
  path: ImagePath;
};

export type Video = {
  provider: "youtube";
  id: string;
  startTime: number;
};

export type ImagePath = {
  uuid: string;
  fileName: string;
};

export type Visibility = "private" | "unlisted" | "public";

export type Question = {
  title: string;
  description: string;
  media?: QuestionMedia;
  timeLimit: number;
  showInIntroduction: {
    image: boolean;
    description: boolean;
  };
  points: {
    base: number;
    bonus: number;
  };
} & QuestionTypeOptions;

export type QuestionMedia =
  | {
      type: "image";
      data: Image;
    }
  | {
      type: "video";
      data: Video;
    };

export type QuestionTypeOptions =
  | {
      questionType: "multiple-choice" | "multi-select";
      options: {
        randomizeAnswerOrder: boolean;
      };
      answers: MultipleChoiceAnswer[];
    }
  | {
      questionType: "open-ended";
      options: {
        caseSensitive: boolean;
      };
      answers: OpenEndedAnswer[];
    }
  | {
      questionType: "arrange";
      options: {};
      answers: ArrangeAnswer[];
    }
  | { questionType: "true-false"; options: {}; answers: TrueFalseAnswer[] };

export type MultipleChoiceAnswer = IsCorrect & TextImageAnswerContent;
export type ArrangeAnswer = TextImageAnswerContent;
export type TrueFalseAnswer = IsCorrect & TrueFalseAnswerContent;
export type OpenEndedAnswer = {
  text: string;
  type: OpenEndedAnswerType;
};
export type OpenEndedAnswerType = "string";

export type IsCorrect = {
  correct: boolean;
};

export type TextImageAnswerContent = {
  text: string;
  image?: Image;
};

export type TrueFalseAnswerContent = {
  text: "True" | "False";
};

export type QuestionType = Question["questionType"];
