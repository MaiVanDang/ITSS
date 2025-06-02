import { userInfoProps } from './interface/Interface';

// Lấy thông tin người dùng
const userInfoString: string | null = localStorage.getItem('userInfo');
export const userInfo: userInfoProps | null = userInfoString ? JSON.parse(userInfoString) : null;
export const getUserInfo = () => {
    return JSON.parse(localStorage.getItem('userInfo') || '{}');
};
