import React, { useState } from 'react';
import { Input } from './ui/input.jsx';
import { Button } from './ui/button.tsx';
import { Trash2 } from 'lucide-react';

export function CartTable({ items, onUpdateQuantity, onUpdatePrice, onRemoveItem, subtotal }) {
  return (
    <div className="bg-white rounded-lg border h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="grid grid-cols-12 gap-2 text-muted-foreground text-sm">
          <div className="col-span-5">Product name</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-2 text-center">Price</div>
          <div className="col-span-2 text-center">Amount</div>
          <div className="col-span-1"></div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No items in cart</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.product.id} className="grid grid-cols-12 gap-2 items-center py-2 border-b last:border-b-0">
                <div className="col-span-5">
                  <p className="truncate" title={item.product.name}>{item.product.name}</p>
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                    className="text-center h-8 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.product.price.toFixed(2)}
                    onChange={(e) => onUpdatePrice(item.product.id, parseFloat(e.target.value) || 0)}
                    className="text-center h-8 text-sm"
                  />
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="col-span-1 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.product.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="text-right">
          <span className="text-muted-foreground">Subtotal: </span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
