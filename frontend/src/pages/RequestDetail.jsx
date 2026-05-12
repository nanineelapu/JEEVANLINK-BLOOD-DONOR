import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, Brain, CheckCircle2, XCircle, Award, AlertCircle } from 'lucide-react';
import { requestApi } from '../api/request.api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { bgLabel } from '../utils/bloodGroup.js';
import BloodGroupBadge from '../components/BloodGroupBadge.jsx';
import Loader from '../components/Loader.jsx';

export default function RequestDetail() {
  const { id } = useParams();
  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isHospital, isDonor } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    try { setReq(await requestApi.byId(id)); }
    catch { toast.error('Could not load request'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const fulfill = async () => {
    if (!confirm('Mark this request as fulfilled? This will record donations.')) return;
    try { await requestApi.fulfill(id); toast.success('Request fulfilled'); load(); }
    catch { toast.error('Failed to fulfill'); }
  };

  const cancel = async () => {
    if (!confirm('Cancel this request?')) return;
    try { await requestApi.cancel(id); toast.success('Cancelled'); load(); }
    catch { toast.error('Failed to cancel'); }
  };

  const accept = async (matchId) => {
    try { await requestApi.accept(matchId); toast.success('Accepted — hospital notified'); load(); }
    catch { toast.error('Could not accept'); }
  };

  const decline = async (matchId) => {
    try { await requestApi.decline(matchId); toast('Declined'); load(); }
    catch { toast.error('Could not decline'); }
  };

  if (loading) return <Loader />;
  if (!req) return null;

  const myMatch = isDonor && req.matches?.find((m) => m.donorId === user.userId);

  const statusColor = {
    OPEN: 'bg-urgent-500/10 text-urgent-600',
    FULFILLED: 'bg-success-500/10 text-success-700',
    CANCELLED: 'bg-ink-200 text-ink-600',
  }[req.status];

  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-ink-600 hover:text-ink-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="card-elev p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start gap-5">
            <BloodGroupBadge group={req.bloodGroup} size="xl" />
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-ink-900">{req.patientName}</h1>
                {req.priority === 'URGENT' && (
                  <span className="chip bg-urgent-500/10 text-urgent-600 text-xs">
                    <AlertCircle className="h-3 w-3" /> URGENT
                  </span>
                )}
                <span className={`chip ${statusColor}`}>{req.status}</span>
              </div>
              <p className="text-ink-600">
                <span className="font-semibold">{req.unitsRequired} units</span> of {bgLabel(req.bloodGroup)} needed
              </p>
              {req.reason && <p className="text-sm text-ink-500 mt-1 max-w-lg">{req.reason}</p>}
              <p className="text-xs text-ink-400 mt-2">
                Created {new Date(req.createdAt).toLocaleString()}
                {req.fulfilledAt && ` · Fulfilled ${new Date(req.fulfilledAt).toLocaleString()}`}
              </p>
            </div>
          </div>

          {isHospital && req.status === 'OPEN' && req.hospitalId === user.userId && (
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={cancel} className="btn-secondary">Cancel</button>
              <button onClick={fulfill} className="btn-success">
                <CheckCircle2 className="h-4 w-4" /> Mark fulfilled
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Donor-only accept/decline panel */}
      {isDonor && myMatch && myMatch.status === 'PENDING' && (
        <div className="card-elev p-6 mb-6 bg-gradient-to-br from-brand-50 to-white border-brand-200">
          <h2 className="text-lg font-bold text-ink-900 mb-2">Your action is needed</h2>
          {myMatch.aiReasoning && (
            <p className="text-sm text-ink-600 mb-4 italic">
              <Brain className="inline h-3.5 w-3.5 mr-1 text-brand-600" />
              "{myMatch.aiReasoning}"
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={() => decline(myMatch.id)} className="btn-secondary">
              <XCircle className="h-4 w-4" /> Decline
            </button>
            <button onClick={() => accept(myMatch.id)} className="btn-success">
              <CheckCircle2 className="h-4 w-4" /> Accept
            </button>
          </div>
        </div>
      )}

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-brand-600" />
          <h2 className="text-xl font-bold text-ink-900">Matched donors</h2>
          <span className="chip bg-brand-50 text-brand-700">{req.matches?.length || 0}</span>
        </div>

        {(!req.matches || req.matches.length === 0) ? (
          <div className="card p-12 text-center text-ink-500">No matched donors yet.</div>
        ) : (
          <div className="space-y-3">
            {req.matches.map((m, idx) => (
              <MatchRow key={m.id} match={m} idx={idx} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MatchRow({ match, idx }) {
  const statusColors = {
    PENDING: 'bg-warn-500/10 text-warn-600',
    ACCEPTED: 'bg-success-500/10 text-success-700',
    DECLINED: 'bg-ink-200 text-ink-600',
    DONATED: 'bg-brand-50 text-brand-700',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            #{idx + 1}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-ink-900">Donor {match.donorId.slice(0, 8)}</p>
              <span className="chip bg-ink-100 text-ink-700">
                <MapPin className="h-3 w-3" /> {match.distanceKm?.toFixed(1) || '—'} km
              </span>
              <span className="chip bg-success-500/10 text-success-700">
                <Award className="h-3 w-3" /> {Math.round(match.matchScore || 0)}/100
              </span>
            </div>
            {match.aiReasoning && (
              <p className="text-sm text-ink-600 mt-2 italic">"{match.aiReasoning}"</p>
            )}
          </div>
        </div>
        <span className={`chip ${statusColors[match.status]} flex-shrink-0`}>{match.status}</span>
      </div>
    </div>
  );
}
