import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sparkles, ArrowLeft, Loader2, Brain, MapPin, Award } from 'lucide-react';
import { requestApi } from '../api/request.api.js';
import { BLOOD_GROUPS, bgLabel } from '../utils/bloodGroup.js';
import BloodGroupBadge from '../components/BloodGroupBadge.jsx';

export default function CreateRequest() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { priority: 'URGENT', unitsRequired: 1 },
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await requestApi.create({
        ...data,
        unitsRequired: Number(data.unitsRequired),
      });
      setResult(res);
      toast.success('Request created. AI is matching donors…');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not create request');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-brand-200 rounded-full blur-2xl opacity-60 animate-pulse" />
          <div className="relative h-24 w-24 mx-auto bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center shadow-xl">
            <Brain className="h-12 w-12 text-white animate-pulse" />
          </div>
        </div>
        <h2 className="mt-8 text-2xl font-bold text-ink-900">AI is finding matched donors…</h2>
        <p className="mt-2 text-ink-600">Filtering compatible blood groups, computing distances, ranking by recency.</p>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-500">
          <Loader2 className="h-4 w-4 animate-spin" /> This usually takes a few seconds.
        </div>
      </div>
    );
  }

  if (result) return <MatchResults result={result} />;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-ink-600 hover:text-ink-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="card-elev p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink-900">New blood request</h1>
            <p className="text-sm text-ink-500">AI will instantly match compatible donors nearby.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="label">Blood group required</label>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map((bg) => {
                const sel = watch('bloodGroup') === bg.value;
                return (
                  <label
                    key={bg.value}
                    className={`cursor-pointer flex items-center justify-center rounded-lg border-2 py-2.5 text-sm font-bold transition-all ${
                      sel ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-700 hover:border-ink-300'
                    }`}
                  >
                    <input type="radio" value={bg.value} className="sr-only" {...register('bloodGroup', { required: true })} />
                    {bg.label}
                  </label>
                );
              })}
            </div>
            {errors.bloodGroup && <p className="text-xs text-brand-600 mt-1.5">Required</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Units required</label>
              <input type="number" min="1" className="input" {...register('unitsRequired', { required: true, min: 1 })} />
            </div>
            <div>
              <label className="label">Priority</label>
              <div className="grid grid-cols-2 gap-2">
                {['URGENT', 'NORMAL'].map((p) => {
                  const sel = watch('priority') === p;
                  const styles = p === 'URGENT'
                    ? sel ? 'border-urgent-500 bg-orange-50 text-urgent-600' : 'border-ink-200 text-ink-700'
                    : sel ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-700';
                  return (
                    <label key={p} className={`cursor-pointer flex items-center justify-center rounded-lg border-2 py-2 text-sm font-semibold ${styles}`}>
                      <input type="radio" value={p} className="sr-only" {...register('priority')} />
                      {p}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="label">Patient name</label>
            <input className="input" placeholder="e.g. Ravi Kumar" {...register('patientName', { required: true })} />
          </div>

          <div>
            <label className="label">Reason / notes</label>
            <textarea rows="3" className="input" placeholder="Brief context for the donors…" {...register('reason')} />
          </div>

          <button className="btn-primary w-full">
            <Sparkles className="h-4 w-4" /> Create request & find donors
          </button>
        </form>
      </div>
    </div>
  );
}

function MatchResults({ result }) {
  const matches = result.matches || [];
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card-elev p-8 mb-6 bg-gradient-to-br from-brand-50 to-white">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BloodGroupBadge group={result.bloodGroup} size="lg" />
            <div>
              <p className="text-sm text-ink-500">Request created</p>
              <h1 className="text-2xl font-bold text-ink-900">
                {result.unitsRequired} units of {bgLabel(result.bloodGroup)} for {result.patientName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {result.priority === 'URGENT' && <span className="chip bg-urgent-500/10 text-urgent-600">URGENT</span>}
                <span className="text-xs text-ink-500">{new Date(result.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <Link to={`/requests/${result.id}`} className="btn-secondary">View detail →</Link>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Brain className="h-5 w-5 text-brand-600" />
        <h2 className="text-xl font-bold text-ink-900">AI-matched donors</h2>
        <span className="chip bg-brand-50 text-brand-700">{matches.length} found</span>
      </div>

      {matches.length === 0 ? (
        <div className="card p-12 text-center text-ink-500">
          <p>No eligible donors found right now. Try widening your search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((m, idx) => (
            <div key={m.id} className="card p-5 hover:shadow-elev transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink-900">Donor {m.donorId.slice(0, 8)}</p>
                      <span className="chip bg-ink-100 text-ink-700">
                        <MapPin className="h-3 w-3" /> {m.distanceKm?.toFixed(1) || '—'} km
                      </span>
                      <span className="chip bg-success-500/10 text-success-700">
                        <Award className="h-3 w-3" /> Score {Math.round(m.matchScore)}/100
                      </span>
                    </div>
                    {m.aiReasoning && (
                      <p className="text-sm text-ink-600 mt-2 italic leading-relaxed">
                        <Brain className="inline h-3.5 w-3.5 mr-1 text-brand-600" />
                        "{m.aiReasoning}"
                      </p>
                    )}
                  </div>
                </div>
                <span className="chip bg-warn-500/10 text-warn-600 flex-shrink-0">{m.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
