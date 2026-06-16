import React, { useState } from 'react';
import axios from 'axios';
import { CreditCard, X, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const PaymentModal = ({ isOpen, onClose, amount, parcelId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('card');

  if (!isOpen) return null;

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const cfg = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`http://localhost:5000/api/parcels/pay/${parcelId}`, {}, cfg);
      toast.success('Payment successful!');
      onSuccess();
      onClose();
    } catch {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-md overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <CreditCard className="w-5 h-5 text-primary-600" />
            Complete Payment
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Amount Due</p>
            <p className="text-4xl font-black text-slate-900">Rs. {amount?.toLocaleString()}</p>
          </div>

          <form onSubmit={handlePay} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { id: 'card', label: 'Credit Card', icon: '💳' },
                { id: 'easypaisa', label: 'EasyPaisa', icon: '📱' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    method === m.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{m.icon}</span>
                  <span className="text-xs font-bold">{m.label}</span>
                </button>
              ))}
            </div>

            {method === 'card' && (
              <div className="space-y-3">
                <input required placeholder="Card Number" className="input-field font-mono" maxLength={16} />
                <div className="grid grid-cols-2 gap-3">
                  <input required placeholder="MM/YY" className="input-field text-center font-mono" maxLength={5} />
                  <input required placeholder="CVC" type="password" className="input-field text-center font-mono" maxLength={3} />
                </div>
                <input required placeholder="Cardholder Name" className="input-field" />
              </div>
            )}

            {method === 'easypaisa' && (
              <div className="space-y-3">
                <input required placeholder="Mobile Account Number (03XX-XXXXXXX)" className="input-field font-mono" />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-4 text-base">
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              ) : (
                <><ShieldCheck className="w-5 h-5" /> Pay Rs. {amount?.toLocaleString()}</>
              )}
            </button>
            <p className="text-center text-[10px] font-semibold text-slate-400 mt-3 uppercase tracking-widest flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Secure Encrypted Payment
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
