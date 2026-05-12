import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { authApi } from '../api/auth.api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await authApi.login(data);
      login(res);
      toast.success('Welcome back!');
      navigate('/', { replace: true });
    } catch (e) {
      toast.error(e.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 font-sans">
      {/* Brand side */}
      <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-brand-600/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-accent-500/10 blur-[120px]" />
        
        <div className="relative z-10">
          <Logo textClass="text-2xl font-black text-white tracking-tighter" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-ping" />
            AI-Powered Matching Engine
          </div>
          <h1 className="text-5xl xl:text-7xl font-black leading-[1.1] tracking-tight">
            Every drop<br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Saves a Life.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
            The world's most advanced blood donor network, connecting hospitals with heroes in real time.
          </p>
          <div className="flex gap-10 pt-4">
            <Stat value="24/7" label="SMART MATCH" />
            <Stat value="1.5s" label="LATENCY" />
            <Stat value="100%" label="SECURE" />
          </div>
        </div>
        
        <div className="relative z-10 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <span>JEEVANLINK SYSTEM v1.0</span>
          <span className="h-1 w-1 rounded-full bg-slate-700" />
          <span>REAL-TIME NETWORK</span>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-8 sm:p-20 relative">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-12 flex justify-center">
            <Logo textClass="text-2xl font-black tracking-tighter" />
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Sign in</h2>
            <p className="text-slate-500 font-medium">Welcome back, Hero. Access your console.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="label">SYSTEM IDENTITY</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                <input
                  type="email"
                  className="input pl-12 h-14"
                  placeholder="name@jeevanlink.org"
                  {...register('email', { required: 'Email is required' })}
                />
              </div>
              {errors.email && <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mt-2 ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="label">ACCESS KEY</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                <input
                  type="password"
                  className="input pl-12 h-14"
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
              </div>
              {errors.password && <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mt-2 ml-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full h-14 text-base tracking-widest">
              {isSubmitting ? 'AUTHENTICATING…' : 'INITIALIZE SESSION'}
              {!isSubmitting && <ArrowRight className="h-5 w-5 ml-2" />}
            </button>
          </form>

          <p className="mt-10 text-sm text-slate-500 text-center font-medium">
            New to the network?{' '}
            <Link to="/register" className="font-black text-brand-600 hover:text-brand-700 underline underline-offset-4 decoration-2">
              Join as a Hero
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="group">
      <div className="text-3xl font-black tracking-tighter group-hover:text-brand-500 transition-colors">{value}</div>
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}
