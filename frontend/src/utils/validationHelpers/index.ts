import { isExpired } from '../dateHelpers';
import { canStoreInFridge } from '../ingredientHelpers';
import { StoreProps } from '../interface/Interface'; // Adjust import path

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateItem = (item: StoreProps): ValidationResult => {
  if (!item || item === null || item === undefined) {
    return { isValid: false, message: 'Không có thông tin thực phẩm để thêm.' };
  }
  
  return { isValid: true };
};

export const validateUserFridge = (fridgeId?: string): ValidationResult => {
  if (!fridgeId) {
    return { 
      isValid: false, 
      message: 'Không tìm thấy thông tin tủ lạnh. Vui lòng đăng nhập lại.' 
    };
  }
  
  return { isValid: true };
};

export const validateForFridgeAddition = (
  item: StoreProps, 
  fridgeId?: string
): ValidationResult => {
  const itemValidation = validateItem(item);
  if (!itemValidation.isValid) return itemValidation;
  
  const fridgeValidation = validateUserFridge(fridgeId);
  if (!fridgeValidation.isValid) return fridgeValidation;
  
  if (isExpired(item.expridedAt)) {
    return { 
      isValid: false, 
      message: `${item.ingredientName} đã hết hạn (${item.expridedAt}).` 
    };
  }
  
  if (!canStoreInFridge(item.ingredientName, item.ingredientStatus)) {
    const reason = item.ingredientStatus === 'SEASONING' 
      ? 'Gia vị nêm không cần thêm vào tủ lạnh.'
      : 'Thực phẩm này không cần thêm vào tủ lạnh.';
    return { isValid: false, message: reason };
  }
  
  return { isValid: true };
};