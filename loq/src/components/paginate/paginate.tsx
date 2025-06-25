import { createContext, ReactNode, useContext, useState } from "react";
import { useMutableState } from "../../functions/hooks";

// Allow different states per page
type PaginateProperties<T = any> = {
  [key: string]: T;
};

type NavigatorOptions<
  T extends Record<string, any>,
  P extends keyof T & string
> = {
  currentPage: P;
  setPage: <K extends keyof T>(page: K, state: T[K]) => void;
  state: T[P];
  updateState: ReturnType<typeof useMutableState<T[P]>>[1];
  setState: ReturnType<typeof useMutableState<T[P]>>[2];
};

const PaginateNavigatorContext = createContext<NavigatorOptions<any, any> | undefined>(undefined);

export function PaginateContainer<
  S extends PaginateProperties,
  C extends string,
  P extends keyof S & string = keyof S & string,
>(props: {
  pages: Record<P, ReactNode>;
  defaultPage: C & P;
  defaultState: S[C & P];
  container?: (
    Outlet: () => ReactNode,
    options: NavigatorOptions<S, P>
  ) => ReactNode;
}) {
  const [page, setPage] = useState<P>(props.defaultPage);
  const [state, updateState, setState] = useMutableState<S[P]>(props.defaultState);

  function changePageAndState<K extends keyof S>(newPage: K, newState: S[K]) {
    setPage(newPage as unknown as P); // cast needed because setPage is typed to P
    setState(newState as unknown as S[P]);
  }

  const value: NavigatorOptions<S, P> = {
    currentPage: page,
    setPage: changePageAndState,
    state,
    updateState,
    setState,
  };

  return (
    <PaginateNavigatorContext.Provider value={value}>
      {props.container ? props.container(() => props.pages[page], value) : props.pages[page]}
    </PaginateNavigatorContext.Provider>
  );
}

export function usePaginate<
  T extends PaginateProperties,
  P extends keyof T & string
>() {
  const context = useContext(PaginateNavigatorContext);
  if (!context) throw new Error("No paginate context found.");
  return context as NavigatorOptions<T, P>;
}
