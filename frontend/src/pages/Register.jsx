import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import { UserPlus, Mail, Lock, User, Building } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EVALUATEE',
    departmentId: '',
  });
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/auth/departments');
        setDepartments(res.data);
      } catch (error) {
        console.error('Failed to fetch departments', error);
        Swal.fire('Error', 'ไม่สามารถโหลดรายชื่อแผนกได้', 'error');
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.name || !formData.email || !formData.password || !formData.departmentId) {
      Swal.fire('คำเตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
      return;
    }

    if (formData.password.length < 6) {
      Swal.fire('คำเตือน', 'รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/register', formData);
      Swal.fire({
        icon: 'success',
        title: 'ลงทะเบียนสำเร็จ',
        text: 'คุณสามารถเข้าสู่ระบบได้ทันที',
        confirmButtonColor: '#1e3a8a',
      });
      navigate('/login');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'ลงทะเบียนล้มเหลว',
        text: error.response?.data?.message || 'โปรดตรวจสอบข้อมูลอีกครั้ง',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-secondary rounded-2xl flex items-center justify-center text-white shadow-lg">
            <UserPlus size={32} />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">ลงทะเบียน</h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">เข้าร่วมระบบประเมินผลบุคลากร</p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อ-นามสกุล</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                  placeholder="สมชาย ใจดี"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">อีเมล</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">รหัสผ่าน</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">บทบาท</label>
                <select
                  name="role"
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="EVALUATEE">ผู้รับการประเมิน</option>
                  <option value="EVALUATOR">ผู้ประเมิน</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">แผนก</label>
                <div className="relative">
                  <select
                    name="departmentId"
                    required
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                    value={formData.departmentId}
                    onChange={handleChange}
                  >
                    <option value="">เลือกแผนก</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex justify-center items-center gap-2 text-base mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>ลงทะเบียน <UserPlus size={18} /></>
              )}
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              มีบัญชีผู้ใช้แล้ว?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                เข้าสู่ระบบที่นี่
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
