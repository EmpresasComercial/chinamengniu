import React, { SVGProps } from 'react';
import { Home, CheckCircle2, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const CowIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    viewBox="0 0 24 24" 
    fill={props.fill || "none"}
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={props.className}
  >
    <path d="M12 5c-3.3 0-6 2.7-6 6v2l-1 1v1c0 1.1.9 2 2 2h2v4h2v-4h4v4h2v-4h2c1.1 0 2-.9 2-2v-1l-1-1v-2c0-3.3-2.7-6-6-6z" />
    <circle cx="9" cy="10" r="1" />
    <circle cx="15" cy="10" r="1" />
    <path d="M11 13h2" />
    <path d="M4 8l2 1" />
    <path d="M20 8l-2 1" />
  </svg>
);

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { name: 'home', path: '/', icon: Home },
    { name: 'fazenda', path: '/vip', icon: CowIcon },
    { name: 'reprodução', path: '/reproducao', icon: CheckCircle2 },
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
