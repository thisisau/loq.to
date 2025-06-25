// import { createContext, ReactNode, useContext, useState } from "react";
// import { useMutableState } from "../../functions/hooks";

// type PaginateProperties<T = any> = {
//   [key: string]: T;
// };

// type NavigatorOptions<T extends Record<string, any>, P extends keyof T> = {
//   currentPage: P;
//   setPage: ((page: keyof T, state: T[P]) => void)
//   state: T[P];
//   updateState: ReturnType<typeof useMutableState<T[P]>>[1];
//   setState: ReturnType<typeof useMutableState<T[P]>>[2];
// };

// const PaginateNavigatorContext = createContext<
//   NavigatorOptions<any, any> | undefined
// >(undefined);

// export function PaginateContainer<
//   S extends PaginateProperties,
//   P extends keyof S & string = keyof S extends string
// >(props: {
//   pages: Record<P & string, ReactNode>;
//   defaultPage: P;
//   container?: (
//     Outlet: () => ReactNode,
//     options: NavigatorOptions<S, P & string>
//   ) => ReactNode;
//   defaultState: S[keyof S];
// }) {
//   const [page, setPage] = useState<P>(props.defaultPage);
//   const [state, updateState, setState] = useMutableState<S[keyof S]>(
//     props.defaultState
//   );

//   const changePageAndState = (newPage: string & keyof S & P, newState: S[keyof S]) => {
//     setPage(newPage);
//     setState(newState);
//   };

//   return (
//     <PaginateNavigatorContext.Provider
//       value={{
//         currentPage: page,
//         setPage: changePageAndState,
//         state,
//         updateState,
//         setState,
//       }}
//     >
//       {props.container
//         ? props.container(() => props.pages[page], {
//             currentPage: page,
//             setPage: changePageAndState,
//             state,
//             updateState,
//             setState,
//           })
//         : props.pages[page]}
//     </PaginateNavigatorContext.Provider>
//   );
// }

// export function usePaginate<T extends PaginateProperties<P, any>, P extends string>() {
//   const context = useContext(PaginateNavigatorContext);
//   if (!context) throw new Error("No paginate context found.");
//   return context as NavigatorOptions<T, P>;
// }
