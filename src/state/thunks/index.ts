import { createAsyncThunk } from '@reduxjs/toolkit';

export const dummyThunk = createAsyncThunk(
  'issue/create',
  async (meta: { x: number }) => {
    return Promise.resolve(meta);
  },
);

export const Thunks = { dummyThunk };
