# How to Run and Test the Essen POS System

This document provides instructions for running the Essen POS System and testing the newly implemented loyalty program and advanced analytics features.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Windows, macOS, or Linux operating system

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd pos-system
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

## Running the Application

To run the application in development mode:
```bash
npm run dev
```

This will start both the Vite development server and the Electron app. The application will be available at `http://localhost:5175` (or the next available port).

## Testing the Loyalty Program

### 1. Customer Tier Assignment
- Open the CRM module from the main dashboard
- Navigate to the Loyalty tab
- View customer profiles to see their current loyalty tier and points balance
- Customers are automatically assigned to tiers based on their points balance:
  - Regular: 0-499 points (1x multiplier)
  - Silver: 500-1499 points (1.5x multiplier)
  - Gold: 1500-2999 points (2x multiplier)
  - Platinum: 3000+ points (3x multiplier)

### 2. Points Earning with Multipliers
- Go to the Sales screen
- Select a customer with an existing loyalty tier
- Add products to the cart and complete a sale
- The system will automatically calculate loyalty points with the customer's tier multiplier
- View the points earned in the sales confirmation and customer profile

### 3. Points Redemption
- In the Sales screen with a customer selected, click the "Redeem Points" button
- Enter the number of points to redeem (minimum 20 points)
- The system will apply a discount to the sale based on the points value
- Points are converted at a rate of 5¢ per point

## Testing Real-Time Analytics

### 1. Real-Time Dashboard
- Navigate to the Reports module
- Select the "Real-Time Dashboard" tab
- The dashboard will display live sales metrics and performance indicators
- Key metrics include:
  - Today's sales
  - Weekly sales performance
  - Active customers
  - Average transaction value
  - Top products sold
  - Live sales feed

### 2. WebSocket Connectivity
- The real-time dashboard uses WebSocket technology for live updates
- When a sale is completed in the Sales screen, it will appear in the live sales feed
- The dashboard automatically refreshes data at configurable intervals (15s, 30s, 1m, 5m)

## User Credentials for Testing

The system comes with pre-configured user accounts for testing:

### Admin User
- Email: admin@essen.com
- Password: admin123
- Permissions: Full access to all system features

### Manager User
- Email: manager@essen.com
- Password: manager123
- Permissions: Sales, reports, and limited inventory control

### Cashier Users
- Email: cashier1@essen.com or cashier2@essen.com
- Password: cashier123
- Permissions: Sales operations only

## Sample Data

The seed script creates sample data for testing:

### Products
- Premium Coffee - $15.99
- Organic Milk 1L - $4.99
- Whole Wheat Bread - $3.49
- Premium Chocolate Pack - $8.99
- Organic Bananas - $2.49
- Frozen Greek Yogurt - $5.99
- Sourdough Bread Loaf - $4.99
- Premium Beer Craft Pack - $12.99
- Natural Honey Jar - $7.99
- Extra Virgin Olive Oil - $9.99

### Customers
- John Smith: 254 points (Regular tier)
- Sarah Johnson: 1750 points (Gold tier)
- Michael Davis: 75 points (Regular tier)
- Emily Wilson: 420 points (Regular tier)
- David Brown: 0 points (Regular tier)
- Lisa Garcia: 95 points (Regular tier)
- Robert Miller: 350 points (Regular tier)
- Jennifer Martinez: 1100 points (Silver tier)

## Troubleshooting

### Database Issues
If you encounter database errors:
```bash
npx prisma migrate reset
npx prisma migrate dev
npm run seed
```

### WebSocket Connection Problems
If real-time updates are not working:
1. Ensure the Electron backend is running on port 3000
2. Verify that the WebSocket server is running on port 3001
3. Check that no firewall is blocking the connection

### Performance Issues
If the application is running slowly:
1. Close other applications to free up system resources
2. Ensure you have at least 4GB of RAM available
3. Restart the development server

## Building for Production

To build the application for production:
```bash
npm run build
npm run electron:build
```

This will create distributable packages for Windows, macOS, and Linux in the `dist-electron` directory.

## API Documentation

### Loyalty Program Endpoints
- `POST /api/loyalty/earn` - Earn loyalty points for a customer
- `POST /api/loyalty/redeem` - Redeem loyalty points for a discount
- `GET /api/loyalty/transactions/:customerId` - Get loyalty transaction history
- `GET /api/loyalty/tiers` - Get all loyalty tiers
- `POST /api/loyalty/tiers` - Create a new loyalty tier (Admin only)
- `PUT /api/loyalty/tiers/:id` - Update a loyalty tier (Admin only)
- `DELETE /api/loyalty/tiers/:id` - Delete a loyalty tier (Admin only)

### Analytics Endpoints
- `GET /api/analytics/realtime` - Get real-time analytics data

## Testing Scripts

Several testing scripts are included in the repository:

- `test-loyalty.js` - Test loyalty tier assignment and points calculation
- `test-analytics.js` - Test real-time analytics data retrieval
- `test-websocket.js` - Test WebSocket connectivity
- `create-test-sale.js` - Create a test sale to verify functionality
- `final-test.js` - Comprehensive integration test

To run any of these scripts:
```bash
node script-name.js
```

## Support

For issues or questions about the implementation, please refer to:
- CLINE.md - Complete implementation guide
- README.md - Project overview and setup instructions
- Source code comments for detailed technical information