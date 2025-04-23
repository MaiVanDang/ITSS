import { createSlice } from '@reduxjs/toolkit';
import { marketProps } from '../../utils/interface/Interface';

export const marketsSlice = createSlice({
    name: 'marketOrders',
    initialState: {
        data: [] as marketProps[],
    },
    reducers: {
        updateMarkets: (state, action) => {
            state.data = action.payload;
        },
        deleteMarket: (state, action) => {
            const index = state.data.findIndex((d) => d.id === action.payload);
            state.data[index].status = 0;
        },
        restoreMarket: (state, action) => {
            const index = state.data.findIndex((d) => d.id === action.payload);
            state.data[index].status = 1;
        },
    },
});

export const { updateMarkets, deleteMarket, restoreMarket } = marketsSlice.actions;

export default marketsSlice.reducer;
