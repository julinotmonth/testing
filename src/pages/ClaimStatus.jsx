import { useState } from 'react';
import { Search, Download, Eye, Calendar, MapPin, User, Building2, CreditCard, Hospital, CheckCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import StatusBadge from '../components/common/StatusBadge';
import toast from 'react-hot-toast';
import { claimsAPI } from '../services/api';
import { generateClaimPDF } from '../utils/pdfGenerator';

const ClaimStatus = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Masukkan nomor klaim atau NIK');
      return;
    }

    setLoading(true);
    try {
      const response = await claimsAPI.search(searchQuery.trim());

      if (response.success && response.data) {
        setSearchResult(response.data);
        toast.success('Data klaim ditemukan');
      } else {
        setSearchResult(null);
        toast.error('Data klaim tidak ditemukan');
      }
    } catch (error) {
      setSearchResult(null);
      const message = error.response?.data?.message || 'Data klaim tidak ditemukan';
      toast.error(message);
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!searchResult) {
      toast.error('Tidak ada data untuk diunduh');
      return;
    }

    try {
      console.log('Generating PDF for claim:', searchResult.id);
      console.log('Claim data:', searchResult);
      generateClaimPDF(searchResult);
      toast.success('PDF berhasil diunduh!');
    } catch (error) {
      console.error('PDF generation error:', error);
      console.error('Error details:', error.message, error.stack);
      toast.error(`Gagal mengunduh PDF: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Cek Status Klaim</h1>
            <p className="text-gray-600">Pantau progress pengajuan klaim Anda secara real-time</p>
          </div>

          {/* Search Card */}
          <Card className="p-6 mb-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Masukkan Nomor Klaim (contoh: KLM-2024-1234)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button icon={Search} onClick={handleSearch} loading={loading}>
                Cari
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Masukkan nomor klaim atau NIK untuk mencari status klaim Anda
            </p>
          </Card>

          {/* Search Result */}
          {searchResult && (
            <div className="space-y-6">
              {/* Claim Info Card */}
              <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {searchResult.id}
                    </h2>
                    <StatusBadge status={searchResult.status} />
                  </div>
                  <Button variant="outline" icon={Download} size="sm" onClick={handleDownloadPDF}>
                    Download
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Nama Pemohon</p>
                      <p className="font-medium text-gray-800">{searchResult.fullName}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Tanggal Kejadian</p>
                      <p className="font-medium text-gray-800">{searchResult.incidentDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Lokasi Kejadian</p>
                      <p className="font-medium text-gray-800">{searchResult.incidentLocation}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Eye className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Nomor HP</p>
                      <p className="font-medium text-gray-800">{searchResult.phone}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Medical & Hospital Info Card */}
              {(searchResult.hospitalName || searchResult.estimatedCost) && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Hospital className="w-5 h-5 mr-2 text-red-500" />
                    Informasi Medis & Rumah Sakit
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Nama Rumah Sakit</p>
                      <p className="font-medium text-gray-800">{searchResult.hospitalName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estimasi Biaya Perawatan</p>
                      <p className="font-medium text-gray-800">
                        {searchResult.estimatedCost 
                          ? `Rp ${Number(searchResult.estimatedCost).toLocaleString('id-ID')}` 
                          : '-'}
                      </p>
                    </div>
                    {searchResult.treatmentDescription && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Deskripsi Perawatan</p>
                        <p className="font-medium text-gray-800">{searchResult.treatmentDescription}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Bank Account Info Card */}
              {searchResult.bankName && (
                <Card className="p-6 bg-blue-50 border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
                    Informasi Rekening Bank
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Nama Bank</p>
                        <p className="font-medium text-gray-800">{searchResult.bankName}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Cabang</p>
                        <p className="font-medium text-gray-800">{searchResult.bankBranch || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Nomor Rekening</p>
                        <p className="font-medium text-gray-800 font-mono">{searchResult.accountNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Nama Pemilik Rekening</p>
                        <p className="font-medium text-gray-800">{searchResult.accountHolderName}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Transfer Proof Card - Show when transfer is complete */}
              {searchResult.transferProofPath && (
                <Card className="p-6 bg-green-50 border border-green-300">
                  <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                    <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                    Dana Santunan Telah Ditransfer
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Jumlah Transfer</p>
                      <p className="text-2xl font-bold text-green-700">
                        Rp {Number(searchResult.transferAmount || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Transfer</p>
                      <p className="font-medium text-gray-800 text-lg">{searchResult.transferDate || '-'}</p>
                    </div>
                    {searchResult.transferNotes && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Catatan</p>
                        <p className="font-medium text-gray-800">{searchResult.transferNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Transfer Proof Image */}
                  <div className="border border-green-300 rounded-lg overflow-hidden bg-white">
                    <div className="flex items-center justify-between p-3 bg-green-100">
                      <span className="font-medium text-green-800">Bukti Transfer</span>
                      <a
                        href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${searchResult.transferProofPath}`}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-green-700 hover:text-green-900 text-sm font-medium"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Unduh
                      </a>
                    </div>
                    <div className="p-4">
                      <img
                        src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${searchResult.transferProofPath}`}
                        alt="Bukti Transfer"
                        className="w-full h-auto max-h-96 object-contain rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>✓ Klaim Selesai:</strong> Dana santunan telah berhasil ditransfer ke rekening Anda. 
                      Silakan cek saldo rekening Anda untuk memastikan dana telah masuk.
                    </p>
                  </div>
                </Card>
              )}

              {/* Timeline Card */}
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Riwayat Status</h3>
                
                <div className="relative">
                  {searchResult.timeline && searchResult.timeline.map((item, index) => (
                    <div key={index} className="flex pb-8 last:pb-0">
                      <div className="flex flex-col items-center mr-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.date || item.createdAt
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-300 text-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                        {index < searchResult.timeline.length - 1 && (
                          <div className={`w-0.5 h-full mt-2 ${
                            item.date || item.createdAt ? 'bg-blue-600' : 'bg-gray-300'
                          }`}></div>
                        )}
                      </div>
                      
                      <div className="flex-1 pt-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`font-bold ${
                            item.date || item.createdAt ? 'text-gray-800' : 'text-gray-400'
                          }`}>
                            {item.status}
                          </h4>
                          {(item.date || item.createdAt) && (
                            <span className="text-sm text-gray-500">
                              {item.date || new Date(item.createdAt).toLocaleDateString('id-ID')}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${
                          item.date || item.createdAt ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Actions Card */}
              <Card className="p-6 bg-green-50 border border-green-200">
                <h4 className="font-bold text-gray-800 mb-2">Informasi</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Jika Anda memiliki pertanyaan atau butuh bantuan terkait klaim ini, 
                  silakan hubungi customer service kami.
                </p>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/#/contact'}>
                  Hubungi Customer Service
                </Button>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {!searchResult && (
            <Card className="p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Cari Status Klaim Anda
              </h3>
              <p className="text-gray-600">
                Masukkan nomor klaim atau NIK untuk melihat status pengajuan klaim
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimStatus;