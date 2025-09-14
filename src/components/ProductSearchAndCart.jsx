import React, { useState, useRef, useCallback, useMemo, memo } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus, Search, Trash2 } from 'lucide-react';
import api from '../services/api';

const ProductSearchAndCart = memo(function ProductSearchAndCart({
  items,
  onUpdateQuantity,
  onUpdatePrice,
  onRemoveItem,
  onAddProduct,
  subtotal
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Memoized search function to prevent recreation
  const performSearch = useCallback(async (value) => {
    if (!value.trim()) {
      setFilteredProducts([]);
      setShowResults(false);
      setSearchLoading(false);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await api.get(`/products/search?q=${encodeURIComponent(value)}&limit=20`);
      setFilteredProducts(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setFilteredProducts([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Memoized add product function
  const handleAddProduct = useCallback((product) => {
    onAddProduct({ ...product, quantity: 1 });
    setSearchTerm('');
    setShowResults(false);
  }, [onAddProduct]);

  // Improved debounced search with better performance
  React.useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Shorter delay for better responsiveness
    const debounceDelay = searchTerm.length > 2 ? 150 : 300;

    if (searchTerm.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchTerm);
      }, debounceDelay);
    } else {
      setFilteredProducts([]);
      setShowResults(false);
      setSearchLoading(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, performSearch]);

  return (
    <div className="bg-white p-4 rounded-lg border h-full flex flex-col">
      <h2 className="mb-4 text-foreground font-semibold">🛍️ Products & Cart</h2>

      {/* Search Section */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search products by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {searchLoading && (
          <div className="absolute right-4 top-3.5">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Search Results */}
        {showResults && filteredProducts.length > 0 && (
          <div className="mt-2 bg-gray-50 border rounded-lg max-h-48 overflow-y-auto">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                onClick={() => handleAddProduct(product)}
              >
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-muted-foreground text-sm">${product.price.toFixed(2)}</p>
                  {product.stockQty !== undefined && (
                    <p className="text-xs text-gray-500">Stock: {product.stockQty}</p>
                  )}
                </div>
                <Plus className="w-4 h-4 text-primary" />
              </div>
            ))}
          </div>
        )}

        {showResults && filteredProducts.length === 0 && searchTerm && (
          <div className="mt-2 text-center text-muted-foreground py-4">
            No products found
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Cart Items</h3>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No items in cart</p>
              <p className="text-sm mt-1">Search and add products above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => {
                // Handle both nested product structure and direct product structure
                const product = item.product || item;
                const productId = product.id;
                const productName = product.name;
                const productPrice = product.price;

                return (
                  <div key={productId} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium truncate" title={productName}>
                          {productName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Unit: ${productPrice.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(productId)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive ml-2"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">Qty:</label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => onUpdateQuantity(productId, parseInt(e.target.value) || 1)}
                          className="w-16 h-7 text-center text-sm"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">Price:</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={productPrice.toFixed(2)}
                          onChange={(e) => onUpdatePrice && onUpdatePrice(productId, parseFloat(e.target.value) || 0)}
                          className="w-20 h-7 text-center text-sm"
                        />
                      </div>

                      <div className="ml-auto text-right">
                        <p className="text-sm font-medium">
                          ${(productPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Subtotal */}
        {items.length > 0 && (
          <div className="mt-4 pt-3 border-t bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Subtotal:</span>
              <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export { ProductSearchAndCart };
