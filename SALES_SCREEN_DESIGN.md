# SalesScreen Design Specification

## Overview
The SalesScreen is the core component of the POS (Point of Sale) system, providing a comprehensive interface for processing customer transactions. It follows a three-column layout optimized for efficiency and user experience.

## Layout Structure

### Three-Column Design
```
┌─────────────────────────────────────────────────┐
│ SALES SCREEN - Point of Sale System            │
│                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │             │ │             │ │             │ │
│  │ PRODUCT     │ │ SHOPPING    │ │ POINT OF    │ │
│  │ SEARCH      │ │ CART        │ │ SALE        │ │
│  │             │ │             │ │             │ │
│  │ [Search Bar]│ │ [Items: 3]  │ │ [Payment]   │ │
│  │ [Results]   │ │ [Quantity]  │ │ [Discount]  │ │
│  │ [Add Btn]   │ │ [Remove]    │ │ [Total]     │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Left Column - ProductSearch
**Purpose:** Product discovery and selection
**Height:** Full height with scrollable content

#### Features:
- **Search Input**
  - Real-time search as user types
  - Search by name, barcode, or category
  - Debounced input (100-200ms delay)

- **Product Results**
  - Grid/list view of matching products
  - Product image, name, price, category
  - Stock quantity indicator
  - "Add to Cart" button for each product

- **Categories**
  - Filter by product categories
  - Quick category buttons

#### Functions:
```javascript
// Search functionality
performSearch(query) // API call to search products
handleAddToCart(product) // Add product to cart with quantity 1

// State management
const [searchTerm, setSearchTerm] = useState('')
const [filteredProducts, setFilteredProducts] = useState([])
```

### 2. Middle Column - CartTable
**Purpose:** Cart management and item editing
**Height:** Full height with scrollable item list

#### Features:
- **Cart Header**
  - "Shopping Cart" title
  - Item count display
  - "Clear All" button

- **Item List**
  - Product name, quantity, price, total
  - Quantity input fields (+/- buttons)
  - Price editing capability
  - Remove item buttons
  - Subtotal calculation

- **Cart Summary**
  - Subtotal display
  - Tax calculation (configurable)
  - Total amount

#### Functions:
```javascript
// Cart management
handleQuantityChange(productId, newQuantity)
handlePriceUpdate(productId, newPrice)
handleRemoveItem(productId)
clearCart()

// Calculations
calculateSubtotal() // Sum of all item totals
calculateTax(subtotal) // Configurable tax rate
calculateTotal() // Subtotal + tax
```

### 3. Right Column - EditablePointOfSale
**Purpose:** Payment processing and transaction completion
**Height:** Full height with organized sections

#### Features:
- **Payment Methods**
  - Cash, Credit Card, Debit Card, Check, etc.
  - Visual selection buttons
  - Payment method icons

- **Order Summary**
  - Item count
  - Subtotal, tax, total
  - Discount applications

- **Action Buttons**
  - Process Payment (primary action)
  - Save Sale (for later)
  - Apply Discount
  - Customer selection

- **Configuration**
  - POS settings modal
  - Payment method management
  - Feature toggles

#### Functions:
```javascript
// Payment processing
handlePaymentMethodSelect(method)
processPayment(paymentMethod)
handleCheckout()

// Order management
applyDiscount(amount)
saveSale()
refundTransaction()

// Configuration
openSettingsModal()
updatePaymentMethods()
toggleFeatures()
```

## User Workflow

### Standard Transaction Flow:
1. **Search Products** → User searches for items
2. **Add to Cart** → Click "Add" or double-click product
3. **Modify Cart** → Adjust quantities, prices, remove items
4. **Select Payment** → Choose payment method
5. **Process Payment** → Complete transaction
6. **Print Receipt** → Generate customer receipt

### Keyboard Shortcuts:
- **F1** - Focus search input
- **F2** - Clear cart
- **F3** - Quick checkout
- **Enter** - Process barcode scan
- **Arrow Keys** - Navigate product list

## Technical Specifications

### State Management:
```javascript
// Main state variables
const [cart, setCart] = useState([])           // Array of cart items
const [searchTerm, setSearchTerm] = useState('') // Search input
const [selectedPayment, setSelectedPayment] = useState('cash')
const [customer, setCustomer] = useState(null)
const [discounts, setDiscounts] = useState({})
```

### Cart Item Structure:
```javascript
{
  product: {
    id: "prod-123",
    name: "Coffee",
    price: 3.50,
    category: "Beverages"
  },
  quantity: 2,
  customPrice: null // Optional price override
}
```

### API Integration:
```javascript
// Product search
GET /api/products/search?q={query}&limit=20

// Process sale
POST /api/sales
{
  totalAmount: 15.99,
  paymentType: "cash",
  customerId: null,
  saleItems: [...]
}

// Update inventory
PUT /api/products/{id}/stock
```

### Responsive Design:
- **Desktop:** 3-column layout side by side
- **Tablet:** 2-column layout (search + cart/pos combined)
- **Mobile:** Single column stacked layout

## Component Architecture

### File Structure:
```
src/components/
├── SalesScreen.jsx           # Main container
├── ProductSearch.jsx         # Left column
├── CartTable.jsx            # Middle column
├── EditablePointOfSale.jsx  # Right column
└── ui/                      # Shared UI components
    ├── button.tsx
    ├── input.tsx
    ├── dialog.tsx
    └── ...
```

### Props Interface:
```javascript
// SalesScreen props (none - self-contained)

// ProductSearch props
ProductSearch.propTypes = {
  onAddProduct: PropTypes.func.isRequired
}

// CartTable props
CartTable.propTypes = {
  items: PropTypes.array.isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
  onUpdatePrice: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  subtotal: PropTypes.number.isRequired
}

// EditablePointOfSale props
EditablePointOfSale.propTypes = {
  subtotal: PropTypes.number.isRequired,
  onDeleteAll: PropTypes.func.isRequired,
  onSaveSale: PropTypes.func.isRequired,
  onRefund: PropTypes.func.isRequired,
  onProcessPayment: PropTypes.func.isRequired
}
```

## Error Handling

### User-Friendly Messages:
- **Empty Cart:** "Your cart is empty. Add products to get started."
- **Search No Results:** "No products found. Try a different search term."
- **Payment Failed:** "Payment processing failed. Please try again."
- **Network Error:** "Connection lost. Please check your internet."

### Validation:
- **Quantity:** Must be positive integer
- **Price:** Must be positive number
- **Payment:** Must select payment method before processing
- **Customer:** Optional but validated if provided

## Performance Considerations

### Optimization Strategies:
1. **Debounced Search** - Prevent excessive API calls
2. **Virtual Scrolling** - For large product lists
3. **Lazy Loading** - Load product images on demand
4. **Memoization** - Cache expensive calculations
5. **Pagination** - Limit search results to 20-50 items

### Loading States:
- **Search Loading** - Spinner in search input
- **Cart Updating** - Disable buttons during updates
- **Payment Processing** - Full-screen loading overlay

## Accessibility

### Keyboard Navigation:
- **Tab Order:** Logical flow through all interactive elements
- **Enter/Space:** Activate buttons and form submission
- **Escape:** Close modals and cancel operations
- **Arrow Keys:** Navigate product lists and cart items

### Screen Reader Support:
- **ARIA Labels:** Descriptive labels for all controls
- **Live Regions:** Announce cart updates and search results
- **Focus Management:** Proper focus indicators and management

## Testing Requirements

### Unit Tests:
- Component rendering
- State updates
- Event handlers
- Calculations (subtotal, tax, total)

### Integration Tests:
- Search → Add to cart → Process payment flow
- Cart modifications and updates
- Payment method selection and processing

### E2E Tests:
- Complete transaction workflow
- Keyboard navigation
- Responsive design across devices
- Error scenarios and recovery

## Future Enhancements

### Planned Features:
1. **Barcode Scanning** - Hardware integration
2. **Customer Loyalty** - Points and rewards
3. **Split Payments** - Multiple payment methods
4. **Order History** - Recent transactions
5. **Inventory Alerts** - Low stock warnings
6. **Receipt Printing** - Thermal printer support
7. **Gift Cards** - Gift card management
8. **Discount Codes** - Promotional codes
9. **Multi-language** - Internationalization
10. **Offline Mode** - Work without internet

### Technical Improvements:
1. **Real-time Updates** - WebSocket integration
2. **Progressive Web App** - Installable on devices
3. **Advanced Search** - Filters and sorting
4. **Analytics** - Sales reporting
5. **Multi-store** - Chain management
6. **Mobile App** - React Native companion

---

## Implementation Notes

### Current Status:
- ✅ Basic layout structure implemented
- ✅ Component separation completed
- ✅ State management set up
- 🔄 Product search functionality (in progress)
- 🔄 Cart management (in progress)
- 🔄 Payment processing (in progress)

### Dependencies:
- React 18+
- Tailwind CSS
- React Hot Toast
- Lucide Icons
- Custom UI components

### Browser Support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

*This document serves as the comprehensive specification for the SalesScreen component. All implementations should follow these guidelines to ensure consistency and maintainability.*
