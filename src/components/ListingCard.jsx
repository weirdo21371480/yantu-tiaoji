import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, TrendingUp, Flame } from 'lucide-react';

export default function ListingCard({ listing }) {
  const daysLeft = Math.ceil(
    (new Date(listing.deadline) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const isUrgent = daysLeft <= 7 && daysLeft > 0;
  const schoolName = listing.school_name || listing.schoolName;
  const scoreReq = listing.score_requirement || listing.scoreRequirement;
  const isHot = listing.isHot || listing.is_hot;

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="block bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                {schoolName}
              </h3>
              {isHot && (
                <span className="shrink-0 inline-flex items-center gap-0.5 px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                  <Flame className="w-3 h-3" />
                  热门
                </span>
              )}
              {isUrgent && (
                <span className="shrink-0 inline-flex items-center gap-0.5 px-2 py-0.5 bg-orange-50 text-orange-600 text-xs font-medium rounded-full">
                  <Clock className="w-3 h-3" />
                  即将截止
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{listing.department}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-md">
            {listing.subject}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
            {listing.degree}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            {listing.location}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            余额 {listing.vacancies} 人
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
            ≥ {scoreReq} 分
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {daysLeft > 0 ? `剩 ${daysLeft} 天` : '已截止'}
          </div>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {listing.description}
        </p>
      </div>
    </Link>
  );
}
