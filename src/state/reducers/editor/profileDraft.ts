import { createReducer } from '@reduxjs/toolkit';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
import type { FanPhase, HeaterPhase } from '../../../types/profile.ts';
import { Actions } from '../../actions';

export type ProfileDraftReducerState = {
  id: string;
  name: string;
  heaterPhases: HeaterPhase[];
  fanPhases: FanPhase[];
  createdAt: string;
};

const DEFAULT_VALUES: {
  heaterPhases: HeaterPhase[];
  fanPhases: FanPhase[];
} = {
  heaterPhases: [
    {
      time: 0,
      temperature: 50,
    },
    {
      time: 60,
      temperature: 120,
    },
    {
      time: 120,
      temperature: 160,
    },
    {
      time: 240,
      temperature: 190,
    },
    {
      time: 420,
      temperature: 212,
    },
    {
      time: 421,
      temperature: 0,
    },
  ],
  fanPhases: [
    {
      fanSpeed: 95,
      time: 0,
    },
    {
      fanSpeed: 90,
      time: 60,
    },
    {
      fanSpeed: 70,
      time: 180,
    },
    {
      fanSpeed: 55,
      time: 240,
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
};

export const profileDraftReducer = createReducer<ProfileDraftReducerState>(
  {
    ...DEFAULT_VALUES,
    createdAt: DateTime.now().toISOTime(),

    id: uuidv4(),
    name: 'New Profile',
  },
  (builder) =>
    builder
      .addCase(Actions.addFanPhase, (state, action) => {
        // No Items exist
        if (state.fanPhases.length <= 0) {
          state.fanPhases.push({
            fanSpeed: 100,
            time: 60,
          });
          return;
        }
        const index = action.payload.index || state.fanPhases.length - 1;
        // Last Item
        if (index >= state.fanPhases.length - 1) {
          state.fanPhases.splice(index + 1, 0, {
            fanSpeed: state.fanPhases[index]!.fanSpeed,
            time: state.fanPhases[index]!.time + 60,
          });
          return;
        }
        // Previous & Next exist
        const prev = state.fanPhases[index]!;
        const next = state.fanPhases[index + 1]!;

        state.fanPhases.splice(index + 1, 0, {
          fanSpeed: (prev.fanSpeed + next.fanSpeed) / 2,
          time: (prev.time + next.time) / 2,
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
      .addCase(Actions.addHeaterPhase, (state, action) => {
        // No Items exist
        if (state.heaterPhases.length <= 0) {
          state.heaterPhases.push({
            temperature: 100,
            time: 60,
          });
          return;
        }
        const index = action.payload.index || state.heaterPhases.length - 1;
        // Last Item
        if (index >= state.heaterPhases.length - 1) {
          state.heaterPhases.splice(index + 1, 0, {
            temperature: state.heaterPhases[index]!.temperature,
            time: state.heaterPhases[index]!.time + 60,
          });
          return;
        }
        // Previous & Next exist
        const prev = state.heaterPhases[index]!;
        const next = state.heaterPhases[index + 1]!;

        state.heaterPhases.splice(index + 1, 0, {
          temperature: (prev.temperature + next.temperature) / 2,
          time: (prev.time + next.time) / 2,
        });
      })
      .addCase(Actions.removeHeaterPhase, (state, action) => {
        state.heaterPhases.splice(action.payload.index, 1);
      })
      .addCase(Actions.resetProfileDraft, () => {
        return {
          ...DEFAULT_VALUES,
          createdAt: DateTime.now().toISOTime(),

          id: uuidv4(),
          name: 'New Profile',
        };
      })
      .addCase(Actions.prefillProfileDraft, (_state, action) => {
        return action.payload;
      }),
);
