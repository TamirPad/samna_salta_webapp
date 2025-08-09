import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isLoading: boolean;
  sidebarOpen: boolean;
  modalOpen: boolean;
  modalType: string | null;
  adminView: boolean; // when true, admin sees admin navigation; when false, customer navigation
}

const initialState: UIState = {
  isLoading: false,
  sidebarOpen: false,
  modalOpen: false,
  modalType: null,
  adminView: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openSidebar: (state) => {
      state.sidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.sidebarOpen = false;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.modalOpen = true;
      state.modalType = action.payload;
    },
    closeModal: (state) => {
      state.modalOpen = false;
      state.modalType = null;
    },
    setAdminView: (state, action: PayloadAction<boolean>) => {
      state.adminView = action.payload;
    },
    toggleAdminView: (state) => {
      state.adminView = !state.adminView;
    },
  },
});

export const {
  setLoading,
  toggleSidebar,
  openSidebar,
  closeSidebar,
  openModal,
  closeModal,
  setAdminView,
  toggleAdminView,
} = uiSlice.actions;

// Selectors
export const selectIsLoading = (state: { ui: UIState }): boolean =>
  state.ui.isLoading;
export const selectSidebarOpen = (state: { ui: UIState }): boolean =>
  state.ui.sidebarOpen;
export const selectModalOpen = (state: { ui: UIState }): boolean =>
  state.ui.modalOpen;
export const selectModalType = (state: { ui: UIState }): string | null =>
  state.ui.modalType;
export const selectAdminView = (state: { ui: UIState }): boolean =>
  state.ui.adminView;

export default uiSlice.reducer;
