import { useState, useEffect } from 'react';
import { Search, MapPin, ExternalLink, GraduationCap, X, Loader2 } from 'lucide-react';
import { api } from '../api';

const categories = ['全部', '综合类', '理工类'];

export default function Schools() {
  const [keyword, setKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('全部');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [schools, setSchools] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLocations().then(setLocations).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (keyword.trim()) params.keyword = keyword.trim();
    if (selectedLocation !== '全部') params.location = selectedLocation;
    if (selectedCategory !== '全部') params.category = selectedCategory;

    api.getSchools(params)
      .then(setSchools)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [keyword, selectedLocation, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">院校库</h1>
          <p className="text-gray-500">
            共收录 <span className="font-semibold text-primary-600">{schools.length}</span> 所高校
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-4">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索院校名称..." className="w-full ml-3 py-2.5 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none" />
              {keyword && (
                <button onClick={() => setKeyword('')} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              )}
            </div>
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              <option value="全部">全部地区</option>
              {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2.5 text-sm rounded-lg font-medium transition-colors ${selectedCategory === cat ? 'bg-primary-50 text-primary-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
        ) : schools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {schools.map((school) => <SchoolCard key={school.id} school={school} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><GraduationCap className="w-8 h-8 text-gray-300" /></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关院校</h3>
            <p className="text-gray-500">请尝试调整搜索条件</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SchoolCard({ school }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <img src={school.logo} alt={school.name} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">{school.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded">{school.type}</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">{school.category}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1.5"><MapPin className="w-3.5 h-3.5" /> {school.location}</div>
          </div>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{school.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {school.departments.slice(0, 3).map((dept) => (
            <span key={dept} className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded">{dept}</span>
          ))}
          {school.departments.length > 3 && (
            <span className="px-2 py-0.5 text-gray-400 text-xs">+{school.departments.length - 3}</span>
          )}
        </div>
        <a href={school.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium">
          访问官网 <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
