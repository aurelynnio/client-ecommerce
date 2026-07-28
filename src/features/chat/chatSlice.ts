import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatUiState {
  isOpen: boolean;
}

const initialState: ChatUiState = {
  isOpen: false,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    setChatOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
  },
});

export const { toggleChat, setChatOpen } = chatSlice.actions;
export default chatSlice.reducer;
