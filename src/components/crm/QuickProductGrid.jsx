import React from 'react';

const QuickProductGrid = ({ products, onProductSelect }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onProductSelect(product)}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 active:bg-blue-100 transition-all duration-200 touch-action-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] flex flex-col justify-between"
        >
          <div className="text-left">
            <div className="font-medium text-gray-900 truncate" title={product.name}>
              {product.name}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Stock: {product.stockQty}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              ${product.price.toFixed(2)}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default QuickProductGrid;
