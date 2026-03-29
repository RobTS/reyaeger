import { Provider } from 'react-redux';
import { store } from './state/store.ts';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

export const ReduxProvider: React.FC<Props> = (props) => {
  return <Provider store={store}>{props.children}</Provider>;
};
