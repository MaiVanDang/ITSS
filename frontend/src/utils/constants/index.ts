export const EXPIRY_THRESHOLDS = {
  WARNING_DAYS: 3,
  TODAY: 0
} as const;

export const INGREDIENT_STATUS_MAP = {
  INGREDIENT: { label: 'Nguyên liệu', variant: 'primary' },
  FRESH_INGREDIENT: { label: 'Nguyên liệu tươi', variant: 'success' },
  DRY_INGREDIENT: { label: 'Nguyên liệu khô', variant: 'secondary' },
  SEASONING: { label: 'Gia vị nêm', variant: 'warning' }
} as const;

export const TOAST_TYPES = {
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info'
} as const;

export const BADGE_VARIANTS = {
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  SECONDARY: 'secondary'
} as const;