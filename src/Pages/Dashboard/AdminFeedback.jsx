import React, { useEffect, useState, useMemo } from 'react';
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Info,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Search,
  Monitor,
  Globe,
  User,
  Mail,
  Calendar,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { API_BASE_URL } from '../../services/BaseUrl';

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  
 

  const API_URL = `${API_BASE_URL}feedback`;

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.data);
      } else {
        setError(data.message || 'Failed to fetch feedback.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Unable to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // Filtered List
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.type === selectedCategory;
      const matchesSearch =
        (item.message && item.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [feedbacks, selectedCategory, searchQuery]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const total = feedbacks.length;
    const bugs = feedbacks.filter((f) => f.type === 'bug').length;
    const features = feedbacks.filter((f) => f.type === 'feature').length;
    const general = feedbacks.filter((f) => f.type === 'general').length;
    return { total, bugs, features, general };
  }, [feedbacks]);

  // Data for Category Breakdown (Pie Chart)
  const categoryChartData = useMemo(() => {
    return [
      { name: 'Bugs', value: stats.bugs, color: '#EF4444' },
      { name: 'Features', value: stats.features, color: '#3B82F6' },
      { name: 'General', value: stats.general, color: '#10B981' },
    ].filter((d) => d.value > 0);
  }, [stats]);

  // Data for Submission Timeline Trend (Area Chart)
  const timelineChartData = useMemo(() => {
    const counts = {};
    feedbacks.forEach((f) => {
      const date = new Date(f.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      counts[date] = (counts[date] || 0) + 1;
    });

    return Object.keys(counts)
      .reverse()
      .map((date) => ({ date, Submissions: counts[date] }));
  }, [feedbacks]);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'bug':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <Bug className="w-3 h-3" /> Bug Report
          </span>
        );
      case 'feature':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <Lightbulb className="w-3 h-3" /> Improvement
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
            <Info className="w-3 h-3" /> General
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Feedback Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor, analyze, and inspect tester reports and bug logs in real time.
          </p>
        </div>
        <button
          onClick={fetchFeedback}
          disabled={loading}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Feedback</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bug Reports</p>
            <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">{stats.bugs}</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
            <Bug className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Feature Suggestions</p>
            <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{stats.features}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <Lightbulb className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">General Notes</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{stats.general}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Info className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Submission Trend
            </h3>
          </div>
          <div className="h-64 w-full">
            {timelineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineChartData}>
                  <defs>
                    <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="Submissions"
                    stroke="#6366F1"
                    fillOpacity={1}
                    fill="url(#colorSubmissions)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                No timeline data available
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Category Distribution
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-gray-400">No category data</div>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
          {['all', 'bug', 'feature', 'general'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feedback, name, email..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Feedback Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            Loading feedback logs...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 font-medium">{error}</div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No feedback entries matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Message</th>
                  <th className="py-3.5 px-4">Page Context</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {filteredFeedbacks.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-medium">
                      <div>
                        <p className="text-gray-900 dark:text-gray-100">
                          {item.name || 'Anonymous'}
                        </p>
                        {item.email && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {item.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getTypeBadge(item.type)}</td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-gray-600 dark:text-gray-300">
                      {item.message}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500 max-w-xs truncate">
                      {item.pageUrl ? (
                        <a
                          href={item.pageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-indigo-600 dark:text-indigo-400 flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3 shrink-0" />
                          {new URL(item.pageUrl).pathname || '/'}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedFeedback(item)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal Dialog */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 relative space-y-4">
            <div className="flex items-start justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <div>
                <h3 className="text-lg font-bold">Feedback Details</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  ID: {selectedFeedback._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Category:</span>
                {getTypeBadge(selectedFeedback.type)}
              </div>

              <div>
                <span className="text-gray-500 text-xs font-medium block mb-1">
                  Message:
                </span>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {selectedFeedback.message}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-100 dark:border-gray-700 pt-3">
                <div>
                  <span className="text-gray-400 block">Submitted By:</span>
                  <span className="font-medium">{selectedFeedback.name || 'Anonymous'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Email:</span>
                  <span className="font-medium">{selectedFeedback.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Resolution:</span>
                  <span className="font-medium">{selectedFeedback.screenResolution || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Date:</span>
                  <span className="font-medium">
                    {new Date(selectedFeedback.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedFeedback.userAgent && (
                <div className="text-xs">
                  <span className="text-gray-400 block">User Agent:</span>
                  <code className="block bg-gray-100 dark:bg-gray-900 p-2 rounded text-[10px] break-all text-gray-600 dark:text-gray-400 mt-1">
                    {selectedFeedback.userAgent}
                  </code>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}