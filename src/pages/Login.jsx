import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Shield, Phone, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Validasi apakah input adalah email atau nomor telepon
  const validateIdentifier = (value) => {
    if (!value) return 'Email atau No. Telepon wajib diisi';
    
    // Cek apakah format email
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    // Cek apakah format nomor telepon Indonesia
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
    
    if (!emailRegex.test(value) && !phoneRegex.test(value)) {
      return 'Masukkan email atau nomor telepon yang valid';
    }
    
    return true;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await login(data.identifier, data.password);
      
      if (result.success) {
        toast.success('Login berhasil!');
        navigate('/');
      } else {
        toast.error(result.message || 'Login gagal!');
      }
    } catch (error) {
      toast.error('Login gagal! Periksa kembali kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Jasa Raharja</h1>
          <p className="text-gray-600">SAMSAT Sidoarjo</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Masuk ke Akun</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                label="Email atau No. Telepon"
                type="text"
                icon={User}
                placeholder="email@example.com atau 08xxxxxxxxxx"
                error={errors.identifier?.message}
                {...register('identifier', { 
                  validate: validateIdentifier
                })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Gunakan email atau nomor telepon yang terdaftar
              </p>
            </div>

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', { 
                required: 'Password wajib diisi',
                minLength: {
                  value: 6,
                  message: 'Password minimal 6 karakter'
                }
              })}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Ingat saya</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                Lupa password?
              </Link>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Masuk
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Belum punya akun?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;