import React from 'react';

import SignUp from '../pages/sign-up';
import SignIn from '../pages/sign-in';
import Cook from '../pages/cook/Cook';
import Ingredient from '../pages/ingredient/Ingredients';
import Market from '../pages/market/Market';
import AddMarketOrder from '../pages/add-market-order/AddMarketOrder';
import Group from '../pages/group/Group';
import GroupDetail from '../components/group-detail/GroupDetail';
import Fridge from '../pages/fridge/Fridge';
import AddDish from '../pages/add-dish/AddDish';
interface RouteConfig {
    path: string;
    component: React.ComponentType;
    layout?: React.ComponentType | null;
}

// public routes
const publicRoutes: RouteConfig[] = [
   { path: '/cook', component: Cook },
   { path: '/cook/create', component: AddDish },
   { path: '/ingredients', component: Ingredient },
   { path: '/market', component: Market },
   { path: '/market/add', component: AddMarketOrder },
   { path: '/group', component: Group },
   { path: '/group/:id', component: GroupDetail },
   { path: '/fridge', component: Fridge },
    { path: '/sign-up', component: SignUp, layout: null },
    { path: '/', component: SignIn, layout: null },
];

const privateRoutes: RouteConfig[] = [];

export { publicRoutes, privateRoutes };
