import { createSlice } from '@reduxjs/toolkit';
import { ingredientProps } from '../../utils/interface/Interface';

export const ingredientsSlice = createSlice({
    name: 'ingredients',
    initialState: {
        data: [] as ingredientProps[],
    },
    reducers: {
        updateIngredients: (state, action) => {
            state.data = action.payload;
        },
        deleteIngredients: (state, action) => {
            const index = state.data.findIndex((d) => d.id === action.payload);
            state.data[index].status = 0;
        },
        restoreIngredients: (state, action) => {
            const index = state.data.findIndex((d) => d.id === action.payload);
            state.data[index].status = 1;
        },
        addIngredients: (state, action) => {
            const data = {
                ...action.payload,
                id: state.data.length + 1,
            };
            state.data.push(data);
        },
        editIngredient: (state, action) => {
            const index = state.data.findIndex((d) => d.id === action.payload.id);
            const { name, image, description, dueDate } = action.payload.data;
            state.data[index] = { ...state.data[index], name, image, description, dueDate };
        },
    },
});

export const {
    updateIngredients,
    deleteIngredients,
    restoreIngredients,
    addIngredients,
    editIngredient,
} = ingredientsSlice.actions;

export default ingredientsSlice.reducer;
