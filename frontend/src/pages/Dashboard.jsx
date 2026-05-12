import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Heart, Plus, Activity, Calendar, MessageCircle, ShieldCheck,
  ArrowRight, MapPin, Droplet, Building2, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { donorApi } from '../api/donor.api.js';
import { hospitalApi } from '../api/hospital.api.js';
import { requestApi } from '../api/request.api.js';
import { bgLabel } from '../utils/bloodGroup.js';
import BloodGroupBadge from '../components/BloodGroupBadge.jsx';
import InventoryGrid from '../components/InventoryGrid.jsx';
import Loader from '../components/Loader.jsx';

export default function Dashboard() {
  const { isDonor, isHospital, user } = useAuth();
  if (isDonor) return <DonorDashboard user={user} />;
  if (isHospital) return <HospitalDashboard user={user} />;
  return <Loader />;
}

/* ─────────────── DONOR ─────────────── */

function DonorDashboard({ user }) {
  const [me, setMe] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const [d, m] = await Promise.all([donorApi.me(), requestApi.myMatches()]);
      setMe(d);
      setMatches(m);
    } catch (e) {
      toast.error('Could not load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleAvailability = async () => {
    try {
      const next = !me.available;
      const updated = await donorApi.setAvailability(next);
      setMe(updated);
      toast.success(`You are now ${next ? 'available' : 'unavailable'}`);
    } catch (e) {
      toast.error('Could not update');
    }
  };

  const accept = async (id) => {
    try {
      await requestApi.accept(id);
      toast.success('Thanks! The hospital has been notified.');
      refresh();
    } catch { toast.error('Could not accept'); }
  };

  const decline = async (id) => {
    try {
      await requestApi.decline(id);
      toast('Declined');
      refresh();
    } catch { toast.error('Could not decline'); }
  };

  if (loading) return <Loader text="Loading your dashboard…" />;

  const pending = matches.filter((m) => m.status === 'PENDING');
  const past = matches.filter((m) => m.status !== 'PENDING');

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 shadow-2xl">
        {/* Background blobs */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-600/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <BloodGroupBadge group={me?.bloodGroup} size="xl" className="ring-4 ring-white/10 shadow-2xl" />
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success-500 border-2 border-slate-900" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">DASHBOARD</p>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">{user?.fullName?.split(' ')[0]}</span>
              </h1>
              <div className="flex items-center gap-4 mt-3 text-sm font-medium text-slate-400">
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-brand-500" /> {me?.city || '—'}</span>
                <span className="h-1 w-1 rounded-full bg-slate-700" />
                <span className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-brand-500" /> {me?.totalDonations || 0} Donations</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleAvailability} 
            className={`group relative overflow-hidden px-8 py-4 rounded-2xl font-black text-sm tracking-wide transition-all ${
              me?.available 
                ? 'bg-success-500 text-white hover:bg-success-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                : 'glass text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3 relative z-10">
              <Activity className={`h-5 w-5 ${me?.available ? 'animate-bounce' : ''}`} />
              {me?.available ? "AVAILABLE TO DONATE" : "CURRENTLY BUSY"}
            </div>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Heart}
          label="Total Contributions"
          value={me?.totalDonations || 0}
          gradient="from-brand-500 to-brand-700"
          delay="0"
        />
        <StatCard
          icon={Calendar}
          label="Next Window"
          value={me?.nextEligibleDate ? new Date(me.nextEligibleDate).toLocaleDateString() : 'Available Now'}
          gradient="from-slate-800 to-slate-950"
          delay="100"
        />
        <StatCard
          icon={ShieldCheck}
          label="Verification Status"
          value={me?.eligible ? 'Verified Hero' : 'Pending'}
          gradient={me?.eligible ? 'from-success-500 to-success-700' : 'from-slate-400 to-slate-600'}
          delay="200"
        />
      </div>

      {/* Pending matches */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-ink-900">Open requests matched to you</h2>
            <p className="text-sm text-ink-500">AI-matched based on your blood group and location.</p>
          </div>
          <Link to="/eligibility" className="btn-secondary text-sm">
            <MessageCircle className="h-4 w-4" /> Check eligibility
          </Link>
        </div>

        {pending.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No active requests yet"
            subtitle="When a hospital nearby needs your blood group, you'll see it here."
          />
        ) : (
          <div className="space-y-3">
            {pending.map((m) => (
              <MatchCard key={m.id} match={m} onAccept={() => accept(m.id)} onDecline={() => decline(m.id)} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-ink-900 mb-3">Past matches</h2>
          <div className="space-y-2">
            {past.slice(0, 5).map((m) => (
              <div key={m.id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="chip bg-ink-100 text-ink-700">{m.status}</span>
                  <span className="text-sm text-ink-600">{new Date(m.matchedAt).toLocaleString()}</span>
                </div>
                <Link to={`/requests/${m.requestId}`} className="text-sm text-brand-700 font-semibold hover:underline">
                  View
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MatchCard({ match, onAccept, onDecline }) {
  return (
    <div className="card p-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 hover:shadow-elev transition-shadow">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Droplet className="h-9 w-9 text-brand-600 flex-shrink-0" fill="#fee2e2" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-ink-900 truncate">
              A hospital needs your help
            </p>
            <span className="chip bg-urgent-500/10 text-urgent-600">
              <AlertCircle className="h-3 w-3" /> {match.distanceKm?.toFixed(1) || '—'} km away
            </span>
          </div>
          {match.aiReasoning && (
            <p className="text-sm text-ink-600 mt-1 line-clamp-2 italic">"{match.aiReasoning}"</p>
          )}
          <p className="text-xs text-ink-500 mt-1">
            Match score: <span className="font-semibold text-ink-700">{Math.round(match.matchScore || 0)}/100</span>
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onDecline} className="btn-secondary">Decline</button>
        <button onClick={onAccept} className="btn-success">
          Accept <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────── HOSPITAL ─────────────── */

function HospitalDashboard({ user }) {
  const [me, setMe] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [h, inv, reqs] = await Promise.all([
          hospitalApi.me(),
          hospitalApi.inventory(),
          requestApi.list(),
        ]);
        setMe(h);
        setInventory(inv);
        setRequests(reqs);
      } catch (e) {
        toast.error('Could not load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader text="Loading your dashboard…" />;

  const active = requests.filter((r) => r.status === 'OPEN');

  return (
    <div className="space-y-8">
      <div className="card-elev p-8 bg-gradient-to-br from-white to-brand-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-ink-900">{me?.name}</h1>
              <span className="chip bg-success-500/10 text-success-700">
                <ShieldCheck className="h-3 w-3" /> Verified
              </span>
            </div>
            <p className="text-sm text-ink-600 mt-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {me?.address}, {me?.city}
            </p>
          </div>
        </div>
        <Link to="/requests/new" className="btn-primary self-start md:self-auto">
          <Plus className="h-4 w-4" /> New blood request
        </Link>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-ink-900">Blood inventory</h2>
            <p className="text-sm text-ink-500">Live snapshot across all 8 blood groups.</p>
          </div>
          <Link to="/inventory" className="btn-secondary text-sm">Manage inventory <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <InventoryGrid inventory={inventory} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-ink-900">Active requests</h2>
          <span className="text-sm text-ink-500">{active.length} open</span>
        </div>
        {active.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No active requests"
            subtitle="Create a new request and we'll match donors instantly."
          />
        ) : (
          <div className="space-y-3">
            {active.map((r) => <RequestRow key={r.id} request={r} />)}
          </div>
        )}
      </section>

      {requests.filter((r) => r.status !== 'OPEN').length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-ink-900 mb-3">History</h2>
          <div className="space-y-2">
            {requests.filter((r) => r.status !== 'OPEN').slice(0, 5).map((r) => <RequestRow key={r.id} request={r} muted />)}
          </div>
        </section>
      )}
    </div>
  );
}

function RequestRow({ request, muted }) {
  const statusColor = {
    OPEN: 'bg-urgent-500/10 text-urgent-600',
    FULFILLED: 'bg-success-500/10 text-success-700',
    CANCELLED: 'bg-ink-200 text-ink-600',
  }[request.status] || 'bg-ink-100 text-ink-700';
  return (
    <Link
      to={`/requests/${request.id}`}
      className={`card p-6 flex flex-col sm:flex-row sm:items-center gap-6 group ${muted ? 'opacity-60 grayscale' : ''}`}
    >
      <div className="relative">
        <BloodGroupBadge group={request.bloodGroup} size="lg" />
        {request.priority === 'URGENT' && (
          <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-brand-600 animate-ping" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <p className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{request.patientName}</p>
          {request.priority === 'URGENT' && (
            <span className="px-2 py-0.5 rounded-md bg-brand-100 text-brand-700 text-[10px] font-black uppercase tracking-wider">URGENT</span>
          )}
        </div>
        <p className="text-sm text-slate-500 font-medium mt-0.5">{request.reason || 'Medical Emergency'}</p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Droplet className="h-3 w-3" /> {request.unitsRequired} Units
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-200" />
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {new Date(request.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
          {request.status}
        </span>
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-200" />
          ))}
          {request.matches?.length > 3 && (
            <div className="h-6 w-6 rounded-full border-2 border-white bg-slate-900 text-[8px] flex items-center justify-center text-white">
              +{request.matches.length - 3}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function StatCard({ icon: Icon, label, value, gradient }) {
  return (
    <div className="card group p-6 overflow-hidden relative">
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-[0.03] group-hover:scale-150 transition-transform duration-700`} />
      <div className="relative flex items-center gap-5">
        <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="card p-12 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
        <Icon className="h-7 w-7" />
      </div>
      <p className="font-semibold text-ink-900">{title}</p>
      <p className="text-sm text-ink-500 mt-1">{subtitle}</p>
    </div>
  );
}
