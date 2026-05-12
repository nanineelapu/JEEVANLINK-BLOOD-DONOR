import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, MapPin, Building2, Droplet, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authApi } from '../api/auth.api.js';
import { donorApi } from '../api/donor.api.js';
import { hospitalApi } from '../api/hospital.api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { BLOOD_GROUPS } from '../utils/bloodGroup.js';
import Logo from '../components/Logo.jsx';

export default function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('DONOR');
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const navigate = useNavigate();
  const { login } = useAuth();

  // Step 1
  const accountForm = useForm({ defaultValues: { role: 'DONOR' } });
  // Step 2
  const profileForm = useForm();

  const onAccountSubmit = async (data) => {
    try {
      const res = await authApi.register(data);
      login(res);
      setRole(data.role);
      toast.success('Account created. One more step.');
      setStep(2);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Registration failed');
    }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ latitude: p.coords.latitude, longitude: p.coords.longitude });
        toast.success('Location captured');
      },
      () => toast.error('Could not access location')
    );
  };

  const onProfileSubmit = async (data) => {
    try {
      if (role === 'DONOR') {
        await donorApi.create({
          bloodGroup: data.bloodGroup,
          age: Number(data.age),
          city: data.city,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      } else {
        await hospitalApi.create({
          name: data.name,
          address: data.address,
          city: data.city,
          contactPhone: data.contactPhone,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      }
      toast.success('Profile complete!');
      navigate('/', { replace: true });
    } catch (e) {
      toast.error(e.response?.data?.error || 'Profile setup failed');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-brand-50">
      {/* Brand side */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative z-10">
          <Logo textClass="text-xl text-white" />
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight">
            Join the network<br />that saves lives.
          </h1>
          <p className="text-brand-100 text-lg max-w-md">
            Whether you donate blood or run a hospital, JEEVANLINK gives you the tools
            to act fast when every minute matters.
          </p>
          <div className="space-y-3 pt-4">
            <Feature text="AI-matched donors within seconds" />
            <Feature text="Live inventory tracking across 8 blood groups" />
            <Feature text="Eligibility chatbot powered by Gemini" />
          </div>
        </div>
        <p className="relative z-10 text-xs text-brand-200">
          Already a member?{' '}
          <Link to="/login" className="text-white font-semibold underline-offset-2 hover:underline">
            Sign in instead
          </Link>
        </p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo textClass="text-xl" />
          </div>

          <div className="flex items-center gap-3 mb-8">
            <StepDot active={step === 1} done={step > 1} label="Account" n={1} />
            <div className="flex-1 h-px bg-ink-200" />
            <StepDot active={step === 2} done={false} label="Profile" n={2} />
          </div>

          {step === 1 && (
            <>
              <h2 className="text-3xl font-bold text-ink-900 mb-1">Create account</h2>
              <p className="text-ink-500 mb-8">Choose a role to get started.</p>

              <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-5">
                <div>
                  <label className="label">I am a…</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { v: 'DONOR', label: 'Donor', desc: 'I want to donate', icon: Droplet },
                      { v: 'HOSPITAL_ADMIN', label: 'Hospital', desc: 'I manage inventory', icon: Building2 },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      const selected = accountForm.watch('role') === opt.v;
                      return (
                        <label
                          key={opt.v}
                          className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                            selected ? 'border-brand-500 bg-brand-50' : 'border-ink-200 hover:border-ink-300'
                          }`}
                        >
                          <input type="radio" value={opt.v} className="sr-only" {...accountForm.register('role', { required: true })} />
                          <Icon className={`h-5 w-5 ${selected ? 'text-brand-600' : 'text-ink-500'}`} />
                          <div className="mt-2 text-sm font-semibold text-ink-900">{opt.label}</div>
                          <div className="text-xs text-ink-500">{opt.desc}</div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="label">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <input className="input pl-10" placeholder="Jane Doe" {...accountForm.register('fullName', { required: true })} />
                  </div>
                </div>

                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <input type="email" className="input pl-10" placeholder="you@example.com" {...accountForm.register('email', { required: true })} />
                  </div>
                </div>

                <div>
                  <label className="label">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <input className="input pl-10" placeholder="+91 90000 00000" {...accountForm.register('phone')} />
                  </div>
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <input type="password" className="input pl-10" placeholder="Min 6 characters" {...accountForm.register('password', { required: true, minLength: 6 })} />
                  </div>
                </div>

                <button className="btn-primary w-full">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-3xl font-bold text-ink-900 mb-1">
                {role === 'DONOR' ? 'Donor profile' : 'Hospital profile'}
              </h2>
              <p className="text-ink-500 mb-8">
                {role === 'DONOR' ? "Help us match you to nearby requests." : "Tell us where to deliver requests."}
              </p>

              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
                {role === 'DONOR' ? (
                  <>
                    <div>
                      <label className="label">Blood group</label>
                      <div className="grid grid-cols-4 gap-2">
                        {BLOOD_GROUPS.map((bg) => {
                          const sel = profileForm.watch('bloodGroup') === bg.value;
                          return (
                            <label
                              key={bg.value}
                              className={`cursor-pointer flex items-center justify-center rounded-lg border-2 py-2 text-sm font-bold transition-all ${
                                sel ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-700'
                              }`}
                            >
                              <input type="radio" value={bg.value} className="sr-only" {...profileForm.register('bloodGroup', { required: true })} />
                              {bg.label}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Age</label>
                        <input type="number" className="input" placeholder="25" {...profileForm.register('age', { required: true, min: 18, max: 65 })} />
                      </div>
                      <div>
                        <label className="label">City</label>
                        <input className="input" placeholder="Hyderabad" {...profileForm.register('city', { required: true })} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="label">Hospital name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                        <input className="input pl-10" placeholder="Apollo Hyderabad" {...profileForm.register('name', { required: true })} />
                      </div>
                    </div>
                    <div>
                      <label className="label">Address</label>
                      <input className="input" placeholder="Road No. 72, Jubilee Hills" {...profileForm.register('address', { required: true })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">City</label>
                        <input className="input" placeholder="Hyderabad" {...profileForm.register('city', { required: true })} />
                      </div>
                      <div>
                        <label className="label">Contact phone</label>
                        <input className="input" placeholder="+91 …" {...profileForm.register('contactPhone')} />
                      </div>
                    </div>
                  </>
                )}

                <div className="rounded-lg border border-ink-200 bg-ink-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand-600" />
                      <span className="text-sm font-medium text-ink-800">Location</span>
                    </div>
                    <button type="button" onClick={captureLocation} className="btn-secondary text-xs px-3 py-1.5">
                      {coords.latitude ? 'Update' : 'Use my location'}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-ink-500">
                    {coords.latitude
                      ? `Captured: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
                      : 'Optional, but helps the AI find nearby donors.'}
                  </p>
                </div>

                <button className="btn-primary w-full">Finish setup</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Feature({ text }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 className="h-5 w-5 text-brand-200 mt-0.5 flex-shrink-0" />
      <span className="text-brand-50">{text}</span>
    </div>
  );
}

function StepDot({ active, done, label, n }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
          done ? 'bg-success-600 text-white' : active ? 'bg-brand-600 text-white' : 'bg-ink-200 text-ink-500'
        }`}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : n}
      </div>
      <span className={`text-sm font-medium ${active || done ? 'text-ink-900' : 'text-ink-500'}`}>{label}</span>
    </div>
  );
}
