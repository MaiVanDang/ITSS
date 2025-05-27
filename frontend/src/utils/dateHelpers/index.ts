export const calculateDaysLeft = (expirationDate: string): number => {
  const expiredDate = new Date(expirationDate);
  const currentDate = new Date();
  return Math.floor((expiredDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24) + 1);
};

export const isExpired = (expirationDate?: string): boolean => {
  if (!expirationDate) return false;
  
  const today = new Date();
  const expDate = new Date(expirationDate);
  today.setHours(0, 0, 0, 0);
  expDate.setHours(0, 0, 0, 0);
  
  return expDate < today;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Chưa có';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  } catch {
    return 'Ngày không hợp lệ';
  }
};

export const isDateToday = (dateString: string): boolean => {
  const today = new Date();
  const compareDate = new Date(dateString);
  
  return today.toDateString() === compareDate.toDateString();
};