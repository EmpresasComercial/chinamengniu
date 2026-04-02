import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5] max-w-md mx-auto shadow-xl relative overflow-hidden">
      <main className="flex-1 overflow-y-auto scrollable">
        <div className="page-content">
          <Outlet />
        </div>
        <div className="h-20" /> {/* Espaço para o BottomNav */}
      </main>
      <BottomNav />
    </div>
  );
}
