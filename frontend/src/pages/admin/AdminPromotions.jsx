import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints';
import { useToastStore } from '../../store/useToastStore';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import {
  Percent,
  Trash2,
  CheckCircle,
  XCircle,
  Tag,
  Building2,
  Calendar,
} from 'lucide-react';

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [promoToDelete, setPromoToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToastStore();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getPromotions();
      setPromotions(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load promotions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (promo) => {
    try {
      setActionLoading(true);
      await adminApi.togglePromotion(promo.id);
      toast.success('Promotion status updated.');
      fetchPromotions();
    } catch (err) {
      toast.error('Failed to update promotion.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!promoToDelete) return;
    try {
      setActionLoading(true);
      await adminApi.deletePromotion(promoToDelete.id);
      toast.success('Promotion removed.');
      setPromoToDelete(null);
      fetchPromotions();
    } catch (err) {
      toast.error('Failed to delete promotion.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Active Promotions & Discounts</h2>
          <p className="text-xs text-slate-400">
            Discounts and special travel offers offered by registered partner businesses.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-900 rounded-3xl animate-pulse" />
          ))
        ) : promotions.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            No promotions active.
          </div>
        ) : (
          promotions.map((p) => {
            const isActive = p.status === 'active';
            return (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {p.discount}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{p.title}</h3>
                  <p className="text-xs text-emerald-400 font-semibold mb-2">{p.business?.name}</p>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {p.description}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 text-xs flex items-center justify-between">
                    <span className="text-slate-400">Promo Code:</span>
                    <span className="font-mono font-bold text-amber-400">{p.promo_code || 'N/A'}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Expires {p.end_date}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggle(p)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => setPromoToDelete(p)}
                      className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog
        isOpen={!!promoToDelete}
        title="Delete Promotion?"
        message="This discount deal will be removed immediately from public listings."
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setPromoToDelete(null)}
      />
    </div>
  );
}
