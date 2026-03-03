import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { ChevronLeft, FileText, Upload, CheckCircle2, AlertCircle, X, ExternalLink } from 'lucide-react';

const EvidenceUpload = () => {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/me/evaluations');
      const assignment = res.data.find(a => a.evaluationId === parseInt(evaluationId));
      if (!assignment) throw new Error('Evaluation not found');
      setEvaluation(assignment.evaluation);
    } catch (error) {
      Swal.fire('Error', 'ไม่พบข้อมูลการประเมิน', 'error');
      navigate('/me/evaluations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [evaluationId]);

  const handleFileUpload = async (indicatorId, file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire('Error', 'ขนาดไฟล์ต้องไม่เกิน 10MB', 'error');
      return;
    }

    setUploading(indicatorId);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('indicatorId', indicatorId);

    try {
      await api.post(`/me/evaluations/${evaluationId}/evidence`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      Swal.fire({
        icon: 'success',
        title: 'อัปโหลดสำเร็จ',
        timer: 1000,
        showConfirmButton: false
      });
      fetchData();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'ไม่สามารถอัปโหลดไฟล์ได้', 'error');
    } finally {
      setUploading(null);
    }
  };

  if (loading) return <div className="text-center py-10">กำลังโหลด...</div>;

  const topicsWithEvidenceNeeded = evaluation.topics.map(t => ({
    ...t,
    indicators: t.indicators.filter(i => i.requireEvidence)
  })).filter(t => t.indicators.length > 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/me/evaluations')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แนบหลักฐานการประเมิน</h1>
          <p className="text-gray-500 font-medium text-sm">{evaluation.name}</p>
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex gap-3 items-start">
        <AlertCircle className="text-amber-500 shrink-0" size={20} />
        <div>
          <p className="text-amber-800 text-sm font-bold">คำแนะนำ</p>
          <p className="text-amber-700 text-sm">
            โปรดแนบหลักฐาน (เช่น PDF, รูปภาพ) สำหรับตัวชี้วัดที่กำหนด เพื่อให้ผู้ประเมินสามารถตรวจสอบและให้คะแนนได้
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {topicsWithEvidenceNeeded.map((topic) => (
          <div key={topic.id} className="space-y-4">
            <h2 className="text-lg font-bold text-primary flex items-center gap-2 border-b-2 border-primary/10 pb-2">
              <CheckCircle2 size={20} /> {topic.name}
            </h2>
            <div className="grid gap-4">
              {topic.indicators.map((indicator) => {
                const evidence = indicator.evidences?.[0];
                return (
                  <div key={indicator.id} className="card hover:border-blue-200 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-grow space-y-2">
                        <p className="font-semibold text-gray-900 leading-relaxed">{indicator.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            ตัวชี้วัดแบบ {indicator.type === 'SCALE_1_4' ? 'คะแนน 1-4' : 'ใช่/ไม่ใช่'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="shrink-0">
                        {evidence ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-xl border border-green-200">
                              <FileText size={20} />
                              <div className="flex-grow min-w-0">
                                <p className="text-xs font-bold truncate">อัปโหลดเรียบร้อยแล้ว</p>
                                <a 
                                  href={`http://localhost:5000/${evidence.filePath}`} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-[10px] text-green-600 hover:underline flex items-center gap-0.5"
                                >
                                  ดูไฟล์ <ExternalLink size={10} />
                                </a>
                              </div>
                              <button 
                                onClick={() => document.getElementById(`file-${indicator.id}`).click()}
                                className="p-1.5 hover:bg-green-100 rounded-full transition-colors text-green-600"
                                title="อัปโหลดใหม่"
                              >
                                <Upload size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => document.getElementById(`file-${indicator.id}`).click()}
                            disabled={uploading === indicator.id}
                            className="w-full md:w-40 h-24 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-all group disabled:opacity-50"
                          >
                            {uploading === indicator.id ? (
                              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <Upload size={24} className="group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold">เลือกไฟล์</span>
                              </>
                            )}
                          </button>
                        )}
                        <input
                          id={`file-${indicator.id}`}
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(indicator.id, e.target.files[0])}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {topicsWithEvidenceNeeded.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">ไม่มีตัวชี้วัดที่ต้องแนบหลักฐานในการประเมินนี้</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvidenceUpload;
