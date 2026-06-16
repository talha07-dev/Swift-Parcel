import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
  Package, LogOut, User, LayoutDashboard, Bell, MessageSquare,
  ChevronDown, Truck, Shield, X, Check, Settings
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const notifRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath =
    user?.role === 'admin' ? '/admin-dashboard' :
    user?.role === 'delivery-boy' ? '/driver-dashboard' : '/dashboard';

  // Fetch notifications & unread message count every 15 seconds
  useEffect(() => {
    if (!user) return;
    const fetchBadges = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const cfg = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const [notifRes, msgRes] = await Promise.all([
          axios.get('http://localhost:5000/api/notifications', cfg),
          axios.get('http://localhost:5000/api/messages/unread-count', cfg),
        ]);
        setNotifications(notifRes.data.slice(0, 8));
        setUnreadCount(notifRes.data.filter(n => !n.isRead).length);
        setUnreadMsgCount(msgRes.data.unreadCount || 0);
      } catch (_) {}
    };
    fetchBadges();
    const id = setInterval(fetchBadges, 15000);
    return () => clearInterval(id);
  }, [user, location]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const cfg = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put('http://localhost:5000/api/notifications/mark-all-read', {}, cfg);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (_) {}
  };

  const notifTypeColor = (type) => {
    if (type === 'booking') return 'bg-emerald-100 text-emerald-600';
    if (type === 'chat')    return 'bg-primary-100 text-primary-600';
    return 'bg-amber-100 text-amber-600';
  };

  const roleLabel = user?.role === 'admin' ? 'Admin' :
                    user?.role === 'delivery-boy' ? 'Rider' : 'Customer';
  const roleBg    = user?.role === 'admin' ? 'bg-violet-100 text-violet-700' :
                    user?.role === 'delivery-boy' ? 'bg-amber-100 text-amber-700' :
                    'bg-primary-100 text-primary-700';

  return (
    <nav className="navbar-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">Swift</span>
            <span className="text-lg font-extrabold text-primary-600 tracking-tight">Parcel</span>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {user ? (
            <>
              {/* Dashboard Link */}
              <Link
                to={dashboardPath}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  location.pathname.includes('dashboard')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              {/* Message icon (customer ↔ admin chat) */}
              {user.role !== 'delivery-boy' && (
                <Link
                  to={user.role === 'admin' ? '/admin-dashboard?tab=inbox' : '/support'}
                  className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-primary-600 transition-all"
                  title="Support Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadMsgCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadMsgCount > 9 ? '9+' : unreadMsgCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Notifications Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifDropdown(v => !v)}
                  className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-primary-600 transition-all"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-dot">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden animate-slide-up z-50">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <span className="text-sm font-bold text-slate-700">Notifications</span>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Mark all read
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-sm">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`px-4 py-3 border-b border-slate-50 flex items-start gap-3 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-primary-50/40' : ''}`}>
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${notifTypeColor(n.type)}`}>
                              {n.type === 'booking' ? '📦' : n.type === 'chat' ? '💬' : '🚚'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs leading-relaxed ${!n.isRead ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>{n.message}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(n.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 mt-1 flex-shrink-0" />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Pill */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-800 leading-none">{user.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 ${roleBg}`}>{roleLabel}</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center">
                  {user.role === 'admin' ? <Shield className="w-4 h-4 text-violet-600" /> :
                   user.role === 'delivery-boy' ? <Truck className="w-4 h-4 text-amber-600" /> :
                   <User className="w-4 h-4 text-primary-600" />}
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
