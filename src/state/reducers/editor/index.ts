import { combineReducers } from '@reduxjs/toolkit';
import { profileDraftReducer } from './profileDraft.ts';

export const editorReducer = combineReducers({
  editorDraft: profileDraftReducer('editor'),
  roastDraft: profileDraftReducer('roast'),
});
