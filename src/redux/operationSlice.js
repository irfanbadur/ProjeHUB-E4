import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  commandType: null,     // Örn: "drawLine", "move"
  step: 0,               // Komutun kaçıncı adımında olduğumuzu tutar
  data: {},              // Komuta özel geçici veriler (örnek: startPoint)
  lastCommandType: null, // 🆕 yeni alan
  message: "", // 👈 yeni alan
  textOptions: {
    font: "Arial",
    fontSize: "12",
    alignment: "left",
  },
};

const operationSlice = createSlice({
  name: 'operation',
  initialState,
  reducers: {
    setCommandType: (state, action) => {
      console.log("setCommandType action",action)

      state.lastCommandType = action.payload; // 🧠 son komutu kaydet
      state.commandType = action.payload;
      state.step = 0;
      state.data = {};

    },
    setOperationStep: (state, action) => {
      state.step = action.payload;
    },
    setOperationData: (state, action) => {
      console.log("setOperationData action",action)
      state.data = { ...state.data, ...action.payload };
    },
    setCommandMessage: (state, action) => {
      state.message = action.payload;
    },
    resetOperation: (state) => {
      state.commandType = null;
      state.step = 0;
      state.data = {};
      state.message = "";
      // 🔥 lastCommandType asla sıfırlanmaz
    },

    setTextOptions: (state, action) => {
      state.textOptions = action.payload;
    }
  },
});

export const {
  setCommandType,
  setOperationStep,
  setOperationData,
  resetOperation,
  setCommandMessage,
  setTextOptions
} = operationSlice.actions;

export default operationSlice.reducer;
