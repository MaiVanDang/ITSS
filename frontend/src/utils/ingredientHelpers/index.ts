import { EXPIRY_THRESHOLDS } from '../constants';
import { calculateDaysLeft } from '../dateHelpers';

export interface ExpiryStatus {
  status: string;
  style: React.CSSProperties;
  daysLeft: number | null;
  tooltipText: string;
}

export const getExpiryStatus = (exprided?: string): ExpiryStatus => {
  if (!exprided) {
    return { 
      status: "Không xác định", 
      style: {}, 
      daysLeft: null, 
      tooltipText: "Không xác định ngày hết hạn" 
    };
  }

  try {
    const daysLeft = calculateDaysLeft(exprided);
    
    if (daysLeft > EXPIRY_THRESHOLDS.WARNING_DAYS) {
      return { 
        status: "Còn hạn", 
        style: { backgroundColor: "transparent" }, 
        daysLeft, 
        tooltipText: `Thực phẩm còn ${daysLeft} ngày nữa là hết hạn` 
      };
    }
    
    if (daysLeft > EXPIRY_THRESHOLDS.TODAY) {
      return { 
        status: "Sắp hết hạn", 
        style: { backgroundColor: "#FFF3CD" }, 
        daysLeft, 
        tooltipText: `Thực phẩm còn ${daysLeft} ngày nữa là hết hạn` 
      };
    }
    
    if (daysLeft === EXPIRY_THRESHOLDS.TODAY) {
      return { 
        status: "Hết hạn hôm nay", 
        style: { backgroundColor: "#F8D7DA" }, 
        daysLeft, 
        tooltipText: "Thực phẩm hết hạn ngày hôm nay" 
      };
    }
    
    return { 
      status: "Đã hết hạn", 
      style: { backgroundColor: "#F5C6CB" }, 
      daysLeft, 
      tooltipText: `Thực phẩm đã hết hạn từ ${Math.abs(daysLeft)} ngày trước` 
    };
  } catch {
    return { 
      status: "Không xác định", 
      style: {}, 
      daysLeft: null, 
      tooltipText: "Không xác định ngày hết hạn" 
    };
  }
};

export const getIngredientStatusInfo = (ingredientStatus?: string) => {
  const statusMap = {
    'INGREDIENT': { label: 'Nguyên liệu', variant: 'primary' },
    'FRESH_INGREDIENT': { label: 'Nguyên liệu tươi', variant: 'success' },
    'DRY_INGREDIENT': { label: 'Nguyên liệu khô', variant: 'secondary' },
    'SEASONING': { label: 'Gia vị nêm', variant: 'warning' }
  };
  
  return statusMap[ingredientStatus as keyof typeof statusMap] || 
         { label: 'Không xác định', variant: 'light' };
};

export const canStoreInFridge = (ingredientName: string, ingredientStatus?: string): boolean => {
  // Gạo không cần tủ lạnh
  if (ingredientName.trim() === "Gạo") return false;
  
  // Gia vị không cần tủ lạnh
  if (ingredientStatus === 'SEASONING') return false;
  
  return true;
};