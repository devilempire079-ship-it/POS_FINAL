import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch all products
  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProducts(params);
      setProducts(data);
      return data;
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch products: ' + err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Search products
  const searchProducts = useCallback(async (query) => {
    if (!query.trim()) return fetchProducts();

    try {
      setLoading(true);
      setError(null);
      const data = await api.searchProducts(query);
      setProducts(data);
      return data;
    } catch (err) {
      setError(err.message);
      toast.error('Search failed: ' + err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  // Create new product
  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      const newProduct = await api.createProduct(productData);
      setProducts(prev => [...prev, newProduct]);

      toast.success(`Product "${newProduct.name}" created successfully`);

      // Log the action
      if (user) {
        await api.logAction('CREATE', 'product', newProduct.id, `Created product "${newProduct.name}"`);
      }

      return { success: true, product: newProduct };
    } catch (err) {
      toast.error('Failed to create product: ' + err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update existing product
  const updateProduct = useCallback(async (id, productData) => {
    try {
      setLoading(true);
      const updatedProduct = await api.updateProduct(id, productData);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));

      toast.success(`Product "${updatedProduct.name}" updated successfully`);

      // Log the action
      if (user) {
        await api.logAction('UPDATE', 'product', id, `Updated product "${updatedProduct.name}"`);
      }

      return { success: true, product: updatedProduct };
    } catch (err) {
      toast.error('Failed to update product: ' + err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Delete product
  const deleteProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));

      toast.success('Product deleted successfully');

      // Log the action
      if (user) {
        await api.logAction('DELETE', 'product', id, `Deleted product ID ${id}`);
      }

      return { success: true };
    } catch (err) {
      toast.error('Failed to delete product: ' + err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Adjust stock level
  const adjustStock = useCallback(async (id, newStockQty, reason = 'Manual adjustment') => {
    try {
      setLoading(true);
      const product = products.find(p => p.id === id);
      if (!product) {
        throw new Error('Product not found');
      }

      const stockChange = newStockQty - product.stockQty;

      // Update product stock
      const updatedProduct = await api.updateProduct(id, { stockQty: newStockQty });
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));

      // Create stock movement record
      if (user) {
        await api.createStockMovement({
          productId: id,
          type: stockChange > 0 ? 'in' : 'out',
          quantity: Math.abs(stockChange),
          reason,
          userId: user.id,
          reference: `stock_adjustment_${id}_${Date.now()}`,
          notes: `Stock adjusted from ${product.stockQty} to ${newStockQty}`
        });

        await api.logAction('STOCK_ADJUSTMENT', 'product', id,
          `Stock adjusted: ${product.stockQty} → ${newStockQty} (${stockChange > 0 ? '+' : ''}${stockChange})`);
      }

      toast.success(`Stock updated to ${newStockQty}`);

      return { success: true, product: updatedProduct };
    } catch (err) {
      toast.error('Failed to adjust stock: ' + err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [products, user]);

  // Get product by ID
  const getProduct = useCallback((id) => {
    return products.find(p => p.id === id) || null;
  }, [products]);



  // Check if product exists
  const productExists = useCallback((id) => {
    return products.some(p => p.id === id);
  }, [products]);

  // Memoized computed values for better performance
  const categories = useMemo(() => {
    const categorySet = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(categorySet);
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stockQty <= (p.minStockLevel || 10));
  }, [products]);

  const totalValue = useMemo(() => {
    return products.reduce((sum, product) => sum + (product.price * product.stockQty), 0);
  }, [products]);

  // Get product categories (legacy function for backward compatibility)
  const getCategories = useCallback(() => categories, [categories]);

  // Get low stock products (legacy function for backward compatibility)
  const getLowStockProducts = useCallback(() => lowStockProducts, [lowStockProducts]);

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    getProduct,
    getLowStockProducts,
    productExists,
    getCategories,
    setError,
    clearError: () => setError(null)
  };
};
