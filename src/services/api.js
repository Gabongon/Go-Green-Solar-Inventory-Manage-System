import { mockUsers, mockProducts, mockOrders } from './mockData';
import { v4 as uuidv4 } from 'uuid';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// LocalStorage keys
const STORAGE_KEYS = {
  USERS: 'solar_inventory_users',
  PRODUCTS: 'solar_inventory_products',
  ORDERS: 'solar_inventory_orders',
  CURRENT_USER: 'solar_inventory_current_user',
};

// Initialize localStorage with mock data
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mockProducts));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(mockOrders));
  }
};

initializeStorage();

// Auth Service
export const authService = {
  async login(email, password) {
    await delay(800); // Simulate network delay
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      const token = btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
      return { user: userWithoutPassword, token };
    }
    throw new Error('Invalid email or password');
  },

  async signup(userData) {
    await delay(800);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    
    if (users.find(u => u.email === userData.email)) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: uuidv4(),
      ...userData,
      role: 'user',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=22c55e&color=fff`,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true,
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    const { password, ...userWithoutPassword } = newUser;
    const token = btoa(JSON.stringify({ id: newUser.id, email: newUser.email, role: newUser.role }));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
    
    return { user: userWithoutPassword, token };
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser() {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },
};

// Product Service
export const productService = {
  async getAll() {
    await delay(500);
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
  },

  async getById(id) {
    await delay(300);
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    return products.find(p => p.id === id);
  },

  async create(productData) {
    await delay(800);
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const newProduct = {
      id: uuidv4(),
      ...productData,
      sku: generateSKU(productData.category, productData.name),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: '/api/placeholder/200/200',
    };
    products.push(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return newProduct;
  },

  async update(id, productData) {
    await delay(800);
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    
    products[index] = {
      ...products[index],
      ...productData,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return products[index];
  },

  async delete(id) {
    await delay(800);
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    return true;
  },

  async getLowStock() {
    await delay(300);
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    return products.filter(p => p.quantity <= p.lowStockThreshold);
  },
};

// Order Service
export const orderService = {
  async getAll() {
    await delay(500);
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS));
  },

  async getUserOrders(userId) {
    await delay(500);
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS));
    return orders.filter(o => o.userId === userId);
  },

  async create(orderData) {
    await delay(800);
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS));
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
    
    // Calculate total and validate stock
    let totalAmount = 0;
    const items = orderData.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      totalAmount += product.unitPrice * item.quantity;
      return {
        ...item,
        unitPrice: product.unitPrice,
        productName: product.name,
      };
    });

    const newOrder = {
      id: uuidv4(),
      orderNumber: `ORD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
      ...orderData,
      items,
      totalAmount,
      status: 'pending',
      requestedDate: new Date().toISOString(),
      approvedBy: null,
      approvedDate: null,
    };

    orders.push(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return newOrder;
  },

  async updateStatus(orderId, status, approvedBy) {
    await delay(500);
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS));
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    orders[index] = {
      ...orders[index],
      status,
      ...(status === 'approved' && { approvedBy, approvedDate: new Date().toISOString() }),
    };

    // If approved, update inventory
    if (status === 'approved') {
      const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS));
      orders[index].items.forEach(item => {
        const productIndex = products.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) {
          products[productIndex].quantity -= item.quantity;
        }
      });
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return orders[index];
  },
};

// User Service (Admin only)
export const userService = {
  async getAll() {
    await delay(500);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    return users.map(({ password, ...user }) => user);
  },

  async create(userData) {
    await delay(800);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    
    if (users.find(u => u.email === userData.email)) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: uuidv4(),
      ...userData,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=22c55e&color=fff`,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  async update(id, userData) {
    await delay(800);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    users[index] = {
      ...users[index],
      ...userData,
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    const { password, ...userWithoutPassword } = users[index];
    return userWithoutPassword;
  },

  async delete(id) {
    await delay(800);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    return true;
  },
};

function generateSKU(category, name) {
  const prefix = category.substring(0, 3).toUpperCase();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${random}`;
}