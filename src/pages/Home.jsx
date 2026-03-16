import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  School,
  Users,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Clock,
  CheckCircle2,
  Star,
  Loader2,
} from 'lucide-react';
import { api } from '../api';
import ListingCard from '../components/ListingCard';

const features = [
  { icon: Search, title: '精准匹配', desc: '根据成绩、专业、地区等条件，智能推荐最适合的调剂院校', color: 'from-blue-500 to-blue-600' },
  { icon: Clock, title: '实时更新', desc: '全网调剂信息实时采集，第一时间推送最新调剂动态', color: 'from-emerald-500 to-emerald-600' },
  { icon: BookOpen, title: '权威数据', desc: '汇集全国高校官方调剂信息，确保数据真实可靠', color: 'from-purple-500 to-purple-600' },
  { icon: CheckCircle2, title: '一站式服务', desc: '从信息查询到材料准备，全程指导调剂申请流程', color: 'from-orange-500 to-orange-600' },
];

const statIcons = [BookOpen, School, Users, TrendingUp];

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [stats, setStats] = useState(null);
  const [hotListings, setHotListings] = useState([]);
  const [latestListings, setLatestListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getStats(), api.getHotListings(), api.getLatestListings()])
      .then(([s, hot, latest]) => {
        setStats(s);
        setHotListings(hot);
        setLatestListings(latest);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(keyword.trim() ? `/listings?keyword=${encodeURIComponent(keyword.trim())}` : '/listings');
  };

  const statItems = stats
    ? [
        { label: '调剂信息', value: stats.totalListings, suffix: '条' },
        { label: '合作院校', value: stats.totalSchools, suffix: '所' },
        { label: '注册用户', value: stats.totalUsers, suffix: '人' },
        { label: '调剂成功率', value: stats.successRate, suffix: '%' },
      ]
    : [];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZyIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNnKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-primary-100 mb-6">
              <Star className="w-4 h-4 text-yellow-300" />
              2026年考研调剂信息已全面更新
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              你的考研调剂
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                一站式服务平台
              </span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-10 leading-relaxed">
              汇聚全国高校调剂资源，精准匹配调剂信息，助你圆梦理想院校
            </p>
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex bg-white rounded-xl shadow-2xl overflow-hidden p-1.5">
                <div className="flex-1 flex items-center px-4">
                  <Search className="w-5 h-5 text-gray-400 shrink-0" />
                  <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索院校、专业、地区..." className="w-full ml-3 py-3 text-gray-700 placeholder-gray-400 focus:outline-none" />
                </div>
                <button type="submit" className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-md">
                  搜索
                </button>
              </div>
            </form>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {['计算机科学', '人工智能', '软件工程', '电子信息'].map((tag) => (
                <Link key={tag} to={`/listings?keyword=${tag}`} className="px-3 py-1 bg-white/10 backdrop-blur-sm text-primary-100 text-sm rounded-full hover:bg-white/20 transition-colors">
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="relative -mt-8 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {statItems.map((stat, i) => {
                  const Icon = statIcons[i];
                  return (
                    <div key={stat.label} className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-xl mb-3">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-gray-900">
                        {stat.value.toLocaleString()}
                        <span className="text-base font-normal text-gray-500 ml-1">{stat.suffix}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">为什么选择研途调剂</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">我们致力于为考研学子提供最全面、最及时、最精准的调剂信息服务</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:border-primary-100 transition-all duration-300 group">
                <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hot Listings */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">热门调剂</h2>
              <p className="text-gray-500 mt-1">当前最受关注的调剂信息</p>
            </div>
            <Link to="/listings" className="hidden sm:inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hotListings.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}
        </div>
      </section>

      {/* Latest */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">最新发布</h2>
              <p className="text-gray-500 mt-1">实时更新的调剂信息</p>
            </div>
            <Link to="/listings" className="hidden sm:inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestListings.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">还在为调剂发愁？</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">立即注册，获取最新调剂信息推送，让你不错过任何一个调剂机会</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login?tab=register" className="px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-lg">
              免费注册
            </Link>
            <Link to="/listings" className="px-8 py-3.5 bg-primary-500/30 text-white font-semibold rounded-xl hover:bg-primary-500/40 transition-colors border border-white/20">
              浏览调剂信息
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
