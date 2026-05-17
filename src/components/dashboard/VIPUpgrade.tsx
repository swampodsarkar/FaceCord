import { useState } from 'react';
import { Crown, Check, Shield, Gem, Star } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { db } from '../../firebase/config';
import { ref, update } from 'firebase/database';
import { rateLimit } from '../../lib/rateLimit';

export default function VIPUpgrade() {
  const { user, vipTier, setVipTier } = useAppStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'Basic VIP',
      price: '99৳',
      period: '/month',
      icon: Star,
      color: 'from-blue-500 to-cyan-500',
      features: [
        'HD Voice (High Bitrate)',
        'Create up to 5 Rooms',
        'Upload up to 1 Min Clips',
        'VIP Badge (Blue)',
        'Custom Username Color'
      ]
    },
    {
      id: 'pro',
      name: 'Pro VIP',
      price: '199৳',
      period: '/month',
      icon: Crown,
      color: 'from-fuchsia-500 to-pink-500',
      popular: true,
      features: [
        'Everything in Basic',
        'Noise Cancellation High Level',
        'Create Unlimited Rooms',
        'Upload up to 3 Min Clips',
        'Room Background Music',
        'VIP Badge (Red)',
        'Animated Avatar Frame',
        'AI Gaming Assistant'
      ]
    },
    {
      id: 'clan',
      name: 'Clan VIP',
      price: '299৳',
      period: '/month',
      icon: Gem,
      color: 'from-amber-400 to-orange-500',
      features: [
        'Everything in Pro',
        'Room Capacity: 100 Users',
        'Upload HD 5 Min Clips',
        'VIP Badge (Gold)',
        'RGB Glowing Profile Border',
        'Tournament Access',
        'Room Boost System',
        'Paid Private Rooms (Monetization)'
      ]
    }
  ];

  const handleSubscribe = (plan: any) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const confirmPayment = async () => {
    if (!selectedPlan || !user) return;
    if (!rateLimit('vip-subscribe', 5000)) {
      alert('Please wait before trying again');
      return;
    }
    setProcessing(true);

    try {
      await update(ref(db, `users/${user.uid}`), {
        vipTier: selectedPlan.id,
        vipSince: Date.now()
      });
      
      setVipTier(selectedPlan.id);
      setShowCheckout(false);
      setSelectedPlan(null);
    } catch (e) {
      console.error('Payment failed', e);
    }
    setProcessing(false);
  };

  const limitations = [
    {
      title: 'Free Plan Limits',
      icon: Shield,
      items: [
        'Max 5-8 people per voice room',
        'Voice Quality: Normal',
        'Only Text Chat (No GIFs/Stickers)',
        'Max clip length: 15 seconds (720p)',
        '1 Public Room only',
        'Auto-delete clips after 7 days'
      ]
    }
  ];

  return (
    <div className="flex-1 bg-[#151921] rounded-3xl border border-white/5 p-6 md:p-8 flex flex-col h-full overflow-y-auto custom-scrollbar relative">
      <div className="text-center mb-10 mt-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500 drop-shadow-lg mb-4">
          Upgrade to VIP Elite
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Unlock the ultimate gaming experience. Get high-quality voice, longer clips, AI moderation, custom profiles, and much more.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full mb-12">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative bg-[#0B0E14] border-2 rounded-3xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-2 cursor-pointer ${
              vipTier === plan.id ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.2)]' : 'border-white/5 hover:border-white/20'
            }`}
            onClick={() => setVipTier(plan.id as any)}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-pink-500/30">
                Most Popular
              </div>
            )}
            
            {vipTier === plan.id && (
              <div className="absolute -top-4 right-4 bg-amber-400 text-black text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg shadow-amber-400/30 flex items-center gap-1">
                <Check className="w-3 h-3" /> Active
              </div>
            )}

            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 shadow-lg`}>
              <plan.icon className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-white font-black text-xl uppercase tracking-wider mb-2">{plan.name}</h3>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-black text-white">{plan.price}</span>
              <span className="text-slate-400 font-bold mb-1">{plan.period}</span>
            </div>

            <div className="flex-1 flex flex-col gap-3 mb-8">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="bg-white/10 rounded-full p-0.5 shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-slate-300 text-sm font-medium leading-tight">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              className={`w-full py-3 rounded-xl font-black uppercase tracking-widest transition-all ${
                vipTier === plan.id 
                  ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.3)]' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (vipTier !== plan.id) handleSubscribe(plan);
              }}
            >
              {vipTier === plan.id ? 'Your Plan' : 'Subscribe & Pay'}
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto w-full bg-red-500/10 border border-red-500/20 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center">
        <div className="shrink-0 w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
          <Shield className="w-10 h-10 text-red-500" />
        </div>
        <div>
          <h3 className="text-red-400 font-black text-xl uppercase tracking-wider mb-2">Free Plan Limitations</h3>
          <p className="text-slate-400 text-sm mb-4">You are currently subject to the following limits on the free plan.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {limitations[0].items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>
                <span className="text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
          {vipTier !== 'free' && (
            <button 
              onClick={() => setVipTier('free')}
              className="mt-6 text-sm text-red-400 font-bold hover:text-red-300 transition-colors cursor-pointer border border-red-500/20 px-4 py-2 rounded-lg"
            >
              Revert to Free Plan (Demo)
            </button>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#0B0E14] border border-white/10 rounded-3xl p-8 w-full max-w-md">
            <h3 className="text-2xl font-black mb-2">Confirm Payment</h3>
            <p className="text-slate-400 mb-6">You are subscribing to <span className="text-white font-bold">{selectedPlan.name}</span></p>
            
            <div className="bg-white/5 p-4 rounded-2xl mb-6">
              <div className="flex justify-between text-lg">
                <span>Total</span>
                <span className="font-black">{selectedPlan.price}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Billed monthly • Cancel anytime</div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setShowCheckout(false); setSelectedPlan(null); }}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={confirmPayment}
                disabled={processing}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 font-black text-black"
              >
                {processing ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-500 mt-4">Demo payment — updates your VIP status instantly</p>
          </div>
        </div>
      )}
    </div>
  );
}
