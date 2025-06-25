export type RecursiveArray<T> = Array<T | RecursiveArray<T>>;
export type ClassArray = RecursiveArray<string | undefined | false | null>;

export type BackendResponse<T> =
  | {
      success: true;
      data: T;
      error: null;
    }
  | {
      success: false;
      data: null;
      error: ResponseError;
    };

export type ResponseError = {
  code: number;
  id: string;
  message: string;
};
