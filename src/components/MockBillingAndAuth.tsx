import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, Mail, Check, AlertCircle } from 'lucide-react';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
  initialPlan?: PlanType;
}

type PlanType = 'free' | 'pro' | 'studio';

interface PlanDetails {
  id: PlanType;
  name: string;
  price: string;
  priceValue: number;
  description: string;
  features: string[];
  badge?: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
}

export const MockBillingAndAuth: React.FC<BillingModalProps> = ({ isOpen, onClose, onUpgradeSuccess, initialPlan }) => {
  const [email, setEmail] = useState('');
  const [authStep, setAuthStep] = useState<'signin' | 'stripe' | 'activated'>('signin');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pro');
  const [loading, setLoading] = useState(false);
  const [stripeCardName, setStripeCardName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialPlan) {
      setSelectedPlan(initialPlan);
      setError(null);
    }
  }, [isOpen, initialPlan]);

  if (!isOpen) return null;

  const plans: PlanDetails[] = [
    {
      id: 'free',
      name: 'Free Basic',
      price: '$0/mo',
      priceValue: 0,
      description: 'Start crafting your basic web portfolio.',
      features: [
        'Standard templates access',
        'Basic local draft storage',
        'Standard badge footer',
        'Essential editing tools'
      ],
      colorClass: 'text-slate-400',
      borderClass: 'border-slate-800',
      bgClass: 'bg-slate-950/40'
    },
    {
      id: 'pro',
      name: 'Pro Portfolio',
      price: '$9/mo',
      priceValue: 9,
      description: 'The standard for creators and devs.',
      features: [
        'Georgia Editorial & Brutalism Templates',
        'Frictionless badge footer removal option',
        'Unlimited live subdomains on Edge CDN',
        'Advanced customizable layouts & stack'
      ],
      badge: 'Popular',
      colorClass: 'text-amber-400',
      borderClass: 'border-amber-500/40',
      bgClass: 'bg-amber-950/10'
    },
    {
      id: 'studio',
      name: 'Studio Team',
      price: '$24/mo',
      priceValue: 24,
      description: 'Collaborative controls & rich features.',
      features: [
        'All Pro & premium templates unlocked',
        'Interactive feedback layers',
        'Priority high-performance storage',
        'Workspace Google Drive syncing'
      ],
      badge: 'Studio',
      colorClass: 'text-indigo-400',
      borderClass: 'border-indigo-500/40',
      bgClass: 'bg-indigo-950/10'
    }
  ];

  const currentPlan = plans.find(p => p.id === selectedPlan) || plans[1];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    setError(null);
    setLoading(true);
    // Simulate Supabase login request
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setAuthStep('stripe');
  };

  const handleStripePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlan !== 'free' && !stripeCardName.trim()) {
      setError('Please write Cardholder Name.');
      return;
    }
    setError(null);
    setLoading(true);
    // Simulate Stripe payment intent completion
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);
    setAuthStep('activated');
  };

  const handleCompletion = () => {
    onUpgradeSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-y-auto max-h-[90vh] shadow-2xl relative">
        
        {/* Close absolute */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-slate-500 hover:text-white font-bold text-xs cursor-pointer z-10"
        >
          ✕ Close
        </button>

        {/* Auth Step 1: Sign-in */}
        {authStep === 'signin' && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-11 h-11 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20">
                <Mail className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Create your Folio Account</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Sign up with email to securely host and customize your portfolios. Conforms to standard Supabase Auth credentials.
              </p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full text-sm p-3 bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 flex items-center gap-1.5 justify-center">
                  <AlertCircle className="w-3.5 h-3.5" /> {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Configure Auth & Proceed'}
              </button>
            </form>

            <div className="border-t border-slate-800/80 pt-4 text-center">
              <button
                onClick={() => setAuthStep('stripe')}
                className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider hover:underline"
              >
                Skip authentication to Payment flow ➔
              </button>
            </div>
          </div>
        )}

        {/* Auth Step 2: Stripe Billing details */}
        {authStep === 'stripe' && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-11 h-11 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                <CreditCard className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Select your Plan & Subscribe</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Toggle between available subscription tiers below. Try standard Pro or team Studio levels anytime.
              </p>
            </div>

            {/* Interactive Package Selector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {plans.map((p) => {
                const isSelected = selectedPlan === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlan(p.id);
                      setError(null);
                    }}
                    className={`relative text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? `bg-slate-950 border-indigo-500 ring-2 ring-indigo-500/30`
                        : `${p.bgClass} ${p.borderClass} hover:border-slate-700`
                    }`}
                  >
                    {p.badge && (
                      <span className={`absolute top-2 right-2 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        p.id === 'pro' ? 'bg-amber-400 text-slate-900' : 'bg-indigo-500 text-white'
                      }`}>
                        {p.badge}
                      </span>
                    )}
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">{p.name}</div>
                      <div className="text-lg font-black text-white">{p.price}</div>
                      <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">{p.description}</p>
                    </div>

                    <div className="mt-3 border-t border-slate-800/60 pt-2.5">
                      <div className="text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">Includes:</div>
                      <ul className="space-y-1">
                        {p.features.slice(0, 2).map((f, idx) => (
                          <li key={idx} className="flex items-start gap-1 text-[9px] text-slate-350 leading-relaxed">
                            <Check className="w-2.5 h-2.5 shrink-0 mt-0.5 text-indigo-400" />
                            <span className="truncate">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Price-specific forms */}
            <form onSubmit={handleStripePayment} className="space-y-4 border-t border-slate-800/60 pt-5">
              {selectedPlan !== 'free' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={stripeCardName}
                      onChange={(e) => setStripeCardName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full text-xs p-3 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value="••••   ••••   ••••   4242"
                        className="w-full text-xs p-3 bg-slate-950 border border-slate-850 text-slate-500 rounded-xl select-none"
                      />
                      <CreditCard className="w-4 h-4 text-slate-600 absolute right-3.5 top-3.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500">EXPIRATION</span>
                      <input
                        type="text"
                        disabled
                        value="12 / 28"
                        className="w-full text-xs p-2.5 bg-slate-950 border border-slate-850 text-slate-500 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500">CVC</span>
                      <input
                        type="text"
                        disabled
                        value="•••"
                        className="w-full text-xs p-2.5 bg-slate-950 border border-slate-850 text-slate-500 rounded-xl"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-slate-950/60 border border-slate-855 rounded-2xl p-4 text-center">
                  <p className="text-xs text-slate-400 leading-normal">
                    You have selected the <strong className="text-white">Free Basic Plan</strong>. No payment card details are needed. Proceed below to flag your portal with essential tiers.
                  </p>
                </div>
              )}

              {error && (
                <p className="text-xs text-red-400 flex items-center gap-1.5 justify-center">
                  <AlertCircle className="w-3.5 h-3.5" /> {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 shadow-md ${
                  selectedPlan === 'free'
                    ? 'bg-slate-800 hover:bg-slate-700 text-white shadow'
                    : selectedPlan === 'studio'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950'
                }`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : selectedPlan === 'free' ? (
                  'Activate Free Plan'
                ) : (
                  `Confirm Subscription (${currentPlan.price})`
                )}
              </button>
            </form>

            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              Payments are simulated through Stripe billing integrations. Actual cards will never be billed. Cancel anytime.
            </p>
          </div>
        )}

        {/* Step 3: Activated Successfully representation */}
        {authStep === 'activated' && (
          <div className="p-8 space-y-6 text-center animate-fade-in">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">✨ Plan Activated!</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                You subscribed successfully to the <strong className="text-indigo-400">{currentPlan.name}</strong> tier. Your live credentials have been updated and synced.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850/60 text-left space-y-2">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">Unlocked Addons for {currentPlan.name}</p>
              <div className="space-y-1.5">
                {currentPlan.features.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-slate-350">
                    <Check className="w-3.5 h-3.5 mt-0.5 text-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleCompletion}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Return to Workspace
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
