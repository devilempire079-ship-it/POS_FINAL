-- Alternate Units Support Migration
-- Adds support for products with multiple units of measure (e.g., rope sold in meters or feet)

-- Add alternate unit fields to Product table
ALTER TABLE "Product" ADD COLUMN "alternateUnit" TEXT;
ALTER TABLE "Product" ADD COLUMN "alternateUnitConversionRate" REAL DEFAULT 1.0;

-- Create indexes for better performance
CREATE INDEX "Product_alternateUnit_idx" ON "Product"("alternateUnit");

-- Update existing products with common alternate units
UPDATE "Product" SET "alternateUnit" = 'ft', "alternateUnitConversionRate" = 3.28084 WHERE "unitOfMeasure" = 'm' AND "name" LIKE '%rope%';
UPDATE "Product" SET "alternateUnit" = 'yd', "alternateUnitConversionRate" = 1.09361 WHERE "unitOfMeasure" = 'm' AND "name" LIKE '%fabric%';
UPDATE "Product" SET "alternateUnit" = 'in', "alternateUnitConversionRate" = 39.3701 WHERE "unitOfMeasure" = 'cm' AND "name" LIKE '%tape%';
UPDATE "Product" SET "alternateUnit" = 'gal', "alternateUnitConversionRate" = 0.264172 WHERE "unitOfMeasure" = 'L' AND "name" LIKE '%paint%';
