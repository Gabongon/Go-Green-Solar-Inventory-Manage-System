import { STOCK_STATUS } from './constants';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const calculateStockStatus = (quantity, threshold) => {
  if (quantity <= 0) return STOCK_STATUS.OUT_OF_STOCK;
  if (quantity <= threshold) return STOCK_STATUS.LOW_STOCK;
  return STOCK_STATUS.IN_STOCK;
};

export const generateSKU = (category, name) => {
  const prefix = category.substring(0, 3).toUpperCase();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${random}`;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};