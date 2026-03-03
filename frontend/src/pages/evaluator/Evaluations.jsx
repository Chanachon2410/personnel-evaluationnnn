import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ClipboardList, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EvaluatorEvaluations = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const res = await api.get('/evaluator/assigned-evaluations');
        setEvaluations(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, []);

  if (loading) return <div className="text-center py-20 font-bold text-gray-500 text-lg animate-pulse">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ClipboardList className="text-primary" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">รายการแบบประเมิน</h1>
          <p className="text-sm text-gray-500 font-medium">รายการแบบประเมินที่คุณได้รับมอบหมายจากผู้ดูแลระบบ</p>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden shadow-sm border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-20">ลำดับ</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อการประเมิน</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-48">จัดการคู่ประเมิน</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {evaluations.map((evaluation, idx) => (
              <tr key={evaluation.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-400">{idx + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">{evaluation.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button 
                    onClick={() => navigate(`/evaluator/evaluations/${evaluation.id}`)}
                    className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-primary/90 transition-all shadow-sm"
                  >
                    <Settings2 size={14} /> จัดการคู่ประเมิน
                  </button>
                </td>
              </tr>
            ))}
            {evaluations.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-10 text-center text-gray-400 italic">คุณยังไม่ได้รับมอบหมายงานประเมิน</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EvaluatorEvaluations;
