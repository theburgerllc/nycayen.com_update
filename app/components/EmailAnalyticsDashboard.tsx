'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Mail, MousePointer, DollarSign, Target, Clock, Zap, Calendar } from 'lucide-react';

// Analytics Types
interface EmailMetrics {
  totalSubscribers: number;
  activeSubscribers: number;
  newSubscribers: number;
  unsubscribes: number;
  subscriptionRate: number;
  churnRate: number;
  growthRate: number;
  averageEngagement: number;
}

interface CampaignMetrics {
  id: string;
  name: string;
  type: 'newsletter' | 'promotional' | 'automated' | 'transactional';
  sentDate: Date;
  recipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
  conversions: number;
  revenue: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  unsubscribeRate: number;
  bounceRate: number;
  roi: number;
}

interface PopupMetrics {
  popupId: string;
  popupName: string;
  views: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  avgTimeToConvert: number;
  topVariant?: string;
}

interface SegmentMetrics {
  segmentId: string;
  segmentName: string;
  subscriberCount: number;
  engagementRate: number;
  conversionRate: number;
  avgLifetimeValue: number;
  churnRate: number;
}

// Main Analytics Dashboard
export default function EmailAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'popups' | 'segments'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<EmailMetrics | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignMetrics[]>([]);
  const [popupMetrics, setPopupMetrics] = useState<PopupMetrics[]>([]);
  const [segmentMetrics, setSegmentMetrics] = useState<SegmentMetrics[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, campaignsRes, popupsRes, segmentsRes] = await Promise.all([
        fetch(`/api/analytics/email-metrics?timeRange=${timeRange}`),
        fetch(`/api/analytics/campaigns?timeRange=${timeRange}`),
        fetch(`/api/analytics/popups?timeRange=${timeRange}`),
        fetch(`/api/analytics/segments?timeRange=${timeRange}`),
      ]);

      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (campaignsRes.ok) setCampaigns(await campaignsRes.json());
      if (popupsRes.ok) setPopupMetrics(await popupsRes.json());
      if (segmentsRes.ok) setSegmentMetrics(await segmentsRes.json());
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Email Marketing Analytics</h1>
        
        <div className="mt-4 sm:mt-0 flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'campaigns', label: 'Campaigns' },
            { id: 'popups', label: 'Popups' },
            { id: 'segments', label: 'Segments' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <OverviewTab metrics={metrics} campaigns={campaigns} timeRange={timeRange} />
      )}
      
      {activeTab === 'campaigns' && (
        <CampaignsTab campaigns={campaigns} timeRange={timeRange} />
      )}
      
      {activeTab === 'popups' && (
        <PopupsTab popups={popupMetrics} timeRange={timeRange} />
      )}
      
      {activeTab === 'segments' && (
        <SegmentsTab segments={segmentMetrics} timeRange={timeRange} />
      )}
    </div>
  );
}

// Overview Tab
function OverviewTab({ 
  metrics, 
  campaigns, 
  timeRange 
}: {
  metrics: EmailMetrics | null;
  campaigns: CampaignMetrics[];
  timeRange: string;
}) {
  const kpiCards = useMemo(() => {
    if (!metrics) return [];

    return [
      {
        title: 'Total Subscribers',
        value: metrics.totalSubscribers.toLocaleString(),
        change: metrics.growthRate,
        icon: Users,
        color: 'blue',
      },
      {
        title: 'New Subscribers',
        value: metrics.newSubscribers.toLocaleString(),
        change: metrics.subscriptionRate,
        icon: TrendingUp,
        color: 'green',
      },
      {
        title: 'Avg Engagement',
        value: `${(metrics.averageEngagement * 100).toFixed(1)}%`,
        change: metrics.averageEngagement - 0.25, // Mock comparison
        icon: Target,
        color: 'purple',
      },
      {
        title: 'Churn Rate',
        value: `${(metrics.churnRate * 100).toFixed(1)}%`,
        change: -metrics.churnRate + 0.02, // Mock comparison (negative is good)
        icon: TrendingDown,
        color: 'red',
      },
    ];
  }, [metrics]);

  const chartData = useMemo(() => {
    // Generate mock daily data for the chart
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      subscribers: Math.floor(Math.random() * 50) + 20,
      opens: Math.floor(Math.random() * 200) + 100,
      clicks: Math.floor(Math.random() * 50) + 20,
    }));
  }, [timeRange]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriber Growth Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Subscriber Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="subscribers" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Engagement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="opens" fill="#3b82f6" name="Opens" />
              <Bar dataKey="clicks" fill="#10b981" name="Clicks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Campaigns</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Click Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.slice(0, 5).map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.type}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.recipients.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(campaign.openRate * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(campaign.clickRate * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.roi}x
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
    red: 'bg-red-500',
  };

  const isPositive = change > 0;
  const isNegative = change < 0;

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
        {isPositive && <TrendingUp className="w-4 h-4 text-green-500" />}
        {isNegative && <TrendingDown className="w-4 h-4 text-red-500" />}
        <span className={`ml-1 text-sm ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
          {Math.abs(change * 100).toFixed(1)}%
        </span>
        <span className="ml-1 text-sm text-gray-500">vs last period</span>
      </div>
    </div>
  );
}

// Campaigns Tab
function CampaignsTab({ campaigns, timeRange }: { campaigns: CampaignMetrics[]; timeRange: string }) {
  const [sortBy, setSortBy] = useState<'sentDate' | 'openRate' | 'clickRate' | 'roi'>('sentDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'sentDate') {
        return multiplier * (new Date(a.sentDate).getTime() - new Date(b.sentDate).getTime());
      }
      return multiplier * (a[sortBy] - b[sortBy]);
    });
  }, [campaigns, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Campaign Performance Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={campaigns.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="openRate" fill="#3b82f6" name="Open Rate %" />
            <Bar dataKey="clickRate" fill="#10b981" name="Click Rate %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">All Campaigns</h3>
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="sentDate">Date</option>
              <option value="openRate">Open Rate</option>
              <option value="clickRate">Click Rate</option>
              <option value="roi">ROI</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">
                        {campaign.type} • {campaign.sentDate.toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.recipients.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.delivered.toLocaleString()} ({((campaign.delivered / campaign.recipients) * 100).toFixed(1)}%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.opened.toLocaleString()} ({(campaign.openRate * 100).toFixed(1)}%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.clicked.toLocaleString()} ({(campaign.clickRate * 100).toFixed(1)}%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.conversions.toLocaleString()} ({(campaign.conversionRate * 100).toFixed(1)}%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      campaign.roi > 3 ? 'bg-green-100 text-green-800' :
                      campaign.roi > 1 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {campaign.roi.toFixed(1)}x
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

// Popups Tab
function PopupsTab({ popups, timeRange }: { popups: PopupMetrics[]; timeRange: string }) {
  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

  const pieData = popups.map((popup, index) => ({
    name: popup.popupName,
    value: popup.conversions,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Popup Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {popups.slice(0, 3).map((popup, index) => (
          <div key={popup.popupId} className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-2">{popup.popupName}</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Views</span>
                <span className="font-medium">{popup.views.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Conversions</span>
                <span className="font-medium">{popup.conversions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className={`font-medium ${popup.conversionRate > 0.05 ? 'text-green-600' : 'text-gray-900'}`}>
                  {(popup.conversionRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="font-medium">${popup.revenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Conversion Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Rates by Popup</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popups}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="popupName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => [`${(value as number * 100).toFixed(1)}%`, 'Conversion Rate']} />
              <Bar dataKey="conversionRate" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Segments Tab
function SegmentsTab({ segments, timeRange }: { segments: SegmentMetrics[]; timeRange: string }) {
  return (
    <div className="space-y-6">
      {/* Segment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement by Segment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={segments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="segmentName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => [`${(value as number * 100).toFixed(1)}%`, 'Engagement Rate']} />
              <Bar dataKey="engagementRate" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lifetime Value by Segment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={segments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="segmentName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Avg LTV']} />
              <Bar dataKey="avgLifetimeValue" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segments Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Segment Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg LTV</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Churn Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {segments.map((segment) => (
                <tr key={segment.segmentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{segment.segmentName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {segment.subscriberCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(segment.engagementRate * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(segment.conversionRate * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${segment.avgLifetimeValue.toFixed(0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      segment.churnRate < 0.05 ? 'bg-green-100 text-green-800' :
                      segment.churnRate < 0.1 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {(segment.churnRate * 100).toFixed(1)}%
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