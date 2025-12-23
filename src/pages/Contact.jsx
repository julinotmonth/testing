import { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  Send,
  Building2,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  ExternalLink
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix untuk icon marker Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Koordinat SAMSAT Sidoarjo
  const position = [-7.4478, 112.7183];

  // =============================================
  // KONFIGURASI - GANTI DENGAN DATA YANG BENAR
  // =============================================
  const ADMIN_WHATSAPP = '081217625630'; // Ganti dengan nomor WA admin (format: 62xxx)
  
  const contactInfo = {
    address: 'Jl. Raya Sidoarjo No. 123, Sidoarjo, Jawa Timur 61212',
    phone: '(031) 8941234',
    whatsapp: '081234567890',
    email: 'jasaraharja.sidoarjo@jasaraharja.co.id',
    website: 'www.jasaraharja.co.id',
    operationalHours: [
      { day: 'Senin - Kamis', time: '08:00 - 15:00 WIB' },
      { day: 'Jumat', time: '08:00 - 14:30 WIB' },
      { day: 'Sabtu - Minggu', time: 'Tutup' }
    ],
    socialMedia: {
      facebook: 'https://facebook.com/jasaraharja',
      instagram: 'https://instagram.com/jasaraharja',
      twitter: 'https://twitter.com/jasaraharja'
    }
  };
  // =============================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasi
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Mohon lengkapi semua field');
      return;
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Format email tidak valid');
      return;
    }

    setIsSubmitting(true);

    // Format pesan untuk WhatsApp
    const waMessage = `*PESAN DARI WEBSITE JASA RAHARJA*
━━━━━━━━━━━━━━━━━━━━━

*Nama:* ${formData.name}
*Email:* ${formData.email}
*Subjek:* ${formData.subject}

*Pesan:*
${formData.message}

━━━━━━━━━━━━━━━━━━━━━
_Pesan ini dikirim melalui form kontak website_`;

    // Encode pesan untuk URL
    const encodedMessage = encodeURIComponent(waMessage);
    
    // Buka WhatsApp di tab baru
    const whatsappURL = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    setIsSubmitting(false);
    toast.success('Anda akan diarahkan ke WhatsApp');
  };

  const handleDirectWhatsApp = () => {
    const waURL = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent('Halo, saya ingin bertanya mengenai layanan Jasa Raharja SAMSAT Sidoarjo.')}`;
    window.open(waURL, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Hubungi Kami</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Kami siap membantu Anda. Silakan hubungi kami melalui form di bawah ini 
            atau kunjungi kantor kami langsung.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Kolom Kiri - Informasi Kontak */}
          <div className="space-y-6">
            
            {/* Card Informasi Kontak */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Informasi Kontak
              </h2>
              
              <div className="space-y-4">
                {/* Alamat */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Alamat</h3>
                    <p className="text-gray-600 text-sm">{contactInfo.address}</p>
                  </div>
                </div>

                {/* Telepon */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Telepon</h3>
                    <p className="text-gray-600 text-sm">{contactInfo.phone}</p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div 
                  onClick={handleDirectWhatsApp}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors cursor-pointer group"
                >
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">WhatsApp</h3>
                    <p className="text-gray-600 text-sm">{contactInfo.whatsapp}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>

                {/* Email */}
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Mail className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Email</h3>
                    <p className="text-gray-600 text-sm">{contactInfo.email}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>

                {/* Website */}
                <a 
                  href={`https://${contactInfo.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Website</h3>
                    <p className="text-gray-600 text-sm">{contactInfo.website}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              </div>
            </div>

            {/* Card Jam Operasional */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Jam Operasional
              </h2>
              
              <div className="space-y-3">
                {contactInfo.operationalHours.map((item, index) => (
                  <div 
                    key={index}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      item.time === 'Tutup' ? 'bg-red-50' : 'bg-green-50'
                    }`}
                  >
                    <span className="font-medium text-gray-700">{item.day}</span>
                    <span className={`text-sm font-semibold ${
                      item.time === 'Tutup' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Social Media */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Ikuti Kami</h2>
              
              <div className="flex gap-4">
                <a 
                  href={contactInfo.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                  <span className="font-medium">Facebook</span>
                </a>
                <a 
                  href={contactInfo.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                  <span className="font-medium">Instagram</span>
                </a>
                <a 
                  href={contactInfo.socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                  <span className="font-medium">Twitter</span>
                </a>
              </div>
            </div>
          </div>

          {/* Kolom Kanan - Form & Peta */}
          <div className="space-y-6">
            
            {/* Form Kirim Pesan via WhatsApp */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 rounded-xl">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Kirim Pesan</h2>
                  <p className="text-gray-500 text-sm">Pesan akan dikirim via WhatsApp</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none"
                    required
                  />
                </div>

                {/* Subjek */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subjek
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Perihal pesan Anda"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none"
                    required
                  />
                </div>

                {/* Pesan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pesan
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tulis pesan Anda di sini..."
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none resize-none"
                    required
                  />
                </div>

                {/* Tombol Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <MessageCircle className="w-5 h-5" />
                  {isSubmitting ? 'Mengarahkan...' : 'Kirim via WhatsApp'}
                </button>

                {/* Info */}
                <p className="text-center text-gray-400 text-xs mt-4">
                  Dengan mengklik tombol di atas, Anda akan diarahkan ke WhatsApp untuk mengirim pesan
                </p>
              </form>
            </div>

            {/* Peta Lokasi */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Lokasi Kami
              </h2>
              
              <div className="h-[300px] rounded-xl overflow-hidden">
                <MapContainer 
                  center={position} 
                  zoom={15} 
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={position}>
                    <Popup>
                      <div className="text-center">
                        <strong>Jasa Raharja SAMSAT Sidoarjo</strong>
                        <br />
                        <small>{contactInfo.address}</small>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              {/* Tombol Buka di Google Maps */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Buka di Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;