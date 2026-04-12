import { createAction } from '@reduxjs/toolkit';
import type { NxProfile } from '../../types/profile.ts';

export const resetProfileDraft = createAction<
  { target: 'roast' | 'editor' },
  'resetProfileDraft'
>('resetProfileDraft');

export const prefillProfileDraft = createAction<
  {
    target: 'roast' | 'editor';
    profile: NxProfile;
  },
  'prefillProfileDraft'
>('prefillProfileDraft');

export const addFanPhase = createAction<
  { target: 'roast' | 'editor'; index?: number },
  'addFanPhase'
>('addFanPhase');

export const changeFanPhase = createAction<
  {
    target: 'roast' | 'editor';
    index: number;
    time?: number;
    fanSpeed?: number;
  },
  'changeFanPhase'
>('changeFanPhase');

export const removeFanPhase = createAction<
  { target: 'roast' | 'editor'; index: number },
  'removeFanPhase'
>('removeFanPhase');

export const addHeaterPhase = createAction<
  { target: 'roast' | 'editor'; index?: number },
  'addHeaterPhase'
>('addHeaterPhase');

export const changeHeaterPhase = createAction<
  {
    target: 'roast' | 'editor';
    index: number;
    temperature?: number;
    time?: number;
  },
  'changeHeaterPhase'
>('changeHeaterPhase');

export const removeHeaterPhase = createAction<
  { target: 'roast' | 'editor'; index: number },
  'removeHeaterPhase'
>('removeHeaterPhase');

export const setProfileName = createAction<
  { target: 'roast' | 'editor'; name: string },
  'setProfileName'
>('setProfileName');

export const setProfileDuration = createAction<
  { target: 'roast' | 'editor'; durationSeconds: number },
  'setProfileDuration'
>('setProfileDuration');
