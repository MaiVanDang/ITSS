import { userInfoProps } from './interface/Interface';

// Lấy thông tin người dùng
const userInfoString: string | null = localStorage.getItem('userInfo');
export const userInfo: userInfoProps | null = userInfoString ? JSON.parse(userInfoString) : null;