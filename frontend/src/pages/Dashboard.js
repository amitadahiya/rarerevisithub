import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, Users, MessageCircle, Calendar as CalendarIcon } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-[#121212] border border-white/5 rounded-sm p-6 hover:border-[#D4AF37]/20 transition-all duration-300" data-testid={`stat-card-${title.toLowerCase().replace(' ', '-')}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-widest text-white/50 mb-2">{title}</p>
        <h3 className="text-3xl font-serif text-white mb-1">{value}</h3>
        {trend && (
          <p className="text-xs text-[#D4AF37] flex items-center gap-1">
            <TrendingUp size={12} />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-sm bg-${color || '[#D4AF37]'}/10`}>
        <Icon size={24} className={`text-${color || '[#D4AF37]'}`} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, accountsRes, postsRes] = await Promise.all([
        axios.get(`${API}/analytics`),
        axios.get(`${API}/social-accounts`),
        axios.get(`${API}/posts`)
      ]);
      
      setAnalytics(analyticsRes.data);
      setSocialAccounts(accountsRes.data);
      setRecentPosts(postsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[#D4AF37] text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-serif text-white mb-2">Dashboard</h1>
        <p className="text-white/50">Your automation hub overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Posts"
          value={analytics?.total_posts || 0}
          icon={CalendarIcon}
          trend="+12% this week"
        />
        <StatCard
          title="Engagement"
          value={analytics?.total_engagement || 0}
          icon={MessageCircle}
          trend="+8% this week"
        />
        <StatCard
          title="Followers Growth"
          value={`+${analytics?.followers_growth || 0}`}
          icon={Users}
          trend="+15% this month"
        />
        <StatCard
          title="Top Platform"
          value={analytics?.top_platform || 'Instagram'}
          icon={TrendingUp}
        />
      </div>

      {/* Social Accounts Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#121212] border border-white/5 rounded-sm p-6">
          <h2 className="text-2xl font-serif text-white mb-4">Social Accounts</h2>
          <div className="space-y-3">
            {socialAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 bg-white/5 rounded-sm" data-testid={`social-account-${account.platform}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${account.is_connected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-white capitalize">{account.platform}</span>
                </div>
                <span className="text-xs text-white/50">
                  {account.is_connected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-[#121212] border border-white/5 rounded-sm p-6">
          <h2 className="text-2xl font-serif text-white mb-4">Recent Posts</h2>
          {recentPosts.length === 0 ? (
            <p className="text-white/50 text-sm">No posts yet. Create your first post in Content Studio!</p>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.id} className="p-3 bg-white/5 rounded-sm" data-testid={`recent-post-${post.id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-[#D4AF37] uppercase">{post.platform}</span>
                    <span className="text-xs text-white/50">{post.status}</span>
                  </div>
                  <p className="text-sm text-white/70 line-clamp-2">{post.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#121212] border border-white/5 rounded-sm p-6">
        <h2 className="text-2xl font-serif text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            data-testid="quick-action-create-post"
            onClick={() => window.location.href = '/content'}
            className="bg-[#D4AF37] text-black hover:bg-[#C5A059] font-medium rounded-sm px-6 py-3 transition-all duration-300 gold-glow"
          >
            Create Post
          </button>
          <button 
            data-testid="quick-action-add-product"
            onClick={() => window.location.href = '/products'}
            className="bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-sm px-6 py-3 transition-all duration-300"
          >
            Add Product
          </button>
          <button 
            data-testid="quick-action-view-analytics"
            onClick={() => window.location.href = '/analytics'}
            className="bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-sm px-6 py-3 transition-all duration-300"
          >
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;