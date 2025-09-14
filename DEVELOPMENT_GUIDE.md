# POS System Development Guide

This document provides instructions for setting up and running the POS System application.

## Project Overview

The POS System is a desktop application built with:
- Electron (for desktop app framework)
- React + Vite (for frontend UI)
- Node.js + Express (for backend API)
- SQLite (for local database)
- Prisma (for database ORM)

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

## Setting Up the Development Environment

1. **Prerequisites**:
   - Node.js (v16 or higher)
   - npm or yarn

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Database Setup**:
   ```bash
   # Create and apply database migrations
   npx prisma migrate dev --name init
   
   # Seed the database with sample data
   npm run seed
   ```

4. **Run the Application**:
   ```bash
   npm run dev
   ```

## Key Components

### Electron Main Process (`electron-main.js`)
- Sets up the Electron application window
- Runs an Express server for backend API endpoints
- Handles inter-process communication (IPC) between frontend and backend

### Preload Script (`preload.js`)
- Provides a secure bridge between the renderer process and main process
- Exposes limited Electron APIs to the frontend

### Frontend Components
- **App.jsx**: Main application component with routing
- **Dashboard.jsx**: Overview of sales, inventory, and quick actions
- **SalesScreen.jsx**: Main POS interface for processing sales
- **InventoryScreen.jsx**: Product management and stock control
- **ReportsScreen.jsx**: Sales analytics and reporting
- **SettingsScreen.jsx**: Application configuration
- **QuantityDialog.jsx**: Modal for adjusting product quantities

### Backend API Endpoints
- `POST /api/sales` - Record a new sale
- `GET /api/sales/report` - Retrieve sales reports
- `POST /api/inventory` - Add a new product
- `PUT /api/inventory/:id` - Update an existing product
- `GET /api/inventory` - Retrieve all products
- `GET /api/inventory/stock` - Retrieve current stock levels
- `POST /api/users` - Add a new user
- `GET /api/users` - Retrieve all users

### Database Schema
The application uses Prisma with SQLite for data persistence:
- **Product**: Product information (name, type, pricing, stock)
- **Sale**: Sales transactions
- **SaleItem**: Individual items within sales
- **User**: User accounts with roles
- **Log**: Audit trail of system actions

## Building for Production

To create distributable packages:
```bash
npm run build
npm run electron:build
```

This will generate platform-specific installers in the `dist-electron` directory.

## Troubleshooting

### Common Issues

1. **Electron not starting**:
   - Ensure all dependencies are installed: `npm install`
   - Check that no other instances are running

2. **Database connection errors**:
   - Verify the database file exists at `prisma/dev.db`
   - Run migrations: `npx prisma migrate dev`

3. **Port conflicts**:
   - The backend runs on port 3000 by default
   - The frontend dev server runs on port 5173

### Development Tips

1. **Hot Reloading**:
   - The Vite development server provides hot module replacement
   - Changes to React components will automatically update in the browser

2. **Debugging**:
   - Use Electron's developer tools (Ctrl/Cmd + Shift + I)
   - Check the terminal for backend API logs

3. **Adding New Features**:
   - Create new React components in the `src/components` directory
   - Add new API endpoints in `electron-main.js`
   - Update the database schema in `prisma/schema.prisma` if needed

## Future Enhancements

### Phase 2 Features
- Cloud synchronization with PostgreSQL
- Multi-branch support
- Loyalty program integration
- E-commerce platform sync
- Advanced analytics and reporting

### Architecture Improvements
- Implement proper authentication and authorization
- Add unit and integration tests
- Implement data validation and error handling
- Add offline/online sync capabilities