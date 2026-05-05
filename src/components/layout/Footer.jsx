import { FiGlobe, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

const supportItems = [
  { icon: FiPhone, label: '+91 12345 67890' },
  { icon: FiMail, label: 'support@sellerinsight.in' },
  { icon: FiGlobe, label: 'meematrix.com' },
  { icon: FiMapPin, label: 'Surat, Gujarat 395001' },
];

export default function Footer() {
  return (
    <footer className="relative mt-8 border-t border-slate-200 bg-white text-slate-900">
      <div className="mx-auto max-w-[1600px] px-4 py-4 relative z-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 rounded-full bg-primary" />
            <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400">Seller Insight Hub</span>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {supportItems.map(({ icon: Icon, label }) => (
              <div key={label} className="group flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-1.5 transition-all hover:bg-white hover:shadow-sm">
                <Icon size={12} className="text-primary/70" />
                <span className="text-[0.65rem] font-bold text-slate-500">{label}</span>
              </div>
            ))}
          </div>

          <div className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-slate-400">
            &copy; {new Date().getFullYear()} Seller Insight CRM. v2.0.4
          </div>
        </div>
      </div>
    </footer>
  );
}
