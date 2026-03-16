import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }
    setLoading(true);
    try {
      await register({ name: registerForm.name, email: registerForm.email, phone: registerForm.phone, password: registerForm.password });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">研途调剂</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button onClick={() => { setActiveTab('login'); setError(''); }} className={`flex-1 py-4 text-sm font-medium transition-colors relative ${activeTab === 'login' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
              登录
              {activeTab === 'login' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary-600 rounded-full" />}
            </button>
            <button onClick={() => { setActiveTab('register'); setError(''); }} className={`flex-1 py-4 text-sm font-medium transition-colors relative ${activeTab === 'register' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
              注册
              {activeTab === 'register' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary-600 rounded-full" />}
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>
            )}

            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <InputField icon={Mail} type="email" placeholder="请输入邮箱" value={loginForm.email} onChange={(v) => setLoginForm({ ...loginForm, email: v })} />
                <div className="relative">
                  <InputField icon={Lock} type={showPassword ? 'text' : 'password'} placeholder="请输入密码" value={loginForm.password} onChange={(v) => setLoginForm({ ...loginForm, password: v })} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-xs text-gray-400">演示账号: demo@example.com / demo123456</div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  登录
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <InputField icon={User} type="text" placeholder="请输入姓名" value={registerForm.name} onChange={(v) => setRegisterForm({ ...registerForm, name: v })} />
                <InputField icon={Mail} type="email" placeholder="请输入邮箱" value={registerForm.email} onChange={(v) => setRegisterForm({ ...registerForm, email: v })} />
                <InputField icon={Phone} type="tel" placeholder="请输入手机号" value={registerForm.phone} onChange={(v) => setRegisterForm({ ...registerForm, phone: v })} />
                <InputField icon={Lock} type="password" placeholder="请输入密码" value={registerForm.password} onChange={(v) => setRegisterForm({ ...registerForm, password: v })} />
                <InputField icon={Lock} type="password" placeholder="请确认密码" value={registerForm.confirmPassword} onChange={(v) => setRegisterForm({ ...registerForm, confirmPassword: v })} />
                <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  注册
                </button>
              </form>
            )}
          </div>
        </div>
        <p className="text-center text-sm text-gray-400 mt-6">© 2026 研途调剂 All Rights Reserved.</p>
      </div>
    </div>
  );
}

function InputField({ icon: Icon, type, placeholder, value, onChange }) {
  return (
    <div className="flex items-center bg-gray-50 rounded-xl px-4 border border-gray-100 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full ml-3 py-3 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none" required />
    </div>
  );
}
