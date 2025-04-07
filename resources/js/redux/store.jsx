// resources/js/redux/store.jsx
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

// Initial state for the editor
const initialState = {
  widgets: [],
  activeDevice: 'Desktop',
  editWidgetData: null,
  selectedGridLayout: false,
};

// Reducer for managing the editor state
const editorReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_WIDGETS':
      return { ...state, widgets: action.payload };
    case 'SET_ACTIVE_DEVICE':
      return { ...state, activeDevice: action.payload };
    case 'SET_EDIT_WIDGET_DATA':
      return { ...state, editWidgetData: action.payload };
    case 'SET_SELECTED_GRID_LAYOUT':
      return { ...state, selectedGridLayout: action.payload };
    default:
      return state;
  }
};

// Combine reducers if needed in the future (though we're using only one reducer here)
const rootReducer = combineReducers({
  editor: editorReducer,
});

// Create the Redux store using Redux Toolkit's configureStore
const store = configureStore({
  reducer: rootReducer,
});

export default store;
