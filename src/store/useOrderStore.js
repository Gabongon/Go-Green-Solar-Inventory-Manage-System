import { create } from 'zustand';
import { orderService } from '../services/api';
import toast from 'react-hot-toast';

export const useOrderStore = create((set, get) => ({
  orders: [],
  userOrders: [],
  loading: false,
  currentOrder: null,

  fetchAllOrders: async () => {
    set({ loading: true });
    try {
      const orders = await orderService.getAll();
      set({ orders, loading: false });
    } catch (error) {
      toast.error('Failed to fetch orders');
      set({ loading: false });
    }
  },

  fetchUserOrders: async (userId) => {
    set({ loading: true });
    try {
      const orders = await orderService.getUserOrders(userId);
      set({ userOrders: orders, loading: false });
    } catch (error) {
      toast.error('Failed to fetch orders');
      set({ loading: false });
    }
  },

  createOrder: async (orderData) => {
    try {
      const newOrder = await orderService.create(orderData);
      set(state => ({
        orders: [...state.orders, newOrder],
        userOrders: [...state.userOrders, newOrder],
      }));
      toast.success('Order created successfully');
      return newOrder;
    } catch (error) {
      toast.error(error.message || 'Failed to create order');
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status, approvedBy) => {
    try {
      const updatedOrder = await orderService.updateStatus(orderId, status, approvedBy);
      set(state => ({
        orders: state.orders.map(o => o.id === orderId ? updatedOrder : o),
        userOrders: state.userOrders.map(o => o.id === orderId ? updatedOrder : o),
      }));
      toast.success(`Order ${status} successfully`);
    } catch (error) {
      toast.error('Failed to update order');
    }
  },

  setCurrentOrder: (order) => {
    set({ currentOrder: order });
  },

  getOrdersByStatus: (status) => {
    const orders = get().orders;
    return orders.filter(o => o.status === status);
  },

  getOrderStats: () => {
    const orders = get().orders;
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      approved: orders.filter(o => o.status === 'approved').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalValue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
    };
  },
}));