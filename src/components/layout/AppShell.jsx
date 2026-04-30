import Navbar from './Navbar';
import Footer from './Footer';
import Breadcrumbs from './Breadcrumbs';

export default function AppShell({ children, mainClassName = '' }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg flex flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px]" />
      <Navbar />
      <main className={`relative z-10 w-full px-3 py-3 sm:px-6 sm:py-5 lg:px-6 lg:py-5 flex-1 ${mainClassName}`}>
        <div className="max-w-[1700px] mx-auto">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
