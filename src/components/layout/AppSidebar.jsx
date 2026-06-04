import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiDatabase, FiBox, FiPrinter, FiRotateCcw, FiDownload, FiBarChart2, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import logoImage from '../../assets/logo.jpg';

export default function AppSidebar() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState({
        main: true,
        master: true,
        orders: true,
        report: true
    });

    useEffect(() => {
        const handleToggle = () => setIsOpen(prev => !prev);
        window.addEventListener('toggle-sidebar', handleToggle);
        return () => window.removeEventListener('toggle-sidebar', handleToggle);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const toggleMenu = (menu) => {
        setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const navItemClass = ({ isActive }) =>
        "flex items-center gap-3 px-3 py-2 mx-2 rounded-inner font-semibold text-sm transition-all duration-200 " +

        (isActive
            ? 'bg-primary text-white shadow-sm shadow-primary/20'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900');

    const GroupHeader = ({ title, menuId }) => (
        <div
            className="flex items-center justify-between px-5 py-3 cursor-pointer text-[0.65rem] font-bold text-slate-400 tracking-[0.2em] hover:text-slate-600 transition-colors mt-4"

            onClick={() => toggleMenu(menuId)}
        >
            <span>{title}</span>
            {openMenus[menuId] ? <FiChevronDown size={14} className="opacity-50" /> : <FiChevronRight size={14} className="opacity-50" />}
        </div>
    );

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[1050] bg-slate-900/40 backdrop-blur-sm lg:hidden animate-fade-in"
                    onClick={() => setIsOpen(false)}
                />
            )}
            <aside className={`fixed inset-y-0 left-0 z-[1100] w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.02)] lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

            <div className="flex h-16 items-center px-5 border-b border-slate-100 bg-white">
                <img src={logoImage} alt="MeeMatrix logo" className="h-8 object-contain" />
            </div>

            <div className="flex-1 overflow-y-auto pb-6 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200">
                {/* Main */}
                <div className="mb-2">
                    <GroupHeader title="MAIN" menuId="main" />
                    {openMenus.main && (
                        <div className="flex flex-col gap-1 mt-1">
                            <NavLink to="/dashboard" className={navItemClass}>
                                <FiHome size={18} />
                                <span>Dashboard</span>
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Master */}
                <div className="mb-2">
                    <GroupHeader title="MASTER" menuId="master" />
                    {openMenus.master && (
                        <div className="flex flex-col gap-1 mt-1">
                            <NavLink to="/account" className={navItemClass}>
                                <FiDatabase size={18} />
                                <span>Account</span>
                            </NavLink>
                            <NavLink to="/sku-list" className={navItemClass}>
                                <FiBox size={18} />
                                <span>SKU</span>
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Orders */}
                <div className="mb-2">
                    <GroupHeader title="ORDERS" menuId="orders" />
                    {openMenus.orders && (
                        <div className="flex flex-col gap-1 mt-1">
                            <NavLink to="/pick-up-entry" className={navItemClass}>
                                <FiPrinter size={18} />
                                <span>Label (Pickup Entry)</span>
                            </NavLink>
                            <NavLink to="/return-entry-account-wise" className={navItemClass}>
                                <FiRotateCcw size={18} />
                                <span>Return</span>
                            </NavLink>
                            <NavLink to="/daily-import" className={navItemClass}>
                                <FiDownload size={18} />
                                <span>Daily Import</span>
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Report */}
                <div className="mb-2">
                    <GroupHeader title="REPORT" menuId="report" />
                    {openMenus.report && (
                        <div className="flex flex-col gap-1 mt-1">
                            <NavLink to="/sku-report" className={navItemClass}>
                                <FiBarChart2 size={18} />
                                <span>SKU Report</span>
                            </NavLink>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50">

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
                    <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Support</div>
                    <div className="mt-1 text-xs font-semibold text-slate-700">Meematrix CRM. v1.0.0</div>
                </div>
            </div>
        </aside>
      </>
    );
}
