import React from 'react';
import { Home, Cpu, User, Box } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { name: 'home', path: '/', icon: Home },
    { name: 'projetos', path: '/projetos', icon: Box },
    { name: 'ai', path: '/extracao', icon: Cpu },
    { name: 'perfil', path: '/perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around items-center py-2 z-[100] pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center gap-1 ${isActive ? 'text-[#6D28D9]' : 'text-gray-400'
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
