import { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3, ChevronRight, FileText, Upload, CheckCircle2, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const EvaluateeEvaluations = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const res = await api.get('/me/evaluations');
        // เพิ่มบรรทัดนี้เพื่อกรองเอาเฉพาะ status ที่เป็น 'OPEN'
        const openAssignments = res.data.filter(
          (assignment) => assignment.evaluation.status === 'OPEN'
        );
        // นำข้อมูลที่กรองแล้วไปเก็บใน state
        setAssignments(openAssignments);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, []);

  if (loading) return <div className="text-center py-10">กำลังโหลด...</div>;

  const calculateStats = (assignment) => {
    let totalIndicators = 0;
    let scoredCount = 0;
    let totalScore = 0;

    assignment.evaluation.topics?.forEach(topic => {
      topic.indicators?.forEach(indicator => {
        totalIndicators++;
        // Find result for THIS specific assignment
        const result = indicator.results?.find(r => r.assignmentId === assignment.id);
        if (result && result.score !== null) {
          scoredCount++;
          totalScore += result.score;
        }
      });
    });

    return {
      progress: totalIndicators > 0 ? Math.round((scoredCount / totalIndicators) * 100) : 0,
      totalScore: scoredCount > 0 ? totalScore : null,
      isCompleted: totalIndicators > 0 && scoredCount === totalIndicators
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ผลการประเมินของฉัน</h1>
        <p className="text-gray-500">ดูรายการการประเมินและแนบหลักฐานเพิ่มเติม</p>
      </div>

      <div className="grid gap-6">
        {assignments.map((assignment) => {
          const stats = calculateStats(assignment);
          return (
            <div key={assignment.id} className="card border-l-4 border-amber-500 overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between gap-6 p-2">
                <div className="flex-grow space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900">{assignment.evaluation.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      assignment.evaluation.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {assignment.evaluation.status}
                    </span>
                    {stats.isCompleted && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                        ประเมินแล้ว
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5"><Clock size={16} /> สิ้นสุด: {new Date(assignment.evaluation.endAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={16} /> ผู้ประเมิน: {assignment.evaluator?.name || 'รอระบุ'}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">ความคืบหน้า</p>
                      <p className={`text-lg font-bold ${stats.progress === 100 ? 'text-green-600' : 'text-primary'}`}>
                        {stats.progress}%
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">คะแนนรวม</p>
                      <p className="text-lg font-bold text-primary">
                        {stats.totalScore !== null ? stats.totalScore : '-'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 justify-center shrink-0">
                  <Link
                    to={`/me/evaluations/${assignment.evaluationId}`}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    <Upload size={18} /> แนบหลักฐาน
                  </Link>
                  <Link
                    to={`/me/evaluations/${assignment.id}/result`}
                    className="btn-outline flex items-center justify-center gap-2"
                  >
                    <BarChart3 size={18} /> ดูคะแนน
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {assignments.length === 0 && (
          <div className="text-center py-20 bg-pink-50 rounded-2xl border-2 border-dashed border-pink-200">
            <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">คุณยังไม่มีรายการการประเมินในขณะนี้</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluateeEvaluations;
