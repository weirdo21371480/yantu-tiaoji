import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Users,
  TrendingUp,
  Clock,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  CheckCircle2,
  Flame,
  BookOpen,
  Share2,
  Heart,
  Loader2,
  Send,
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getListing(id)
      .then((data) => {
        setListing(data);
        return api.getSchool(data.school_id);
      })
      .then(setSchool)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user && id) {
      api.getApplication(id).then((a) => setApplied(!!a)).catch(() => {});
    }
  }, [user, id]);

  const handleApply = async () => {
    if (!user) return;
    setApplying(true);
    try {
      await api.applyListing(id);
      setApplied(true);
      alert('申请提交成功！');
    } catch (err) {
      alert(err.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">信息不存在</h2>
          <p className="text-gray-500 mb-6">该调剂信息可能已被删除或链接有误</p>
          <Link to="/listings" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <ArrowLeft className="w-4 h-4" /> 返回列表
          </Link>
        </div>
      </div>
    );
  }

  const daysLeft = Math.ceil((new Date(listing.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-700">首页</Link>
            <span>/</span>
            <Link to="/listings" className="hover:text-gray-700">调剂信息</Link>
            <span>/</span>
            <span className="text-gray-900">{listing.school_name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{listing.school_name}</h1>
                    {listing.isHot && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                        <Flame className="w-3 h-3" /> 热门
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500">{listing.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"><Heart className="w-5 h-5" /></button>
                  <button className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-primary-500 hover:border-primary-200 transition-colors"><Share2 className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-lg"><BookOpen className="w-3.5 h-3.5" /> {listing.subject}</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg"><GraduationCap className="w-3.5 h-3.5" /> {listing.degree}</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg"><MapPin className="w-3.5 h-3.5" /> {listing.location}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <InfoCard icon={Users} label="调剂名额" value={`${listing.vacancies} 人`} />
                <InfoCard icon={TrendingUp} label="最低总分" value={`${listing.score_requirement} 分`} />
                <InfoCard icon={Calendar} label="发布日期" value={listing.publish_date} />
                <InfoCard icon={Clock} label="截止日期" value={daysLeft > 0 ? `剩 ${daysLeft} 天` : '已截止'} highlight={daysLeft <= 7 && daysLeft > 0} />
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">调剂说明</h2>
              <p className="text-gray-600 leading-relaxed">{listing.description}</p>
            </div>

            {/* Score */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">分数要求</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ScoreItem label="总分" score={listing.score_requirement} />
                <ScoreItem label="英语" score={listing.english_requirement} />
                <ScoreItem label="数学" score={listing.math_requirement} />
                <ScoreItem label="专业课" score={listing.professional_requirement} />
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">申请条件</h2>
              <ul className="space-y-3">
                {listing.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-600">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">申请调剂</h3>
              <p className="text-primary-100 text-sm mb-6">确认符合条件后，请尽快提交调剂申请</p>
              {user ? (
                applied ? (
                  <div className="text-center py-3 bg-white/20 rounded-lg text-white font-medium">
                    <CheckCircle2 className="w-5 h-5 inline mr-1" /> 已申请
                  </div>
                ) : (
                  <button onClick={handleApply} disabled={applying} className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60">
                    {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    提交申请
                  </button>
                )
              ) : (
                <Link to="/login" className="block text-center w-full px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                  登录后申请
                </Link>
              )}
              <p className="text-center text-primary-200 text-xs mt-3">截止日期：{listing.deadline}</p>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">联系方式</h3>
              <div className="space-y-3">
                <ContactItem icon={GraduationCap} label="联系人" value={listing.contact} />
                <ContactItem icon={Phone} label="电话" value={listing.phone} />
                <ContactItem icon={Mail} label="邮箱" value={listing.email} small />
              </div>
            </div>

            {/* School */}
            {school && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">院校信息</h3>
                <div className="flex items-center gap-3 mb-4">
                  <img src={school.logo} alt={school.name} className="w-14 h-14 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{school.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded">{school.type}</span>
                      <span className="text-xs text-gray-500">{school.location}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">{school.description}</p>
                <Link to="/schools" className="block text-center w-full px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  查看院校详情
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, highlight }) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? 'bg-orange-50' : 'bg-gray-50'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${highlight ? 'text-orange-500' : 'text-gray-400'}`} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className={`font-semibold ${highlight ? 'text-orange-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function ScoreItem({ label, score }) {
  return (
    <div className="text-center bg-gray-50 rounded-lg p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-primary-600">≥{score}</p>
    </div>
  );
}

function ContactItem({ icon: Icon, label, value, small }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`font-medium text-gray-900 ${small ? 'text-sm' : ''}`}>{value}</p>
      </div>
    </div>
  );
}
