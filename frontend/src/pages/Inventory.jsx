import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Minus, Save } from 'lucide-react';
import { hospitalApi } from '../api/hospital.api.js';
import { BLOOD_GROUPS, bgLabel } from '../utils/bloodGroup.js';
import Loader from '../components/Loader.jsx';

function colorFor(units) {
  if (units === 0) return { border: 'border-brand-300', text: 'text-brand-700', accent: 'from-brand-500 to-brand-700', label: 'Empty' };
  if (units < 5) return { border: 'border-warn-500/40', text: 'text-warn-600', accent: 'from-amber-400 to-amber-600', label: 'Low' };
  return { border: 'border-success-500/40', text: 'text-success-700', accent: 'from-success-500 to-success-700', label: 'Good' };
}

export default function Inventory() {
  const [inv, setInv] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addAmounts, setAddAmounts] = useState({});

  const load = async () => {
    try { setInv(await hospitalApi.inventory()); }
    catch { toast.error('Could not load inventory'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (id) => {
    const units = Number(addAmounts[id] || 0);
    if (units <= 0) return toast.error('Enter a positive number');
    try {
      await hospitalApi.addUnits(id, units);
      toast.success(`Added ${units} units`);
      setAddAmounts((s) => ({ ...s, [id]: '' }));
      load();
    } catch { toast.error('Update failed'); }
  };

  const handleUse = async (id) => {
    const units = Number(addAmounts[id] || 0);
    if (units <= 0) return toast.error('Enter a positive number');
    try {
      await hospitalApi.useUnits(id, units);
      toast.success(`Deducted ${units} units`);
      setAddAmounts((s) => ({ ...s, [id]: '' }));
      load();
    } catch (e) { toast.error(e.response?.data?.error || 'Update failed'); }
  };

  if (loading) return <Loader />;

  const map = Object.fromEntries(inv.map((i) => [i.bloodGroup, i]));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink-900">Blood inventory</h1>
        <p className="text-ink-500 mt-1">Track and adjust stock across all 8 blood groups.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {BLOOD_GROUPS.map((bg) => {
          const item = map[bg.value];
          const units = item?.unitsAvailable || 0;
          const c = colorFor(units);
          return (
            <div key={bg.value} className={`card border-2 ${c.border} overflow-hidden`}>
              <div className={`h-1.5 bg-gradient-to-r ${c.accent}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`text-2xl font-extrabold ${c.text}`}>{bgLabel(bg.value)}</div>
                  <span className={`chip bg-ink-100 ${c.text}`}>{c.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-5xl font-extrabold ${c.text}`}>{units}</span>
                  <span className="text-xs text-ink-500">units</span>
                </div>

                {item && (
                  <div className="mt-4 space-y-2">
                    <input
                      type="number"
                      min="1"
                      value={addAmounts[item.id] || ''}
                      onChange={(e) => setAddAmounts((s) => ({ ...s, [item.id]: e.target.value }))}
                      placeholder="Units"
                      className="input"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleUse(item.id)} className="btn-secondary text-xs px-2 py-1.5">
                        <Minus className="h-3.5 w-3.5" /> Use
                      </button>
                      <button onClick={() => handleAdd(item.id)} className="btn-primary text-xs px-2 py-1.5">
                        <Plus className="h-3.5 w-3.5" /> Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-xs text-ink-500 text-center">
        Updated automatically when requests are fulfilled.
      </div>
    </div>
  );
}
