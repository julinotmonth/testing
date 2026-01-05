import { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  CreditCard,
  FileText,
  ChevronRight,
  Check,
  Trash2,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../services/api';

const UserNotification = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const dropdownRef = useRef(null);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationsAPI.getMyNotifications();
      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when dropdown opens
  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'claims') return n.type?.includes('claim');
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationsAPI.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.type?.includes('claim') && notification.reference_id) {
      navigate('/claim/status', { state: { claimId: notification.reference_id } });
    } else if (notification.type?.includes('verification') && notification.reference_id) {
      navigate('/verification/status', { state: { verificationId: notification.reference_id } });
    }
    
    setIsOpen(false);
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'claim_submitted':
        return { icon: FileText, color: 'blue', gradient: 'from-blue-500 to-blue-600' };
      case 'claim_verified':
        return { icon: CheckCircle, color: 'indigo', gradient: 'from-indigo-500 to-indigo-600' };
      case 'claim_processing':
        return { icon: RefreshCw, color: 'amber', gradient: 'from-amber-500 to-orange-500' };
      case 'claim_approved':
        return { icon: CheckCircle, color: 'green', gradient: 'from-green-500 to-green-600' };
      case 'claim_completed':
        return { icon: CreditCard, color: 'emerald', gradient: 'from-emerald-500 to-teal-600' };
      case 'claim_rejected':
        return { icon: XCircle, color: 'red', gradient: 'from-red-500 to-red-600' };
      case 'verification_approved':
        return { icon: CheckCircle, color: 'green', gradient: 'from-green-500 to-green-600' };
      case 'verification_rejected':
        return { icon: XCircle, color: 'red', gradient: 'from-red-500 to-red-600' };
      default:
        return { icon: Info, color: 'gray', gradient: 'from-gray-500 to-gray-600' };
    }
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return 'Baru saja';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Baru saja';
    
    const now = new Date();
    const diffMs = now - date;
    
    if (diffMs < 0) return 'Baru saja';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
      green: { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
      red: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
      gray: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-500' }
    };
    return colors[color] || colors.gray;
  };

  const FilterButton = ({ value, label, count }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
        filter === value
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
      {count > 0 && (
        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
          filter === value ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-700'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all duration-300 ${
          isOpen 
            ? 'bg-blue-100 text-blue-600 shadow-lg shadow-blue-200/50' 
            : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 shadow-md hover:shadow-lg'
        }`}
      >
        <Bell className="w-5 h-5" />
        
        {/* Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white text-[11px] font-bold rounded-full shadow-lg"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Notifikasi</h3>
                    <p className="text-blue-100 text-xs">
                      {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <FilterButton value="all" label="Semua" count={notifications.length} />
                <FilterButton value="unread" label="Belum Dibaca" count={unreadCount} />
                <FilterButton value="claims" label="Klaim" count={notifications.filter(n => n.type?.includes('claim')).length} />
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="py-12 text-center">
                  <RefreshCw className="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin" />
                  <p className="text-gray-500 text-sm">Memuat notifikasi...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Tidak ada notifikasi</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {filter === 'all' ? 'Belum ada pemberitahuan' : 'Tidak ada notifikasi di kategori ini'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredNotifications.map((notification, index) => {
                    const { icon: Icon, color, gradient } = getNotificationIcon(notification.type);
                    const colorClasses = getColorClasses(color);

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleNotificationClick(notification)}
                        className={`group px-4 py-3.5 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                          !notification.is_read ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`relative flex-shrink-0 w-11 h-11 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                            <Icon className="w-5 h-5 text-white" />
                            {!notification.is_read && (
                              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className={`font-semibold text-sm ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </h4>
                                <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                              </div>
                              <button
                                onClick={(e) => deleteNotification(notification.id, e)}
                                className="p-1 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                            
                            {/* Meta Info */}
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${colorClasses.bg} ${colorClasses.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${colorClasses.dot}`} />
                                {notification.type?.replace('claim_', '').replace('verification_', '').replace('_', ' ')}
                              </span>
                              <span className="text-gray-400 text-[11px]">
                                {formatTime(notification.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <button
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                      unreadCount > 0 
                        ? 'text-blue-600 hover:text-blue-700' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    Tandai semua dibaca
                  </button>
                  <button
                    onClick={() => {
                      navigate('/notifications');
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Lihat Semua
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserNotification;