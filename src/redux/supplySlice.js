// redux/supplySlice.js
import { createSlice } from '@reduxjs/toolkit';

const supplySlice = createSlice({
  name: 'supply',
  initialState: {
    general: {
      id: "sp",
      name: "Supply Point",
      type: "box",
      installedPower: 0,
      power: 0,
    },
    nodes: [],
    connections: [],
    branchCircuits: [],
    meters: []
  },
  reducers: {
    // -----------------------
    // General
    // -----------------------
    updateGeneral: (state, action) => {
      state.general = { ...state.general, ...action.payload };
    },

    // -----------------------
    // Nodes
    // -----------------------
    setNodes: (state, action) => {
      state.nodes = action.payload;
    },
    updateNodeById: (state, action) => {
      const { id, changes } = action.payload;
      const index = state.nodes.findIndex(node => node.id === id);
      if (index !== -1) {
        state.nodes[index] = { ...state.nodes[index], ...changes };
      }
    },
    deleteNodeById: (state, action) => {
      const id = action.payload;
      state.nodes = state.nodes.filter(node => node.id !== id);
    },

    // -----------------------
    // Connections
    // -----------------------
    setConnections: (state, action) => {
      state.connections = action.payload;
    },
    updateConnectionById: (state, action) => {
      const { id, changes } = action.payload;
      const index = state.connections.findIndex(con => con.id === id);
      if (index !== -1) {
        state.connections[index] = { ...state.connections[index], ...changes };
      }
    },
    deleteConnectionById: (state, action) => {
      const id = action.payload;
      state.connections = state.connections.filter(con => con.id !== id);
    },

    // -----------------------
    // Branch Circuits
    // -----------------------
    setBranchCircuits: (state, action) => {
      state.branchCircuits = action.payload;
    },
    updateBranchCircuitById: (state, action) => {
      const { id, changes } = action.payload;
      const index = state.branchCircuits.findIndex(bc => bc.id === id);
      if (index !== -1) {
        state.branchCircuits[index] = { ...state.branchCircuits[index], ...changes };
      }
    },
    deleteBranchCircuitById: (state, action) => {
      const id = action.payload;
      state.branchCircuits = state.branchCircuits.filter(bc => bc.id !== id);
    },

    // -----------------------
    // Meters
    // -----------------------
    setMeters: (state, action) => {
      state.meters = action.payload;
    },
    updateMeterById: (state, action) => {
      const { id, changes } = action.payload;
      const index = state.meters.findIndex(meter => meter.id === id);
      if (index !== -1) {
        state.meters[index] = { ...state.meters[index], ...changes };
      }
    },
    deleteMeterById: (state, action) => {
      const id = action.payload;
      state.meters = state.meters.filter(meter => meter.id !== id);
    },

    // -----------------------
    // Optional: Reset all
    // -----------------------
    resetSupply: (state) => {
      state.general = {
        id: "sp",
        name: "Supply Point",
        type: "box",
        installedPower: 0,
        power: 0,
      };
      state.nodes = [];
      state.connections = [];
      state.branchCircuits = [];
      state.meters = [];
    }
  }
});

// -----------------------
// Export Actions
// -----------------------
export const {
  updateGeneral,

  setNodes,
  updateNodeById,
  deleteNodeById,

  setConnections,
  updateConnectionById,
  deleteConnectionById,

  setBranchCircuits,
  updateBranchCircuitById,
  deleteBranchCircuitById,

  setMeters,
  updateMeterById,
  deleteMeterById,

  resetSupply
} = supplySlice.actions;

// -----------------------
// Export Reducer
// -----------------------
export default supplySlice.reducer;
