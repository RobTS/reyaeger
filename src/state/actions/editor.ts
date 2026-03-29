import { createAction } from '@reduxjs/toolkit';

export const resetProfileDraft = createAction<undefined, 'resetProfileDraft'>(
  'resetProfileDraft',
);

export const addFanPhase = createAction<undefined, 'addFanPhase'>(
  'addFanPhase',
);

export const changeFanPhase = createAction<
  {
    index: number;
    time?: number;
    fanSpeed?: number;
  },
  'changeFanPhase'
>('changeFanPhase');

export const removeFanPhase = createAction<
  {
    index: number;
  },
  'removeFanPhase'
>('removeFanPhase');

export const addHeaterPhase = createAction<undefined, 'addHeaterPhase'>(
  'addHeaterPhase',
);

export const changeHeaterPhase = createAction<
  {
    index: number;
    temperature?: number;
    time?: number;
  },
  'changeHeaterPhase'
>('changeHeaterPhase');

export const removeHeaterPhase = createAction<
  {
    index: number;
  },
  'removeHeaterPhase'
>('removeHeaterPhase');
