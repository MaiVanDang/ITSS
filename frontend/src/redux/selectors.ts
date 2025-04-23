// import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';

export const isLoginSelector = (state: RootState) => state.authen.status;
export const userInfoSelector = (state: RootState) => state.authen.userInfo;
export const dishsSelector = (state: RootState) => state.dishs.data;
export const ingredientsSelector = (state: RootState) => state.ingredients.data;
export const marketOrderSelector = (state: RootState) => state.marketOrder.data;
