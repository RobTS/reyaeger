import { createAction } from '@reduxjs/toolkit';

export const resetStore = createAction<undefined, 'resetStore'>('resetStore');
