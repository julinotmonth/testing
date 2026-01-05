import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, FileText, Upload, CheckCircle, ChevronRight, ChevronLeft, Search, X } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { claimsAPI } from '../services/api';

// Data Rumah Sakit di Indonesia (dikelompokkan per provinsi)
const HOSPITAL_LIST = [
  // JAWA TIMUR
  "RSUD Dr. Soetomo, Surabaya",
  "RS Universitas Airlangga, Surabaya",
  "RS Premier Surabaya",
  "RS Mitra Keluarga Surabaya",
  "RS National Hospital Surabaya",
  "RSUD Dr. Soedono, Madiun",
  "RSUD Sidoarjo",
  "RS Siti Khodijah Sepanjang, Sidoarjo",
  "RS Delta Surya, Sidoarjo",
  "RS Mitra Keluarga Waru, Sidoarjo",
  "RSI Siti Hajar, Sidoarjo",
  "RSUD Bangil, Pasuruan",
  "RS Muhammadiyah Gresik",
  "RSUD Ibnu Sina, Gresik",
  "RSUD Dr. R. Koesma, Tuban",
  "RSUD Jombang",
  "RSUD Nganjuk",
  "RSUD Blambangan, Banyuwangi",
  "RSUD Dr. Haryoto, Lumajang",
  "RSUD Dr. Saiful Anwar, Malang",
  "RS Lavalette, Malang",
  "RS Panti Nirmala, Malang",
  "RSI Unisma, Malang",
  "RSUD Kanjuruhan, Malang",
  "RSUD Mardi Waluyo, Blitar",
  "RSUD Dr. Iskak, Tulungagung",
  "RSUD Dr. Soedarsono, Pasuruan",
  "RSUD Gambiran, Kediri",
  "RS Baptis Kediri",
  "RSUD Pare, Kediri",
  "RSUD Dr. Soebandi, Jember",
  "RS Citra Husada, Jember",
  "RSUD Dr. H. Moh. Anwar, Sumenep",
  "RSUD Syamrabu, Bangkalan",
  "RSUD Sampang",
  "RSUD Pamekasan",
  "RSUD Pacitan",
  "RSUD Ponorogo",
  "RSUD Dr. Harjono, Ponorogo",
  "RS Muhammadiyah Ponorogo",
  "RSUD Magetan",
  "RSUD Ngawi",
  "RSUD Bojonegoro",
  "RSUD Dr. R. Sosodoro Djatikoesoemo, Bojonegoro",
  "RSUD Lamongan",
  "RS Muhammadiyah Lamongan",
  "RSUD Mojokerto",
  "RS Gatoel, Mojokerto",
  "RSUD Prof. Dr. Soekandar, Mojokerto",
  "RSUD Kertosono, Nganjuk",
  "RSUD Caruban, Madiun",
  "RS Dolopo, Madiun",
  "RSUD Trenggalek",
  "RS Paru Dungus, Madiun",
  "RSUD Bondowoso",
  "RSUD Situbondo",
  "RSUD Genteng, Banyuwangi",
  "RS Fatimah, Banyuwangi",
  "RSUD Probolinggo",
  "RS Dharma Husada, Probolinggo",
  
  // JAKARTA
  "RSUPN Dr. Cipto Mangunkusumo, Jakarta",
  "RS Fatmawati, Jakarta",
  "RSUP Persahabatan, Jakarta",
  "RS Pusat Pertamina, Jakarta",
  "RS Pondok Indah, Jakarta",
  "RS Siloam Semanggi, Jakarta",
  "RS Siloam TB Simatupang, Jakarta",
  "RS Siloam Kebon Jeruk, Jakarta",
  "RS Mayapada Hospital Jakarta Selatan",
  "RS Mayapada Hospital Kuningan",
  "RS Mitra Keluarga Kelapa Gading, Jakarta",
  "RS Mitra Keluarga Kemayoran, Jakarta",
  "RS Medistra, Jakarta",
  "RS MMC, Jakarta",
  "RS Jakarta, Jakarta Selatan",
  "RS Harapan Kita, Jakarta",
  "RS Jantung Harapan Kita, Jakarta",
  "RS Kanker Dharmais, Jakarta",
  "RS Mata JEC, Jakarta",
  "RS Hermina Kemayoran, Jakarta",
  "RS Hermina Jatinegara, Jakarta",
  "RS Premier Jatinegara, Jakarta",
  "RS Pelni, Jakarta",
  "RSPAD Gatot Soebroto, Jakarta",
  "RS Polri Kramat Jati, Jakarta",
  "RS Tarakan, Jakarta",
  "RS Sumber Waras, Jakarta",
  "RSUD Budhi Asih, Jakarta",
  "RSUD Pasar Rebo, Jakarta",
  "RSUD Cengkareng, Jakarta",
  "RSUD Tarakan, Jakarta",
  "RSUD Koja, Jakarta",
  "RS Islam Jakarta Cempaka Putih",
  "RS Islam Pondok Kopi, Jakarta",
  "RS Agung, Jakarta",
  "RS Bunda Jakarta",
  "RS Columbia Asia Pulomas, Jakarta",
  "RS EMC Tangerang",
  "RS Omni Hospital Alam Sutera",
  "RS Omni Hospital Pulomas, Jakarta",
  
  // JAWA BARAT
  "RSUP Dr. Hasan Sadikin, Bandung",
  "RS Borromeus, Bandung",
  "RS Santo Yusuf, Bandung",
  "RS Advent Bandung",
  "RS Santosa Hospital Bandung Central",
  "RS Santosa Hospital Bandung Kopo",
  "RS Melinda 2, Bandung",
  "RS Hermina Pasteur, Bandung",
  "RS Hermina Arcamanik, Bandung",
  "RS Al Islam, Bandung",
  "RS Muhammadiyah Bandung",
  "RSUD Al-Ihsan, Bandung",
  "RSUD Cibabat, Cimahi",
  "RS Mitra Kasih, Cimahi",
  "RSUD Soreang, Bandung",
  "RSUD Majalaya, Bandung",
  "RSUD Sumedang",
  "RS Pakuwon, Sumedang",
  "RSUD Subang",
  "RSUD Karawang",
  "RS Cito Karawang",
  "RSUD Purwakarta",
  "RSUD Cianjur",
  "RSUD Sukabumi",
  "RS Kartika Kasih, Sukabumi",
  "RSUD R. Syamsudin, Sukabumi",
  "RSUD Sekarwangi, Sukabumi",
  "RSUD Cibinong, Bogor",
  "RS PMI Bogor",
  "RS Hermina Bogor",
  "RS Azra, Bogor",
  "RS Salak, Bogor",
  "RSUD Ciawi, Bogor",
  "RSUD Leuwiliang, Bogor",
  "RSUD Cileungsi, Bogor",
  "RSUD Kota Bogor",
  "RSUD Bekasi",
  "RS Hermina Bekasi",
  "RS Mitra Keluarga Bekasi Barat",
  "RS Mitra Keluarga Bekasi Timur",
  "RS Siloam Bekasi",
  "RS Anna Bekasi",
  "RS Permata Bekasi",
  "RS Hosana Medica Bekasi",
  "RSUD Depok",
  "RS Hermina Depok",
  "RS Mitra Keluarga Depok",
  "RS Siloam Depok",
  "RS Tugu Ibu, Depok",
  "RS Hasanah Graha Afiah, Depok",
  "RSUD Cirebon",
  "RS Gunung Jati, Cirebon",
  "RS Mitra Plumbon, Cirebon",
  "RSUD Waled, Cirebon",
  "RSUD Arjawinangun, Cirebon",
  "RSUD Indramayu",
  "RSUD Majalengka",
  "RSUD Kuningan",
  "RSUD Garut",
  "RS Intan Husada, Garut",
  "RSUD Tasikmalaya",
  "RS Jasa Kartini, Tasikmalaya",
  "RSUD Ciamis",
  "RSUD Banjar",
  
  // JAWA TENGAH
  "RSUP Dr. Kariadi, Semarang",
  "RS Elisabeth, Semarang",
  "RS Telogorejo, Semarang",
  "RS Columbia Asia Semarang",
  "RS Siloam Semarang",
  "RS Ken Saras, Semarang",
  "RS Hermina Pandanaran, Semarang",
  "RS Roemani Muhammadiyah, Semarang",
  "RSUD Kota Semarang",
  "RSUD Tugurejo, Semarang",
  "RSUP Dr. Soeradji Tirtonegoro, Klaten",
  "RSUD Klaten",
  "RSUD Dr. Moewardi, Solo",
  "RS Dr. Oen Solo",
  "RS Kasih Ibu Solo",
  "RS Panti Waluyo, Solo",
  "RS PKU Muhammadiyah Solo",
  "RS Hermina Solo",
  "RSUD Ir. Soekarno, Sukoharjo",
  "RSUD Karanganyar",
  "RSUD Wonogiri",
  "RSUD Sragen",
  "RSUD Boyolali",
  "RSUD Kelet, Jepara",
  "RSUD RA Kartini, Jepara",
  "RSUD Kudus",
  "RSUD Pati",
  "RSUD Blora",
  "RSUD Rembang",
  "RSUD Cepu, Blora",
  "RSUD Demak",
  "RSUD Sunan Kalijaga, Demak",
  "RSUD Ungaran",
  "RSUD Ambarawa",
  "RSUD Salatiga",
  "RSUD Kendal",
  "RSUD Dr. Soeselo, Tegal",
  "RSUD Kardinah, Tegal",
  "RS Mitra Siaga, Tegal",
  "RSUD Brebes",
  "RSUD Pemalang",
  "RSUD Pekalongan",
  "RSUD Batang",
  "RSUD Banyumas",
  "RSUD Prof. Dr. Margono Soekarjo, Purwokerto",
  "RS Wijayakusuma, Purwokerto",
  "RS Elizabeth, Purwokerto",
  "RSUD Cilacap",
  "RSUD Kebumen",
  "RSUD Purworejo",
  "RSUD Wonosobo",
  "RSUD Temanggung",
  "RSUD Magelang",
  "RS Tidar, Magelang",
  "RSUD Muntilan, Magelang",
  
  // DI YOGYAKARTA
  "RSUP Dr. Sardjito, Yogyakarta",
  "RS Bethesda, Yogyakarta",
  "RS Panti Rapih, Yogyakarta",
  "RS JIH, Yogyakarta",
  "RS Siloam Yogyakarta",
  "RS Hermina Yogyakarta",
  "RS PKU Muhammadiyah Yogyakarta",
  "RS Ludira Husada Tama, Yogyakarta",
  "RSUD Kota Yogyakarta",
  "RSUD Panembahan Senopati, Bantul",
  "RSUD Wates, Kulon Progo",
  "RSUD Wonosari, Gunungkidul",
  "RSUD Sleman",
  "RSUD Prambanan, Sleman",
  
  // BANTEN
  "RSUD Tangerang",
  "RS Siloam Tangerang",
  "RS Hermina Tangerang",
  "RS Mayapada Tangerang",
  "RS Eka Hospital BSD",
  "RS Eka Hospital Puri",
  "RS Medika BSD",
  "RS Omni Hospital Alam Sutera, Tangerang",
  "RS Hermina Ciputat",
  "RSUD Cilegon",
  "RS Krakatau Medika, Cilegon",
  "RSUD Serang",
  "RS Sari Asih Serang",
  "RSUD Pandeglang",
  "RSUD Lebak",
  
  // SUMATERA UTARA
  "RSUP H. Adam Malik, Medan",
  "RS USU, Medan",
  "RS Siloam Medan",
  "RS Columbia Asia Medan",
  "RS Hermina Medan",
  "RS Elisabeth Medan",
  "RS Santa Elisabeth, Medan",
  "RS Murni Teguh, Medan",
  "RS Permata Bunda, Medan",
  "RSUD Dr. Pirngadi, Medan",
  "RSUD Deli Serdang",
  "RSUD Binjai",
  "RSUD Tebing Tinggi",
  "RSUD Pematangsiantar",
  "RSUD Tarutung",
  "RSUD Sidikalang",
  "RSUD Kisaran",
  "RSUD Rantauprapat",
  "RSUD Padangsidimpuan",
  "RSUD Gunung Sitoli",
  "RSUD Kabanjahe",
  
  // SUMATERA BARAT
  "RSUP Dr. M. Djamil, Padang",
  "RS Semen Padang",
  "RS Yos Sudarso, Padang",
  "RS Selaguri, Padang",
  "RSUD Padang",
  "RSUD Pariaman",
  "RSUD Padang Panjang",
  "RSUD Bukittinggi",
  "RS Achmad Mochtar, Bukittinggi",
  "RSUD Payakumbuh",
  "RSUD Solok",
  "RSUD Sawahlunto",
  "RSUD Lubuk Basung",
  "RSUD Painan",
  "RSUD Batusangkar",
  
  // RIAU
  "RSUD Arifin Achmad, Pekanbaru",
  "RS Santa Maria, Pekanbaru",
  "RS Eka Hospital, Pekanbaru",
  "RS Awal Bros, Pekanbaru",
  "RS Aulia Hospital, Pekanbaru",
  "RS Siloam Pekanbaru",
  "RSUD Dumai",
  "RSUD Bengkalis",
  "RSUD Tengku Rafian, Siak",
  "RSUD Rokan Hulu",
  "RSUD Indragiri Hulu",
  "RSUD Indragiri Hilir",
  "RSUD Kampar",
  "RSUD Kuantan Singingi",
  
  // KEPULAUAN RIAU
  "RSUD Raja Ahmad Tabib, Tanjung Pinang",
  "RS Awal Bros, Batam",
  "RS Otorita Batam",
  "RS Santa Elisabeth, Batam",
  "RS Budi Kemuliaan, Batam",
  "RSUD Embung Fatimah, Batam",
  "RSUD Karimun",
  "RSUD Natuna",
  "RSUD Lingga",
  
  // SUMATERA SELATAN
  "RSUP Dr. Mohammad Hoesin, Palembang",
  "RS Siloam Palembang",
  "RS Hermina Palembang",
  "RS Charitas, Palembang",
  "RS RK Charitas, Palembang",
  "RS Siti Khadijah, Palembang",
  "RS Muhammadiyah Palembang",
  "RSUD Palembang BARI",
  "RSUD Lubuklinggau",
  "RSUD Prabumulih",
  "RSUD Lahat",
  "RSUD Muara Enim",
  "RSUD Baturaja",
  "RSUD Sekayu",
  "RSUD Kayu Agung",
  
  // JAMBI
  "RSUD Raden Mattaher, Jambi",
  "RS Siloam Jambi",
  "RS Theresia, Jambi",
  "RS Kambang, Jambi",
  "RSUD H. Abdul Manap, Jambi",
  "RSUD Sungai Penuh",
  "RSUD Muaro Jambi",
  "RSUD Bungo",
  "RSUD Sarolangun",
  "RSUD Merangin",
  "RSUD Tebo",
  "RSUD Tanjung Jabung Barat",
  "RSUD Tanjung Jabung Timur",
  
  // BENGKULU
  "RSUD Dr. M. Yunus, Bengkulu",
  "RS Tiara Sella, Bengkulu",
  "RSUD Curup",
  "RSUD Argamakmur",
  "RSUD Manna",
  "RSUD Mukomuko",
  "RSUD Kepahiang",
  "RSUD Lebong",
  
  // LAMPUNG
  "RSUD Dr. H. Abdul Moeloek, Bandar Lampung",
  "RS Urip Sumoharjo, Bandar Lampung",
  "RS Bumi Waras, Bandar Lampung",
  "RS Imanuel Way Halim, Bandar Lampung",
  "RS Hermina Lampung",
  "RSUD Bob Bazar, Lampung Selatan",
  "RSUD Pringsewu",
  "RSUD Jenderal Ahmad Yani, Metro",
  "RSUD Dadi Tjokrodipo, Bandar Lampung",
  "RSUD A. Dadi Tjokrodipo, Bandar Lampung",
  "RSUD Menggala",
  "RSUD Kota Agung",
  "RSUD Way Kanan",
  "RSUD Liwa",
  
  // BANGKA BELITUNG
  "RSUD Depati Hamzah, Pangkal Pinang",
  "RS Bakti Timah, Pangkal Pinang",
  "RSUD Sungailiat",
  "RSUD Toboali",
  "RSUD Tanjung Pandan",
  "RSUD Manggar",
  
  // ACEH
  "RSUD Dr. Zainoel Abidin, Banda Aceh",
  "RS Malahayati, Banda Aceh",
  "RS Harapan Bunda, Banda Aceh",
  "RSU Meuraxa, Banda Aceh",
  "RSUD Cut Meutia, Lhokseumawe",
  "RSUD Langsa",
  "RSUD Meulaboh",
  "RSUD Calang",
  "RSUD Sabang",
  "RSUD Takengon",
  "RSUD Bireuen",
  "RSUD Sigli",
  "RSUD Jantho",
  "RSUD Blangkejeren",
  "RSUD Kutacane",
  "RSUD Idi",
  "RSUD Blangpidie",
  "RSUD Tapaktuan",
  "RSUD Singkil",
  "RSUD Subulussalam",
  
  // KALIMANTAN BARAT
  "RSUD Dr. Soedarso, Pontianak",
  "RS Antonius, Pontianak",
  "RS St. Antonius, Pontianak",
  "RS Anugerah Bunda, Pontianak",
  "RS Promedika, Pontianak",
  "RSUD Sultan Syarif Mohamad Alkadrie, Pontianak",
  "RSUD Dr. Abdul Aziz, Singkawang",
  "RSUD Sanggau",
  "RSUD Sintang",
  "RSUD Dr. Agoesdjam, Ketapang",
  "RSUD Sambas",
  "RSUD Mempawah",
  "RSUD Bengkayang",
  "RSUD Sekadau",
  "RSUD Melawi",
  "RSUD Kapuas Hulu",
  "RSUD Kayong Utara",
  "RSUD Landak",
  
  // KALIMANTAN TENGAH
  "RSUD Dr. Doris Sylvanus, Palangkaraya",
  "RS Awal Bros, Palangkaraya",
  "RS Betang Pambelum, Palangkaraya",
  "RSUD Dr. Murjani, Sampit",
  "RSUD Sultan Imanuddin, Pangkalan Bun",
  "RSUD Muara Teweh",
  "RSUD Puruk Cahu",
  "RSUD Kuala Kurun",
  "RSUD Pulang Pisau",
  "RSUD Kasongan",
  "RSUD Tamiang Layang",
  "RSUD Buntok",
  "RSUD Sukamara",
  "RSUD Lamandau",
  
  // KALIMANTAN SELATAN
  "RSUD Ulin, Banjarmasin",
  "RS Islam Banjarmasin",
  "RS Suaka Insan, Banjarmasin",
  "RS Sari Mulia, Banjarmasin",
  "RS Siloam Banjarmasin",
  "RSUD Dr. H. Moch. Ansari Saleh, Banjarmasin",
  "RSUD Idaman, Banjarbaru",
  "RSUD H. Damanhuri, Barabai",
  "RSUD H. Badaruddin, Tanjung",
  "RSUD Ratu Zalecha, Martapura",
  "RSUD Pelaihari",
  "RSUD Kandangan",
  "RSUD Rantau",
  "RSUD Kotabaru",
  "RSUD Amuntai",
  "RSUD Batulicin",
  
  // KALIMANTAN TIMUR
  "RSUD Abdul Wahab Sjahranie, Samarinda",
  "RS Siloam Samarinda",
  "RS Dirgahayu, Samarinda",
  "RS Islam Samarinda",
  "RS Hermina Samarinda",
  "RSUD Kanujoso Djatiwibowo, Balikpapan",
  "RS Pertamina, Balikpapan",
  "RS Siloam Balikpapan",
  "RS Restu Ibu, Balikpapan",
  "RSUD Aji Muhammad Parikesit, Tenggarong",
  "RSUD Sangatta",
  "RSUD Taman Husada, Bontang",
  "RSUD Harapan Insan Sendawar",
  "RSUD Panglima Sebaya, Tanah Grogot",
  "RSUD Berau",
  "RSUD Mahakam Ulu",
  
  // KALIMANTAN UTARA
  "RSUD Tarakan",
  "RS Siloam Tarakan",
  "RSUD Tanjung Selor",
  "RSUD Nunukan",
  "RSUD Malinau",
  
  // SULAWESI UTARA
  "RSUP Prof. Dr. R. D. Kandou, Manado",
  "RS Siloam Manado",
  "RS Bethesda, Manado",
  "RS Advent Manado",
  "RS Pancaran Kasih, Manado",
  "RSUD Noongan",
  "RSUD Bitung",
  "RSUD Kotamobagu",
  "RSUD Talaud",
  "RSUD Sangihe",
  "RSUD Liun Kendage Tahuna",
  "RSUD Bolaang Mongondow",
  
  // SULAWESI TENGAH
  "RSUD Undata, Palu",
  "RS Anutapura, Palu",
  "RS Woodward, Palu",
  "RS Budi Agung, Palu",
  "RSUD Poso",
  "RSUD Luwuk",
  "RSUD Tolitoli",
  "RSUD Buol",
  "RSUD Donggala",
  "RSUD Parigi",
  "RSUD Morowali",
  "RSUD Banggai Kepulauan",
  
  // SULAWESI SELATAN
  "RSUP Dr. Wahidin Sudirohusodo, Makassar",
  "RS Siloam Makassar",
  "RS Awal Bros Makassar",
  "RS Hermina Makassar",
  "RS Ibnu Sina, Makassar",
  "RS Islam Faisal, Makassar",
  "RS Pelamonia, Makassar",
  "RS Stella Maris, Makassar",
  "RS Labuang Baji, Makassar",
  "RS Grestelina, Makassar",
  "RSUD Haji, Makassar",
  "RSUD Daya, Makassar",
  "RSUD Syekh Yusuf, Gowa",
  "RSUD H. Padjonga, Gowa",
  "RSUD Lasinrang, Pinrang",
  "RSUD Andi Makkasau, Parepare",
  "RSUD Batara Guru, Luwu",
  "RSUD Sawerigading, Palopo",
  "RSUD Tenriawaru, Bone",
  "RSUD La Temmamala, Soppeng",
  "RSUD Andi Sulthan Dg. Radja, Bulukumba",
  "RSUD Sinjai",
  "RSUD Bantaeng",
  "RSUD Jeneponto",
  "RSUD Takalar",
  "RSUD Selayar",
  "RSUD Maros",
  "RSUD Pangkep",
  "RSUD Barru",
  "RSUD Enrekang",
  "RSUD Tana Toraja",
  "RSUD Toraja Utara",
  "RSUD Wajo",
  "RSUD Sidenreng Rappang",
  "RSUD Luwu Utara",
  "RSUD Luwu Timur",
  
  // SULAWESI TENGGARA
  "RSUD Bahteramas, Kendari",
  "RS Siloam Kendari",
  "RS Santa Anna, Kendari",
  "RSUD Kota Kendari",
  "RSUD Konawe",
  "RSUD Kolaka",
  "RSUD Bau-Bau",
  "RSUD Raha",
  "RSUD Buton",
  "RSUD Wakatobi",
  "RSUD Bombana",
  "RSUD Konawe Selatan",
  "RSUD Konawe Utara",
  "RSUD Kolaka Utara",
  
  // GORONTALO
  "RSUD Prof. Dr. H. Aloei Saboe, Gorontalo",
  "RS Siloam Gorontalo",
  "RSUD Otanaha, Gorontalo",
  "RSUD Toto Kabila, Bone Bolango",
  "RSUD Pohuwato",
  "RSUD Boalemo",
  "RSUD Gorontalo Utara",
  
  // SULAWESI BARAT
  "RSUD Majene",
  "RSUD Polewali Mandar",
  "RSUD Mamasa",
  "RSUD Mamuju",
  "RSUD Mamuju Utara",
  "RSUD Mamuju Tengah",
  
  // BALI
  "RSUP Sanglah, Denpasar",
  "RS Siloam Bali",
  "RS BIMC, Bali",
  "RS Prima Medika, Denpasar",
  "RS Surya Husadha, Denpasar",
  "RS Bali Royal Hospital",
  "RS Kasih Ibu, Denpasar",
  "RS Sanglah, Denpasar",
  "RSUD Mangusada, Badung",
  "RSUD Tabanan",
  "RSUD Sanjiwani, Gianyar",
  "RSUD Bangli",
  "RSUD Klungkung",
  "RSUD Karangasem",
  "RSUD Buleleng",
  "RSUD Negara",
  
  // NUSA TENGGARA BARAT
  "RSUD Provinsi NTB, Mataram",
  "RS Siloam Mataram",
  "RS Harapan Keluarga, Mataram",
  "RS Risa, Mataram",
  "RSUD Kota Mataram",
  "RSUD H. L. Manambai Abdul Kadir, Sumbawa Besar",
  "RSUD Praya, Lombok Tengah",
  "RSUD Patut Patuh Patju, Lombok Barat",
  "RSUD Selong, Lombok Timur",
  "RSUD Dompu",
  "RSUD Bima",
  "RSUD Kota Bima",
  "RSUD Sumbawa Barat",
  "RSUD Lombok Utara",
  
  // NUSA TENGGARA TIMUR
  "RSUD Prof. Dr. W. Z. Johannes, Kupang",
  "RS Siloam Kupang",
  "RS Leona, Kupang",
  "RS Kartini, Kupang",
  "RSUD S. K. Lerik, Kupang",
  "RSUD Dr. Ben Mboi, Ruteng",
  "RSUD Ende",
  "RSUD Bajawa",
  "RSUD Maumere",
  "RSUD Larantuka",
  "RSUD Atambua",
  "RSUD Kefamenanu",
  "RSUD Soe",
  "RSUD Waikabubak",
  "RSUD Waingapu",
  "RSUD Kalabahi",
  "RSUD Lewoleba",
  "RSUD Rote Ndao",
  "RSUD Sabu Raijua",
  "RSUD Manggarai Timur",
  "RSUD Sumba Tengah",
  "RSUD Sumba Barat Daya",
  
  // MALUKU
  "RSUD Dr. M. Haulussy, Ambon",
  "RS Siloam Ambon",
  "RS Hative, Ambon",
  "RSUD Tual",
  "RSUD Masohi",
  "RSUD Namlea",
  "RSUD Saumlaki",
  "RSUD Dobo",
  "RSUD Langgur",
  "RSUD Piru",
  "RSUD Bula",
  
  // MALUKU UTARA
  "RSUD Dr. Chasan Boesoirie, Ternate",
  "RS Siloam Ternate",
  "RSUD Tobelo",
  "RSUD Labuha",
  "RSUD Jailolo",
  "RSUD Sanana",
  "RSUD Weda",
  "RSUD Maba",
  "RSUD Morotai",
  "RSUD Tidore",
  
  // PAPUA
  "RSUD Jayapura",
  "RS Siloam Jayapura",
  "RS Marthen Indey, Jayapura",
  "RS Dian Harapan, Jayapura",
  "RSUD Abepura",
  "RSUD Yowari, Sentani",
  "RSUD Biak",
  "RSUD Serui",
  "RSUD Merauke",
  "RSUD Wamena",
  "RSUD Nabire",
  "RSUD Timika",
  "RSUD Sarmi",
  "RSUD Keerom",
  "RSUD Memberamo",
  "RSUD Puncak Jaya",
  "RSUD Tolikara",
  "RSUD Yahukimo",
  "RSUD Asmat",
  "RSUD Boven Digoel",
  "RSUD Mappi",
  "RSUD Supiori",
  "RSUD Waropen",
  "RSUD Dogiyai",
  "RSUD Deiyai",
  "RSUD Intan Jaya",
  "RSUD Lanny Jaya",
  "RSUD Nduga",
  "RSUD Paniai",
  "RSUD Pegunungan Bintang",
  "RSUD Puncak",
  "RSUD Yalimo",
  
  // PAPUA BARAT
  "RSUD Manokwari",
  "RS Siloam Manokwari",
  "RSUD Sorong",
  "RS Sele Be Solu, Sorong",
  "RSUD Fakfak",
  "RSUD Kaimana",
  "RSUD Raja Ampat",
  "RSUD Teluk Bintuni",
  "RSUD Teluk Wondama",
  "RSUD Tambrauw",
  "RSUD Maybrat",
  "RSUD Pegunungan Arfak",
  "RSUD Sorong Selatan",
  
  // PAPUA SELATAN
  "RSUD Merauke",
  "RSUD Tanah Merah",
  "RSUD Boven Digoel",
  "RSUD Asmat",
  "RSUD Mappi",
  
  // PAPUA TENGAH
  "RSUD Nabire",
  "RSUD Timika",
  "RSUD Dogiyai",
  "RSUD Deiyai",
  "RSUD Intan Jaya",
  "RSUD Paniai",
  "RSUD Puncak",
  "RSUD Puncak Jaya",
  "RSUD Mimika",
  
  // PAPUA PEGUNUNGAN
  "RSUD Wamena",
  "RSUD Lanny Jaya",
  "RSUD Nduga",
  "RSUD Tolikara",
  "RSUD Yahukimo",
  "RSUD Yalimo",
  "RSUD Pegunungan Bintang",
  "RSUD Mamberamo Tengah",
  
  // PAPUA BARAT DAYA
  "RSUD Sorong",
  "RSUD Sorong Selatan",
  "RSUD Raja Ampat",
  "RSUD Tambrauw",
  "RSUD Maybrat"
];

const ClaimForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [claimNumber, setClaimNumber] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State untuk autocomplete rumah sakit
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [isManualHospitalInput, setIsManualHospitalInput] = useState(false);
  const hospitalInputRef = useRef(null);
  const hospitalDropdownRef = useRef(null);
  
  const [formData, setFormData] = useState({
    // Step 1: Personal Data
    fullName: '',
    nik: '',
    phone: '',
    address: '',
    
    // Step 2: Incident Data
    incidentDate: '',
    incidentTime: '',
    _hour: '',
    _minute: '',
    incidentLocation: '',
    incidentDescription: '',
    vehicleType: '',
    vehicleNumber: '',
    
    // Step 3: Medical & Hospital Info
    hospitalName: '',
    treatmentDescription: '',
    estimatedCost: '',
    
    // Step 4: Bank Account Info
    bankName: '',
    bankBranch: '',
    accountNumber: '',
    accountHolderName: '',
    bankBookFile: null,
    
    // Step 5: Documents
    ktpFile: null,
    policeReportFile: null,
    stnkFile: null,
    medicalReportFile: null
  });

  const steps = [
    { number: 1, title: 'Data Diri', icon: User },
    { number: 2, title: 'Data Kejadian', icon: FileText },
    { number: 3, title: 'Info Medis', icon: FileText },
    { number: 4, title: 'Rekening Bank', icon: FileText },
    { number: 5, title: 'Upload Dokumen', icon: Upload },
    { number: 6, title: 'Review', icon: CheckCircle }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler untuk input yang hanya boleh angka (NIK)
  const handleNikChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Hapus semua karakter non-digit
    if (value.length <= 16) {
      setFormData({ ...formData, nik: value });
    }
  };

  // Handler untuk input yang hanya boleh angka (Phone) - maksimal 13 digit
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Hapus semua karakter non-digit
    if (value.length <= 13) {
      setFormData({ ...formData, phone: value });
    }
  };

  // Handler untuk input jam (0-23)
  const handleHourChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value === '') {
      setFormData({ ...formData, _hour: '', incidentTime: '' });
      return;
    }
    const hour = parseInt(value);
    if (hour >= 0 && hour <= 23 && value.length <= 2) {
      const minute = formData._minute || '00';
      const newTime = `${value.padStart(2, '0')}:${minute.padStart(2, '0')}`;
      setFormData({ ...formData, incidentTime: newTime, _hour: value });
    }
  };

  // Handler untuk input menit (0-59)
  const handleMinuteChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value === '') {
      const hour = formData._hour || '00';
      setFormData({ ...formData, _minute: '', incidentTime: hour ? `${hour.padStart(2, '0')}:00` : '' });
      return;
    }
    const minute = parseInt(value);
    if (minute >= 0 && minute <= 59 && value.length <= 2) {
      const hour = formData._hour || '00';
      const newTime = `${hour.padStart(2, '0')}:${value.padStart(2, '0')}`;
      setFormData({ ...formData, incidentTime: newTime, _minute: value });
    }
  };

  // Handler untuk pencarian rumah sakit
  const handleHospitalSearch = (e) => {
    const value = e.target.value;
    setHospitalSearch(value);
    setFormData({ ...formData, hospitalName: value });
    
    if (value.length >= 2) {
      const filtered = HOSPITAL_LIST.filter(hospital => 
        hospital.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10); // Batasi 10 hasil
      setFilteredHospitals(filtered);
      setShowHospitalDropdown(true);
    } else {
      setFilteredHospitals([]);
      setShowHospitalDropdown(false);
    }
  };

  // Handler untuk memilih rumah sakit dari dropdown
  const handleSelectHospital = (hospital) => {
    setHospitalSearch(hospital);
    setFormData({ ...formData, hospitalName: hospital });
    setShowHospitalDropdown(false);
    setIsManualHospitalInput(false);
  };

  // Handler untuk input manual rumah sakit
  const handleManualHospitalInput = () => {
    setIsManualHospitalInput(true);
    setShowHospitalDropdown(false);
  };

  // Handler untuk membersihkan input rumah sakit
  const handleClearHospital = () => {
    setHospitalSearch('');
    setFormData({ ...formData, hospitalName: '' });
    setIsManualHospitalInput(false);
    setShowHospitalDropdown(false);
  };

  // Effect untuk menutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        hospitalDropdownRef.current && 
        !hospitalDropdownRef.current.contains(event.target) &&
        hospitalInputRef.current &&
        !hospitalInputRef.current.contains(event.target)
      ) {
        setShowHospitalDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5000000) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }
    setFormData({ ...formData, [e.target.name]: file });
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.fullName || !formData.nik || !formData.phone || !formData.address) {
          return false;
        }
        // Validasi NIK harus 16 digit
        if (formData.nik.length !== 16) {
          toast.error('NIK harus 16 digit');
          return false;
        }
        // Validasi phone minimal 10 digit, maksimal 13 digit
        if (formData.phone.length < 10 || formData.phone.length > 13) {
          toast.error('Nomor HP harus 10-13 digit');
          return false;
        }
        return true;
      case 2:
        return formData.incidentDate && formData.incidentLocation && formData.incidentDescription;
      case 3:
        return true; // Medical info is optional
      case 4:
        return formData.bankName && formData.accountNumber && formData.accountHolderName && formData.bankBookFile;
      case 5:
        return formData.ktpFile && formData.policeReportFile;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add text fields
      submitData.append('fullName', formData.fullName);
      submitData.append('nik', formData.nik);
      submitData.append('phone', formData.phone);
      submitData.append('address', formData.address);
      submitData.append('incidentDate', formData.incidentDate);
      submitData.append('incidentTime', formData.incidentTime || '');
      submitData.append('incidentLocation', formData.incidentLocation);
      submitData.append('incidentDescription', formData.incidentDescription);
      submitData.append('vehicleType', formData.vehicleType || '');
      submitData.append('vehicleNumber', formData.vehicleNumber || '');
      
      // Add hospital/medical info
      submitData.append('hospitalName', formData.hospitalName || '');
      submitData.append('treatmentDescription', formData.treatmentDescription || '');
      submitData.append('estimatedCost', formData.estimatedCost || '');
      
      // Add bank info
      submitData.append('bankName', formData.bankName);
      submitData.append('bankBranch', formData.bankBranch || '');
      submitData.append('accountNumber', formData.accountNumber);
      submitData.append('accountHolderName', formData.accountHolderName);
      
      // Add files
      if (formData.ktpFile) submitData.append('ktpFile', formData.ktpFile);
      if (formData.policeReportFile) submitData.append('policeReportFile', formData.policeReportFile);
      if (formData.stnkFile) submitData.append('stnkFile', formData.stnkFile);
      if (formData.medicalReportFile) submitData.append('medicalReportFile', formData.medicalReportFile);
      if (formData.bankBookFile) submitData.append('bankBookFile', formData.bankBookFile);

      const response = await claimsAPI.create(submitData);

      if (response.success) {
        setClaimNumber(response.data.claimId);
        toast.success('Klaim berhasil diajukan!');
        setShowModal(true);
      } else {
        toast.error(response.message || 'Gagal mengajukan klaim');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengajukan klaim. Coba lagi.';
      toast.error(message);
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Data Diri Korban</h3>
            <Input
              label="Nama Lengkap *"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
            />
            <div>
              <Input
                label="NIK (Nomor Induk Kependudukan) *"
                name="nik"
                type="text"
                inputMode="numeric"
                value={formData.nik}
                onChange={handleNikChange}
                placeholder="16 digit NIK"
                maxLength="16"
              />
              <p className="text-xs text-gray-500 mt-1">* Hanya angka, 16 digit</p>
            </div>
            <div>
              <Input
                label="Nomor HP *"
                name="phone"
                type="tel"
                inputMode="numeric"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="08xxxxxxxxxx"
                maxLength="13"
              />
              <p className="text-xs text-gray-500 mt-1">* Hanya angka, maksimal 13 digit</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Lengkap *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan alamat lengkap"
              ></textarea>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Data Kejadian</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Tanggal Kejadian *"
                name="incidentDate"
                type="date"
                value={formData.incidentDate}
                onChange={handleChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Waktu Kejadian
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData._hour || (formData.incidentTime ? formData.incidentTime.split(':')[0] : '')}
                        onChange={handleHourChange}
                        placeholder="00"
                        maxLength="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">Jam</span>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-400">:</span>
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData._minute || (formData.incidentTime ? formData.incidentTime.split(':')[1] : '')}
                        onChange={handleMinuteChange}
                        placeholder="00"
                        maxLength="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">Menit</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">* Format 24 jam (00-23 : 00-59)</p>
              </div>
            </div>
            <Input
              label="Lokasi Kejadian *"
              name="incidentLocation"
              value={formData.incidentLocation}
              onChange={handleChange}
              placeholder="Contoh: Jl. Raya Surabaya-Mojokerto KM 15"
            />
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Kendaraan
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih jenis kendaraan</option>
                  <option value="motor">Sepeda Motor</option>
                  <option value="mobil">Mobil</option>
                  <option value="truk">Truk</option>
                  <option value="bus">Bus</option>
                </select>
              </div>
              <Input
                label="Nomor Polisi"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                placeholder="Contoh: L 1234 AB"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kronologi Kejadian *
              </label>
              <textarea
                name="incidentDescription"
                value={formData.incidentDescription}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Jelaskan detail kejadian kecelakaan..."
              ></textarea>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Informasi Medis & Rumah Sakit</h3>
            <p className="text-sm text-gray-600 mb-4">
              Isi informasi ini jika korban mendapatkan perawatan medis di rumah sakit
            </p>
            
            {/* Autocomplete Rumah Sakit */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Rumah Sakit
              </label>
              <div className="relative" ref={hospitalInputRef}>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={hospitalSearch || formData.hospitalName}
                  onChange={handleHospitalSearch}
                  onFocus={() => {
                    if (hospitalSearch.length >= 2) {
                      setShowHospitalDropdown(true);
                    }
                  }}
                  placeholder="Ketik nama rumah sakit untuk mencari..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {(hospitalSearch || formData.hospitalName) && (
                  <button
                    type="button"
                    onClick={handleClearHospital}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {/* Dropdown hasil pencarian */}
              {showHospitalDropdown && (
                <div 
                  ref={hospitalDropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  {filteredHospitals.length > 0 ? (
                    <>
                      {filteredHospitals.map((hospital, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectHospital(hospital)}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-gray-800">{hospital}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleManualHospitalInput}
                        className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-t border-gray-200"
                      >
                        <span className="text-blue-600 font-medium">
                          ✏️ Tidak ada? Ketik manual: "{hospitalSearch}"
                        </span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleManualHospitalInput}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    >
                      <span className="text-gray-600">
                        Rumah sakit tidak ditemukan. 
                      </span>
                      <span className="text-blue-600 font-medium ml-1">
                        Klik untuk input manual
                      </span>
                    </button>
                  )}
                </div>
              )}
              
              {/* Info jika input manual */}
              {isManualHospitalInput && formData.hospitalName && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Input manual: {formData.hospitalName}
                </p>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                Ketik minimal 2 huruf untuk mencari. Jika tidak ada, klik "Ketik manual"
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi Perawatan / Diagnosa
              </label>
              <textarea
                name="treatmentDescription"
                value={formData.treatmentDescription}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Patah tulang kaki kanan, memerlukan operasi dan rawat inap selama 7 hari..."
              ></textarea>
            </div>
            
            <Input
              label="Estimasi Biaya Perawatan (Rp)"
              name="estimatedCost"
              type="number"
              value={formData.estimatedCost}
              onChange={handleChange}
              placeholder="Contoh: 15000000"
            />
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Catatan:</strong> Informasi medis bersifat opsional namun akan mempercepat proses verifikasi klaim Anda. 
                Pastikan estimasi biaya sesuai dengan kuitansi atau perkiraan dari rumah sakit.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Informasi Rekening Bank</h3>
            <p className="text-sm text-gray-600 mb-4">
              Rekening ini akan digunakan untuk pencairan dana santunan jika klaim disetujui
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Bank *
              </label>
              <select
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih Bank</option>
                <option value="BCA">Bank Central Asia (BCA)</option>
                <option value="BNI">Bank Negara Indonesia (BNI)</option>
                <option value="BRI">Bank Rakyat Indonesia (BRI)</option>
                <option value="Mandiri">Bank Mandiri</option>
                <option value="CIMB Niaga">CIMB Niaga</option>
                <option value="BTN">Bank Tabungan Negara (BTN)</option>
                <option value="Danamon">Bank Danamon</option>
                <option value="Permata">Bank Permata</option>
                <option value="OCBC NISP">OCBC NISP</option>
                <option value="Panin">Bank Panin</option>
                <option value="Maybank">Maybank Indonesia</option>
                <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                <option value="BJB">Bank BJB</option>
                <option value="Bank Jatim">Bank Jatim</option>
                <option value="Bank Jateng">Bank Jateng</option>
                <option value="Bank DKI">Bank DKI</option>
                <option value="Lainnya">Bank Lainnya</option>
              </select>
            </div>
            
            <Input
              label="Cabang Bank"
              name="bankBranch"
              value={formData.bankBranch}
              onChange={handleChange}
              placeholder="Contoh: KCP Surabaya Tunjungan"
            />
            
            <Input
              label="Nomor Rekening *"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Masukkan nomor rekening"
              maxLength="20"
            />
            
            <Input
              label="Nama Pemilik Rekening *"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              placeholder="Nama sesuai buku tabungan"
            />

            {/* Upload Buku Tabungan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto/Scan Buku Tabungan * <span className="text-gray-500 text-xs">(Max 5MB)</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Upload halaman depan buku tabungan yang menampilkan nama dan nomor rekening
              </p>
              <input
                type="file"
                name="bankBookFile"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {formData.bankBookFile && (
                <p className="text-sm text-green-600 mt-1">✓ {formData.bankBookFile.name}</p>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Penting:</strong> Pastikan data rekening bank yang Anda masukkan sudah benar. 
                Nama pemilik rekening harus sesuai dengan nama yang tertera di buku tabungan. 
                Kesalahan data rekening dapat menyebabkan keterlambatan pencairan dana.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Upload Dokumen Pendukung</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KTP Korban * <span className="text-gray-500 text-xs">(Max 5MB)</span>
                </label>
                <input
                  type="file"
                  name="ktpFile"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {formData.ktpFile && (
                  <p className="text-sm text-green-600 mt-1">✓ {formData.ktpFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surat Keterangan Polisi * <span className="text-gray-500 text-xs">(Max 5MB)</span>
                </label>
                <input
                  type="file"
                  name="policeReportFile"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {formData.policeReportFile && (
                  <p className="text-sm text-green-600 mt-1">✓ {formData.policeReportFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  STNK Kendaraan <span className="text-gray-500 text-xs">(Max 5MB)</span>
                </label>
                <input
                  type="file"
                  name="stnkFile"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {formData.stnkFile && (
                  <p className="text-sm text-green-600 mt-1">✓ {formData.stnkFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surat Keterangan Medis <span className="text-gray-500 text-xs">(Max 5MB)</span>
                </label>
                <input
                  type="file"
                  name="medicalReportFile"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {formData.medicalReportFile && (
                  <p className="text-sm text-green-600 mt-1">✓ {formData.medicalReportFile.name}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Catatan:</strong> Dokumen yang bertanda * wajib diupload. 
                Format yang diterima: JPG, PNG, PDF (Max 5MB per file)
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Review Data Pengajuan</h3>
            
            <Card className="p-6 bg-gray-50">
              <h4 className="font-bold text-gray-800 mb-3">Data Diri</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Nama:</span> <strong>{formData.fullName}</strong></p>
                <p><span className="text-gray-600">NIK:</span> <strong>{formData.nik}</strong></p>
                <p><span className="text-gray-600">No HP:</span> <strong>{formData.phone}</strong></p>
                <p><span className="text-gray-600">Alamat:</span> <strong>{formData.address}</strong></p>
              </div>
            </Card>

            <Card className="p-6 bg-gray-50">
              <h4 className="font-bold text-gray-800 mb-3">Data Kejadian</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Tanggal:</span> <strong>{formData.incidentDate}</strong></p>
                <p><span className="text-gray-600">Waktu:</span> <strong>{formData.incidentTime || '-'}</strong></p>
                <p><span className="text-gray-600">Lokasi:</span> <strong>{formData.incidentLocation}</strong></p>
                <p><span className="text-gray-600">Jenis Kendaraan:</span> <strong>{formData.vehicleType || '-'}</strong></p>
                <p><span className="text-gray-600">Nomor Polisi:</span> <strong>{formData.vehicleNumber || '-'}</strong></p>
                <p><span className="text-gray-600">Kronologi:</span> <strong>{formData.incidentDescription}</strong></p>
              </div>
            </Card>

            <Card className="p-6 bg-gray-50">
              <h4 className="font-bold text-gray-800 mb-3">Informasi Medis & Rumah Sakit</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Nama Rumah Sakit:</span> <strong>{formData.hospitalName || '-'}</strong></p>
                <p><span className="text-gray-600">Deskripsi Perawatan:</span> <strong>{formData.treatmentDescription || '-'}</strong></p>
                <p><span className="text-gray-600">Estimasi Biaya:</span> <strong>{formData.estimatedCost ? `Rp ${Number(formData.estimatedCost).toLocaleString('id-ID')}` : '-'}</strong></p>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border border-blue-200">
              <h4 className="font-bold text-gray-800 mb-3">Informasi Rekening Bank</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Nama Bank:</span> <strong>{formData.bankName}</strong></p>
                <p><span className="text-gray-600">Cabang:</span> <strong>{formData.bankBranch || '-'}</strong></p>
                <p><span className="text-gray-600">Nomor Rekening:</span> <strong>{formData.accountNumber}</strong></p>
                <p><span className="text-gray-600">Nama Pemilik Rekening:</span> <strong>{formData.accountHolderName}</strong></p>
                {formData.bankBookFile && (
                  <p className="flex items-center mt-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-gray-600">Buku Tabungan:</span> <strong className="ml-1">{formData.bankBookFile.name}</strong>
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-gray-50">
              <h4 className="font-bold text-gray-800 mb-3">Dokumen Terupload</h4>
              <div className="space-y-2 text-sm">
                <p className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  KTP: {formData.ktpFile?.name}
                </p>
                <p className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  Surat Polisi: {formData.policeReportFile?.name}
                </p>
                {formData.stnkFile && (
                  <p className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    STNK: {formData.stnkFile.name}
                  </p>
                )}
                {formData.medicalReportFile && (
                  <p className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    Surat Medis: {formData.medicalReportFile.name}
                  </p>
                )}
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Form Pengajuan Klaim</h1>
            <p className="text-gray-600">Lengkapi formulir berikut dengan data yang valid</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.number} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      currentStep >= step.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <p className={`text-sm mt-2 font-medium ${
                      currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 ${
                      currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <Card className="p-8 mb-6">
            {renderStep()}
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              icon={ChevronLeft}
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Kembali
            </Button>

            {currentStep < 6 ? (
              <Button icon={ChevronRight} onClick={handleNext}>
                Selanjutnya
              </Button>
            ) : (
              <Button icon={CheckCircle} onClick={handleSubmit} loading={loading}>
                Submit Pengajuan
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Pengajuan Berhasil!">
        <div className="text-center py-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Klaim Berhasil Diajukan!</h3>
          <p className="text-gray-600 mb-2">Nomor Klaim Anda:</p>
          <p className="text-2xl font-bold text-blue-600 mb-6">{claimNumber}</p>
          <p className="text-gray-600 mb-6">
            Pengajuan klaim Anda sedang diproses. Anda dapat memantau status klaim melalui menu "Cek Status Klaim"
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
              Kembali ke Beranda
            </Button>
            <Button onClick={() => navigate('/claim/status')} className="flex-1">
              Cek Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClaimForm;