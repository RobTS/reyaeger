import { configureStore } from '@reduxjs/toolkit';
import {
  type TypedUseSelectorHook,
  useDispatch as useReduxDispatch,
  useSelector as useReduxSelector,
} from 'react-redux';
import { rootReducer } from './reducers';
import { createLogger } from 'redux-logger';
import { Environment } from '../common/env.ts';

export const createStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (gDM) => {
      if (Environment.isProduction()) return gDM();
      // eslint-disable-next-line
      return gDM().concat(createLogger({}) as any);
    },
  });

export const store = createStore();

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAction: () => AppDispatch = useReduxDispatch;
export const useAppDispatch: () => AppDispatch = useReduxDispatch;

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
export const useAppSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
