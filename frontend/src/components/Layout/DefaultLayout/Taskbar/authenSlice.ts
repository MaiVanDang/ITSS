import { createSlice } from '@reduxjs/toolkit';

export const authenSlice = createSlice({
    name: 'authentication',
    initialState: {
        status: true,
        userInfo: {},
    },
    reducers: {
        login: (state, action) => {
            state.status = true;
            state.userInfo = action.payload;
        },
        logout: (state) => {
            state.status = false;
            state.userInfo = {};
        },
    },
});

export const { login, logout } = authenSlice.actions;

export default authenSlice.reducer;
