export interface ingredientsProps {
    id?: number;
    ingredient: ingredientProps;
    quantity: number;
    measure: string;
    exprided?: string;
    createAt?: string;
}
export interface ingredientProps {
    id: number;
    name: string;
    status: number;
    image: string;
    description: string;
    createAt: string;
    updateAt: string | null;
    dueDate: number;
    ingredientStatus: string;
}

export interface dishsProps {
    createAt: string;
    updateAt: string;
    descriptions: string;
    id: number;
    image: string; //Link
    ingredients: ingredientsProps[];
    name: string;
    recipeDes: string;
    status: 1 | 0;
    type: 'Món chính' | 'Món phụ' | string;
    favorite: 1 | 0;
}

export interface marketProps {
    id: number;
    code: string;
    createAt: string;
    user: userInfoProps;
    status: 1 | 0;
    attributes: null;
    dishes: null;
}

export interface userInfoProps {
    address: string;
    avatar: string;
    createAt: string;
    email: string;
    username: string;
    gender: 'nam' | 'nữ' | '';
    groups: null;
    id: number;
    name: string;
    status: 1 | 0;
    fridgeId: number;
}

export interface attributesProps {
    id: number;
    user: userInfoProps;
    ingredients: ingredientProps;
    exprided: string;
    status: 1 | 0;
    measure: string;
    buyAt: string;
    quantity: number;
    ingredientStatus: string;
}

export interface dishesProps {
    id: number;
    dish: dishsProps;
    expride: string;
    cook_status: 1 | 0 | null;
    cookDate: string;
    quantity: number;
    createAt: string;
    updateAt: string;
}

export interface shoppingProps {
    id: number;
    code: string;
    createAt: string;
    user: userInfoProps;
    status: 1 | 0;
    attributes: attributesProps[];
    dishes: dishesProps[];
}

export interface groupsProps {
    id: number;
    groupMembers: userInfoProps[];
    createAt: string;
    leader: userInfoProps;
    name: string;
    shoppings: shoppingProps[];
    updatedAt: string;
    image: string;
}

export interface fridgeProps {
    id: number;
    name: string;
    group: groupsProps;
    user: userInfoProps | null;
    type: number;
    ingredients: ingredientsProps[];
}
