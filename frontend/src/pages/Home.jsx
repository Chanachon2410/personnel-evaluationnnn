import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LayoutDashboard, ClipboardList, UserCheck, BarChart3, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/reports/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const roleInfo = {
    ADMIN: {
      title: 'Administrator',
      description: 'จัดการระบบ จัดการการประเมิน และดูรายงานสรุปทั้งหมด',
      color: 'bg-primary',
      cards: [
        { 
          label: 'การประเมินที่เปิดแล้ว', 
          value: stats?.evaluationCount || 0, 
          path: '/admin/evaluations', 
          icon: <ClipboardList size={24} />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        },
        { 
          label: 'จำนวน EVALUATOR', 
          value: stats?.evaluatorCount || 0, 
          path: '/admin/users',
          state: { role: 'EVALUATOR' },
          icon: <UserCheck size={24} />,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        },
        { 
          label: 'จำนวน EVALUATEE', 
          value: stats?.evaluateeCount || 0, 
          path: '/admin/users',
          state: { role: 'EVALUATEE' },
          icon: <Users size={24} />,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50'
        },
        { 
          label: 'การมอบหมายงานที่ใช้งาน', 
          value: stats?.activeAssignmentCount || 0, 
          path: '/admin/evaluations', 
          icon: <BarChart3 size={24} />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        },
      ]
    },
    EVALUATOR: {
      title: 'Evaluator',
      description: 'ทำการประเมินบุคลากรตามที่ได้รับมอบหมาย',
      color: 'bg-green-600',
      cards: [
        { 
          label: 'การประเมินที่ได้รับมอบหมาย', 
          value: stats?.assignedCount || 0, 
          path: '/evaluator/evaluations', 
          icon: <ClipboardList size={24} />,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        },
      ]
    },
    EVALUATEE: {
      title: 'Evaluatee',
      description: 'ดูผลการประเมินของตัวเองและแนบหลักฐานเพิ่มเติม',
      color: 'bg-amber-500',
      cards: [
        { 
          label: 'รายการประเมินของฉัน', 
          value: stats?.myEvaluationCount || 0, 
          path: '/me/evaluations', 
          icon: <BarChart3 size={24} />,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50'
        },
      ]
    }
  };

  const currentRole = roleInfo[user?.role] || roleInfo.EVALUATEE;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Hero */}
      <div className={`${currentRole.color} rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden`}>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">ยินดีต้อนรับ, {user?.name}</h1>
          <p className="text-white/80 text-lg md:text-xl font-medium">
            สิทธิ์การใช้งาน: <span className="underline decoration-2 underline-offset-4">{currentRole.title}</span>
          </p>
          <p className="mt-2 text-white/70 max-w-lg">{currentRole.description}</p>
        </div>
        <div className="absolute right-8 bottom-8 opacity-10 scale-[4] hidden lg:block">
          <LayoutDashboard size={40} />
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentRole.cards.map((card, idx) => (
          card.path ? (
            <Link 
              key={idx} 
              to={card.path} 
              state={card.state}
              className="card group hover:border-primary transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 ${card.bgColor} ${card.color} rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors`}>
                  {card.icon}
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-primary transition-colors" />
              </div>
              <div className="mt-4">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{card.label}</p>
                <p className="text-4xl font-black mt-1 text-gray-900">{card.value}</p>
              </div>
            </Link>
          ) : (
            <div key={idx} className="card">
              <div className={`p-3 ${card.bgColor} ${card.color} rounded-2xl w-fit`}>
                {card.icon}
              </div>
              <div className="mt-4">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{card.label}</p>
                <p className="text-4xl font-black mt-1 text-gray-900">{card.value}</p>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Home;
