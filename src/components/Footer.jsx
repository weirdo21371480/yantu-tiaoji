import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">研途调剂</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              专业的考研调剂信息服务平台，汇聚全国高校调剂资源，助力考研学子圆梦名校。
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: '首页' },
                { to: '/listings', label: '调剂信息' },
                { to: '/schools', label: '院校库' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">帮助中心</h3>
            <ul className="space-y-2">
              {['调剂流程指南', '常见问题', '使用教程', '隐私政策'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">联系我们</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-primary-400" />
                support@yantutiaoji.com
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-primary-400" />
                400-888-9999
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-primary-400" />
                北京市海淀区中关村大街1号
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            © 2026 研途调剂 All Rights Reserved. 本平台仅提供信息服务，具体调剂政策以各高校官方公告为准。
          </p>
        </div>
      </div>
    </footer>
  );
}
