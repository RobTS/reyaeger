import { createReducer } from '@reduxjs/toolkit';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
import type { FanPhase, HeaterPhase } from '../../../types/profile.ts';
import { Actions } from '../../actions';
import { last } from 'lodash-es';

export type ProfileDraftReducerState = {
  id: string;
  name: string;
  heaterPhases: HeaterPhase[];
  fanPhases: FanPhase[];
  createdAt: string;
};

export const profileDraftReducer = createReducer<ProfileDraftReducerState>(
  {
    createdAt: DateTime.now().toISOTime(),
    heaterPhases: [
      {
        temperature: 50,
        time: 0,
      },
      {
        temperature: 212,
        time: 420,
      },
      {
        temperature: 0,
        time: 421,
      },
    ],
    fanPhases: [
      {
        fanSpeed: 90,
        time: 0,
      },
      {
        fanSpeed: 55,
        time: 420,
      },
      {
        fanSpeed: 65,
        time: 421,
      },
    ],
    id: uuidv4(),
    name: 'New Profile',
  },
  (builder) =>
    builder
      .addCase(Actions.addFanPhase, (state) => {
        const lastPhase = last(state.fanPhases);
        state.fanPhases.push({
          fanSpeed: lastPhase?.fanSpeed ? lastPhase?.fanSpeed : 50,
          time: lastPhase?.time ? lastPhase?.time + 60 : 60,
        });
      })
      .addCase(Actions.changeFanPhase, (state, action) => {
        const previousPhase = state.fanPhases[action.payload.index - 1];
        const phase = state.fanPhases[action.payload.index];
        const nextPhase = state.fanPhases[action.payload.index + 1];

        if (!phase) return;
        if (action.payload.fanSpeed !== undefined) {
          phase.fanSpeed = Math.max(
            Math.min(Math.floor(action.payload.fanSpeed), 100),
            0,
          );
        }
        if (action.payload.time !== undefined) {
          const timeInput = Math.floor(action.payload.time);
          if (previousPhase && timeInput <= previousPhase.time) return;
          if (nextPhase && timeInput >= nextPhase.time) return;

          phase.time = action.payload.time;
        }
      })
      .addCase(Actions.changeHeaterPhase, (state, action) => {
        const previousPhase = state.heaterPhases[action.payload.index - 1];
        const phase = state.heaterPhases[action.payload.index];
        const nextPhase = state.heaterPhases[action.payload.index + 1];

        if (!phase) return;
        if (action.payload.temperature !== undefined) {
          phase.temperature = Math.max(
            Math.min(Math.floor(action.payload.temperature), 250),
            0,
          );
        }
        if (action.payload.time !== undefined) {
          const timeInput = Math.floor(action.payload.time);
          if (previousPhase && timeInput <= previousPhase.time) return;
          if (nextPhase && timeInput >= nextPhase.time) return;

          phase.time = action.payload.time;
        }
      })
      .addCase(Actions.removeFanPhase, (state, action) => {
        state.fanPhases.splice(action.payload.index, 1);
      })
      .addCase(Actions.addHeaterPhase, (state) => {
        const lastPhase = last(state.heaterPhases);
        state.heaterPhases.push({
          temperature: lastPhase?.temperature ? lastPhase?.temperature : 210,
          time: lastPhase?.time ? lastPhase?.time + 60 : 60,
        });
      })
      .addCase(Actions.removeHeaterPhase, (state, action) => {
        state.heaterPhases.splice(action.payload.index, 1);
      }),
);
