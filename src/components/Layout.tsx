import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5] max-w-md mx-auto  relative overflow-hidden">
      <main className="flex-1 overflow-y-auto scrollable pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
        <div className="page-content min-h-full">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
