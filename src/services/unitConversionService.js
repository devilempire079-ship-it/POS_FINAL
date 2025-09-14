// Unit Conversion Service - Enterprise-grade unit management
// This service provides intelligent unit conversion capabilities

class UnitConversionService {
  constructor() {
    // Comprehensive unit conversion database
    this.unitDatabase = {
      // Length units
      length: {
        m: { name: 'meter', symbol: 'm', baseFactor: 1 },
        ft: { name: 'foot', symbol: 'ft', baseFactor: 0.3048 },
        in: { name: 'inch', symbol: 'in', baseFactor: 0.0254 },
        yd: { name: 'yard', symbol: 'yd', baseFactor: 0.9144 },
        cm: { name: 'centimeter', symbol: 'cm', baseFactor: 0.01 },
        mm: { name: 'millimeter', symbol: 'mm', baseFactor: 0.001 },
        km: { name: 'kilometer', symbol: 'km', baseFactor: 1000 }
      },

      // Weight units
      weight: {
        kg: { name: 'kilogram', symbol: 'kg', baseFactor: 1 },
        g: { name: 'gram', symbol: 'g', baseFactor: 0.001 },
        lb: { name: 'pound', symbol: 'lb', baseFactor: 0.453592 },
        oz: { name: 'ounce', symbol: 'oz', baseFactor: 0.0283495 },
        ton: { name: 'metric ton', symbol: 't', baseFactor: 1000 }
      },

      // Volume units
      volume: {
        L: { name: 'liter', symbol: 'L', baseFactor: 1 },
        mL: { name: 'milliliter', symbol: 'mL', baseFactor: 0.001 },
        gal: { name: 'gallon', symbol: 'gal', baseFactor: 3.78541 },
        qt: { name: 'quart', symbol: 'qt', baseFactor: 0.946353 },
        pt: { name: 'pint', symbol: 'pt', baseFactor: 0.473176 },
        cup: { name: 'cup', symbol: 'cup', baseFactor: 0.236588 },
        fl_oz: { name: 'fluid ounce', symbol: 'fl oz', baseFactor: 0.0295735 }
      },

      // Area units
      area: {
        m2: { name: 'square meter', symbol: 'm²', baseFactor: 1 },
        ft2: { name: 'square foot', symbol: 'ft²', baseFactor: 0.092903 },
        yd2: { name: 'square yard', symbol: 'yd²', baseFactor: 0.836127 },
        acre: { name: 'acre', symbol: 'acre', baseFactor: 4046.86 },
        ha: { name: 'hectare', symbol: 'ha', baseFactor: 10000 }
      }
    };

    // Common unit pairs for auto-suggestion
    this.commonPairs = {
      length: [
        ['m', 'ft'], ['m', 'yd'], ['m', 'in'], ['cm', 'in'],
        ['mm', 'in'], ['ft', 'in'], ['yd', 'ft']
      ],
      weight: [
        ['kg', 'lb'], ['g', 'oz'], ['kg', 'g'], ['lb', 'oz']
      ],
      volume: [
        ['L', 'gal'], ['L', 'qt'], ['mL', 'fl_oz'], ['gal', 'qt']
      ],
      area: [
        ['m2', 'ft2'], ['m2', 'yd2'], ['ft2', 'yd2'], ['ha', 'acre']
      ]
    };

    // Industry-specific unit preferences
    this.industryDefaults = {
      construction: { primary: 'ft', alternates: ['in', 'yd', 'm'] },
      manufacturing: { primary: 'mm', alternates: ['cm', 'm', 'in'] },
      retail: { primary: 'each', alternates: ['pack', 'dozen'] },
      food: { primary: 'kg', alternates: ['g', 'lb', 'oz'] },
      pharmacy: { primary: 'each', alternates: ['pack', 'bottle'] },
      restaurant: { primary: 'kg', alternates: ['g', 'lb', 'portion'] }
    };
  }

  // Convert between any two units in the same category
  convert(value, fromUnit, toUnit) {
    try {
      const fromCategory = this.getUnitCategory(fromUnit);
      const toCategory = this.getUnitCategory(toUnit);

      if (!fromCategory || !toCategory) {
        throw new Error(`Unknown unit: ${fromUnit} or ${toUnit}`);
      }

      if (fromCategory !== toCategory) {
        throw new Error(`Cannot convert between different unit types: ${fromCategory} and ${toCategory}`);
      }

      const fromFactor = this.unitDatabase[fromCategory][fromUnit].baseFactor;
      const toFactor = this.unitDatabase[fromCategory][toUnit].baseFactor;

      // Convert to base unit first, then to target unit
      const baseValue = value * fromFactor;
      const result = baseValue / toFactor;

      return {
        value: result,
        from: fromUnit,
        to: toUnit,
        category: fromCategory,
        rate: toFactor / fromFactor
      };
    } catch (error) {
      console.error('Unit conversion error:', error);
      return null;
    }
  }

  // Get unit category (length, weight, volume, area)
  getUnitCategory(unit) {
    for (const [category, units] of Object.entries(this.unitDatabase)) {
      if (units[unit]) {
        return category;
      }
    }
    return null;
  }

  // Get all compatible units for a given unit
  getCompatibleUnits(unit) {
    const category = this.getUnitCategory(unit);
    if (!category) return [];

    return Object.keys(this.unitDatabase[category]).filter(u => u !== unit);
  }

  // Auto-suggest alternate units based on primary unit
  suggestAlternateUnits(primaryUnit, options = {}) {
    const {
      maxSuggestions = 3,
      industry = null,
      excludeUnits = []
    } = options;

    const category = this.getUnitCategory(primaryUnit);
    if (!category) return [];

    let candidates = [];

    // First, check industry-specific preferences
    if (industry && this.industryDefaults[industry]) {
      const industryPrefs = this.industryDefaults[industry];
      candidates = industryPrefs.alternates.filter(unit =>
        this.getUnitCategory(unit) === category && !excludeUnits.includes(unit)
      );
    }

    // Then, add common pairs
    if (this.commonPairs[category]) {
      const commonUnits = this.commonPairs[category]
        .filter(pair => pair.includes(primaryUnit))
        .flatMap(pair => pair.filter(u => u !== primaryUnit))
        .filter(unit => !excludeUnits.includes(unit) && !candidates.includes(unit));

      candidates = [...candidates, ...commonUnits];
    }

    // Finally, add any remaining units from the category
    const remainingUnits = Object.keys(this.unitDatabase[category])
      .filter(unit =>
        unit !== primaryUnit &&
        !candidates.includes(unit) &&
        !excludeUnits.includes(unit)
      );

    candidates = [...candidates, ...remainingUnits];

    return candidates.slice(0, maxSuggestions);
  }

  // Calculate conversion rate between two units
  getConversionRate(fromUnit, toUnit) {
    const conversion = this.convert(1, fromUnit, toUnit);
    return conversion ? conversion.rate : null;
  }

  // Validate unit compatibility
  areUnitsCompatible(unit1, unit2) {
    const cat1 = this.getUnitCategory(unit1);
    const cat2 = this.getUnitCategory(unit2);
    return cat1 && cat2 && cat1 === cat2;
  }

  // Get unit information
  getUnitInfo(unit) {
    const category = this.getUnitCategory(unit);
    if (!category) return null;

    return {
      ...this.unitDatabase[category][unit],
      category,
      code: unit
    };
  }

  // Get all units in a category
  getUnitsByCategory(category) {
    return this.unitDatabase[category] || {};
  }

  // Format unit display name
  formatUnitName(unit) {
    const info = this.getUnitInfo(unit);
    return info ? `${info.name} (${info.symbol})` : unit;
  }

  // Get industry-specific unit recommendations
  getIndustryRecommendations(industry) {
    return this.industryDefaults[industry] || null;
  }

  // Calculate bulk pricing adjustments
  calculateBulkPricing(basePrice, quantity, unit, pricingRules = []) {
    let adjustedPrice = basePrice;
    let appliedRules = [];

    pricingRules.forEach(rule => {
      if (rule.unit === unit && quantity >= rule.threshold) {
        if (rule.type === 'discount') {
          adjustedPrice *= (1 - rule.percentage / 100);
          appliedRules.push(rule);
        } else if (rule.type === 'markup') {
          adjustedPrice *= (1 + rule.percentage / 100);
          appliedRules.push(rule);
        }
      }
    });

    return {
      originalPrice: basePrice,
      adjustedPrice,
      savings: basePrice - adjustedPrice,
      appliedRules
    };
  }

  // Smart rounding for different unit types
  smartRound(value, unit) {
    const category = this.getUnitCategory(unit);

    switch (category) {
      case 'length':
        // Round to nearest mm for precision, cm for general use
        return unit === 'mm' ? Math.round(value) :
               unit === 'cm' ? Math.round(value * 10) / 10 :
               Math.round(value * 100) / 100;
      case 'weight':
        // Round to nearest gram for small weights, kg for large
        return value < 1 ? Math.round(value * 1000) / 1000 :
               Math.round(value * 100) / 100;
      case 'volume':
        // Round to nearest mL for small volumes, L for large
        return value < 1 ? Math.round(value * 1000) / 1000 :
               Math.round(value * 100) / 100;
      default:
        return Math.round(value * 100) / 100;
    }
  }
}

// Export singleton instance
const unitConversionService = new UnitConversionService();
export default unitConversionService;
