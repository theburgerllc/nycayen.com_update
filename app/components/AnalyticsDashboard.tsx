// Comprehensive Analytics Dashboard
'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Users, Eye, MousePointer, DollarSign, Clock, Globe, Smartphone, Monitor, Calendar, MapPin } from 'lucide-react';

// Analytics Data Types
interface AnalyticsMetrics {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  bookings: number;
}

interface TrafficSource {
  source: string;
  sessions: number;
  conversions: number;
  revenue: number;
  percentage: number;
}

interface DeviceMetrics {
  device: string;
  sessions: number;
  percentage: number;
  bounceRate: number;
}

interface PageMetrics {
  page: string;
  views: number;
  uniqueViews: number;
  avgTime: number;
  exitRate: number;
}

interface ConversionFunnel {
  step: string;
  users: number;
  dropoffRate: number;
}

interface WebVitalsData {
  metric: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  percentile: number;
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'traffic' | 'conversions' | 'performance' | 'seo'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in real implementation, fetch from your analytics API
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    pageViews: 12543,
    uniqueVisitors: 8721,
    bounceRate: 42.3,
    avgSessionDuration: 185, // seconds
    conversions: 234,
    conversionRate: 2.68,
    revenue: 15420,
    bookings: 89,
  });

  const [trafficSources] = useState<TrafficSource[]>([
    { source: 'Organic Search', sessions: 4521, conversions: 124, revenue: 6780, percentage: 52.1 },
    { source: 'Social Media', sessions: 2134, conversions: 67, revenue: 3240, percentage: 24.6 },
    { source: 'Direct', sessions: 1456, conversions: 32, revenue: 2140, percentage: 16.8 },
    { source: 'Referral', sessions: 567, conversions: 11, revenue: 1260, percentage: 6.5 },
  ]);

  const [deviceMetrics] = useState<DeviceMetrics[]>([
    { device: 'Mobile', sessions: 5234, percentage: 60.2, bounceRate: 45.1 },
    { device: 'Desktop', sessions: 2876, percentage: 33.1, bounceRate: 38.7 },
    { device: 'Tablet', sessions: 582, percentage: 6.7, bounceRate: 41.2 },
  ]);

  const [topPages] = useState<PageMetrics[]>([
    { page: '/', views: 3456, uniqueViews: 2987, avgTime: 245, exitRate: 23.4 },
    { page: '/services', views: 2134, uniqueViews: 1876, avgTime: 312, exitRate: 18.7 },
    { page: '/blog', views: 1567, uniqueViews: 1432, avgTime: 198, exitRate: 34.2 },
    { page: '/booking', views: 1234, uniqueViews: 1198, avgTime: 567, exitRate: 12.3 },
    { page: '/contact', views: 987, uniqueViews: 876, avgTime: 123, exitRate: 45.6 },
  ]);

  const [conversionFunnel] = useState<ConversionFunnel[]>([
    { step: 'Page View', users: 8721, dropoffRate: 0 },
    { step: 'Service Interest', users: 3456, dropoffRate: 60.4 },
    { step: 'Booking Started', users: 1234, dropoffRate: 64.3 },
    { step: 'Contact Info', users: 567, dropoffRate: 54.1 },
    { step: 'Booking Completed', users: 234, dropoffRate: 58.7 },
  ]);

  const [webVitals] = useState<WebVitalsData[]>([
    { metric: 'LCP', value: 2.1, rating: 'good', percentile: 75 },
    { metric: 'FID', value: 89, rating: 'good', percentile: 82 },
    { metric: 'CLS', value: 0.08, rating: 'good', percentile: 78 },
    { metric: 'TTFB', value: 524, rating: 'needs-improvement', percentile: 65 },
  ]);

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, [timeRange]);

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ];

  // Generate trend data
  const trendData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      visitors: Math.floor(Math.random() * 200) + 150,
      conversions: Math.floor(Math.random() * 20) + 5,
      revenue: Math.floor(Math.random() * 800) + 200,
    }));
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your website performance and business metrics</p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white rounded-lg">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: Globe },
            { id: 'traffic', label: 'Traffic', icon: Users },
            { id: 'conversions', label: 'Conversions', icon: DollarSign },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'seo', label: 'SEO', icon: Eye },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          metrics={metrics}
          trendData={trendData}
          deviceMetrics={deviceMetrics}
          topPages={topPages}
        />
      )}

      {activeTab === 'traffic' && (
        <TrafficTab
          trafficSources={trafficSources}
          deviceMetrics={deviceMetrics}
          trendData={trendData}
        />
      )}

      {activeTab === 'conversions' && (
        <ConversionsTab
          conversionFunnel={conversionFunnel}
          metrics={metrics}
          trendData={trendData}
        />
      )}

      {activeTab === 'performance' && (
        <PerformanceTab
          webVitals={webVitals}
          topPages={topPages}
        />
      )}

      {activeTab === 'seo' && (
        <SEOTab />
      )}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ 
  metrics, 
  trendData, 
  deviceMetrics, 
  topPages 
}: {
  metrics: AnalyticsMetrics;
  trendData: any[];
  deviceMetrics: DeviceMetrics[];
  topPages: PageMetrics[];
}) {
  const kpiCards = [
    {
      title: 'Page Views',
      value: metrics.pageViews.toLocaleString(),
      change: 12.5,
      icon: Eye,
      color: 'blue',
    },
    {
      title: 'Unique Visitors',
      value: metrics.uniqueVisitors.toLocaleString(),
      change: 8.3,
      icon: Users,
      color: 'green',
    },
    {
      title: 'Conversions',
      value: metrics.conversions.toString(),
      change: 15.7,
      icon: TrendingUp,
      color: 'purple',
    },
    {
      title: 'Revenue',
      value: `$${metrics.revenue.toLocaleString()}`,
      change: 23.1,
      icon: DollarSign,
      color: 'emerald',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Trend */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="visitors" stroke="#f59e0b" fill="#fef3c7" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Device Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceMetrics}
                dataKey="percentage"
                nameKey="device"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {deviceMetrics.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#f59e0b', '#3b82f6', '#10b981'][index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Pages</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topPages.map((page, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {page.page}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {page.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {page.uniqueViews.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.floor(page.avgTime / 60)}:{(page.avgTime % 60).toString().padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {page.exitRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Traffic Tab Component
function TrafficTab({ 
  trafficSources, 
  deviceMetrics, 
  trendData 
}: {
  trafficSources: TrafficSource[];
  deviceMetrics: DeviceMetrics[];
  trendData: any[];
}) {
  return (
    <div className="space-y-6">
      {/* Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Sources</h3>
          <div className="space-y-4">
            {trafficSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{source.source}</span>
                    <span className="text-sm text-gray-500">{source.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full" 
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>{source.sessions.toLocaleString()} sessions</span>
                    <span>${source.revenue.toLocaleString()} revenue</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Device Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deviceMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="device" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visitor Trends */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Visitor Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="visitors" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Conversions Tab Component
function ConversionsTab({ 
  conversionFunnel, 
  metrics, 
  trendData 
}: {
  conversionFunnel: ConversionFunnel[];
  metrics: AnalyticsMetrics;
  trendData: any[];
}) {
  return (
    <div className="space-y-6">
      {/* Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">${metrics.revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.conversionRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.bookings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Funnel</h3>
        <div className="space-y-4">
          {conversionFunnel.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{step.step}</span>
                <span className="text-sm text-gray-500">{step.users.toLocaleString()} users</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full"
                  style={{ width: `${(step.users / conversionFunnel[0].users) * 100}%` }}
                ></div>
              </div>
              {index < conversionFunnel.length - 1 && (
                <div className="text-xs text-red-500 mt-1">
                  -{step.dropoffRate}% dropoff
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Trends */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Performance Tab Component
function PerformanceTab({ 
  webVitals, 
  topPages 
}: {
  webVitals: WebVitalsData[];
  topPages: PageMetrics[];
}) {
  return (
    <div className="space-y-6">
      {/* Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {webVitals.map((vital, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-600">{vital.metric}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${
                vital.rating === 'good' ? 'bg-green-100 text-green-800' :
                vital.rating === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {vital.rating}
              </span>
            </div>
            <p className="text-2xl font-semibold text-gray-900 mb-1">
              {vital.metric === 'CLS' ? vital.value.toFixed(3) : vital.value}
              {vital.metric !== 'CLS' && <span className="text-sm text-gray-500">ms</span>}
            </p>
            <p className="text-sm text-gray-500">{vital.percentile}th percentile</p>
          </div>
        ))}
      </div>

      {/* Page Performance */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Page Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Load Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topPages.map((page, index) => {
                const loadTime = Math.random() * 2000 + 500;
                const score = Math.floor(Math.random() * 30) + 70;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {page.page}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {loadTime.toFixed(0)}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {score}/100
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        score >= 90 ? 'bg-green-100 text-green-800' :
                        score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {score >= 90 ? 'Good' : score >= 70 ? 'Needs Work' : 'Poor'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// SEO Tab Component
function SEOTab() {
  const seoMetrics = [
    { metric: 'Organic Traffic', value: '4,521', change: 12.3, status: 'good' },
    { metric: 'Keyword Rankings', value: '147', change: 8.7, status: 'good' },
    { metric: 'Backlinks', value: '234', change: 15.2, status: 'good' },
    { metric: 'Page Speed Score', value: '87', change: -2.1, status: 'warning' },
  ];

  const topKeywords = [
    { keyword: 'hair salon NYC', position: 3, volume: 2400, difficulty: 'High' },
    { keyword: 'wig styling', position: 7, volume: 1200, difficulty: 'Medium' },
    { keyword: 'bridal hair', position: 12, volume: 800, difficulty: 'Medium' },
    { keyword: 'hair color specialist', position: 5, volume: 600, difficulty: 'Low' },
  ];

  return (
    <div className="space-y-6">
      {/* SEO Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {seoMetrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-600">{metric.metric}</h4>
              <div className="flex items-center">
                {metric.change >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`ml-1 text-sm ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(metric.change)}%
                </span>
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Top Keywords */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Keywords</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topKeywords.map((keyword, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {keyword.keyword}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{keyword.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {keyword.volume.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      keyword.difficulty === 'Low' ? 'bg-green-100 text-green-800' :
                      keyword.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {keyword.difficulty}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// KPI Card Component
function KPICard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color 
}: {
  title: string;
  value: string;
  change: number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500',
  };

  const isPositive = change > 0;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center">
        <div className={`${colorClasses[color as keyof typeof colorClasses]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-green-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500" />
        )}
        <span className={`ml-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {Math.abs(change)}%
        </span>
        <span className="ml-1 text-sm text-gray-500">vs last period</span>
      </div>
    </div>
  );
}