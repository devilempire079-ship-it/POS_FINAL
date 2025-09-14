# 🏪 POS FINAL - Setup Guide for New Machines

> **Complete multi-business Point of Sale system setup guide for new developers/machines**

<div align="center">
  <img src="https://img.shields.io/badge/Status-Working%20✅-brightgreen" alt="Status Badge"/>
  <img src="https://img.shields.io/badge/Node.js-18+-blue" alt="Node Badge"/>
  <img src="https://img.shields.io/badge/Duration-10--15%20minutes-orange" alt="Setup Time"/>
</div>

## 🎯 **Quick Overview**
- **System**: Multi-business POS (Restaurant, Retail, Pharmacy, Repair, Rental)
- **Stack**: React + Node.js + SQLite + Prisma + Electron
- **Login Ready**: Three test accounts prepared

## 📋 **Prerequisites (Must Have Installed)**

### ✅ **Required Software**
- **[Node.js 18+](https://nodejs.org/)** - Download LTS version
- **[Git](https://git-scm.com/)** - Version control
- **VSCode** (recommended) - Code editor

### 🔍 **Verify Prerequisites**
```bash
# Check Node.js version
node --version
# Should show: v18.x.x or higher

# Check npm version
npm --version
# Should show: 9.x.x or higher
```

### ⚠️ **Platform Specific Requirements**
- **Windows**: No additional requirements
- **macOS**: Xcode Command Line Tools (install with `xcode-select --install`)
- **Linux**: Python 3.x and build tools (install with package manager)

---

## 🚀 **Step-by-Step Setup Instructions**

### **Step 1: Clone the Repository**
```bash
# Clone the project
git clone https://github.com/devilempire079-ship-it/POS_FINAL.git
cd POS_FINAL

# Verify you have the files
ls -la  # Should see prisma/, src/, package.json, etc.
```

### **Step 2: Set Up Environment Variables**
```bash
# Copy the example environment file
cp .env.example .env

# Generate secure JWT secrets (CRITICAL FOR SECURITY)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Edit .env file and replace the generated secrets:
JWT_SECRET=your_generated_secret_here
JWT_REFRESH_SECRET=your_generated_secret_here
```

**Security Warning:** Never reuse JWT secrets across different deployments!

### **Step 3: Install Dependencies**
```bash
# Install all required packages
npm install

# This will take 2-3 minutes. Success looks like:
# added 1247 packages from 3124 contributors
```

### **Step 3: Database Setup**
```bash
# Step 3a: Push database schema (creates tables)
npx prisma db push --force-reset --accept-data-loss

# Step 3b: Seed with test data and users
npm run seed
```

**Expected Output:**
```bash
🌱 Starting seed...
👤 Created users: {
  admin: 'Admin User',
  manager: 'Store Manager',
  cashiers: [ 'John Cashier', 'Jane Cashier' ]
}
🏪 Created business type: Retail Store
📦 Created/updated product: Premium Arabica Coffee - Supplier: Global Coffee Co
✅ Seed completed successfully!
```

### **Step 4: Start Development Server**

#### **Option A: Full App (Recommended for Production Demo)**
```bash
npm run dev
```
- Starts both frontend (Vite) and backend (Node)
- Opens Electron desktop window
- May show warnings about concurrent processes (safe to ignore)

#### **Option B: Separate Servers (For Development)**
```bash
# Terminal 1: Frontend only
npm run dev:frontend  # or just the Vite part

# Terminal 2: Backend only (if available)
npm run server
```

### **Step 5: Access the Application**
- **Desktop App**: Electron window opens automatically
- **Web App**: `http://localhost:5174` (if separate server)
- **API Server**: `http://localhost:3004` (backend API)

---

## 🔐 **Login Credentials (Ready to Use)**

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | `admin@essen.com` | `Admin123!` | Full access |
| **Manager** | `manager@essen.com` | `Manager123!` | Reports + limited admin |
| **Cashier** | `cashier1@essen.com` | `Cashier123!` | POS sales only |

### **Login Screen Features**
- Click "Admin", "Manager", or "Cashier" buttons to auto-fill credentials
- Manual entry also works

---

## 🔧 **Troubleshooting**

### **❌ "npm install" fails**
```bash
# Clear npm cache and node_modules
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### **❌ "npx prisma" commands fail**
```bash
# Install Prisma globally
npm install -g prisma

# Or run from node_modules
npx prisma --version  # Should show v5.x.x
```

### **❌ Database errors during setup**
```bash
# Force reset database completely
npx prisma db push --force-reset --accept-data-loss
npm run seed
```

### **❌ "Login Failed" error**
```bash
# Check if server is running on port 3004
curl http://localhost:3004/api/health

# If server not running, start it:
node server.js
```

### **❌ Port 5173/3001 already in use**
```bash
# Kill processes using these ports
# Windows:
netstat -ano | findstr :5173
netstat -ano | findstr :3001
# Use PID from output to: taskkill /PID <pid> /F

# macOS/Linux:
lsof -ti:5173 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### **❌ Electron app won't start**
```bash
# Try rebuilding native modules
npm run install-app-deps

# Or run without electron for web-only development
npm run preview
```

---

## 🧪 **Testing Setup**

### **Automatic Tests**
```bash
# Test all functionality (optional)
npm run test

# Test specific API endpoints
node test-login.js
node test-products-api.js
```

### **Manual Testing Checklist**
- [ ] Load application successfully
- [ ] Login with Admin credentials
- [ ] Navigate between screens (Sales, Inventory, CRM, Reports)
- [ ] Create a test sale transaction
- [ ] Switch business types (if available)
- [ ] Logout and login as different user

### **API Health Check**
```bash
# Test API connectivity
curl -X GET http://localhost:3004/api/health

# Expected response:
{"status":"healthy","timestamp":"2025-XX-...","uptime":X.XXX,"version":"1.0.0","services":{"api":"running","websocket":"running","database":"connected"}}
```

---

## 📊 **Project Structure Overview**

```
POS_FINAL/
├── src/
│   ├── components/        # React components by category
│   │   ├── sales/         # Business-specific sales screens
│   │   ├── crm/           # Customer functions
│   │   └── dashboard/     # Analytics widgets
│   ├── hooks/             # Custom React hooks
│   └── services/          # API client and utilities
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Database changes
│   └── seed.js            # Initial data
├── server.js              # Backend API server
├── electron-main.js       # Desktop app entry
└── package.json           # Dependencies and scripts
```

---

## 💡 **Development Tips**

### **Useful Commands**
```bash
# Hot reload development
npm run dev

# Build for production
npm run build
npm run electron:build

# Database management
npx prisma studio          # Database GUI at localhost:5555
npx prisma migrate dev     # Apply schema changes
npm run seed              # Refresh test data

# Testing
npm run test              # Run test suites
node test-login.js        # Test authentication
```

### **Key Features to Explore**
- **Multi-business Support**: Switch between Restaurant, Retail, Pharmacy modes
- **Real-time Analytics**: Live sales dashboard
- **Table Management**: Restaurant table reservations and management
- **Inventory System**: Advanced stock tracking with multiple units
- **Role-Based Access**: Admin, Manager, and Cashier permissions

---

## 🤝 **Need Help?**

### **Common Issues & Solutions**

1. **"Port already in use"**: Kill existing processes or change ports
2. **"Module not found"**: Run `npm install` again
3. **"Database connection failed"**: Run database setup steps again
4. **"Electron didn't start"**: Try web version first with `npm run preview`

### **Support Resources**
- 📖 **README.md**: Comprehensive documentation
- 🐛 **Issue Tracking**: GitHub Issues for bug reports
- 💬 **Documentation**: Each module has inline code comments

---

## ✅ **Success Checklist**

After setup, verify everything works:
- [ ] ✅ Project cloned successfully
- [ ] ✅ Dependencies installed
- [ ] ✅ Database initialized and seeded
- [ ] ✅ Server starts without errors
- [ ] ✅ Application loads in browser/Electron
- [ ] ✅ Admin login works (`admin@essen.com` / `Admin123!`)
- [ ] ✅ All screens accessible
- [ ] ✅ Basic functionality works (create sale, view inventory)

### **Time Expectations**
- **First-time setup**: 10-15 minutes
- **Subsequent setups**: 2-3 minutes
- **Troubleshooting time**: 5-10 minutes if issues arise

---

<div align="center">
  <p><strong>🎉 Happy coding with POS FINAL!</strong></p>
  <p><em>A complete, enterprise-grade Point of Sale solution</em></p>
</div>
