import { createSlice } from '@reduxjs/toolkit';
import { dishsProps } from '../../utils/interface/Interface';

export const dishsSlice = createSlice({
    name: 'dishs',
    initialState: {
        data: [] as dishsProps[],
    },
    reducers: {
        updateDishs: (state, action) => {
            state.data = action.payload;
        },
        deleteDish: (state, action) => {
            const index = state.data.findIndex((d) => d.id === action.payload);
            state.data[index].status = 0;
        },
        restoreDish: (state, action) => {
            const index = state.data.findIndex((d) => d.id === action.payload);
            state.data[index].status = 1;
        },
        favoriteDish: (state, action) => {
            const index = state.data.findIndex((d) => d.id === action.payload);
            state.data[index].favorite = 1;
        },
        unFavoriteDish: (state, action) => {
            const index = state.data.findIndex((d) => d.id === action.payload);
            state.data[index].favorite = 0;
        },
    },
});

export const { updateDishs, deleteDish, restoreDish, favoriteDish, unFavoriteDish } =
    dishsSlice.actions;

export default dishsSlice.reducer;