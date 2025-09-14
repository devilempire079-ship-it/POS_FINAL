# 🏪 POS FINAL - Complete Multi-Business Point of Sale System

<div align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen" alt="Status Badge"/>
  <img src="https://img.shields.io/badge/Version-1.0.0-blue" alt="Version Badge"/>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License Badge"/>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react" alt="React Badge"/>
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs" alt="Node Badge"/>
  <img src="https://img.shields.io/badge/Electron-29.x-47848F?style=for-the-badge&logo=electron" alt="Electron Badge"/>
  <img src="https://img.shields.io/badge/Prisma-5.x-2D3748?style=for-the-badge&logo=prisma" alt="Prisma Badge"/>
</div>

> **A production-ready, enterprise-grade Point of Sale system supporting multiple business verticals with advanced features, real-time analytics, and modern UI/UX.**

## 📹 Demo & Screenshots

✨ **Live Demo at:** [https://github.com/devilempire079-ship-it/POS_FINAL](https://github.com/devilempire079-ship-it/POS_FINAL)

### 🎨 Feature Highlights
| Restaurant POS | Retail Sales | Pharmacy Management |
|:-------------:|:-----------:|:------------------:|
| 🪑 Table Management | 🛒 Product Catalogs | 💊 Prescription Handling |
| 👨‍🍳 Kitchen Display | 📊 Stock Tracking | 🏥 Clinical Profiles |
| 📅 Reservations | 🏷️ Barcode Scanning | 🏥 Medical History |

## 🚀 Key Features

### 🌟 Core Business Support
- **🥗 Restaurant POS** - Table management, reservations, kitchen display, QSR support
- **🛍️ Retail Sales** - Product catalog, inventory, customer loyalty, sales analytics
- **💊 Pharmacy POS** - Prescription handling, clinical profiles, medical history, controlled substances
- **🔧 Repair Shop** - Service tracking, inventory management, customer support
- **🚗 Rental Equipment** - Equipment tracking, reservation system, pricing management

### 🛠️ Advanced Capabilities
- **📊 Real-Time Analytics** - Live dashboards, sales metrics, performance tracking
- **👥 CRM & Loyalty** - Customer management, tiered rewards, purchase history
- **📈 Inventory Management** - Multi-unit support, stock alerts, automated reordering
- **🔐 Security & Roles** - Admin/Manager/Cashier roles, audit trails, permissions
- **🌐 Cross-Platform** - Windows, macOS, Linux desktop applications
- **📤 Import/Export** - CSV bulk operations, data backup/restore
- **🔔 Real-Time Notifications** - WebSocket-enabled alerts, status updates
- **🎨 Modern UI/UX** - Responsive React interface with Tailwind CSS

### 🎯 Recent Enhancements
- ✅ **Dual Assistance System** - Table-specific and general assistance requests
- ✅ **Enterprise Inventory** - Business-type specific configurations
- ✅ **Advanced Reporting** - Predictive analytics and KPI dashboards
- ✅ **WebSocket Integration** - Real-time updates across all modules

## 🛠️ Technology Stack

### 🎨 Frontend
- **React 18** - Modern component-based UI with hooks
- **Vite** - Lightning-fast development and building
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **React Router** - Client-side routing and navigation

### ⚙️ Backend & Database
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - RESTful API framework
- **Prisma ORM** - Type-safe database management
- **SQLite** - Local database with cloud sync capabilities

### 📱 Desktop & Real-Time
- **Electron** - Cross-platform desktop apps
- **Socket.io** - Real-time bidirectional communication
- **WebSocket** - Live updates and notifications

### 🛡️ Security & Quality
- **JWT Authentication** - Secure token-based auth
- **Role-based Access** - Granular permissions system
- **Input Validation** - Comprehensive data sanitization
- **Audit Logging** - Complete transaction trails

## 📦 Installation & Setup

### Prerequisites
- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Git** for cloning repository

### 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/devilempire079-ship-it/POS_FINAL.git
   cd POS_FINAL
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma migrate dev
   npm run seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Launch the application**
   The Electron app will open automatically with the development server.

### 🏗️ Production Build

```bash
npm run build        # Build the React app
npm run electron:build  # Create distributable packages
```

Built packages will be available in the `dist-electron` directory.

## 📁 Project Structure

```
POS_FINAL/
├── src/
│   ├── components/
│   │   ├── sales/           # Business-specific sales screens
│   │   │   ├── restaurant/  # Restaurant POS (tables, kitchen)
│   │   │   ├── retail/      # Retail sales interface
│   │   │   ├── pharmacy/    # Pharmacy management
│   │   │   ├── rental/      # Equipment rental
│   │   │   └── repair/      # Repair shop operations
│   │   ├── crm/             # Customer relationship management
│   │   ├── inventory/       # Advanced inventory systems
│   │   ├── dashboard/       # Analytics and reporting
│   │   ├── restaurant/      # Restaurant-specific features
│   │   └── ui/              # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API and service layer
│   ├── data/                # Mock data and configurations
│   └── configs/             # Business-type specific settings
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migration files
│   └── seed.js             # Database seeding script
├── electron-main.js         # Electron main process
├── preload.js              # Electron preload script
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## 🗄️ Database Schema

### Core Tables
- **Users** - Multi-role authentication (Admin, Manager, Cashier)
- **Products** - Multi-business product catalog with units/variants
- **Customers** - CRM with loyalty tiers and purchase history
- **Sales & SaleItems** - Complete transaction records
- **Inventory** - Stock levels with alerts and reorder points
- **AssistanceRequests** - Staff request system (table/general)

### Business-Specific Tables
- **Tables & Reservations** - Restaurant table management
- **Prescriptions & Medications** - Pharmacy tracking
- **Equipment & Rentals** - Rental business operations
- **ServiceOrders** - Repair shop workflow

## 🎮 Usage Examples

### 🥗 Restaurant Workflow
1. **Table Selection** - Click tables in the visual restaurant floorplan
2. **Order Taking** - Add items from dynamic menu categories
3. **Kitchen Integration** - Send orders to kitchen display systems
4. **Payment Processing** - Multiple tender types and split payments
5. **Assistance Requests** - Table or general staff requests

### 💊 Pharmacy Operations
1. **Prescription Upload** - Handle prescription files and verification
2. **Clinical Profiles** - Maintain patient medical histories
3. **Inventory Management** - Track controlled substances and meds
4. **Insurance Processing** - Prior authorizations and claims
5. **Patient Support** - Refill scheduling and reminders

### 📊 Analytics Dashboard
- **Real-Time Sales** - Live transaction monitoring
- **Performance KPIs** - Multiple business metric tracking
- **Customer Insights** - Loyalty program analytics
- **Inventory Alerts** - Stock level monitoring and prediction

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-enhancement`
3. **Commit changes**: `git commit -m 'Add amazing enhancement'`
4. **Push to the branch**: `git push origin feature/amazing-enhancement`
5. **Open a Pull Request**

### Development Guidelines
- Follow **ES6+** JavaScript standards
- Use **functional components** with React hooks
- Write **meaningful commit messages**
- Add **JSDoc comments** for complex functions
- Test all **business logic changes**

## 📋 Available Scripts

```bash
npm run dev              # Start development with hot reload
npm run build            # Build the React production bundle
npm run electron:build   # Create desktop app packages
npm run prisma:studio    # Open database management interface
npm run seed             # Populate database with sample data
npm run test             # Run test suites
```

## 🐛 Recent Bug Fixes
- **Table Assistance Dialog** - Now supports both table-specific and general assistance requests
- **Validation Logic** - Removed hard requirement for table selection in assistance requests
- **Notification System** - Smart notifications that adapt based on request type

## 📈 Future Roadmap

### Phase 2 (Next Release)
- ☁️ **Cloud Synchronization** - Postgres cloud database with local sync
- 🏢 **Multi-Branch Support** - Centralized management across locations
- 🤖 **AI-Powered Analytics** - Predictive analytics and automated insights
- 🛒 **E-commerce Integration** - Online ordering and fulfillment
- 📱 **Mobile Companion** - Customer-facing mobile app

### Phase 3 (Future Vision)
- 🏪 **Multi-Tenant Architecture** - White-label solution for franchises
- 📊 **Advanced Analytics** - Machine learning-driven business intelligence
- 🔗 **API Integrations** - Third-party service connections (payment processors, etc.)
- 🌐 **Progressive Web App** - Browser-based access with offline capabilities

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/devilempire079-ship-it/POS_FINAL/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/devilempire079-ship-it/POS_FINAL/discussions)
- 📧 **Email**: devilempire079@gmail.com
- 👥 **Contributors**: See [CONTRIBUTORS.md](CONTRIBUTORS.md)

---

<div align="center">
  <p><strong>✨ Built with ❤️ using modern web technologies ✨</strong></p>
  <p><em>A complete, production-ready POS solution for today's businesses</em></p>
</div>
