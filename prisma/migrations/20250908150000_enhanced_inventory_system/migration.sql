-- Enhanced Inventory System Migration
-- Adds comprehensive supplier payment tracking, damage management, and supplier-product relationships

-- Create SupplierProduct relationship table
CREATE TABLE "SupplierProduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "supplierId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "supplierProductCode" TEXT,
    "supplierProductName" TEXT,
    "costPrice" REAL NOT NULL,
    "minOrderQuantity" REAL DEFAULT 1,
    "leadTimeDays" INTEGER DEFAULT 7,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupplierProduct_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SupplierProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create SupplierPayment tracking table
CREATE TABLE "SupplierPayment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "supplierId" INTEGER NOT NULL,
    "paymentNumber" TEXT UNIQUE,
    "amount" REAL NOT NULL,
    "paymentDate" DATETIME NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "invoiceNumbers" TEXT,
    "reference" TEXT,
    "status" TEXT DEFAULT 'paid',
    "notes" TEXT,
    "processedBy" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupplierPayment_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SupplierPayment_processedBy_fkey" FOREIGN KEY ("processedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create DamageReport table for comprehensive defect tracking
CREATE TABLE "DamageReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "supplierId" INTEGER,
    "purchaseReceiptId" INTEGER,
    "quantity" REAL NOT NULL,
    "condition" TEXT NOT NULL,
    "damageReason" TEXT,
    "damageSeverity" TEXT,
    "estimatedValue" REAL,
    "disposition" TEXT, -- returned, scrapped, discounted, etc.
    "reportedBy" INTEGER,
    "approvedBy" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DamageReport_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DamageReport_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DamageReport_purchaseReceiptId_fkey" FOREIGN KEY ("purchaseReceiptId") REFERENCES "PurchaseReceipt" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DamageReport_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DamageReport_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Enhance Supplier table with payment tracking fields
ALTER TABLE "Supplier" ADD COLUMN "creditLimit" REAL DEFAULT 0;
ALTER TABLE "Supplier" ADD COLUMN "currentBalance" REAL DEFAULT 0;
ALTER TABLE "Supplier" ADD COLUMN "lastPaymentDate" DATETIME;
ALTER TABLE "Supplier" ADD COLUMN "preferredPaymentMethod" TEXT DEFAULT 'bank_transfer';

-- Enhance PurchaseReceiptItem with detailed damage tracking
ALTER TABLE "PurchaseReceiptItem" ADD COLUMN "damageReason" TEXT;
ALTER TABLE "PurchaseReceiptItem" ADD COLUMN "damageSeverity" TEXT;
ALTER TABLE "PurchaseReceiptItem" ADD COLUMN "disposition" TEXT;

-- Create indexes for better performance
CREATE INDEX "SupplierProduct_supplierId_idx" ON "SupplierProduct"("supplierId");
CREATE INDEX "SupplierProduct_productId_idx" ON "SupplierProduct"("productId");
CREATE INDEX "SupplierPayment_supplierId_idx" ON "SupplierPayment"("supplierId");
CREATE INDEX "SupplierPayment_paymentDate_idx" ON "SupplierPayment"("paymentDate");
CREATE INDEX "DamageReport_productId_idx" ON "DamageReport"("productId");
CREATE INDEX "DamageReport_supplierId_idx" ON "DamageReport"("supplierId");
CREATE INDEX "DamageReport_condition_idx" ON "DamageReport"("condition");

-- Add supplier performance tracking fields
ALTER TABLE "Supplier" ADD COLUMN "totalOrders" INTEGER DEFAULT 0;
ALTER TABLE "Supplier" ADD COLUMN "totalOrderValue" REAL DEFAULT 0;
ALTER TABLE "Supplier" ADD COLUMN "onTimeDeliveryRate" REAL DEFAULT 0;
ALTER TABLE "Supplier" ADD COLUMN "qualityRating" REAL DEFAULT 0;
ALTER TABLE "Supplier" ADD COLUMN "lastOrderDate" DATETIME;

-- Create SupplierPerformance table for detailed analytics
CREATE TABLE "SupplierPerformance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "supplierId" INTEGER NOT NULL,
    "period" TEXT NOT NULL, -- monthly, quarterly, yearly
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "totalOrders" INTEGER DEFAULT 0,
    "totalValue" REAL DEFAULT 0,
    "onTimeDeliveries" INTEGER DEFAULT 0,
    "totalDeliveries" INTEGER DEFAULT 0,
    "defectRate" REAL DEFAULT 0,
    "averageLeadTime" INTEGER DEFAULT 0,
    "paymentCompliance" REAL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupplierPerformance_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes for performance tracking
CREATE INDEX "SupplierPerformance_supplierId_idx" ON "SupplierPerformance"("supplierId");
CREATE INDEX "SupplierPerformance_period_idx" ON "SupplierPerformance"("period");
CREATE INDEX "SupplierPerformance_periodStart_idx" ON "SupplierPerformance"("periodStart");

-- Insert default data for existing suppliers
INSERT INTO "SupplierProduct" ("supplierId", "productId", "costPrice", "minOrderQuantity", "leadTimeDays", "isActive", "updatedAt")
SELECT
    s."id" as supplierId,
    p."id" as productId,
    p."cost" as costPrice,
    1 as minOrderQuantity,
    7 as leadTimeDays,
    1 as isActive,
    CURRENT_TIMESTAMP as updatedAt
FROM "Supplier" s
CROSS JOIN "Product" p
WHERE p."supplierId" = s."id";

-- Update supplier performance data
UPDATE "Supplier"
SET
    "totalOrders" = COALESCE((
        SELECT COUNT(*)
        FROM "PurchaseOrder"
        WHERE "supplierId" = "Supplier"."id"
    ), 0),
    "totalOrderValue" = COALESCE((
        SELECT SUM("totalAmount")
        FROM "PurchaseOrder"
        WHERE "supplierId" = "Supplier"."id"
    ), 0),
    "lastOrderDate" = (
        SELECT MAX("orderDate")
        FROM "PurchaseOrder"
        WHERE "supplierId" = "Supplier"."id"
    );
