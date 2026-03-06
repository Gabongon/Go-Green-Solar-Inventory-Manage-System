import { create } from 'zustand';
import { productService } from '../services/api';
import { calculateStockStatus } from '../utils/helpers';
import toast from 'react-hot-toast';

export const useInventoryStore = create((set, get) => ({
  products: [],
  filteredProducts: [],
  loading: false,
  searchQuery: '',
  selectedCategory: '',
  selectedStockStatus: '',
  sortBy: 'name',
  sortOrder: 'asc',
  currentPage: 1,
  itemsPerPage: 10,
  totalPages: 1,

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const products = await productService.getAll();
      set({ products, filteredProducts: products, loading: false });
      get().applyFilters();
    } catch (error) {
      toast.error('Failed to fetch products');
      set({ loading: false });
    }
  },

  addProduct: async (productData) => {
    try {
      const newProduct = await productService.create(productData);
      set(state => ({
        products: [...state.products, newProduct],
        filteredProducts: [...state.products, newProduct],
      }));
      get().applyFilters();
      toast.success('Product added successfully');
    } catch (error) {
      toast.error('Failed to add product');
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const updatedProduct = await productService.update(id, productData);
      set(state => ({
        products: state.products.map(p => p.id === id ? updatedProduct : p),
        filteredProducts: state.products.map(p => p.id === id ? updatedProduct : p),
      }));
      get().applyFilters();
      toast.success('Product updated successfully');
    } catch (error) {
      toast.error('Failed to update product');
    }
  },

  deleteProduct: async (id) => {
    try {
      await productService.delete(id);
      set(state => ({
        products: state.products.filter(p => p.id !== id),
        filteredProducts: state.products.filter(p => p.id !== id),
      }));
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 });
    get().applyFilters();
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category, currentPage: 1 });
    get().applyFilters();
  },

  setSelectedStockStatus: (status) => {
    set({ selectedStockStatus: status, currentPage: 1 });
    get().applyFilters();
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
    get().applyFilters();
  },

  setSortOrder: (sortOrder) => {
    set({ sortOrder });
    get().applyFilters();
  },

  setCurrentPage: (page) => {
    set({ currentPage: page });
  },

  applyFilters: () => {
    const { products, searchQuery, selectedCategory, selectedStockStatus, sortBy, sortOrder } = get();
    
    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Apply stock status filter
    if (selectedStockStatus) {
      filtered = filtered.filter(p => {
        const status = calculateStockStatus(p.quantity, p.lowStockThreshold);
        return status === selectedStockStatus;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'price':
          comparison = a.unitPrice - b.unitPrice;
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const totalPages = Math.ceil(filtered.length / get().itemsPerPage);
    
    set({ filteredProducts: filtered, totalPages });
  },

  getPaginatedProducts: () => {
    const { filteredProducts, currentPage, itemsPerPage } = get();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredProducts.slice(start, end);
  },

  getInventoryStats: () => {
    const products = get().products;
    const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
    const lowStockItems = products.filter(p => p.quantity <= p.lowStockThreshold).length;
    const outOfStockItems = products.filter(p => p.quantity === 0).length;

    return {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      totalProducts: products.length,
    };
  },
}));