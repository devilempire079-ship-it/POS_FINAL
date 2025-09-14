import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Calendar,
  BarChart3,
  LineChart,
  Zap,
  Lightbulb,
  DollarSign,
  Package,
  Users,
  ShoppingCart
} from 'lucide-react';

const PredictiveAnalytics = () => {
  const [predictions, setPredictions] = useState({
    salesForecast: [],
    inventoryDemand: [],
    customerChurn: [],
    seasonalTrends: []
  });

  const [selectedModel, setSelectedModel] = useState('sales');
  const [forecastPeriod, setForecastPeriod] = useState(30);
  const [confidenceLevel, setConfidenceLevel] = useState(85);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock predictive data
  useEffect(() => {
    generatePredictions();
  }, [selectedModel, forecastPeriod]);

  const generatePredictions = async () => {
    setIsAnalyzing(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const forecastData = [
      {
        id: 'sales-forecast',
        type: 'sales',
        title: 'Sales Forecasting',
        predictions: Array.from({length: forecastPeriod}, (_, i) => ({
          date: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)).toLocaleDateString(),
          value: Math.random() * 3000 + 2500,
          confidence: Math.random() * 30 + 70,
          trend: i > forecastPeriod / 2 ? 'increasing' : 'stable'
        })),
        accuracy: 87.3,
        totalValue: Array.from({length: forecastPeriod}, () => Math.random() * 3000 + 2500).reduce((a, b) => a + b, 0),
        keyInsights: [
          { icon: TrendingUp, text: 'Sales expected to increase by 15.2% over next month', type: 'positive' },
          { icon: Calendar, text: 'Peak season detected: October 15-25', type: 'info' },
          { icon: AlertTriangle, text: 'Potential drop during holiday week', type: 'warning' },
          { icon: Target, text: 'Revenue target: $125K achievable with 8% growth', type: 'goal' }
        ],
        recommendations: [
          'Increase coffee stock by 20%',
          'Promote holiday specials starting October 15',
          'Adjust staffing for peak periods',
          'Monitor competitor pricing'
        ]
      },
      {
        id: 'inventory-forecast',
        type: 'inventory',
        title: 'Inventory Demand Forecasting',
        predictions: Array.from({length: forecastPeriod}, (_, i) => ({
          date: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)).toLocaleDateString(),
          product: ['Premium Coffee', 'Organic Milk 1L', 'Whole Wheat Bread', 'Chocolate Pack'][Math.floor(Math.random() * 4)],
          predictedDemand: Math.floor(Math.random() * 50) + 20,
          currentStock: Math.floor(Math.random() * 80) + 15,
          reorderPoint: 20,
          confidence: Math.random() * 30 + 60
        })),
        accuracy: 91.7,
        keyInsights: [
          { icon: Package, text: 'Organic Milk will be critically low in 5 days', type: 'warning' },
          { icon: TrendingUp, text: 'Bakery items showing 40% increase in demand', type: 'positive' },
          { icon: Brain, text: 'AI suggests optimizing storage layout', type: 'info' }
        ],
        recommendations: [
          'Reorder Organic Milk - projected 85 units next week',
          'Increase Chocolate Pack stock for December promotion',
          'Optimize warehouse layout for high-demand items',
          'Set up automatic reorder for premium products'
        ]
      },
      {
        id: 'customer-churn',
        type: 'customer',
        title: 'Customer Behavior Analytics',
        predictions: Array.from({length: Math.min(forecastPeriod, 90)}, (_, i) => ({
          date: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)).toLocaleDateString(),
          atRiskCount: Math.floor(Math.random() * 15) + 5,
          potentialValue: Math.floor(Math.random() * 5000) + 2000,
          reasons: ['Price sensitivity', 'Competition', 'Product availability', 'Service quality'][Math.floor(Math.random() * 4)]
        })),
        accuracy: 82.4,
        keyInsights: [
          { icon: Users, text: '12 customers at high risk of churn', type: 'warning' },
          { icon: DollarSign, text: '$8,500 potential revenue at risk', type: 'warning' },
          { icon: Target, text: '80% retention possible with targeted campaigns', type: 'goal' }
        ],
        recommendations: [
          'Launch personalized email campaigns for at-risk customers',
          'Offer loyalty incentives for premium customer segment',
          'Improve product availability for churn-prone categories',
          'Implement proactive customer service outreach'
        ]
      },
      {
        id: 'seasonal-trends',
        type: 'seasonal',
        title: 'Seasonal Trend Analysis',
        predictions: Array.from({length: forecastPeriod}, (_, i) => ({
          month: new Date(Date.now() + (i * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString('default', { month: 'short' }),
          projectedSales: Math.random() * 15000 + 12000,
          growthRate: (Math.random() - 0.5) * 30,
          peakPeriods: ['Holiday season', 'Back to school', 'Summer months'][Math.floor(Math.random() * 3)]
        })),
        accuracy: 89.6,
        keyInsights: [
          { icon: Calendar, text: 'Holiday season projected +45% sales increase', type: 'positive' },
          { icon: Target, text: 'Summer months show -15% seasonal decline', type: 'warning' },
          { icon: Lightbulb, text: 'Opportunity for premium category growth', type: 'info' }
        ],
        recommendations: [
          'Prepare holiday inventory by October 1st',
          'Stock up on seasonal coffee varieties',
          'Create seasonal marketing campaigns',
          'Plan staff scheduling for peak periods'
        ]
      }
    ];

    setPredictions({ [selectedModel]: forecastData.find(model => model.id.startsWith(selectedModel)) });
    setIsAnalyzing(false);
  };

  const currentPrediction = predictions[selectedModel];
  const accuracyBoost = confidenceLevel > 85 ? '+2%' : confidenceLevel > 75 ? '+1%' : '0%';

  const getInsightIcon = (insight, type) => {
    const colorClasses = {
      positive: 'text-green-500',
      warning: 'text-yellow-500',
      info: 'text-blue-500',
      goal: 'text-purple-500'
    };

    return <insight.icon className={`h-4 w-4 ${colorClasses[type]} inline mr-2`} />;
  };

  const MetricPredictionCard = ({ label, current, predicted, trend, icon: Icon }) => {
    const changePercent = ((predicted - current) / current * 100).toFixed(1);
    const isPositive = changePercent >= 0;

    return (
      <div className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Icon className="h-6 w-6 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 text-sm ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-500">Current</p>
            <p className="text-lg font-bold text-gray-900">${current?.toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Predicted</p>
              <p className="text-lg font-bold text-blue-600">${predicted?.toLocaleString()}</p>
            </div>
            <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{changePercent}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ForecastChart = ({ data, type }) => {
    if (!data?.predictions) return <div>Loading forecast data...</div>;

    const maxValue = Math.max(...data.predictions.map(p =>
      type === 'inventory' ? (p.predictedDemand || p.value) : p.value
    ));

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
          <div className="flex items-center space-x-2 text-sm">
            <Brain className="h-4 w-4 text-blue-500" />
            <span className="text-gray-600">
              AI Accuracy: {data.accuracy}% ±{accuracyBoost}
            </span>
          </div>
        </div>

        <div className="h-48 flex items-end space-x-1 mb-4">
          {data.predictions.slice(0, 10).map((prediction, index) => {
            const value = type === 'inventory' ?
              (prediction.predictedDemand || prediction.value) :
              prediction.value;

            const confidence = prediction.confidence || 85;
            const height = (value / maxValue) * 120;

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-500 relative"
                    style={{ height: `${height}px` }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-medium whitespace-nowrap">
                      ${value.toFixed(0)}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-2 font-medium">
                    Day {index + 1}
                  </div>

                  <div className="flex items-center space-x-1 mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      confidence > 80 ? 'bg-green-400' :
                      confidence > 70 ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <span className="text-xs text-gray-500">{confidence.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>Forecast predictions for the next {forecastPeriod} days</p>
          <p className="text-xs mt-1">
            Total Projected: <span className="font-semibold text-blue-600">
              ${(data.totalValue || data.predictions.reduce((sum, p) => sum + (p.value || p.predictedDemand || 0), 0)).toLocaleString()}
            </span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔮 Predictive Analytics</h1>
          <p className="text-gray-600 mt-2">
            AI-powered forecasting and intelligent business insights
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">AI Model:</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="sales">Sales Forecast</option>
              <option value="inventory">Inventory Demand</option>
              <option value="customer-churn">Customer Behavior</option>
              <option value="seasonal-trends">Seasonal Trends</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Period:</label>
            <select
              value={forecastPeriod}
              onChange={(e) => setForecastPeriod(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
              <option value="90">90 Days</option>
              <option value="365">1 Year</option>
            </select>
          </div>

          {isAnalyzing && (
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-500 animate-pulse" />
              <span className="text-sm text-blue-600">AI Processing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">AI Confidence</p>
              <p className="text-2xl font-bold">{currentPrediction?.accuracy.toFixed(1) || '0.0'}%</p>
            </div>
            <Brain className="h-8 w-8 opacity-80" />
          </div>
          <div className="mt-2 text-xs opacity-90">
            ±{accuracyBoost} with advanced algorithms
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Forecast Accuracy</p>
              <p className="text-2xl font-bold text-green-600">{confidenceLevel}%</p>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Confidence threshold
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Data Points</p>
              <p className="text-2xl font-bold text-purple-600">{forecastPeriod}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Days analyzed
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing Time</p>
              <p className="text-2xl font-bold text-blue-600">2.1s</p>
            </div>
            <Zap className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Real-time analysis
          </div>
        </div>
      </div>

      {/* Main Forecast Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ForecastChart data={currentPrediction} type={selectedModel} />

        {/* Key Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Insights</h3>

          <div className="space-y-4">
            {currentPrediction?.keyInsights?.map((insight, index) => (
              <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg border-l-4 ${
                insight.type === 'positive' ? 'bg-green-50 border-green-500' :
                insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                insight.type === 'info' ? 'bg-blue-50 border-blue-500' :
                'bg-purple-50 border-purple-500'
              }`}>
                {insight.type === 'positive' && <TrendingUp className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />}
                {insight.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />}
                {insight.type === 'info' && <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />}
                {insight.type === 'goal' && <Target className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />}

                <p className="text-sm font-medium text-gray-800">{insight.text}</p>
              </div>
            ))}

            {currentPrediction?.keyInsights?.length === 0 && (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">AI analysis in progress...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations and Actions */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🎯 AI Recommendations</h2>
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span className="text-sm">Actionable insights</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentPrediction?.recommendations?.map((recommendation, index) => (
            <div key={index} className="bg-white bg-opacity-10 rounded-lg p-4 hover:bg-opacity-20 transition-all">
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-blue-500 text-white' :
                  index === 2 ? 'bg-green-500 text-white' :
                  'bg-purple-500 text-white'
                }`}>
                  {index + 1}
                </div>
                <p className="text-sm leading-tight">{recommendation}</p>
              </div>
            </div>
          ))}

          {(!currentPrediction?.recommendations || currentPrediction.recommendations.length === 0) && (
            <div className="col-span-full text-center">
              <Brain className="h-16 w-16 opacity-50 mx-auto mb-4" />
              <p className="text-lg opacity-90">Generating personalized recommendations...</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Forecast Table */}
      {currentPrediction?.predictions && currentPrediction.predictions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Forecast Data</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Predicted Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                  {selectedModel === 'inventory' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Stock
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPrediction.predictions.slice(0, 10).map((prediction, index) => {
                  const confidence = prediction.confidence || 85;
                  const value = selectedModel === 'inventory' ?
                    (prediction.predictedDemand || prediction.value) :
                    prediction.value;

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prediction.date}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${value.toFixed(0)}
                        {selectedModel === 'inventory' && ` units`}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-16 bg-gray-200 rounded-full h-2 mr-3`}>
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                confidence > 80 ? 'bg-green-500' :
                                confidence > 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${confidence}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{confidence.toFixed(0)}%</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          prediction.trend === 'increasing' ? 'bg-green-100 text-green-800' :
                          prediction.trend === 'decreasing' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {prediction.trend}
                        </span>
                      </td>

                      {selectedModel === 'inventory' && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {prediction.product}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {prediction.currentStock} units
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {currentPrediction.predictions.length > 10 && (
            <div className="mt-4 text-center">
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                View all {currentPrediction.predictions.length} predictions →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictiveAnalytics;
