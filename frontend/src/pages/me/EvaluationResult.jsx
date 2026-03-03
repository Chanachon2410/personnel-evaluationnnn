import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  ChevronLeft, BarChart3, Download, CheckCircle2, 
  Users, Calendar, Scale, FileText, X, Target 
} from 'lucide-react';

const EvaluateeEvaluationResult = () => {
  const { id } = useParams(); // Assignment ID
  const navigate = useNavigate();
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Evaluatees can now access this endpoint thanks to backend changes
        const res = await api.get(`/evaluator/assignments/${id}/results`);
        setResultsData(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  const calculateTotalScore = () => {
    if (!resultsData?.topics) return 0;
    let total = 0;
    resultsData.topics.forEach(t => t.indicators?.forEach(i => {
      if (i.result) {
        const raw = i.result.score || 0;
        const max = i.type === 'SCALE_1_4' ? 4 : 1;
        total += (raw / max) * i.weight;
      }
    }));
    return total;
  };

  if (loading) return <div className="text-center py-20 font-bold text-gray-400 animate-pulse">กำลังโหลดผลคะแนน...</div>;
  if (!resultsData) return <div className="text-center py-20 text-gray-500">ไม่พบข้อมูลผลการประเมิน</div>;

  const totalScore = calculateTotalScore();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 print:p-0 print:space-y-4 print:pb-0">
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          body { background: white !important; -webkit-print-color-adjust: exact; }
          nav, button, .no-print { display: none !important; }
          .card { box-shadow: none !important; border: 1px solid #eee !important; border-radius: 1rem !important; padding: 1.5rem !important; }
          .hero-card { background-color: #111827 !important; color: white !important; border-radius: 2rem !important; padding: 2rem !important; }
          h1 { font-size: 1.5rem !important; }
          h2 { font-size: 1.8rem !important; }
          .text-8xl { font-size: 4rem !important; }
          .space-y-12 > * + * { margin-top: 1rem !important; }
          .table-fixed { min-width: 100% !important; width: 100% !important; table-layout: fixed !important; }
          td, th { padding: 6px 10px !important; font-size: 10px !important; }
          .text-xl { font-size: 1rem !important; }
          .rounded-[3rem] { border-radius: 1.5rem !important; }
          .p-10 { padding: 1.5rem !important; }
          .pt-6 { pt-2 !important; }
        }
      `}</style>

      {/* Header - Hidden on Print */}
      <div className="flex items-center gap-4 no-print">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900">ผลการประเมินของฉัน</h1>
          <p className="text-gray-500 font-medium">รายละเอียดคะแนนที่ได้รับ</p>
        </div>
      </div>

      {/* Hero Summary */}
      <div className="hero-card bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
          <div>
            <h2 className="text-4xl font-black mb-8 italic print:mb-4">{resultsData.evaluationName}</h2>
            <div className="space-y-4 print:space-y-2">
              <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-2xl w-fit border border-white/10 text-secondary print:py-1">
                <Users size={20} className="print:w-4 print:h-4"/> 
                <span className="font-medium text-white/60 uppercase text-[10px] tracking-widest">ผู้ประเมิน:</span> 
                <span className="font-black text-white">{resultsData.evaluatorName}</span>
              </div>
            </div>
          </div>
          <div className="text-center lg:text-right">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-2">Total achievement</div>
            <div className="text-8xl font-black tracking-tighter text-secondary print:text-6xl">{totalScore.toFixed(2)}<span className="text-2xl ml-1 opacity-40 text-white">%</span></div>
            <div className="mt-6 w-full h-4 bg-white/10 rounded-full overflow-hidden border border-white/5 p-1 print:h-2 print:mt-2">
              <div className="bg-secondary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${totalScore}%` }}></div>
            </div>
          </div>
        </div>
        <BarChart3 size={200} className="absolute -right-10 -bottom-10 opacity-5 scale-[3] no-print" />
      </div>

      {/* Detailed Tables */}
      <div className="space-y-12 pt-6 print:space-y-6 print:pt-2">
        {resultsData.topics.map(topic => {
          let topicTotal = 0;
          topic.indicators?.forEach(i => {
            if (i.result) topicTotal += (i.result.score / (i.type === 'SCALE_1_4' ? 4 : 1)) * i.weight;
          });

          return (
            <div key={topic.id} className="space-y-4 print:space-y-2">
              <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3 px-2 print:pb-1">
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-widest print:text-sm">{topic.name}</h3>
                <div className="text-xl font-black text-primary print:text-base">{topicTotal.toFixed(2)}%</div>
              </div>

              <div className="card !p-0 overflow-hidden border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full table-fixed">
                    <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left w-12 print:w-10">ลำดับ</th>
                        <th className="px-6 py-3 text-left">ตัวชี้วัด</th>
                        <th className="px-6 py-3 text-left w-36 print:w-28">ประเภท</th>
                        <th className="px-6 py-3 text-center w-24 print:w-20">น้ำหนัก</th>
                        <th className="px-6 py-3 text-center w-24 print:w-20">คะแนน</th>
                        <th className="px-6 py-3 text-center w-28 print:w-24">ปรับเป็น %</th>
                        <th className="px-6 py-3 text-center w-24 print:hidden">หลักฐาน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white text-sm">
                      {topic.indicators.map((ind, idx) => {
                        const score = ind.result?.score || 0;
                        const max = ind.type === 'SCALE_1_4' ? 4 : 1;
                        const weighted = (score / max) * ind.weight;
                        return (
                          <tr key={ind.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-gray-400 print:py-2">{idx + 1}</td>
                            <td className="px-6 py-4 font-bold text-gray-900 print:py-2">{ind.name}</td>
                            <td className="px-6 py-4 print:py-2">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${
                                ind.type === 'SCALE_1_4' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                              }`}>
                                {ind.type === 'SCALE_1_4' ? '1-4' : 'P/F'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-gray-400 print:py-2">{ind.weight}%</td>
                            <td className="px-6 py-4 text-center font-black text-xl text-primary print:py-2 print:text-base">{ind.result ? score : '-'}</td>
                            <td className="px-6 py-4 text-center font-black text-xl text-secondary print:py-2 print:text-base">{ind.result ? `${weighted.toFixed(2)}%` : '-'}</td>
                            <td className="px-6 py-4 text-center print:hidden">
                              {ind.evidence ? <FileText size={16} className="mx-auto text-gray-300"/> : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-100 print:p-4 print:mt-4 print:bg-transparent print:border-none">
        <div className="flex items-center gap-4 text-gray-400 print:gap-2">
          <Target size={32} className="print:w-6 print:h-6" />
          <p className="text-xs font-bold leading-relaxed print:text-[8px]">
            รายงานนี้ถูกสร้างโดยระบบประเมินผลอัตโนมัติ | {new Date().toLocaleDateString('th-TH')} <br className="no-print" />
            คะแนนคำนวณตามน้ำหนักที่กำหนดโดยผู้ดูแลระบบ
          </p>
        </div>
        <button onClick={() => window.print()} className="btn-primary px-8 bg-primary no-print">
          พิมพ์รายงาน (PDF)
        </button>
      </div>
    </div>
  );
};

export default EvaluateeEvaluationResult;
