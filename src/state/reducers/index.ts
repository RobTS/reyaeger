import { combineReducers } from '@reduxjs/toolkit';
import { Actions } from '../actions';
import { editorReducer } from './editor';

const appReducer = combineReducers({
  editor: editorReducer,
});

// wrapper to allow central store reset, inspired by https://stackoverflow.com/questions/35622588/how-to-reset-the-state-of-a-redux-store
export const rootReducer: typeof appReducer = (state, action) => {
  if (action.type === Actions.resetStore.type) {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};
