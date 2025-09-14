-- Product Unit Management Enhancement
-- Adds unit of measure and minimum order quantity support for weight-based products

-- Add new fields to Product table
ALTER TABLE "Product" ADD COLUMN "unitOfMeasure" TEXT NOT NULL DEFAULT 'each';
ALTER TABLE "Product" ADD COLUMN "minOrderQty" REAL NOT NULL DEFAULT 1.0;

-- Create indexes for better performance
CREATE INDEX "Product_unitOfMeasure_idx" ON "Product"("unitOfMeasure");

-- Update existing products with appropriate units based on their type
UPDATE "Product" SET "unitOfMeasure" = 'kg' WHERE "name" LIKE '%rice%' OR "name" LIKE '%flour%' OR "name" LIKE '%sugar%';
UPDATE "Product" SET "unitOfMeasure" = 'L' WHERE "name" LIKE '%milk%' OR "name" LIKE '%juice%' OR "name" LIKE '%oil%';
UPDATE "Product" SET "unitOfMeasure" = 'g' WHERE "name" LIKE '%coffee%' OR "name" LIKE '%tea%' OR "name" LIKE '%spice%';
UPDATE "Product" SET "unitOfMeasure" = 'lb' WHERE "name" LIKE '%meat%' OR "name" LIKE '%fish%';
UPDATE "Product" SET "unitOfMeasure" = 'each' WHERE "unitOfMeasure" = 'each'; -- Default for others

-- Set minimum order quantities for weight-based products
UPDATE "Product" SET "minOrderQty" = 0.25 WHERE "unitOfMeasure" IN ('kg', 'lb') AND "conversionRate" > 1;
UPDATE "Product" SET "minOrderQty" = 50 WHERE "unitOfMeasure" = 'g' AND "conversionRate" > 1;
UPDATE "Product" SET "minOrderQty" = 0.1 WHERE "unitOfMeasure" IN ('L', 'mL') AND "conversionRate" > 1;
