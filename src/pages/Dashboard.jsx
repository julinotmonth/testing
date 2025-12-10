import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FileText, Users, CheckCircle, Clock, Search, Eye, X, ThumbsUp, ThumbsDown, Download, File, Upload, CreditCard } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { claimsAPI, verificationsAPI, statsAPI } from '../services/api';
import { formatFileSize, isImageFile, isPDFFile } from '../utils/fileHelper';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('claims'); // 'claims' or 'verifications'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [claims, setClaims] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  
  // Transfer proof states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferProofFile, setTransferProofFile] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [uploadingTransfer, setUploadingTransfer] = useState(false);
  
  const itemsPerPage = 10;
  
  // API base URL for file access
  const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  // Helper to get document by type from documents array
  const getDocumentByType = (documents, type) => {
    if (!documents || !Array.isArray(documents)) return null;
    return documents.find(doc => doc.documentType === type);
  };

  // Document type labels
  const documentLabels = {
    ktp: 'KTP',
    police_report: 'Surat Keterangan Polisi',
    stnk: 'STNK',
    medical_report: 'Surat Keterangan Medis'
  };

  // Load data from API
  useEffect(() => {
    loadClaims();
    loadVerifications();
    loadStats();
  }, []);

  const loadClaims = async () => {
    try {
      const response = await claimsAPI.getAll();
      if (response.success) {
        setClaims(response.data.claims || []);
      }
    } catch (error) {
      console.error('Load claims error:', error);
    }
  };

  const loadVerifications = async () => {
    try {
      const response = await verificationsAPI.getAll();
      if (response.success) {
        setVerifications(response.data.verifications || []);
      }
    } catch (error) {
      console.error('Load verifications error:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await statsAPI.getDashboard();
      if (response.success) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  // Calculate statistics
  const stats = [
    {
      icon: FileText,
      label: 'Total Klaim',
      value: claims.length.toString(),
      color: 'blue',
      change: '+12%'
    },
    {
      icon: Clock,
      label: 'Menunggu Verifikasi',
      value: claims.filter(c => c.status === 'pending').length.toString(),
      color: 'yellow',
      change: '-5%'
    },
    {
      icon: CheckCircle,
      label: 'Disetujui',
      value: claims.filter(c => c.status === 'approved').length.toString(),
      color: 'green',
      change: '+8%'
    },
    {
      icon: Users,
      label: 'Dalam Proses',
      value: claims.filter(c => c.status === 'processing').length.toString(),
      color: 'purple',
      change: '+15%'
    }
  ];

  // Mock chart data
  const chartData = [
    { name: 'Jan', klaim: 65, disetujui: 58 },
    { name: 'Feb', klaim: 78, disetujui: 70 },
    { name: 'Mar', klaim: 90, disetujui: 85 },
    { name: 'Apr', klaim: 105, disetujui: 98 },
    { name: 'May', klaim: 120, disetujui: 110 },
    { name: 'Jun', klaim: 98, disetujui: 92 }
  ];

  const handleViewDetail = (claim) => {
    setSelectedClaim(claim);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (claimId, newStatus) => {
    try {
      const response = await claimsAPI.updateStatus(claimId, { 
        status: newStatus,
        adminNotes: adminNotes 
      });
      if (response.success) {
        toast.success(`Status klaim berhasil diupdate menjadi ${newStatus}`);
        loadClaims();
        setShowDetailModal(false);
        setAdminNotes('');
      } else {
        toast.error(response.message || 'Gagal mengupdate status klaim');
      }
    } catch (error) {
      console.error('Update error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal mengupdate status klaim';
      toast.error(errorMessage);
    }
  };

  // Transfer proof handlers
  const handleOpenTransferModal = (claim) => {
    setSelectedClaim(claim);
    setTransferProofFile(null);
    setTransferAmount(claim.estimatedCost || '');
    setTransferDate(new Date().toISOString().split('T')[0]);
    setTransferNotes('');
    setShowTransferModal(true);
  };

  const handleTransferFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }
      setTransferProofFile(file);
    }
  };

  const handleUploadTransferProof = async () => {
    if (!transferProofFile) {
      toast.error('Pilih file bukti transfer');
      return;
    }
    if (!transferAmount) {
      toast.error('Masukkan jumlah transfer');
      return;
    }

    setUploadingTransfer(true);
    try {
      const formData = new FormData();
      formData.append('transferProof', transferProofFile);
      formData.append('transferAmount', transferAmount);
      formData.append('transferDate', transferDate);
      formData.append('transferNotes', transferNotes);

      const response = await claimsAPI.uploadTransferProof(selectedClaim.id, formData);
      
      if (response.success) {
        toast.success('Bukti transfer berhasil diupload');
        loadClaims();
        setShowTransferModal(false);
        setShowDetailModal(false);
      } else {
        toast.error(response.message || 'Gagal upload bukti transfer');
      }
    } catch (error) {
      console.error('Upload transfer proof error:', error);
      toast.error('Gagal upload bukti transfer');
    } finally {
      setUploadingTransfer(false);
    }
  };

  const handleViewFile = (fileData, fileName) => {
    if (!fileData) {
      toast.error('File tidak tersedia');
      return;
    }
    setSelectedFile({ ...fileData, displayName: fileName });
    setShowFileModal(true);
  };

  const handleDownloadFile = (fileData, fileName) => {
    if (!fileData || !fileData.data) {
      toast.error('File tidak tersedia');
      return;
    }

    // Create download link
    const link = document.createElement('a');
    link.href = fileData.data;
    link.download = fileData.name || fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('File berhasil diunduh');
  };

  const handleViewVerification = (verification) => {
    setSelectedVerification(verification);
    setAdminNotes('');
    setShowVerificationModal(true);
  };

  const handleApproveVerification = async (verificationId) => {
    try {
      const response = await verificationsAPI.updateStatus(verificationId, {
        status: 'approved',
        adminNotes: adminNotes
      });
      if (response.success) {
        toast.success('Verifikasi dokumen disetujui');
        loadVerifications();
        setShowVerificationModal(false);
        setAdminNotes('');
      } else {
        toast.error(response.message || 'Gagal menyetujui verifikasi');
      }
    } catch (error) {
      toast.error('Gagal menyetujui verifikasi');
      console.error('Approve error:', error);
    }
  };

  const handleRejectVerification = async (verificationId) => {
    if (!adminNotes.trim()) {
      toast.error('Mohon berikan alasan penolakan');
      return;
    }

    try {
      const response = await verificationsAPI.updateStatus(verificationId, {
        status: 'rejected',
        adminNotes: adminNotes
      });
      if (response.success) {
        toast.success('Verifikasi dokumen ditolak');
        loadVerifications();
        setShowVerificationModal(false);
        setAdminNotes('');
      } else {
        toast.error(response.message || 'Gagal menolak verifikasi');
      }
    } catch (error) {
      toast.error('Gagal menolak verifikasi');
      console.error('Reject error:', error);
    }
  };

  const handleDeleteVerification = async (verificationId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus verifikasi ini?')) {
      try {
        const response = await verificationsAPI.delete(verificationId);
        if (response.success) {
          toast.success('Verifikasi berhasil dihapus');
          loadVerifications();
          setShowVerificationModal(false);
        } else {
          toast.error(response.message || 'Gagal menghapus verifikasi');
        }
      } catch (error) {
        toast.error('Gagal menghapus verifikasi');
        console.error('Delete error:', error);
      }
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = (claim.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (claim.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || claim.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredVerifications = verifications.filter(verification => {
    const matchesSearch = (verification.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (verification.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || verification.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPages = activeTab === 'claims'
    ? Math.ceil(filteredClaims.length / itemsPerPage)
    : Math.ceil(filteredVerifications.length / itemsPerPage);

  const paginatedClaims = filteredClaims.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginatedVerifications = filteredVerifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Admin</h1>
          <p className="text-gray-600">Kelola dan pantau semua pengajuan klaim</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6" hover>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Statistik Klaim Bulanan</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="klaim" fill="#3b82f6" name="Total Klaim" />
                <Bar dataKey="disetujui" fill="#10b981" name="Disetujui" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tren Pengajuan</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="klaim" stroke="#3b82f6" strokeWidth={2} name="Klaim" />
                <Line type="monotone" dataKey="disetujui" stroke="#10b981" strokeWidth={2} name="Disetujui" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('claims');
                  setCurrentPage(1);
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'claims'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>Pengajuan Klaim ({claims.length})</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('verifications');
                  setCurrentPage(1);
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'verifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Verifikasi Dokumen ({verifications.length})</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Claims Table */}
        {activeTab === 'claims' && (
          <Card className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h3 className="text-lg font-bold text-gray-800">Daftar Pengajuan Klaim</h3>
            
            <div className="flex gap-2 w-full md:w-auto">
              <div className="flex-1 md:w-64">
                <Input
                  placeholder="Cari nomor klaim atau nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={Search}
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="processing">Processing</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">No. Klaim</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nama</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tanggal Kejadian</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Lokasi</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClaims.map((claim, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{claim.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{claim.fullName || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{claim.incidentDate || '-'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {claim.incidentLocation || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetail(claim)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-600">
                Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredClaims.length)} dari {filteredClaims.length} data
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={i}
                      variant={currentPage === pageNum ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
        )}

        {/* Verifications Table */}
        {activeTab === 'verifications' && (
          <Card className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h3 className="text-lg font-bold text-gray-800">Daftar Verifikasi Dokumen</h3>

              <div className="flex gap-2 w-full md:w-auto">
                <div className="flex-1 md:w-64">
                  <Input
                    placeholder="Cari ID atau nama..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={Search}
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID Verifikasi</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nama</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">NIK</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tanggal Submit</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVerifications.map((verification, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{verification.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{verification.fullName || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{verification.nik}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {verification.submittedAt 
                          ? new Date(verification.submittedAt).toLocaleDateString('id-ID')
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={verification.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewVerification(verification)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-gray-600">
                  Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredVerifications.length)} dari {filteredVerifications.length} data
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={i}
                        variant={currentPage === pageNum ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Detail Modal */}
        {selectedClaim && (
          <Modal
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            title="Detail Klaim"
          >
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Informasi Pemohon</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nama Lengkap</p>
                    <p className="font-medium text-gray-800">{selectedClaim.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">NIK</p>
                    <p className="font-medium text-gray-800">{selectedClaim.nik}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">No. Telepon</p>
                    <p className="font-medium text-gray-800">{selectedClaim.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Alamat</p>
                    <p className="font-medium text-gray-800">{selectedClaim.address}</p>
                  </div>
                </div>
              </div>

              {/* Incident Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Informasi Kecelakaan</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tanggal</p>
                    <p className="font-medium text-gray-800">{selectedClaim.incidentDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Waktu</p>
                    <p className="font-medium text-gray-800">{selectedClaim.incidentTime || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Lokasi</p>
                    <p className="font-medium text-gray-800">{selectedClaim.incidentLocation}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Deskripsi</p>
                    <p className="font-medium text-gray-800">{selectedClaim.incidentDescription}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Jenis Kendaraan</p>
                    <p className="font-medium text-gray-800">{selectedClaim.vehicleType || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nomor Polisi</p>
                    <p className="font-medium text-gray-800">{selectedClaim.vehicleNumber || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Medical & Hospital Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Informasi Medis & Rumah Sakit</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Nama Rumah Sakit</p>
                    <p className="font-medium text-gray-800">{selectedClaim.hospitalName || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Deskripsi Perawatan</p>
                    <p className="font-medium text-gray-800">{selectedClaim.treatmentDescription || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estimasi Biaya Perawatan</p>
                    <p className="font-medium text-gray-800">
                      {selectedClaim.estimatedCost 
                        ? `Rp ${Number(selectedClaim.estimatedCost).toLocaleString('id-ID')}` 
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bank Account Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Informasi Rekening Bank</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nama Bank</p>
                    <p className="font-medium text-gray-800">{selectedClaim.bankName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cabang</p>
                    <p className="font-medium text-gray-800">{selectedClaim.bankBranch || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nomor Rekening</p>
                    <p className="font-medium text-gray-800 font-mono">{selectedClaim.accountNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nama Pemilik Rekening</p>
                    <p className="font-medium text-gray-800">{selectedClaim.accountHolderName || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Documents with Inline Preview */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Dokumen yang Diunggah</h3>
                <div className="space-y-4">
                  {selectedClaim.documents && selectedClaim.documents.length > 0 ? (
                    selectedClaim.documents.map((doc, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between p-3 bg-gray-50">
                          <div className="flex items-center text-sm">
                            <File className="w-4 h-4 text-blue-500 mr-2" />
                            <div>
                              <p className="font-medium">{documentLabels[doc.documentType] || doc.documentType}</p>
                              <p className="text-xs text-gray-500">{doc.fileName} • {formatFileSize(doc.fileSize)}</p>
                            </div>
                          </div>
                          <a
                            href={`${API_BASE_URL}/${doc.filePath}`}
                            download={doc.fileName}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Unduh File"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                        <div className="p-2 bg-white">
                          {isImageFile(doc.fileName) ? (
                            <img
                              src={`${API_BASE_URL}/${doc.filePath}`}
                              alt={documentLabels[doc.documentType] || doc.documentType}
                              className="w-full h-auto max-h-96 object-contain"
                            />
                          ) : isPDFFile(doc.fileName) ? (
                            <iframe
                              src={`${API_BASE_URL}/${doc.filePath}`}
                              className="w-full h-96"
                              title={doc.fileName}
                            />
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <File className="w-12 h-12 mx-auto mb-2" />
                              <p>Preview tidak tersedia</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Tidak ada dokumen</p>
                  )}
                </div>
              </div>

              {/* Current Status */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Status Saat Ini</h3>
                <StatusBadge status={selectedClaim.status} />
              </div>

              {/* Transfer Proof Section - Show if exists */}
              {selectedClaim.transferProofPath && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Bukti Transfer
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Jumlah Transfer</p>
                      <p className="font-bold text-green-700 text-lg">
                        Rp {Number(selectedClaim.transferAmount || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Transfer</p>
                      <p className="font-medium text-gray-800">{selectedClaim.transferDate || '-'}</p>
                    </div>
                    {selectedClaim.transferNotes && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Catatan</p>
                        <p className="font-medium text-gray-800">{selectedClaim.transferNotes}</p>
                      </div>
                    )}
                  </div>
                  <div className="border border-green-300 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-green-100">
                      <span className="text-sm font-medium text-green-800">Bukti Transfer</span>
                      <a
                        href={`${API_BASE_URL}/${selectedClaim.transferProofPath}`}
                        download
                        className="p-2 text-green-600 hover:bg-green-200 rounded-lg transition-colors"
                        title="Unduh Bukti Transfer"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="p-2 bg-white">
                      <img
                        src={`${API_BASE_URL}/${selectedClaim.transferProofPath}`}
                        alt="Bukti Transfer"
                        className="w-full h-auto max-h-64 object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Ubah Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedClaim.status === 'pending' && (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => handleUpdateStatus(selectedClaim.id, 'verified')}
                        className="flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verifikasi
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleUpdateStatus(selectedClaim.id, 'rejected')}
                        className="flex items-center justify-center"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Tolak
                      </Button>
                    </>
                  )}
                  {selectedClaim.status === 'verified' && (
                    <Button
                      variant="primary"
                      onClick={() => handleUpdateStatus(selectedClaim.id, 'processing')}
                      className="col-span-2"
                    >
                      <Clock className="w-4 h-4 mr-2 inline" />
                      Proses
                    </Button>
                  )}
                  {selectedClaim.status === 'processing' && (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => handleUpdateStatus(selectedClaim.id, 'approved')}
                        className="flex items-center justify-center"
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Setujui
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleUpdateStatus(selectedClaim.id, 'rejected')}
                        className="flex items-center justify-center"
                      >
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Tolak
                      </Button>
                    </>
                  )}
                  {selectedClaim.status === 'approved' && !selectedClaim.transferProofPath && (
                    <Button
                      variant="primary"
                      onClick={() => handleOpenTransferModal(selectedClaim)}
                      className="col-span-2 bg-green-600 hover:bg-green-700"
                    >
                      <Upload className="w-4 h-4 mr-2 inline" />
                      Upload Bukti Transfer
                    </Button>
                  )}
                  {selectedClaim.status === 'approved' && selectedClaim.transferProofPath && (
                    <div className="col-span-2 text-center text-green-600 font-medium">
                      ✓ Dana sudah ditransfer
                    </div>
                  )}
                  {selectedClaim.status === 'completed' && (
                    <div className="col-span-2 text-center text-green-600 font-medium">
                      ✓ Klaim selesai - Dana sudah ditransfer
                    </div>
                  )}
                  {selectedClaim.status === 'rejected' && (
                    <div className="col-span-2 text-center text-red-600 font-medium">
                      Klaim ditolak
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowDetailModal(false)}
                >
                  Tutup
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* File Preview Modal */}
        {selectedFile && (
          <Modal
            isOpen={showFileModal}
            onClose={() => {
              setShowFileModal(false);
              setSelectedFile(null);
            }}
            title={`Preview: ${selectedFile.displayName}`}
          >
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                <p><strong>Nama File:</strong> {selectedFile.name}</p>
                <p><strong>Ukuran:</strong> {formatFileSize(selectedFile.size)}</p>
                <p><strong>Tipe:</strong> {selectedFile.type}</p>
              </div>

              {/* File Preview */}
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                {isImageFile(selectedFile.name) ? (
                  <div className="max-h-[500px] overflow-auto flex items-center justify-center p-4">
                    <img
                      src={selectedFile.data}
                      alt={selectedFile.displayName}
                      className="max-w-full h-auto"
                    />
                  </div>
                ) : isPDFFile(selectedFile.name) ? (
                  <div className="h-[500px]">
                    <iframe
                      src={selectedFile.data}
                      className="w-full h-full"
                      title={selectedFile.displayName}
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <File className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Preview tidak tersedia untuk tipe file ini</p>
                    <Button
                      variant="primary"
                      onClick={() => handleDownloadFile(selectedFile, selectedFile.displayName)}
                    >
                      <Download className="w-4 h-4 mr-2 inline" />
                      Unduh File
                    </Button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleDownloadFile(selectedFile, selectedFile.displayName)}
                >
                  <Download className="w-4 h-4 mr-2 inline" />
                  Unduh
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowFileModal(false);
                    setSelectedFile(null);
                  }}
                >
                  Tutup
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Verification Detail Modal */}
        {selectedVerification && (
          <Modal
            isOpen={showVerificationModal}
            onClose={() => {
              setShowVerificationModal(false);
              setSelectedVerification(null);
              setAdminNotes('');
            }}
            title="Detail Verifikasi Dokumen"
          >
            <div className="space-y-6">
              {/* User Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Informasi Pemohon</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nama Lengkap</p>
                    <p className="font-medium text-gray-800">{selectedVerification.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">NIK</p>
                    <p className="font-medium text-gray-800">{selectedVerification.nik}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">No. Telepon</p>
                    <p className="font-medium text-gray-800">{selectedVerification.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-800">{selectedVerification.email || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Documents with Inline Preview */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Dokumen yang Diunggah</h3>
                <div className="space-y-4">
                  {selectedVerification.documents && selectedVerification.documents.length > 0 ? (
                    selectedVerification.documents.map((doc, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between p-3 bg-gray-50">
                          <div className="flex items-center text-sm">
                            <File className="w-4 h-4 text-blue-500 mr-2" />
                            <div>
                              <p className="font-medium">{documentLabels[doc.documentType] || doc.documentType}</p>
                              <p className="text-xs text-gray-500">{doc.fileName} • {formatFileSize(doc.fileSize)}</p>
                            </div>
                          </div>
                          <a
                            href={`${API_BASE_URL}/${doc.filePath}`}
                            download={doc.fileName}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Unduh File"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                        <div className="p-2 bg-white">
                          {isImageFile(doc.fileName) ? (
                            <img
                              src={`${API_BASE_URL}/${doc.filePath}`}
                              alt={documentLabels[doc.documentType] || doc.documentType}
                              className="w-full h-auto max-h-96 object-contain"
                            />
                          ) : isPDFFile(doc.fileName) ? (
                            <iframe
                              src={`${API_BASE_URL}/${doc.filePath}`}
                              className="w-full h-96"
                              title={doc.fileName}
                            />
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <File className="w-12 h-12 mx-auto mb-2" />
                              <p>Preview tidak tersedia</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Tidak ada dokumen</p>
                  )}
                </div>
              </div>

              {/* Current Status */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Status Verifikasi</h3>
                <StatusBadge status={selectedVerification.status} />
                {selectedVerification.reviewedBy && (
                  <div className="mt-3 text-sm text-gray-600">
                    <p>Ditinjau oleh: {selectedVerification.reviewedBy}</p>
                    <p>Tanggal: {new Date(selectedVerification.reviewedAt).toLocaleString('id-ID')}</p>
                    {selectedVerification.adminNotes && (
                      <div className="mt-2 p-3 bg-gray-50 rounded">
                        <p className="font-medium mb-1">Catatan Admin:</p>
                        <p>{selectedVerification.adminNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Admin Actions */}
              {selectedVerification.status === 'pending' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Tindakan Admin</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catatan (Opsional untuk approve, Wajib untuk reject)
                      </label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Berikan catatan tentang verifikasi dokumen..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="primary"
                        onClick={() => handleApproveVerification(selectedVerification.id)}
                        className="flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Setujui
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleRejectVerification(selectedVerification.id)}
                        className="flex items-center justify-center"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Tolak
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Close/Delete Buttons */}
              <div className="pt-4 border-t border-gray-200 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowVerificationModal(false);
                    setSelectedVerification(null);
                    setAdminNotes('');
                  }}
                >
                  Tutup
                </Button>
                {selectedVerification.status !== 'pending' && (
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteVerification(selectedVerification.id)}
                  >
                    Hapus
                  </Button>
                )}
              </div>
            </div>
          </Modal>
        )}

        {/* Transfer Proof Upload Modal */}
        {showTransferModal && selectedClaim && (
          <Modal
            isOpen={showTransferModal}
            onClose={() => setShowTransferModal(false)}
            title="Upload Bukti Transfer"
          >
            <div className="space-y-6">
              {/* Claim Info Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-2">Informasi Klaim</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">No. Klaim:</span>
                    <span className="font-medium ml-1">{selectedClaim.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Nama:</span>
                    <span className="font-medium ml-1">{selectedClaim.fullName}</span>
                  </div>
                </div>
              </div>

              {/* Bank Account Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Rekening Tujuan
                </h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Bank:</span> <span className="font-medium">{selectedClaim.bankName}</span></p>
                  <p><span className="text-gray-600">No. Rekening:</span> <span className="font-medium font-mono">{selectedClaim.accountNumber}</span></p>
                  <p><span className="text-gray-600">Nama Pemilik:</span> <span className="font-medium">{selectedClaim.accountHolderName}</span></p>
                  {selectedClaim.bankBranch && (
                    <p><span className="text-gray-600">Cabang:</span> <span className="font-medium">{selectedClaim.bankBranch}</span></p>
                  )}
                </div>
              </div>

              {/* Transfer Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Transfer (Rp) *
                  </label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="Contoh: 5000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {selectedClaim.estimatedCost && (
                    <p className="text-xs text-gray-500 mt-1">
                      Estimasi biaya perawatan: Rp {Number(selectedClaim.estimatedCost).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Transfer *
                  </label>
                  <input
                    type="date"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bukti Transfer * <span className="text-gray-500 text-xs">(JPG, PNG, PDF - Max 5MB)</span>
                  </label>
                  <input
                    type="file"
                    onChange={handleTransferFileChange}
                    accept="image/*,.pdf"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {transferProofFile && (
                    <p className="text-sm text-green-600 mt-1">✓ {transferProofFile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    placeholder="Catatan tambahan tentang transfer..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowTransferModal(false)}
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleUploadTransferProof}
                  loading={uploadingTransfer}
                >
                  <Upload className="w-4 h-4 mr-2 inline" />
                  Upload & Selesaikan Klaim
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Dashboard;