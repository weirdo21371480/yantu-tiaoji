import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  ArrowUpDown,
  Loader2,
} from 'lucide-react';
import { api } from '../api';
import ListingCard from '../components/ListingCard';

const yearOptions = ['2026', '2025', '2024'];
const degreeTypes = ['全部', '学术型硕士', '专业型硕士'];
const sortOptions = [
  { value: 'latest', label: '最新发布' },
  { value: 'deadline', label: '截止日期' },
  { value: 'score_asc', label: '分数从低到高' },
  { value: 'score_desc', label: '分数从高到低' },
  { value: 'vacancies', label: '名额从多到少' },
];

export default function Listings() {
  const [searchParams] = useSearchParams();
  const initialKeyword = searchParams.get('keyword') || '';

  const [keyword, setKeyword] = useState(initialKeyword);
  const [selectedSubject, setSelectedSubject] = useState('全部');
  const [selectedLocation, setSelectedLocation] = useState('全部');
  const [selectedDegree, setSelectedDegree] = useState('全部');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);

  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getSubjects(), api.getLocations()])
      .then(([s, l]) => { setSubjects(s); setLocations(l); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { sort: sortBy, year: selectedYear };
    if (keyword.trim()) params.keyword = keyword.trim();
    if (selectedSubject !== '全部') params.subject = selectedSubject;
    if (selectedLocation !== '全部') params.location = selectedLocation;
    if (selectedDegree !== '全部') params.degree = selectedDegree;

    api.getListings(params)
      .then((data) => { setListings(data.items); setTotal(data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [keyword, selectedSubject, selectedLocation, selectedDegree, sortBy, selectedYear]);

  const activeFilters = [
    selectedSubject !== '全部' && { label: selectedSubject, clear: () => setSelectedSubject('全部') },
    selectedLocation !== '全部' && { label: selectedLocation, clear: () => setSelectedLocation('全部') },
    selectedDegree !== '全部' && { label: selectedDegree, clear: () => setSelectedDegree('全部') },
  ].filter(Boolean);

  const clearAllFilters = () => {
    setKeyword('');
    setSelectedSubject('全部');
    setSelectedLocation('全部');
    setSelectedDegree('全部');
    setSortBy('latest');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">调剂信息</h1>
              <p className="text-gray-500">
                共找到 <span className="font-semibold text-primary-600">{total}</span> 条{selectedYear}年调剂信息
              </p>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {yearOptions.map((y) => (
                <button key={y} onClick={() => setSelectedYear(y)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${selectedYear === y ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {y}年
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
          <div className="p-4">
            <div className="flex gap-3">
              <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-4">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索院校、专业、地区..." className="w-full ml-3 py-2.5 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none" />
                {keyword && (
                  <button onClick={() => setKeyword('')} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${showFilters ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                <SlidersHorizontal className="w-4 h-4" />
                筛选
              </button>
            </div>
          </div>
          {showFilters && (
            <div className="border-t border-gray-100 p-4 space-y-4">
              <FilterRow label="专业方向">
                <FilterSelect value={selectedSubject} onChange={setSelectedSubject} options={['全部', ...subjects]} />
              </FilterRow>
              <FilterRow label="所在地区">
                <FilterSelect value={selectedLocation} onChange={setSelectedLocation} options={['全部', ...locations]} />
              </FilterRow>
              <FilterRow label="学位类型">
                <div className="flex flex-wrap gap-2">
                  {degreeTypes.map((type) => (
                    <button key={type} onClick={() => setSelectedDegree(type)} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${selectedDegree === type ? 'bg-primary-50 text-primary-700 font-medium' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </FilterRow>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.length > 0 && (
              <>
                {activeFilters.map((f) => (
                  <span key={f.label} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full">
                    {f.label}
                    <button onClick={f.clear} className="hover:text-primary-900"><X className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
                <button onClick={clearAllFilters} className="text-sm text-gray-400 hover:text-gray-600">清除全部</button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ArrowUpDown className="w-4 h-4" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent border-none text-sm text-gray-600 font-medium focus:outline-none cursor-pointer">
              {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关调剂信息</h3>
            <p className="text-gray-500 mb-6">请尝试调整搜索条件或筛选项</p>
            <button onClick={clearAllFilters} className="px-6 py-2.5 bg-primary-50 text-primary-700 font-medium rounded-lg hover:bg-primary-100 transition-colors">
              重置筛选条件
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterRow({ label, children }) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-sm text-gray-500 w-20 pt-1.5 shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full sm:w-64 appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300">
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}
