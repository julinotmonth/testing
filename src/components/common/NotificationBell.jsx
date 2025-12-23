import { useState, useEffect, useRef } from 'react';
import { Bell, X, FileText, CheckCircle, Clock, CreditCard, ChevronRight, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBell = ({ claims = [], verifications = [], onSelectClaim, onSelectVerification }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState(() => {
    const saved = localStorage.getItem('readNotifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState('all'); // all, unread, claims, verifications
  const dropdownRef = useRef(null);

  // Generate notifications from claims and verifications
  const notifications = [
    // Klaim baru (pending)
    ...claims
      .filter(c => c.status === 'pending')
      .map(c => ({
        id: `claim-new-${c.id}`,
        type: 'claim_new',
        title: 'Klaim Baru Masuk',
        message: `${c.full_name || 'Seseorang'} mengajukan klaim santunan`,
        time: c.created_at,
        data: c,
        icon: FileText,
        color: 'blue',
        gradient: 'from-blue-500 to-blue-600'
      })),
    // Verifikasi baru (pending)
    ...verifications
      .filter(v => v.status === 'pending')
      .map(v => ({
        id: `verif-new-${v.id}`,
        type: 'verification_new',
        title: 'Verifikasi Dokumen Baru',
        message: `${v.full_name || 'Seseorang'} mengajukan verifikasi`,
        time: v.created_at,
        data: v,
        icon: CheckCircle,
        color: 'emerald',
        gradient: 'from-emerald-500 to-emerald-600'
      })),
    // Klaim dalam proses
    ...claims
      .filter(c => c.status === 'processing')
      .map(c => ({
        id: `claim-process-${c.id}`,
        type: 'claim_processing',
        title: 'Klaim Dalam Proses',
        message: `Klaim ${c.claim_number || `#${c.id}`} sedang diproses`,
        time: c.updated_at || c.created_at,
        data: c,
        icon: Clock,
        color: 'amber',
        gradient: 'from-amber-500 to-orange-500'
      })),
    // Klaim approved menunggu transfer
    ...claims
      .filter(c => c.status === 'approved' && !c.transfer_proof)
      .map(c => ({
        id: `claim-transfer-${c.id}`,
        type: 'claim_transfer',
        title: 'Menunggu Transfer',
        message: `Klaim ${c.claim_number || `#${c.id}`} perlu bukti transfer`,
        time: c.updated_at || c.created_at,
        data: c,
        icon: CreditCard,
        color: 'purple',
        gradient: 'from-purple-500 to-violet-600'
      })),
  ].sort((a, b) => {
    // Handle invalid dates - put items without valid dates at the end
    const dateA = new Date(a.time);
    const dateB = new Date(b.time);
    const isValidA = !isNaN(dateA.getTime());
    const isValidB = !isNaN(dateB.getTime());
    
    if (!isValidA && !isValidB) return 0;
    if (!isValidA) return 1;
    if (!isValidB) return -1;
    return dateB - dateA;
  });

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !readNotifications.includes(n.id);
    if (filter === 'claims') return n.type.startsWith('claim');
    if (filter === 'verifications') return n.type.startsWith('verif');
    return true;
  });

  const unreadCount = notifications.filter(n => !readNotifications.includes(n.id)).length;

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

  // Save read notifications to localStorage
  useEffect(() => {
    localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
  }, [readNotifications]);

  const markAsRead = (notificationId) => {
    if (!readNotifications.includes(notificationId)) {
      setReadNotifications([...readNotifications, notificationId]);
    }
  };

  const markAllAsRead = () => {
    setReadNotifications(notifications.map(n => n.id));
  };

  const clearAllNotifications = () => {
    // Clear all read notifications from localStorage
    localStorage.removeItem('readNotifications');
    setReadNotifications([]);
    // Close the dropdown after clearing
    setIsOpen(false);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.type.startsWith('claim') && onSelectClaim) {
      onSelectClaim(notification.data);
    } else if (notification.type.startsWith('verif') && onSelectVerification) {
      onSelectVerification(notification.data);
    }
    setIsOpen(false);
  };

  const formatTime = (dateString) => {
    // Handle null, undefined, or empty string
    if (!dateString) return 'Baru saja';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Baru saja';
    }
    
    const now = new Date();
    const diffMs = now - date;
    
    // Handle future dates or negative diff
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
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
        dot: 'bg-blue-500'
      },
      emerald: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-200',
        iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        dot: 'bg-emerald-500'
      },
      amber: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-200',
        iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
        dot: 'bg-amber-500'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
        dot: 'bg-purple-500'
      }
    };
    return colors[color] || colors.blue;
  };

  const FilterButton = ({ value, label, count }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
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
                <FilterButton value="claims" label="Klaim" count={notifications.filter(n => n.type.startsWith('claim')).length} />
                <FilterButton value="verifications" label="Verifikasi" count={notifications.filter(n => n.type.startsWith('verif')).length} />
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[400px] overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Tidak ada notifikasi</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {filter === 'all' ? 'Belum ada aktivitas baru' : 'Tidak ada notifikasi di kategori ini'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredNotifications.map((notification, index) => {
                    const isRead = readNotifications.includes(notification.id);
                    const colorClasses = getColorClasses(notification.color);
                    const Icon = notification.icon;

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleNotificationClick(notification)}
                        className={`group px-4 py-3.5 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                          !isRead ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`relative flex-shrink-0 w-11 h-11 ${colorClasses.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
                            <Icon className="w-5 h-5 text-white" />
                            {!isRead && (
                              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className={`font-semibold text-sm ${!isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </h4>
                                <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                            </div>
                            
                            {/* Meta Info */}
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${colorClasses.bg} ${colorClasses.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${colorClasses.dot}`} />
                                {notification.type === 'claim_new' && 'Klaim Baru'}
                                {notification.type === 'verification_new' && 'Verifikasi'}
                                {notification.type === 'claim_processing' && 'Proses'}
                                {notification.type === 'claim_transfer' && 'Transfer'}
                              </span>
                              <span className="text-gray-400 text-[11px]">
                                {formatTime(notification.time)}
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
                    onClick={clearAllNotifications}
                    className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors hover:bg-red-50 px-2 py-1 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Bersihkan
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

export default NotificationBell;