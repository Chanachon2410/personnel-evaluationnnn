import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  User, ChevronLeft, CheckCircle2, PlayCircle, 
  Calendar, BarChart3 
} from 'lucide-react';

const AssignmentList = () => {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get(`/evaluator/evaluations/${evaluationId}`);
        setAssignments(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [evaluationId]);

  if (loading) return <div className="text-center py-20 font-bold text-gray-500 text-lg animate-pulse">กำลังโหลดข้อมูล...</div>;

  const evaluationInfo = assignments[0]?.evaluation;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/evaluator/evaluations')} 
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{evaluationInfo?.name || 'รายการคู่ประเมิน'}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-bold mt-0.5">
              <Calendar size={14} className="text-primary" />
              ช่วงเวลาประเมิน: {evaluationInfo ? `${new Date(evaluationInfo.startAt).toLocaleDateString('th-TH')} - ${new Date(evaluationInfo.endAt).toLocaleDateString('th-TH')}` : '-'}
            </div>
          </div>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-2xl flex items-center gap-2">
          <BarChart3 size={18} />
          <span className="text-sm font-black uppercase tracking-widest">Evaluator Panel</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="card !p-0 overflow-hidden shadow-sm border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="uppercase text-[10px] font-black tracking-widest text-gray-400">
              <th className="px-6 py-4 text-left w-20">ลำดับ</th>
              <th className="px-6 py-4 text-left">ชื่อผู้รับการประเมิน</th>
              <th className="px-6 py-4 text-left w-64">ความคืบหน้า (สถานะตัวชี้วัด)</th>
              <th className="px-6 py-4 text-center w-48">สถานะการประเมิน</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {assignments.map((assignment, idx) => {
              const progress = assignment.progress || { scoredCount: 0, totalIndicators: 0, isCompleted: false };
              const percent = progress.totalIndicators > 0 ? (progress.scoredCount / progress.totalIndicators) * 100 : 0;

              return (
                <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-6 text-sm font-bold text-gray-400 font-mono">{idx + 1}</td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center font-black">
                        {assignment.evaluatee.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-900">{assignment.evaluatee.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{assignment.evaluatee.department?.name || 'ไม่มีแผนก'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black">
                        <span className="text-gray-400 uppercase">Scored</span>
                        <span className="text-primary">{progress.scoredCount} / {progress.totalIndicators} ข้อ</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${progress.isCompleted ? 'bg-green-500' : 'bg-primary'}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    {progress.isCompleted ? (
                      <Link 
                        to={`/evaluator/assignments/${assignment.id}/result`}
                        className="inline-flex items-center gap-1.5 text-green-600 font-black text-xs hover:underline decoration-2 underline-offset-4"
                      >
                        <CheckCircle2 size={16} /> ประเมินเสร็จสิ้น
                      </Link>
                    ) : (
                      <button 
                        onClick={() => navigate(`/evaluator/assignments/${assignment.id}`)}
                        className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                      >
                        <PlayCircle size={16} /> เริ่มการประเมิน
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {assignments.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-20 text-center text-gray-400 italic font-medium">ไม่พบรายชื่อผู้รับการประเมิน</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignmentList;
