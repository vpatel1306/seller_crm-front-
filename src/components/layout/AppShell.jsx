import Navbar from './Navbar';
import Footer from './Footer';

export default function AppShell({ children, mainClassName = '' }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg flex flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px]" />
      <Navbar />
      <main className={`relative z-10 w-full px-2 py-2 sm:px-4 sm:py-3 lg:px-4 lg:py-3 flex-1 ${mainClassName}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
