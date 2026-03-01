import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f0f2f5] max-w-md mx-auto relative pb-20 shadow-xl overflow-x-hidden">
      <Outlet />
      <BottomNav />
    </div>
  );
}
