import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  Calendar,
  RefreshCw,
  Eye,
  Download,
  CreditCard
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { claimsAPI } from '../services/api';
import toast from 'react-hot-toast';

const ClaimHistory = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const response = await claimsAPI.getMyClaims();
      if (response.success) {
        setClaims(response.data || []);
      } else {
        toast.error(response.message || 'Gagal memuat riwayat klaim');
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error('Gagal memuat riwayat klaim');
    } finally {
      setLoading(false);
    }
  };

  // Filter claims
  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      claim.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.nik?.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Status statistics
  const statusStats = {
    all: claims.length,
    pending: claims.filter(c => c.status === 'pending').length,
    verified: claims.filter(c => c.status === 'verified').length,
    processing: claims.filter(c => c.status === 'processing').length,
    approved: claims.filter(c => c.status === 'approved').length,
    completed: claims.filter(c => c.status === 'completed').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'verified': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'processing': return <RefreshCw className="w-5 h-5 text-indigo-500" />;
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'completed': return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Menunggu Verifikasi',
      verified: 'Dokumen Terverifikasi',
      processing: 'Sedang Diproses',
      approved: 'Disetujui',
      completed: 'Selesai',
      rejected: 'Ditolak'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleViewDetail = (claim) => {
    setSelectedClaim(claim);
    setShowDetailModal(true);
  };

  const StatusFilterButton = ({ value, label, count }) => (
    <button
      onClick={() => setStatusFilter(value)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        statusFilter === value
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      {label}
      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
        statusFilter === value ? 'bg-white/20' : 'bg-gray-100'
      }`}>
        {count}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-600 rounded-xl">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Riwayat Klaim</h1>
              <p className="text-gray-600">Lihat semua riwayat pengajuan klaim Anda</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Card className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('all')}>
            <p className="text-2xl font-bold text-gray-800">{statusStats.all}</p>
            <p className="text-xs text-gray-500">Total Klaim</p>
          </Card>
          <Card className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('pending')}>
            <p className="text-2xl font-bold text-yellow-600">{statusStats.pending}</p>
            <p className="text-xs text-gray-500">Menunggu</p>
          </Card>
          <Card className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('verified')}>
            <p className="text-2xl font-bold text-blue-600">{statusStats.verified}</p>
            <p className="text-xs text-gray-500">Terverifikasi</p>
          </Card>
          <Card className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('processing')}>
            <p className="text-2xl font-bold text-indigo-600">{statusStats.processing}</p>
            <p className="text-xs text-gray-500">Diproses</p>
          </Card>
          <Card className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('approved')}>
            <p className="text-2xl font-bold text-green-600">{statusStats.approved}</p>
            <p className="text-xs text-gray-500">Disetujui</p>
          </Card>
          <Card className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('completed')}>
            <p className="text-2xl font-bold text-emerald-600">{statusStats.completed}</p>
            <p className="text-xs text-gray-500">Selesai</p>
          </Card>
          <Card className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('rejected')}>
            <p className="text-2xl font-bold text-red-600">{statusStats.rejected}</p>
            <p className="text-xs text-gray-500">Ditolak</p>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan ID Klaim, Nama, atau NIK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Refresh Button */}
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={fetchClaims}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2 mt-4">
            <StatusFilterButton value="all" label="Semua" count={statusStats.all} />
            <StatusFilterButton value="pending" label="Menunggu" count={statusStats.pending} />
            <StatusFilterButton value="processing" label="Diproses" count={statusStats.processing} />
            <StatusFilterButton value="approved" label="Disetujui" count={statusStats.approved} />
            <StatusFilterButton value="completed" label="Selesai" count={statusStats.completed} />
            <StatusFilterButton value="rejected" label="Ditolak" count={statusStats.rejected} />
          </div>
        </Card>

        {/* Claims List */}
        {loading ? (
          <Card className="p-12 text-center">
            <RefreshCw className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Memuat riwayat klaim...</p>
          </Card>
        ) : filteredClaims.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {claims.length === 0 ? 'Belum Ada Klaim' : 'Tidak Ditemukan'}
            </h3>
            <p className="text-gray-600 mb-6">
              {claims.length === 0 
                ? 'Anda belum pernah mengajukan klaim. Ajukan klaim pertama Anda sekarang!'
                : 'Tidak ada klaim yang sesuai dengan filter pencarian Anda.'
              }
            </p>
            {claims.length === 0 && (
              <Button onClick={() => navigate('/claim/form')}>
                Ajukan Klaim Baru
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredClaims.map((claim) => (
              <Card 
                key={claim.id} 
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewDetail(claim)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left - Claim Info */}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      claim.status === 'completed' ? 'bg-emerald-100' :
                      claim.status === 'approved' ? 'bg-green-100' :
                      claim.status === 'rejected' ? 'bg-red-100' :
                      claim.status === 'processing' ? 'bg-indigo-100' :
                      'bg-yellow-100'
                    }`}>
                      {getStatusIcon(claim.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800">{claim.id}</h3>
                        <StatusBadge status={claim.status} />
                      </div>
                      <p className="text-gray-600 text-sm">{claim.fullName}</p>
                      <p className="text-gray-500 text-xs">NIK: {claim.nik}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(claim.submittedAt)}
                        </span>
                        {claim.estimatedCost && (
                          <span className="font-medium text-gray-700">
                            {formatCurrency(claim.estimatedCost)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right - Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(claim);
                      }}
                    >
                      Detail
                    </Button>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Progress</span>
                    <span>{getStatusLabel(claim.status)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        claim.status === 'rejected' ? 'bg-red-500' :
                        claim.status === 'completed' ? 'bg-emerald-500' :
                        claim.status === 'approved' ? 'bg-green-500' :
                        claim.status === 'processing' ? 'bg-indigo-500 w-3/5' :
                        claim.status === 'verified' ? 'bg-blue-500 w-2/5' :
                        'bg-yellow-500 w-1/5'
                      }`}
                      style={{
                        width: claim.status === 'rejected' ? '100%' :
                               claim.status === 'completed' ? '100%' :
                               claim.status === 'approved' ? '80%' :
                               claim.status === 'processing' ? '60%' :
                               claim.status === 'verified' ? '40%' : '20%'
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Detail Klaim"
          size="lg"
        >
          {selectedClaim && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-xl ${
                selectedClaim.status === 'completed' ? 'bg-emerald-50 border border-emerald-200' :
                selectedClaim.status === 'approved' ? 'bg-green-50 border border-green-200' :
                selectedClaim.status === 'rejected' ? 'bg-red-50 border border-red-200' :
                selectedClaim.status === 'processing' ? 'bg-indigo-50 border border-indigo-200' :
                'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedClaim.status)}
                  <div>
                    <p className="font-semibold text-gray-800">{getStatusLabel(selectedClaim.status)}</p>
                    {selectedClaim.adminNotes && (
                      <p className="text-sm text-gray-600 mt-1">{selectedClaim.adminNotes}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Claim ID */}
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Nomor Klaim</p>
                <p className="text-2xl font-bold text-blue-600">{selectedClaim.id}</p>
              </div>

              {/* Data Diri */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Data Diri
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Nama Lengkap</p>
                    <p className="font-medium">{selectedClaim.fullName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">NIK</p>
                    <p className="font-medium">{selectedClaim.nik || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">No. Telepon</p>
                    <p className="font-medium">{selectedClaim.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Alamat</p>
                    <p className="font-medium">{selectedClaim.address || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Data Kejadian */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Data Kejadian
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Tanggal Kejadian</p>
                    <p className="font-medium">{formatDate(selectedClaim.incidentDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Waktu</p>
                    <p className="font-medium">{selectedClaim.incidentTime || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Lokasi</p>
                    <p className="font-medium">{selectedClaim.incidentLocation || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Kronologi</p>
                    <p className="font-medium">{selectedClaim.incidentDescription || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Info Bank */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Informasi Rekening
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Bank</p>
                    <p className="font-medium">{selectedClaim.bankName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">No. Rekening</p>
                    <p className="font-medium">{selectedClaim.accountNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Atas Nama</p>
                    <p className="font-medium">{selectedClaim.accountHolderName || '-'}</p>
                  </div>
                  {selectedClaim.estimatedCost && (
                    <div>
                      <p className="text-gray-500">Estimasi Biaya</p>
                      <p className="font-medium text-green-600">{formatCurrency(selectedClaim.estimatedCost)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transfer Info (if completed) */}
              {selectedClaim.status === 'completed' && selectedClaim.transferAmount && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Informasi Transfer
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-emerald-600">Jumlah Transfer</p>
                      <p className="font-bold text-emerald-800 text-lg">{formatCurrency(selectedClaim.transferAmount)}</p>
                    </div>
                    <div>
                      <p className="text-emerald-600">Tanggal Transfer</p>
                      <p className="font-medium text-emerald-800">{formatDate(selectedClaim.transferDate)}</p>
                    </div>
                    {selectedClaim.transferNotes && (
                      <div className="col-span-2">
                        <p className="text-emerald-600">Catatan</p>
                        <p className="font-medium text-emerald-800">{selectedClaim.transferNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Timeline
                </h4>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Diajukan</span>
                    <span>{formatDate(selectedClaim.submittedAt)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Terakhir Diperbarui</span>
                    <span>{formatDate(selectedClaim.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDetailModal(false)}
                >
                  Tutup
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate('/claim/status');
                  }}
                >
                  Cek Status Terbaru
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ClaimHistory;