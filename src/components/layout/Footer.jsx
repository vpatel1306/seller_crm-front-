import { FiPhone, FiMail, FiGlobe, FiCalendar, FiClock, FiFileText, FiHelpCircle, FiRefreshCw, FiShoppingBag, FiMapPin } from 'react-icons/fi';
import { SiFlipkart } from 'react-icons/si';
import { TbBuildingStore } from 'react-icons/tb';

const activation = {
  renewDate: '16 Mar 2026',
  expireDate: '15 Mar 2027',
  leftDays: 344,
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 font-sans mt-auto border-t border-white/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mt-64" />

      <div className="max-w-[1600px] mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 relative z-10">

        {/* Col 1 — Logo */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 group">
            <div className="bg-primary/20 p-2.5 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/10">
              <TbBuildingStore size={32} className="text-primary" />
            </div>
            <div>
              <div className="text-xl font-black text-white tracking-tight uppercase leading-tight">Meesho Seller</div>
              <div className="text-[0.65rem] font-bold text-primary tracking-[0.3em] uppercase opacity-70">Insight CRM</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed max-w-[200px] font-medium opacity-60">Empowering sellers with smart insights & real-time analytics for exponential growth.</p>
        </div>

        {/* Col 2 — Site Info */}
        <div className="space-y-6">
          <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/10 pb-2">Location & Hub</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3 group cursor-pointer">
              <FiMapPin size={16} className="text-primary mt-0.5 shrink-0" />
              <span className="text-sm font-medium group-hover:text-white transition-colors">Surat, Gujarat — 395001</span>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <FiMail size={16} className="text-primary shrink-0" />
              <span className="text-sm font-medium group-hover:text-white transition-colors">support@sellerinsight.in</span>
            </div>
            <div className="flex items-center gap-3 group">
              <FiGlobe size={16} className="text-primary shrink-0" />
              <a href="https://sellerinsight.in" target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-white hover:underline transition-all">www.sellerinsight.in</a>
            </div>
          </div>
        </div>

        {/* Col 3 — Contact + Platforms */}
        <div className="space-y-6">
          <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/10 pb-2">Support & Channels</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FiPhone size={14} className="text-primary shrink-0" />
              <span className="text-sm font-mono">+91 12345 67890</span>
            </div>
            <div className="flex items-center gap-3">
              <FiPhone size={14} className="text-primary shrink-0" />
              <span className="text-sm font-mono">+91 11111 22222</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <a href="https://meesho.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/5 active:scale-95">
              <FiShoppingBag size={12} className="text-pink-500" /> Meesho
            </a>
            <a href="https://myntra.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/5 active:scale-95">
              <FiShoppingBag size={12} className="text-fuchsia-500" /> Myntra
            </a>
            <a href="https://flipkart.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/5 active:scale-95">
              <SiFlipkart size={12} className="text-blue-500" /> Flipkart
            </a>
          </div>
        </div>

        {/* Col 4 — Activation Info */}
        <div className="space-y-6">
          <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/10 pb-2">Subscription Info</h4>
          <div className="space-y-5">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                <FiRefreshCw size={18} />
              </div>
              <div>
                <div className="text-[0.6rem] font-bold uppercase tracking-widest opacity-40">Renew Date</div>
                <div className="text-sm font-bold text-gray-200">{activation.renewDate}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                <FiCalendar size={18} />
              </div>
              <div>
                <div className="text-[0.6rem] font-bold uppercase tracking-widest opacity-40">Expire Date</div>
                <div className="text-sm font-bold text-gray-200">{activation.expireDate}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                <FiClock size={18} />
              </div>
              <div>
                <div className="text-[0.6rem] font-bold uppercase tracking-widest opacity-40">Days Remaining</div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  {activation.leftDays} days
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Col 5 — Buttons */}
        <div className="space-y-6">
          <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/10 pb-2">Service Panel</h4>
          <div className="flex flex-col gap-3">
            <button className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:border-primary transition-all active:scale-95 shadow-2xl">
              <FiFileText size={16} className="text-primary" />
              GST Invoices
            </button>
            <button className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-br from-indigo-600 to-primary border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-primary/20">
              <FiHelpCircle size={16} />
              Self Help Hub
            </button>
          </div>
        </div>

      </div>

      <div className="border-t border-white/5 py-8 bg-black/40">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[0.65rem] font-bold uppercase tracking-widest opacity-40">
          <span>© {new Date().getFullYear()} Seller Insight Pro. Build v4.0.2</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">License Agreement</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
