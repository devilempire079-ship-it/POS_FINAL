/*
  Warnings:

  - You are about to drop the `DamageReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SupplierPayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SupplierProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `damageReason` on the `PurchaseReceiptItem` table. All the data in the column will be lost.
  - You are about to drop the column `damageSeverity` on the `PurchaseReceiptItem` table. All the data in the column will be lost.
  - You are about to drop the column `disposition` on the `PurchaseReceiptItem` table. All the data in the column will be lost.
  - You are about to drop the column `creditLimit` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `currentBalance` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `lastOrderDate` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `lastPaymentDate` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `onTimeDeliveryRate` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `preferredPaymentMethod` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `qualityRating` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `totalOrderValue` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `totalOrders` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `averageLeadTime` on the `SupplierPerformance` table. All the data in the column will be lost.
  - You are about to drop the column `defectRate` on the `SupplierPerformance` table. All the data in the column will be lost.
  - You are about to drop the column `onTimeDeliveries` on the `SupplierPerformance` table. All the data in the column will be lost.
  - You are about to drop the column `paymentCompliance` on the `SupplierPerformance` table. All the data in the column will be lost.
  - You are about to drop the column `totalDeliveries` on the `SupplierPerformance` table. All the data in the column will be lost.
  - You are about to drop the column `totalOrders` on the `SupplierPerformance` table. All the data in the column will be lost.
  - You are about to drop the column `totalValue` on the `SupplierPerformance` table. All the data in the column will be lost.
  - Added the required column `metricType` to the `SupplierPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `SupplierPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SupplierPerformance` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DamageReport_condition_idx";

-- DropIndex
DROP INDEX "DamageReport_supplierId_idx";

-- DropIndex
DROP INDEX "DamageReport_productId_idx";

-- DropIndex
DROP INDEX "SupplierPayment_paymentDate_idx";

-- DropIndex
DROP INDEX "SupplierPayment_supplierId_idx";

-- DropIndex
DROP INDEX "sqlite_autoindex_SupplierPayment_1";

-- DropIndex
DROP INDEX "SupplierProduct_productId_idx";

-- DropIndex
DROP INDEX "SupplierProduct_supplierId_idx";

-- AlterTable
ALTER TABLE "BusinessType" ADD COLUMN "category" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DamageReport";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SupplierPayment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SupplierProduct";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Location" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT DEFAULT 'US',
    "latitude" REAL,
    "longitude" REAL,
    "manager" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LocationInventory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "locationId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 0,
    "allocated" REAL NOT NULL DEFAULT 0,
    "available" REAL NOT NULL DEFAULT 0,
    "minStock" REAL NOT NULL DEFAULT 0,
    "maxStock" REAL,
    "reorderPoint" REAL NOT NULL DEFAULT 0,
    "lastCount" DATETIME,
    "lastMovement" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LocationInventory_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LocationInventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryTransfer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "transferNumber" TEXT NOT NULL,
    "fromLocationId" INTEGER NOT NULL,
    "toLocationId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "transferDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDate" DATETIME,
    "receivedDate" DATETIME,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "totalValue" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "requestedBy" INTEGER NOT NULL,
    "approvedBy" INTEGER,
    "shippedBy" INTEGER,
    "receivedBy" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryTransfer_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryTransfer_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TransferItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "transferId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "unitCost" REAL NOT NULL,
    "totalValue" REAL NOT NULL,
    "shippedQty" REAL NOT NULL DEFAULT 0,
    "receivedQty" REAL NOT NULL DEFAULT 0,
    "condition" TEXT NOT NULL DEFAULT 'good',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransferItem_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "InventoryTransfer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransferItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LocationAllocation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "locationId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderType" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "allocatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LocationAllocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LocationAllocation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryBusinessRules" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "businessTypeId" INTEGER NOT NULL,
    "ruleType" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "conditions" TEXT,
    "actions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryBusinessRules_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "BusinessType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessWorkflow" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "businessTypeId" INTEGER NOT NULL,
    "workflowType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "steps" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "approvalRequired" BOOLEAN NOT NULL DEFAULT false,
    "autoApproval" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BusinessWorkflow_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "BusinessType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessCompliance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "businessTypeId" INTEGER NOT NULL,
    "regulation" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "description" TEXT,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "frequency" TEXT,
    "lastAudit" DATETIME,
    "nextAudit" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BusinessCompliance_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "BusinessType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InventoryTypeRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inventoryTypeId" INTEGER NOT NULL,
    "ruleType" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "conditions" TEXT,
    "actions" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryTypeRule_inventoryTypeId_fkey" FOREIGN KEY ("inventoryTypeId") REFERENCES "InventoryType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DemandForecast" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "locationId" INTEGER,
    "forecastDate" DATETIME NOT NULL,
    "algorithm" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "predictedQty" REAL NOT NULL,
    "confidence" REAL NOT NULL,
    "actualQty" REAL,
    "accuracy" REAL,
    "factors" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DemandForecast_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DemandForecast_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryOptimization" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "locationId" INTEGER,
    "optimizationType" TEXT NOT NULL,
    "currentValue" REAL NOT NULL,
    "recommendedValue" REAL NOT NULL,
    "savings" REAL NOT NULL,
    "priority" TEXT NOT NULL,
    "reasoning" TEXT,
    "implemented" BOOLEAN NOT NULL DEFAULT false,
    "implementedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryOptimization_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryOptimization_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryScenario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "businessTypeId" INTEGER NOT NULL,
    "scenarioType" TEXT NOT NULL,
    "conditions" TEXT NOT NULL,
    "actions" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryScenario_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "BusinessType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QualityControl" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "batchLot" TEXT,
    "serialNumber" TEXT,
    "inspectionType" TEXT NOT NULL,
    "inspector" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "criteria" TEXT,
    "results" TEXT,
    "notes" TEXT,
    "expiryDate" DATETIME,
    "nextInspection" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QualityControl_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QualityDefect" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "qualityControlId" INTEGER NOT NULL,
    "defectType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT,
    "quantity" REAL NOT NULL,
    "disposition" TEXT,
    "cost" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QualityDefect_qualityControlId_fkey" FOREIGN KEY ("qualityControlId") REFERENCES "QualityControl" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComplianceRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER,
    "regulation" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'compliant',
    "auditDate" DATETIME,
    "nextAudit" DATETIME,
    "auditor" TEXT,
    "findings" TEXT,
    "correctiveActions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ComplianceRecord_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegulatoryTracking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "regulation" TEXT NOT NULL,
    "trackingType" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expiryDate" DATETIME,
    "recallDate" DATETIME,
    "disposalDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RegulatoryTracking_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryAnalytics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER,
    "locationId" INTEGER,
    "metricType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "value" REAL NOT NULL,
    "target" REAL,
    "variance" REAL,
    "insights" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryAnalytics_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryAnalytics_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryAlert" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER,
    "locationId" INTEGER,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "threshold" REAL,
    "currentValue" REAL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "acknowledgedBy" INTEGER,
    "acknowledgedAt" DATETIME,
    "resolvedAt" DATETIME,
    "autoAction" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryAlert_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryAlert_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupplyChainRisk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "supplierId" INTEGER,
    "productId" INTEGER,
    "riskType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "probability" REAL NOT NULL,
    "impact" TEXT NOT NULL,
    "mitigation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupplyChainRisk_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SupplyChainRisk_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BusinessTypeSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "businessTypeId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "valueType" TEXT NOT NULL DEFAULT 'string',
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "validation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BusinessTypeSetting_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "BusinessType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BusinessTypeSetting" ("businessTypeId", "createdAt", "description", "id", "key", "updatedAt", "value", "valueType") SELECT "businessTypeId", "createdAt", "description", "id", "key", "updatedAt", "value", "valueType" FROM "BusinessTypeSetting";
DROP TABLE "BusinessTypeSetting";
ALTER TABLE "new_BusinessTypeSetting" RENAME TO "BusinessTypeSetting";
CREATE UNIQUE INDEX "BusinessTypeSetting_businessTypeId_key_key" ON "BusinessTypeSetting"("businessTypeId", "key");
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "barcode" TEXT,
    "sku" TEXT,
    "type" TEXT NOT NULL DEFAULT 'unit',
    "category" TEXT,
    "cost" REAL NOT NULL,
    "price" REAL NOT NULL,
    "stockQty" REAL NOT NULL DEFAULT 0,
    "minStockLevel" REAL NOT NULL DEFAULT 10,
    "expiryDate" DATETIME,
    "location" TEXT,
    "supplier" TEXT,
    "supplierId" INTEGER,
    "warehouseLocation" TEXT,
    "reorderPoint" REAL DEFAULT 10,
    "idealStock" REAL,
    "lastRestocked" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "conversionRate" REAL NOT NULL DEFAULT 1.0,
    "unitOfMeasure" TEXT NOT NULL DEFAULT 'each',
    "minOrderQty" REAL NOT NULL DEFAULT 1.0,
    "alternateUnit" TEXT,
    "alternateUnitConversionRate" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "warehouseLocationId" INTEGER,
    "inventoryTypeId" INTEGER,
    CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_warehouseLocationId_fkey" FOREIGN KEY ("warehouseLocationId") REFERENCES "WarehouseLocation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_inventoryTypeId_fkey" FOREIGN KEY ("inventoryTypeId") REFERENCES "InventoryType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("alternateUnit", "alternateUnitConversionRate", "barcode", "category", "conversionRate", "cost", "createdAt", "description", "expiryDate", "id", "idealStock", "isActive", "lastRestocked", "location", "minOrderQty", "minStockLevel", "name", "price", "reorderPoint", "sku", "stockQty", "supplier", "supplierId", "type", "unitOfMeasure", "updatedAt", "warehouseLocation", "warehouseLocationId") SELECT "alternateUnit", coalesce("alternateUnitConversionRate", 1.0) AS "alternateUnitConversionRate", "barcode", "category", "conversionRate", "cost", "createdAt", "description", "expiryDate", "id", "idealStock", "isActive", "lastRestocked", "location", "minOrderQty", "minStockLevel", "name", "price", "reorderPoint", "sku", "stockQty", "supplier", "supplierId", "type", "unitOfMeasure", "updatedAt", "warehouseLocation", "warehouseLocationId" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE TABLE "new_PurchaseReceiptItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "purchaseReceiptId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "orderedQuantity" REAL NOT NULL,
    "receivedQuantity" REAL NOT NULL,
    "unitCost" REAL NOT NULL,
    "totalCost" REAL NOT NULL,
    "condition" TEXT NOT NULL DEFAULT 'good',
    "expiryDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PurchaseReceiptItem_purchaseReceiptId_fkey" FOREIGN KEY ("purchaseReceiptId") REFERENCES "PurchaseReceipt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PurchaseReceiptItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PurchaseReceiptItem" ("condition", "createdAt", "expiryDate", "id", "notes", "orderedQuantity", "productId", "purchaseReceiptId", "receivedQuantity", "totalCost", "unitCost") SELECT "condition", "createdAt", "expiryDate", "id", "notes", "orderedQuantity", "productId", "purchaseReceiptId", "receivedQuantity", "totalCost", "unitCost" FROM "PurchaseReceiptItem";
DROP TABLE "PurchaseReceiptItem";
ALTER TABLE "new_PurchaseReceiptItem" RENAME TO "PurchaseReceiptItem";
CREATE TABLE "new_Supplier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT DEFAULT 'US',
    "contactPerson" TEXT,
    "paymentTerms" TEXT,
    "taxId" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Supplier" ("address", "city", "contactPerson", "country", "createdAt", "email", "id", "isActive", "name", "notes", "paymentTerms", "phone", "state", "taxId", "updatedAt", "zipCode") SELECT "address", "city", "contactPerson", "country", "createdAt", "email", "id", "isActive", "name", "notes", "paymentTerms", "phone", "state", "taxId", "updatedAt", "zipCode" FROM "Supplier";
DROP TABLE "Supplier";
ALTER TABLE "new_Supplier" RENAME TO "Supplier";
CREATE UNIQUE INDEX "Supplier_email_key" ON "Supplier"("email");
CREATE TABLE "new_SupplierPerformance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "supplierId" INTEGER NOT NULL,
    "metricType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "score" REAL NOT NULL,
    "target" REAL,
    "trend" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupplierPerformance_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SupplierPerformance" ("createdAt", "id", "period", "periodEnd", "periodStart", "supplierId") SELECT "createdAt", "id", "period", "periodEnd", "periodStart", "supplierId" FROM "SupplierPerformance";
DROP TABLE "SupplierPerformance";
ALTER TABLE "new_SupplierPerformance" RENAME TO "SupplierPerformance";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Location_code_key" ON "Location"("code");

-- CreateIndex
CREATE UNIQUE INDEX "LocationInventory_locationId_productId_key" ON "LocationInventory"("locationId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryTransfer_transferNumber_key" ON "InventoryTransfer"("transferNumber");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryType_code_key" ON "InventoryType"("code");
