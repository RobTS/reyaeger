import * as EditorActions from './editor.ts';
import * as GeneralActions from './GeneralActions';
import * as ProfileActions from './profile.ts';

export const Actions = {
  ...EditorActions,
  ...GeneralActions,
  ...ProfileActions,
};
