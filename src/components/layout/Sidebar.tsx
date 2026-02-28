import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Ticket, 
  ShoppingCart, 
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  
  const adminLinks = [
    { name: 'Tổng quan', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Đại lý', path: '/admin/agents', icon: <Users className="w-5 h-5" /> },
    { name: 'Mã giảm giá', path: '/admin/coupons', icon: <Ticket className="w-5 h-5" /> },
    { name: 'Đơn hàng', path: '/admin/orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { name: 'Cấu hình', path: '/admin/config', icon: <Settings className="w-5 h-5" /> },
  ];

  const agentLinks = [
    { name: 'Tổng quan', path: '/agent', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Mã giảm giá', path: '/agent/coupons', icon: <Ticket className="w-5 h-5" /> },
    { name: 'Đơn hàng', path: '/agent/orders', icon: <ShoppingCart className="w-5 h-5" /> },
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : agentLinks;

  return (
    <div className="w-64 h-full bg-slate-900 text-white flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-xl font-bold">Jiudi Manager</h1>
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
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
