# POS System

A desktop Point of Sale (POS) application built with Electron, React, and Vite.

## Features

- **Lightning-fast sales screen** with keyboard-driven navigation, quantity dialog, and barcode support
- **Flexible inventory management** with support for units, packs, and wholesale items
- **Role-based access control** with Admin, Manager, and Cashier roles
- **Comprehensive reporting** with sales summaries, product performance, and stock level analysis
- **Offline-first architecture** with SQLite local database
- **Enhanced loyalty program** with tiered rewards and points multipliers
- **Real-time analytics dashboard** with live sales updates and performance metrics

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js with Express (running in Electron main process)
- **Database**: SQLite (local) with potential Postgres sync for cloud capabilities
- **Packaging**: Electron Builder for cross-platform deployment

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma migrate dev
   npm run seed
   ```

### Development

To run the application in development mode:
```bash
npm run dev
```

This will start both the Vite development server and the Electron app.

### Building for Production

To build the application for production:
```bash
npm run build
npm run electron:build
```

This will create distributable packages for Windows, macOS, and Linux in the `dist-electron` directory.

## Project Structure

```
pos-system/
├── src/                 # React frontend components
│   ├── components/      # UI components
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Entry point
├── prisma/              # Database schema and migrations
├── electron-main.js     # Electron main process
├── preload.js           # Electron preload script
├── vite.config.js       # Vite configuration
└── package.json         # Project dependencies and scripts
```

## Core Modules

### Sales Workflow
1. User opens Sales Screen
2. Scan/search product → product appears in cart
3. Qty dialog pops up for adjustment
4. Apply discount/tax if needed
5. Payment screen: cash, card, split, digital
6. Print receipt + log transaction

### Inventory Management
- Add product with type (unit, pack, wholesale)
- Define conversion rates (e.g., 1 pack = 12 units)
- Stock adjustments for purchases, returns, damages
- Low stock alerts and expiry date tracking
- Bulk import/export via CSV

### User & Role Management
- Admin: Full control over sales, reports, and inventory
- Cashier: Sales operations only
- Manager: Sales + reports with limited inventory control
- Comprehensive audit logs for all actions

### Reporting
- Daily/weekly/monthly sales summaries
- Top products and categories analysis
- Profit margin calculations
- Stock level monitoring and reorder suggestions

### Loyalty Program
- **Tiered Rewards System**: Four loyalty tiers (Regular, Silver, Gold, Platinum) with increasing benefits
- **Points Multipliers**: Earn 1x, 1.5x, 2x, or 3x points based on customer tier
- **Automatic Tier Assignment**: Customers automatically progress through tiers based on points balance
- **Points Redemption**: Customers can redeem points for discounts on future purchases

### Real-Time Analytics
- **Live Dashboard**: Real-time sales metrics with WebSocket connectivity
- **Performance Metrics**: Track today's sales, weekly performance, and active customers
- **Data Visualization**: Interactive charts for sales trends and top products
- **Live Sales Feed**: Real-time updates of all transactions

## Database Schema

The application uses SQLite for local data storage with the following tables:

- **Products**: Product information including type, pricing, and stock levels
- **Sales**: Transaction records with totals and payment types
- **SaleItems**: Individual items within each sale
- **Users**: User accounts with role-based permissions
- **Logs**: Audit trail of all system actions
- **Customers**: Customer information with loyalty points tracking
- **LoyaltyTiers**: Tier definitions with points requirements and multipliers
- **LoyaltyTransactions**: History of points earned and redeemed

## Future Enhancements

### Phase 2
- Cloud synchronization with Postgres database
- Multi-branch support
- Advanced AI-powered analytics and predictive modeling
- E-commerce platform sync
- Mobile companion app for customers

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.