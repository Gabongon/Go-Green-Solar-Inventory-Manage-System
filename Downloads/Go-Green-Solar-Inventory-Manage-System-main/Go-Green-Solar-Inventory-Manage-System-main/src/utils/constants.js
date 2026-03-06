export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const PRODUCT_CATEGORIES = {
  'SOLAR_PANELS': {
    name: 'Solar Panels',
    subcategories: ['Monocrystalline', 'Polycrystalline', 'Thin-film']
  },
  'INVERTERS': {
    name: 'Inverters',
    subcategories: ['String', 'Micro', 'Hybrid']
  },
  'BATTERIES': {
    name: 'Batteries',
    subcategories: ['Lithium-ion', 'Lead-acid']
  },
  'MOUNTING_STRUCTURES': {
    name: 'Mounting Structures',
    subcategories: ['Roof Mount', 'Ground Mount', 'Tracking Systems']
  },
  'CABLES': {
    name: 'Cables & Connectors',
    subcategories: ['DC Cables', 'AC Cables', 'Connectors', 'Tools']
  },
  'MONITORING': {
    name: 'Monitoring Systems',
    subcategories: ['Data Loggers', 'Sensors', 'Displays']
  },
  'ACCESSORIES': {
    name: 'Tools & Accessories',
    subcategories: ['Installation Tools', 'Safety Gear', 'Cleaning Equipment']
  }
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock'
};

export const STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.APPROVED]: 'info',
  [ORDER_STATUS.SHIPPED]: 'primary',
  [ORDER_STATUS.DELIVERED]: 'success',
  [ORDER_STATUS.CANCELLED]: 'danger',
  [STOCK_STATUS.IN_STOCK]: 'success',
  [STOCK_STATUS.LOW_STOCK]: 'warning',
  [STOCK_STATUS.OUT_OF_STOCK]: 'danger'
};