import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  ChevronLeft, Save, FileText, AlertCircle, 
  CheckCircle2, Download, HelpCircle 
} from 'lucide-react';
import Swal from 'sweetalert2';

const EvaluationForm = () => {
  const { id } = useParams(); // Assignment ID
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [scores, setScores] = useState({}); // { indicatorId: score }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await api.get(`/evaluator/assignments/${id}`);
        setAssignment(res.data);
        
        // Initialize scores from existing results
        const initialScores = {};
        res.data.evaluation.topics.forEach(t => {
          t.indicators.forEach(i => {
            if (i.results?.[0]) {
              initialScores[i.id] = i.results[0].score;
            }
          });
        });
        setScores(initialScores);
      } catch (error) {
        console.error(error);
        Swal.fire('ผิดพลาด', 'ไม่สามารถโหลดแบบประเมินได้', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [id]);

  const handleScoreChange = (indicatorId, value) => {
    setScores(prev => ({ ...prev, [indicatorId]: parseInt(value) }));
  };

  const handleSave = async () => {
    try {
      const promises = Object.entries(scores).map(([indicatorId, score]) => 
        api.post(`/evaluator/assignments/${id}/score`, { indicatorId, score })
      );
      await Promise.all(promises);
      await Swal.fire('สำเร็จ', 'บันทึกคะแนนการประเมินเรียบร้อยแล้ว', 'success');
      navigate(-1);
    } catch (error) {
      Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกคะแนนได้ครบถ้วน', 'error');
    }
  };

  if (loading) return <div className="text-center py-20 font-bold text-gray-400">กำลังโหลดแบบประเมิน...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{assignment?.evaluation.name}</h1>
            <p className="text-gray-500 font-bold">
              ผู้รับการประเมิน: <span className="text-primary">{assignment?.evaluatee.name}</span>
            </p>
          </div>
        </div>
        <button onClick={handleSave} className="btn-primary px-8 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20">
          <Save size={20} /> บันทึกผลการประเมิน
        </button>
      </div>

      {/* Grouped Topics */}
      <div className="space-y-12">
        {assignment?.evaluation.topics.map((topic) => (
          <div key={topic.id} className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-1.5 h-6 bg-primary rounded-full"></div>
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-widest">{topic.name}</h3>
            </div>

            <div className="card !p-0 overflow-hidden border-gray-200 shadow-sm">
              <table className="min-w-full table-fixed" style={{ minWidth: '900px' }}>
                <thead className="bg-pink-50 border-b border-pink-100">
                  <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    <th className="px-6 py-4 text-left w-20">ลำดับ</th>
                    <th className="px-6 py-4 text-left">ชื่อตัวชี้วัด</th>
                    <th className="px-6 py-4 text-center w-40">หลักฐานประกอบ</th>
                    <th className="px-6 py-4 text-center w-24">น้ำหนัก</th>
                    <th className="px-6 py-4 text-right w-48">คะแนนที่ให้</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topic.indicators.map((ind, idx) => {
                    const hasEvidence = !!ind.evidence;
                    const needsEvidence = ind.requireEvidence;
                    const canScore = !needsEvidence || hasEvidence;

                    return (
                      <tr key={ind.id} className="hover:bg-pink-50/50 transition-colors">
                        <td className="px-6 py-5 font-mono text-gray-400">{idx + 1}</td>
                        <td className="px-6 py-5">
                          <div className="font-bold text-gray-900">{ind.name}</div>
                          <div className="text-[9px] text-gray-400 font-black uppercase mt-1">
                            Type: {ind.type === 'SCALE_1_4' ? 'Scale 1-4' : 'Pass/Fail'}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          {hasEvidence ? (
                            <a 
                              href={`http://localhost:5000/uploads/${ind.evidence.filePath}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-primary font-black text-[10px] bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 hover:bg-primary hover:text-white transition-all"
                            >
                              <Download size={14} /> ดาวน์โหลด
                            </a>
                          ) : needsEvidence ? (
                            <span className="inline-flex items-center gap-1.5 text-red-500 font-black text-[10px] bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                              <AlertCircle size={14} /> รอหลักฐาน
                            </span>
                          ) : (
                            <span className="text-gray-300 text-[10px] font-bold">ไม่ต้องการ</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-center font-black text-gray-400">{ind.weight}%</td>
                        <td className="px-6 py-5 text-right">
                          {canScore ? (
                            <select 
                              className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-primary/20 outline-none"
                              value={scores[ind.id] ?? ''}
                              onChange={(e) => handleScoreChange(ind.id, e.target.value)}
                            >
                              <option value="">-- ให้คะแนน --</option>
                              {ind.type === 'SCALE_1_4' ? (
                                <>
                                  <option value="4">4 - ดีมาก</option>
                                  <option value="3">3 - ดี</option>
                                  <option value="2">2 - พอใช้</option>
                                  <option value="1">1 - ปรับปรุง</option>
                                </>
                              ) : (
                                <>
                                  <option value="1">ผ่าน (100%)</option>
                                  <option value="0">ไม่ผ่าน (0%)</option>
                                </>
                              )}
                            </select>
                          ) : (
                            <div className="text-gray-300 text-xs font-bold italic flex items-center justify-end gap-1">
                              <HelpCircle size={14} /> ต้องมีหลักฐานก่อน
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Save */}
      <div className="flex justify-center pt-10 border-t">
        <button onClick={handleSave} className="btn-primary px-20 py-4 rounded-[2rem] text-lg font-black shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
          <CheckCircle2 size={24} /> บันทึกผลการประเมินทั้งหมด
        </button>
      </div>
    </div>
  );
};

export default EvaluationForm;
