// Smart Unit Suggestions Component - Enterprise-grade unit recommendations
// This component provides intelligent alternate unit suggestions based on industry, usage patterns, and business rules

import React, { useState, useEffect } from 'react';
import unitConversionService from '../../services/unitConversionService';
import {
  Lightbulb,
  TrendingUp,
  Target,
  Zap,
  Star,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

const SmartUnitSuggestions = ({
  primaryUnit,
  currentAlternateUnit,
  onSuggestionSelect,
  industry = null,
  productType = null,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (primaryUnit) {
      generateSuggestions();
    }
  }, [primaryUnit, industry, productType]);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      // Get smart suggestions from the service
      const smartSuggestions = unitConversionService.suggestAlternateUnits(primaryUnit, {
        maxSuggestions: 4,
        industry,
        excludeUnits: currentAlternateUnit ? [currentAlternateUnit] : []
      });

      // Enhance suggestions with additional metadata
      const enhancedSuggestions = smartSuggestions.map(unit => {
        const conversion = unitConversionService.convert(1, primaryUnit, unit);
        const unitInfo = unitConversionService.getUnitInfo(unit);

        return {
          unit,
          conversionRate: conversion ? conversion.rate : 0,
          category: unitInfo?.category || 'unknown',
          name: unitInfo?.name || unit,
          symbol: unitInfo?.symbol || unit,
          reasoning: getSuggestionReasoning(unit, primaryUnit, industry, productType),
          confidence: calculateConfidence(unit, primaryUnit, industry),
          benefits: getUnitBenefits(unit, primaryUnit, industry)
        };
      });

      // Sort by confidence score
      enhancedSuggestions.sort((a, b) => b.confidence - a.confidence);

      setSuggestions(enhancedSuggestions);
    } catch (error) {
      console.error('Error generating unit suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestionReasoning = (unit, primaryUnit, industry, productType) => {
    const reasons = [];

    // Industry-specific reasoning
    if (industry === 'construction' && ['ft', 'in', 'yd'].includes(unit)) {
      reasons.push('Popular with contractors');
    }
    if (industry === 'manufacturing' && ['mm', 'cm'].includes(unit)) {
      reasons.push('Precision engineering standard');
    }
    if (industry === 'food' && ['lb', 'oz', 'g'].includes(unit)) {
      reasons.push('Common kitchen measurements');
    }

    // Unit relationship reasoning
    if (unit === 'ft' && primaryUnit === 'm') {
      reasons.push('Imperial construction standard');
    }
    if (unit === 'in' && ['ft', 'yd'].includes(primaryUnit)) {
      reasons.push('Precision measurements');
    }
    if (unit === 'lb' && primaryUnit === 'kg') {
      reasons.push('US retail standard');
    }

    // Practical reasoning
    if (unit === 'cm' && primaryUnit === 'm') {
      reasons.push('Better for small measurements');
    }
    if (unit === 'km' && primaryUnit === 'm') {
      reasons.push('Better for large distances');
    }

    return reasons.length > 0 ? reasons[0] : 'Compatible unit option';
  };

  const calculateConfidence = (unit, primaryUnit, industry) => {
    let confidence = 50; // Base confidence

    // Industry alignment boosts confidence
    if (industry) {
      const industryPrefs = unitConversionService.getIndustryRecommendations(industry);
      if (industryPrefs?.alternates?.includes(unit)) {
        confidence += 30;
      }
    }

    // Common pair bonus
    const commonPairs = unitConversionService.commonPairs;
    const category = unitConversionService.getUnitCategory(primaryUnit);
    if (commonPairs[category]) {
      const isCommonPair = commonPairs[category].some(pair =>
        pair.includes(primaryUnit) && pair.includes(unit)
      );
      if (isCommonPair) {
        confidence += 20;
      }
    }

    // Unit popularity bonus
    const popularUnits = ['ft', 'in', 'lb', 'oz', 'gal', 'L'];
    if (popularUnits.includes(unit)) {
      confidence += 10;
    }

    return Math.min(confidence, 100);
  };

  const getUnitBenefits = (unit, primaryUnit, industry) => {
    const benefits = [];

    // Customer benefits
    if (['ft', 'in', 'lb', 'oz'].includes(unit)) {
      benefits.push('Familiar to US customers');
    }
    if (['m', 'cm', 'kg', 'L'].includes(unit)) {
      benefits.push('International standard');
    }

    // Practical benefits
    if (unit === 'in' && primaryUnit === 'ft') {
      benefits.push('Precision measurements');
    }
    if (unit === 'yd' && primaryUnit === 'ft') {
      benefits.push('Bulk material handling');
    }

    // Business benefits
    if (industry === 'retail') {
      benefits.push('Increases purchase likelihood');
    }
    if (industry === 'construction') {
      benefits.push('Industry standard compliance');
    }

    return benefits;
  };

  const handleSuggestionSelect = (suggestion) => {
    setSelectedSuggestion(suggestion);
    if (onSuggestionSelect) {
      onSuggestionSelect({
        unit: suggestion.unit,
        conversionRate: suggestion.conversionRate,
        reasoning: suggestion.reasoning
      });
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-blue-600 bg-blue-100';
    if (confidence >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 80) return <Star className="h-4 w-4" />;
    if (confidence >= 60) return <TrendingUp className="h-4 w-4" />;
    return <Target className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex items-center space-x-2 mb-3">
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No alternate unit suggestions available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        <h4 className="text-sm font-semibold text-gray-900">Smart Unit Suggestions</h4>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          AI-Powered
        </span>
      </div>

      {/* Suggestions List */}
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.unit}
            className={`relative p-3 border rounded-lg cursor-pointer transition-all ${
              selectedSuggestion?.unit === suggestion.unit
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleSuggestionSelect(suggestion)}
          >
            {/* Selection Indicator */}
            {selectedSuggestion?.unit === suggestion.unit && (
              <div className="absolute top-2 right-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
            )}

            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Unit Name and Symbol */}
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {suggestion.name} ({suggestion.symbol})
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    1 {primaryUnit} = {suggestion.conversionRate.toFixed(4)} {suggestion.unit}
                  </span>
                </div>

                {/* Reasoning */}
                <p className="text-sm text-gray-600 mb-2">{suggestion.reasoning}</p>

                {/* Benefits */}
                {suggestion.benefits.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {suggestion.benefits.slice(0, 2).map((benefit, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Confidence Score */}
              <div className="ml-4 flex flex-col items-end space-y-2">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                  {getConfidenceIcon(suggestion.confidence)}
                  <span>{suggestion.confidence}%</span>
                </div>

                {index === 0 && (
                  <span className="text-xs text-blue-600 font-medium flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    Recommended
                  </span>
                )}
              </div>
            </div>

            {/* Category Badge */}
            <div className="mt-2">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded capitalize">
                {suggestion.category} unit
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Why these suggestions?</p>
            <p className="text-xs">
              Based on industry standards, customer preferences, and conversion accuracy.
              Higher confidence scores indicate better matches for your business.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartUnitSuggestions;
