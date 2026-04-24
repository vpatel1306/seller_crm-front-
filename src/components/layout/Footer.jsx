import { FiGlobe, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

const supportItems = [
  { icon: FiPhone, label: '+91 12345 67890' },
  { icon: FiMail, label: 'support@sellerinsight.in' },
  { icon: FiGlobe, label: 'meematrix.com' },
  { icon: FiMapPin, label: 'Surat, Gujarat 395001' },
];

export default function Footer() {
  return (
    <footer className="relative mt-10 border-t border-white/40 bg-[#111827] text-white mt-auto">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="grid w-full gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8">
        <div>
          <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.28em] text-primary/80">Seller Insight</div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight">A cleaner CRM workspace for modern marketplace operations.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Unified reporting, SKU control, return handling, and payout visibility for growing seller teams.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {supportItems.map(({ icon: Icon, label }) => (
            <div key={label} className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-200">
                <Icon size={16} className="text-primary" />
                <span>{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-[0.68rem] font-bold uppercase tracking-[0.26em] text-slate-400">
        Copyright {new Date().getFullYear()} Seller Insight CRM
      </div>
    </footer>
  );
}
