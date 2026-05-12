import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bell, Check, Inbox } from 'lucide-react';
import { notificationApi } from '../api/notification.api.js';
import Loader from '../components/Loader.jsx';

const TYPE_LABELS = {
  MATCH_FOUND: { label: 'Match found', tint: 'bg-brand-50 text-brand-700' },
  DONOR_ACCEPTED: { label: 'Donor accepted', tint: 'bg-success-500/10 text-success-700' },
  REQUEST_FULFILLED: { label: 'Fulfilled', tint: 'bg-success-500/10 text-success-700' },
};

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { setItems(await notificationApi.list()); }
    catch { toast.error('Could not load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    try { await notificationApi.markRead(id); load(); }
    catch { toast.error('Could not update'); }
  };

  const markAll = async () => {
    try {
      await Promise.all(items.filter((i) => !i.read).map((i) => notificationApi.markRead(i.id)));
      toast.success('All marked as read');
      load();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900">Notifications</h1>
          <p className="text-ink-500 mt-1">Stay on top of every match, acceptance and fulfillment.</p>
        </div>
        {items.some((i) => !i.read) && (
          <button onClick={markAll} className="btn-secondary text-sm">
            <Check className="h-4 w-4" /> Mark all as read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
            <Inbox className="h-7 w-7" />
          </div>
          <p className="font-semibold text-ink-900">You're all caught up</p>
          <p className="text-sm text-ink-500 mt-1">New alerts will show up here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const type = TYPE_LABELS[n.type] || { label: n.type, tint: 'bg-ink-100 text-ink-700' };
            const Card = n.relatedRequestId ? Link : 'div';
            const cardProps = n.relatedRequestId ? { to: `/requests/${n.relatedRequestId}` } : {};
            return (
              <Card
                key={n.id}
                {...cardProps}
                className={`card p-4 flex items-start gap-4 transition-colors ${
                  !n.read ? 'border-brand-200 bg-brand-50/40' : ''
                } ${n.relatedRequestId ? 'hover:shadow-elev cursor-pointer' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Bell className="h-5 w-5" />
                  </div>
                  {!n.read && <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-brand-600 ring-2 ring-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`chip ${type.tint} text-[10px]`}>{type.label}</span>
                    <span className="text-xs text-ink-400">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  <p className={`font-semibold mt-1 ${!n.read ? 'text-ink-900' : 'text-ink-700'}`}>{n.title}</p>
                  {n.message && <p className="text-sm text-ink-600 mt-0.5">{n.message}</p>}
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); markRead(n.id); }}
                    className="text-xs text-ink-500 hover:text-ink-700 underline-offset-2 hover:underline flex-shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
