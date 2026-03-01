import { Home, Package, CheckCircle2, Building2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { name: 'lar', path: '/', icon: Home },
    { name: 'vip', path: '/vip', icon: Package },
    { name: 'reprodução', path: '/reproducao', icon: CheckCircle2 },
    { name: 'eu', path: '/perfil', icon: Building2 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 z-50 max-w-md mx-auto">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center gap-1 ${isActive ? 'text-[#0000A5]' : 'text-gray-400'
              }`}
          >
            <item.icon className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} />
            <span className={`text-[10px] ${isActive ? 'font-bold' : ''}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
