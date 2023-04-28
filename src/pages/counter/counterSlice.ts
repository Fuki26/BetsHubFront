import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: {
  value: number;
  status: 'idle' | 'loading' | 'failed';
} = {
  value: 0,
  status: 'idle',
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  }
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export default counterSlice.reducer;
