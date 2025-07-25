import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Language = 'he' | 'en';

interface LanguageState {
  currentLanguage: Language;
}

const initialState: LanguageState = {
  currentLanguage: 'he', // Default to Hebrew
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.currentLanguage = action.payload;
    },
  },
});

export const { setLanguage } = languageSlice.actions;

// Selectors
export const selectLanguage = (state: { language: LanguageState }) => state.language.currentLanguage;

export default languageSlice.reducer; 