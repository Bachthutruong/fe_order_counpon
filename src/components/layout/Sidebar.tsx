import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Ticket, 
  ShoppingCart, 
  LogOut,
  BarChart3
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  
  const adminLinks = [
    { name: '總覽', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: '經銷商', path: '/admin/agents', icon: <Users className="w-5 h-5" /> },
    { name: '折扣碼', path: '/admin/coupons', icon: <Ticket className="w-5 h-5" /> },
    { name: '訂單', path: '/admin/orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { name: '營收統計', path: '/admin/revenue-stats', icon: <BarChart3 className="w-5 h-5" /> },
    { name: '設定', path: '/admin/config', icon: <Settings className="w-5 h-5" /> },
  ];

  const agentLinks = [
    { name: '總覽', path: '/agent', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: '折扣碼', path: '/agent/coupons', icon: <Ticket className="w-5 h-5" /> },
    { name: '訂單', path: '/agent/orders', icon: <ShoppingCart className="w-5 h-5" /> },
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : agentLinks;

  return (
    <div className="w-64 h-full bg-slate-900 text-white flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-xl font-bold">Jiudi 管理系統</h1>
      </div>
      <div className="flex-1 py-4">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.path}>
              <NavLink 
                to={link.path}
                className={({ isActive }) => 
                  `flex items-center space-x-3 px-4 py-3 hover:bg-slate-800 transition-colors ${isActive ? 'bg-slate-800 text-blue-400 border-r-4 border-blue-500' : 'text-slate-300'}`
                }
                end={link.path === '/admin' || link.path === '/agent'}
              >
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={logout}
          className="flex items-center space-x-3 text-slate-300 hover:text-white transition-colors w-full px-4 py-2"
        >
          <LogOut className="w-5 h-5" />
          <span>登出</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
