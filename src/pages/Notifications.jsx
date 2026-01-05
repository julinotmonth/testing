import { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  CreditCard,
  FileText,
  RefreshCw,
  Check,
  Trash2,
  Filter,
  Search,
  Info,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationsAPI.getMyNotifications();
      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Gagal memuat notifikasi');
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search
  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'unread' && !n.is_read) ||
      (filter === 'claims' && n.type?.includes('claim')) ||
      (filter === 'verifications' && n.type?.includes('verification'));
    
    const matchesSearch = 
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Mark as read
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
      toast.success('Semua notifikasi ditandai sudah dibaca');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Gagal menandai notifikasi');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notifikasi dihapus');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Gagal menghapus notifikasi');
    }
  };

  // Delete all read notifications
  const deleteAllRead = async () => {
    try {
      const readIds = notifications.filter(n => n.is_read).map(n => n.id);
      for (const id of readIds) {
        await notificationsAPI.delete(id);
      }
      setNotifications(prev => prev.filter(n => !n.is_read));
      toast.success('Notifikasi yang sudah dibaca dihapus');
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      toast.error('Gagal menghapus notifikasi');
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    if (notification.type?.includes('claim') && notification.reference_id) {
      navigate('/claim/status', { state: { claimId: notification.reference_id } });
    } else if (notification.type?.includes('verification') && notification.reference_id) {
      navigate('/verification/status', { state: { verificationId: notification.reference_id } });
    }
  };

  // Get icon based on notification type
  const getNotificationStyle = (type) => {
    switch (type) {
      case 'claim_submitted':
        return { icon: FileText, bgColor: 'bg-blue-100', iconColor: 'text-blue-600', borderColor: 'border-blue-200' };
      case 'claim_verified':
        return { icon: CheckCircle, bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600', borderColor: 'border-indigo-200' };
      case 'claim_processing':
        return { icon: RefreshCw, bgColor: 'bg-amber-100', iconColor: 'text-amber-600', borderColor: 'border-amber-200' };
      case 'claim_approved':
        return { icon: CheckCircle, bgColor: 'bg-green-100', iconColor: 'text-green-600', borderColor: 'border-green-200' };
      case 'claim_completed':
        return { icon: CreditCard, bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600', borderColor: 'border-emerald-200' };
      case 'claim_rejected':
        return { icon: XCircle, bgColor: 'bg-red-100', iconColor: 'text-red-600', borderColor: 'border-red-200' };
      case 'verification_approved':
        return { icon: CheckCircle, bgColor: 'bg-green-100', iconColor: 'text-green-600', borderColor: 'border-green-200' };
      case 'verification_rejected':
        return { icon: XCircle, bgColor: 'bg-red-100', iconColor: 'text-red-600', borderColor: 'border-red-200' };
      default:
        return { icon: Info, bgColor: 'bg-gray-100', iconColor: 'text-gray-600', borderColor: 'border-gray-200' };
    }
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const FilterButton = ({ value, label, count }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        filter === value
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      {label}
      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
        filter === value ? 'bg-white/20' : 'bg-gray-100'
      }`}>
        {count}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Notifikasi</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 
                    ? `${unreadCount} notifikasi belum dibaca`
                    : 'Semua notifikasi sudah dibaca'
                  }
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={fetchNotifications}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari notifikasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <FilterButton value="all" label="Semua" count={notifications.length} />
            <FilterButton value="unread" label="Belum Dibaca" count={unreadCount} />
            <FilterButton value="claims" label="Klaim" count={notifications.filter(n => n.type?.includes('claim')).length} />
            <FilterButton value="verifications" label="Verifikasi" count={notifications.filter(n => n.type?.includes('verification')).length} />
          </div>

          {/* Bulk Actions */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className={`flex items-center gap-2 text-sm font-medium ${
                  unreadCount > 0 ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                Tandai semua sudah dibaca
              </button>
              <button
                onClick={deleteAllRead}
                disabled={notifications.filter(n => n.is_read).length === 0}
                className={`flex items-center gap-2 text-sm font-medium ${
                  notifications.filter(n => n.is_read).length > 0 
                    ? 'text-red-600 hover:text-red-700' 
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                Hapus yang sudah dibaca
              </button>
            </div>
          )}
        </Card>

        {/* Notifications List */}
        {loading ? (
          <Card className="p-12 text-center">
            <RefreshCw className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Memuat notifikasi...</p>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Tidak Ada Notifikasi</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Belum ada pemberitahuan untuk Anda.'
                : 'Tidak ada notifikasi di kategori ini.'
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const style = getNotificationStyle(notification.type);
              const Icon = style.icon;

              return (
                <Card 
                  key={notification.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    !notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl ${style.bgColor}`}>
                      <Icon className={`w-6 h-6 ${style.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                            {!notification.is_read && (
                              <span className="ml-2 inline-flex w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            )}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {notification.message}
                          </p>
                          <p className="text-gray-400 text-xs mt-2">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {formatTime(notification.created_at)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Tandai sudah dibaca"
                            >
                              <Check className="w-4 h-4 text-blue-600" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Hapus notifikasi"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;