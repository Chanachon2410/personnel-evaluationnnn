import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  ChevronLeft, LayoutGrid, Users, BarChart3, Plus, Trash2, Edit, 
  CheckCircle2, AlertCircle, Scale, FileText, Check, X, Download, Info
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminEvaluationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('topics');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data for Assignments
  const [evaluators, setEvaluators] = useState([]);
  const [evaluatees, setEvaluatees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  
  // Results
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [resultsData, setResultsData] = useState(null);

  const fetchEvaluation = async () => {
    try {
      const res = await api.get(`/admin/evaluations/${id}`);
      setEvaluation(res.data);
    } catch (err) {
      setError(err.response?.status === 404 ? 'NOT_FOUND' : 'ERROR');
    }
  };

  const fetchData = async () => {
    try {
      const [usersRes, assignRes] = await Promise.all([
        api.get('/admin/users'),
        api.get(`/admin/evaluations/${id}/assignments`)
      ]);
      setEvaluators(usersRes.data.filter(u => u.role === 'EVALUATOR' || u.role === 'ADMIN'));
      setEvaluatees(usersRes.data.filter(u => u.role === 'EVALUATEE'));
      setAssignments(assignRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchEvaluation(), fetchData()]);
      setLoading(false);
    };
    init();
  }, [id]);

  useEffect(() => {
    if (selectedAssignmentId) {
      api.get(`/admin/assignments/${selectedAssignmentId}/results`)
        .then(res => setResultsData(res.data))
        .catch(console.error);
    } else {
      setResultsData(null);
    }
  }, [selectedAssignmentId]);


  if (loading) return <div className="text-center py-20 animate-pulse font-bold text-gray-400">กำลังโหลด...</div>;
  if (error === 'NOT_FOUND') return <div className="text-center py-20 text-red-500 font-bold">ไม่พบข้อมูลการประเมิน</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/evaluations')} className="p-2 hover:bg-gray-100 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900">{evaluation?.name}</h1>
          <p className="text-sm text-gray-500">จัดการข้อมูลและดูผลการประเมิน</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('topics')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'topics' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          1. หัวข้อประเมิน
        </button>
        <button 
          onClick={() => setActiveTab('assignments')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'assignments' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          2. จัดการผู้ประเมิน
        </button>
        <button 
          onClick={() => setActiveTab('results')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'results' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          3. ผลการประเมิน
        </button>
      </div>

      <div className="py-4">
        {activeTab === 'topics' && <TopicsTab evaluation={evaluation} onRefresh={fetchEvaluation} />}
        {activeTab === 'assignments' && (
          <AssignmentsTab 
            evaluationId={id} 
            evaluators={evaluators} 
            evaluatees={evaluatees} 
            assignments={assignments} 
            onRefresh={fetchData} 
          />
        )}
        {activeTab === 'results' && (
          <ResultsTab 
            assignments={assignments} 
            selectedAssignmentId={selectedAssignmentId} 
            setSelectedAssignmentId={setSelectedAssignmentId} 
            resultsData={resultsData} 
          />
        )}
      </div>
    </div>
  );
};

// --- Tab 1: Topics ---
const TopicsTab = ({ evaluation, onRefresh }) => {
  const [newTopicName, setNewTopicName] = useState('');
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editingTopicName, setEditingTopicName] = useState('');

  const handleAddTopic = async () => {
    if (!newTopicName.trim()) return;
    try {
      await api.post(`/admin/evaluations/${evaluation.id}/topics`, { name: newTopicName });
      setNewTopicName('');
      onRefresh();
      Swal.fire({
        icon: 'success',
        title: 'เพิ่มหัวข้อสำเร็จ',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      Swal.fire('ผิดพลาด', 'ไม่สามารถเพิ่มหัวข้อได้', 'error');
    }
  };

  const handleEditTopic = (topic) => {
    setEditingTopicId(topic.id);
    setEditingTopicName(topic.name);
  };

  const handleUpdateTopic = async () => {
    if (!editingTopicName.trim()) {
      return Swal.fire('เตือน', 'กรุณากรอกชื่อหัวข้อ', 'warning');
    }

    try {
      await api.patch(`/admin/topics/${editingTopicId}`, { name: editingTopicName });
      setEditingTopicId(null);
      setEditingTopicName('');
      onRefresh();
      Swal.fire({
        icon: 'success',
        title: 'แก้ไขหัวข้อสำเร็จ',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      Swal.fire('ผิดพลาด', error.response?.data?.message || 'ไม่สามารถแก้ไขหัวข้อได้', 'error');
    }
  };

  const handleCancelEditTopic = () => {
    setEditingTopicId(null);
    setEditingTopicName('');
  };

  const handleDeleteTopic = async (topicId) => {
    const res = await Swal.fire({ title: 'ยืนยันการลบ?', text: 'ตัวชี้วัดทั้งหมดในหัวข้อนี้จะถูกลบออก', icon: 'warning', showCancelButton: true });
    if (res.isConfirmed) {
      try {
        await api.delete(`/admin/topics/${topicId}`);
        onRefresh();
        Swal.fire({
          icon: 'success',
          title: 'ลบหัวข้อสำเร็จ',
          showConfirmButton: false,
          timer: 1500
        });
      } catch (error) {
        Swal.fire('ผิดพลาด', 'ไม่สามารถลบหัวข้อได้', 'error');
      }
    }
  };

  return (
    <div className="space-y-10">
      <div className="card flex gap-4 items-end bg-gray-50 border-gray-200">
        <div className="flex-1">
          <label className="block text-xs font-black text-gray-500 uppercase mb-1">ชื่อหัวข้อประเมินใหม่ (Topic)</label>
          <input 
            type="text" 
            placeholder="เช่น ทักษะด้านไอที, การทำงานร่วมกัน..." 
            className="w-full px-4 py-2 border rounded-xl"
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
          />
        </div>
        <button onClick={handleAddTopic} className="btn-primary py-2.5 px-6">เพิ่มหัวข้อ</button>
      </div>

      {evaluation?.topics.map((topic) => {
        if (editingTopicId === topic.id) {
          return (
            <div key={topic.id} className="card !p-0 overflow-hidden border-gray-200 shadow-sm">
              <div className="bg-pink-100 px-6 py-4 flex justify-between items-center gap-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm font-bold"
                  value={editingTopicName}
                  onChange={(e) => setEditingTopicName(e.target.value)}
                />
                <button onClick={handleUpdateTopic} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"><Check size={16}/></button>
                <button onClick={handleCancelEditTopic} className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all"><X size={16}/></button>
              </div>
              <IndicatorTable topic={topic} onRefresh={onRefresh} evaluation={evaluation} />
            </div>
          );
        }

        return (
          <div key={topic.id} className="card !p-0 overflow-hidden border-gray-200 shadow-sm">
            <div className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
              <h3 className="font-black uppercase tracking-widest text-sm">{topic.name}</h3>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleEditTopic(topic)} className="p-1.5 hover:bg-blue-500 rounded-lg transition-all text-gray-400 hover:text-white" title="แก้ไข">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDeleteTopic(topic.id)} className="p-1.5 hover:bg-red-500 rounded-lg transition-all text-gray-400 hover:text-white" title="ลบ">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <IndicatorTable topic={topic} onRefresh={onRefresh} evaluation={evaluation} />
          </div>
        );
      })}
    </div>
  );
};

const IndicatorTable = ({ topic, onRefresh, evaluation }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'SCALE_1_4', weight: '', requireEvidence: false });

  // editing state
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', type: 'SCALE_1_4', weight: '', requireEvidence: false });

  const handleAdd = async () => {
    if (!formData.name || !formData.weight) {
      return Swal.fire('เตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
    }

    // Check weight
    let currentTotal = 0;
    evaluation.topics.forEach(t => t.indicators.forEach(i => currentTotal += i.weight));
    if (currentTotal + parseFloat(formData.weight) > 100) {
      return Swal.fire('น้ำหนักเกิน!', `น้ำหนักรวมปัจจุบันคือ ${currentTotal}% หากเพิ่มอีก ${formData.weight}% จะเกิน 100%`, 'error');
    }

    try {
      await api.post(`/admin/topics/${topic.id}/indicators`, { ...formData, weight: parseFloat(formData.weight) });
      setFormData({ name: '', type: 'SCALE_1_4', weight: '', requireEvidence: false });
      setIsAdding(false);
      onRefresh();
    } catch (error) {
      Swal.fire('ผิดพลาด', error.response?.data?.message || 'ไม่สามารถเพิ่มตัวชี้วัดได้', 'error');
    }
  };

  const handleEdit = (ind) => {
    setEditingId(ind.id);
    setEditData({
      name: ind.name,
      type: ind.type,
      weight: ind.weight,
      requireEvidence: ind.requireEvidence,
    });
  };

  const handleUpdate = async () => {
    if (!editData.name || !editData.weight) {
      return Swal.fire('เตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
    }
    // calculate weight without current indicator
    let currentTotal = 0;
    evaluation.topics.forEach(t => t.indicators.forEach(i => {
      if (i.id !== editingId) currentTotal += i.weight;
    }));
    if (currentTotal + parseFloat(editData.weight) > 100) {
      return Swal.fire('น้ำหนักเกิน!', `น้ำหนักรวมปัจจุบันคือ ${currentTotal}% หากเปลี่ยนเป็น ${editData.weight}% จะเกิน 100%`, 'error');
    }

    try {
      // backend uses PATCH for indicators
      await api.patch(`/admin/indicators/${editingId}`, { ...editData, weight: parseFloat(editData.weight) });
      setEditingId(null);
      setEditData({ name: '', type: 'SCALE_1_4', weight: '', requireEvidence: false });
      onRefresh();
      Swal.fire({
        icon: 'success',
        title: 'แก้ไขข้อมูลสำเร็จ',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('update indicator error', error);
      Swal.fire('ผิดพลาด', error.response?.data?.message || 'ไม่สามารถแก้ไขตัวชี้วัดได้', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ name: '', type: 'SCALE_1_4', weight: '', requireEvidence: false });
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({ title: 'ลบตัวชี้วัด?', icon: 'warning', showCancelButton: true });
    if (res.isConfirmed) {
      await api.delete(`/admin/indicators/${id}`);
      onRefresh();
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-fixed" style={{ minWidth: '900px' }}>
        <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400">
          <tr>
            <th className="px-6 py-3 text-left w-20">ลำดับ</th>
            <th className="px-6 py-3 text-left">ชื่อตัวชี้วัด</th>
            <th className="px-6 py-3 text-left w-44">ประเภท</th>
            <th className="px-6 py-3 text-center w-28">น้ำหนัก</th>
            <th className="px-6 py-3 text-center w-36">หลักฐาน</th>
            <th className="px-6 py-3 text-right w-28">จัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {topic.indicators.map((ind, idx) => {
            if (editingId === ind.id) {
              return (
                <tr key={ind.id} className="bg-pink-50/30">
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 border rounded-lg text-sm"
                      value={editData.name}
                      onChange={e => setEditData({...editData, name: e.target.value})}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className="w-full px-3 py-1.5 border rounded-lg text-sm"
                      value={editData.type}
                      onChange={e => setEditData({...editData, type: e.target.value})}
                    >
                      <option value="SCALE_1_4">ระดับ 1-4</option>
                      <option value="YES_NO">ผ่าน/ไม่ผ่าน</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="number"
                      className="w-20 px-3 py-1.5 border rounded-lg text-sm text-center font-bold"
                      value={editData.weight}
                      onChange={e => setEditData({...editData, weight: e.target.value})}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <select
                      className="w-full px-3 py-1.5 border rounded-lg text-sm"
                      value={editData.requireEvidence}
                      onChange={e => setEditData({...editData, requireEvidence: e.target.value === 'true'})}
                    >
                      <option value="false">ไม่ต้องการ</option>
                      <option value="true">ต้องการ</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={handleUpdate} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"><Check size={16}/></button>
                      <button onClick={handleCancelEdit} className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all"><X size={16}/></button>
                    </div>
                  </td>
                </tr>
              );
            }

            return (
              <tr key={ind.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-gray-400">{idx + 1}</td>
                <td className="px-6 py-4 font-bold text-gray-900">{ind.name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                    ind.type === 'SCALE_1_4' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {ind.type === 'SCALE_1_4' ? <><Scale size={12}/> ระดับ 1-4</> : <><CheckCircle2 size={12}/> ผ่าน/ไม่ผ่าน</>}
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-black text-primary">{ind.weight}%</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${ind.requireEvidence ? 'text-amber-600' : 'text-gray-300'}`}>
                    <FileText size={14} /> {ind.requireEvidence ? 'ต้องการ' : 'ไม่ต้องการ'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => handleEdit(ind)} className="text-gray-400 hover:text-primary p-1.5"><Edit size={18}/></button>
                    <button onClick={() => handleDelete(ind.id)} className="text-gray-300 hover:text-red-600 p-1.5"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            );
          })}
          
          {/* Inline Add Form */}
          {isAdding ? (
            <tr className="bg-blue-50/30">
              <td className="px-6 py-4"></td>
              <td className="px-6 py-4">
                <input 
                  type="text" 
                  placeholder="ชื่อตัวชี้วัด..." 
                  className="w-full px-3 py-1.5 border rounded-lg text-sm"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </td>
              <td className="px-6 py-4">
                <select 
                  className="w-full px-3 py-1.5 border rounded-lg text-sm"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="SCALE_1_4">ระดับ 1-4</option>
                  <option value="YES_NO">ผ่าน/ไม่ผ่าน</option>
                </select>
              </td>
              <td className="px-6 py-4 text-center">
                <input 
                  type="number" 
                  placeholder="%" 
                  className="w-20 px-3 py-1.5 border rounded-lg text-sm text-center font-bold"
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: e.target.value})}
                />
              </td>
              <td className="px-6 py-4 text-center">
                <select 
                  className="w-full px-3 py-1.5 border rounded-lg text-sm"
                  value={formData.requireEvidence}
                  onChange={e => setFormData({...formData, requireEvidence: e.target.value === 'true'})}
                >
                  <option value="false">ไม่ต้องการ</option>
                  <option value="true">ต้องการ</option>
                </select>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex gap-1 justify-end">
                  <button onClick={handleAdd} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"><Check size={16}/></button>
                  <button onClick={() => setIsAdding(false)} className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all"><X size={16}/></button>
                </div>
              </td>
            </tr>
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-3">
                <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest hover:underline">
                  <Plus size={16} /> เพิ่มข้อมูลตัวชี้วัด
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// --- Tab 2: Assignments ---
const AssignmentsTab = ({ evaluationId, evaluators, evaluatees, assignments, onRefresh }) => {
  const [formData, setFormData] = useState({ evaluatorId: '', evaluateeId: '' });

  const handleAdd = async () => {
    if (!formData.evaluatorId || !formData.evaluateeId) return;
    try {
      await api.post('/admin/assignments', { ...formData, evaluationId });
      setFormData({ evaluatorId: '', evaluateeId: '' });
      onRefresh();
    } catch (error) {
      Swal.fire('ผิดพลาด', error.response?.data?.message || 'ไม่สามารถจับคู่ได้', 'error');
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({ title: 'ยืนยันการลบ?', text: 'ประวัติการประเมินคู่นี้จะหายไป', icon: 'warning', showCancelButton: true });
    if (res.isConfirmed) {
      await api.delete(`/admin/assignments/${id}`);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="card grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-gray-50 border-gray-200">
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase mb-1">ผู้ประเมิน (Evaluator)</label>
          <select 
            className="w-full px-4 py-2 border rounded-xl"
            value={formData.evaluatorId}
            onChange={e => setFormData({...formData, evaluatorId: e.target.value})}
          >
            <option value="">-- เลือกผู้ประเมิน --</option>
            {evaluators.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase mb-1">ผู้รับการประเมิน (Evaluatee)</label>
          <select 
            className="w-full px-4 py-2 border rounded-xl"
            value={formData.evaluateeId}
            onChange={e => setFormData({...formData, evaluateeId: e.target.value})}
          >
            <option value="">-- เลือกผู้รับการประเมิน --</option>
            {evaluatees.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <button onClick={handleAdd} className="btn-primary py-2.5 px-6">บันทึกข้อมูล</button>
      </div>

      <div className="card !p-0 overflow-hidden border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
            <tr>
              <th className="px-6 py-4 text-left w-20">ลำดับ</th>
              <th className="px-6 py-4 text-left">ผู้ประเมิน</th>
              <th className="px-6 py-4 text-left">ผู้รับการประเมิน</th>
              <th className="px-6 py-4 text-right w-28">จัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {assignments.map((as, idx) => (
              <tr key={as.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-gray-400">{idx + 1}</td>
                <td className="px-6 py-4 font-bold text-gray-900">{as.evaluator.name}</td>
                <td className="px-6 py-4 font-bold text-gray-900">{as.evaluatee.name}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(as.id)} className="text-gray-300 hover:text-red-600 p-1.5"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Tab 3: Results ---
const ResultsTab = ({ assignments, selectedAssignmentId, setSelectedAssignmentId, resultsData }) => {
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

  const totalScore = calculateTotalScore();

  return (
    <div className="space-y-8">
      <div className="card bg-gray-50 border-gray-200">
        <label className="block text-xs font-black text-gray-500 uppercase mb-2">เลือกคู่ที่ต้องการดูผลการประเมิน</label>
        <select 
          className="w-full md:w-1/2 px-4 py-3 border rounded-2xl shadow-sm font-bold text-gray-700"
          value={selectedAssignmentId}
          onChange={e => setSelectedAssignmentId(e.target.value)}
        >
          <option value="">-- เลือกคู่ประเมิน --</option>
          {assignments.map(as => <option key={as.id} value={as.id}>{as.evaluator.name} ➔ {as.evaluatee.name}</option>)}
        </select>
      </div>

      {resultsData ? (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-primary text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
              <div>
                <h2 className="text-4xl font-black mb-6 italic">{resultsData.evaluationName}</h2>
                <div className="space-y-3 opacity-80">
                  <p className="flex items-center gap-3 font-bold"><Users size={20}/> ผู้ประเมิน: {resultsData.evaluatorName}</p>
                  <p className="flex items-center gap-3 font-bold"><CheckCircle2 size={20}/> ผู้รับการประเมิน: {resultsData.evaluateeName}</p>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <div className="text-xs font-black uppercase tracking-[0.3em] opacity-50 mb-2">Total Score Achievement</div>
                <div className="text-8xl font-black tracking-tighter">{totalScore.toFixed(2)}<span className="text-2xl ml-1 opacity-40">%</span></div>
                <div className="mt-6 w-full h-4 bg-white/20 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full transition-all duration-1000" style={{ width: `${totalScore}%` }}></div>
                </div>
              </div>
            </div>
            <BarChart3 size={200} className="absolute -right-10 -bottom-10 opacity-5 scale-[3]" />
          </div>

          {resultsData.topics.map(topic => {
            let topicTotal = 0;
            topic.indicators.forEach(i => { if(i.result) topicTotal += (i.result.score / (i.type === 'SCALE_1_4' ? 4 : 1)) * i.weight; });
            
            return (
              <div key={topic.id} className="card !p-0 overflow-hidden border-gray-200">
                <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b border-gray-200">
                  <h3 className="text-lg font-black text-gray-800 uppercase tracking-widest">{topic.name}</h3>
                  <div className="text-xl font-black text-primary">{topicTotal.toFixed(2)}%</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-fixed" style={{ minWidth: '1000px' }}>
                    <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400">
                      <tr>
                        <th className="px-6 py-3 text-left w-20">ลำดับ</th>
                        <th className="px-6 py-3 text-left">ชื่อตัวชี้วัด</th>
                        <th className="px-6 py-3 text-left w-44">ประเภท</th>
                        <th className="px-6 py-3 text-center w-28">น้ำหนัก</th>
                        <th className="px-6 py-3 text-center w-28">คะแนน</th>
                        <th className="px-6 py-3 text-center w-32">ปรับเป็น %</th>
                        <th className="px-6 py-3 text-center w-32">หลักฐาน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {topic.indicators.map((ind, idx) => {
                        const score = ind.result?.score || 0;
                        const max = ind.type === 'SCALE_1_4' ? 4 : 1;
                        const weighted = (score / max) * ind.weight;
                        return (
                          <tr key={ind.id} className="hover:bg-blue-50/20 transition-colors">
                            <td className="px-6 py-4 font-mono text-gray-400">{idx + 1}</td>
                            <td className="px-6 py-4 font-bold text-gray-900">{ind.name}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${
                                ind.type === 'SCALE_1_4' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                              }`}>
                                {ind.type === 'SCALE_1_4' ? 'ระดับ 1-4' : 'ผ่าน/ไม่ผ่าน'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-gray-400">{ind.weight}%</td>
                            <td className="px-6 py-4 text-center font-black text-xl text-primary">{ind.result ? score : '-'}</td>
                            <td className="px-6 py-4 text-center font-black text-xl text-secondary">{ind.result ? `${weighted.toFixed(2)}%` : '-'}</td>
                            <td className="px-6 py-4 text-center">
                              {ind.evidence ? (
                                <a href={`http://localhost:5000/uploads/${ind.evidence.filePath}`} target="_blank" rel="noopener noreferrer" className="bg-gray-100 hover:bg-primary hover:text-white p-2 rounded-xl transition-all inline-flex items-center gap-2 text-[10px] font-black uppercase shadow-sm">
                                  <Download size={14}/> LOAD
                                </a>
                              ) : <span className="text-gray-200">-</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-40 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <BarChart3 size={80} className="mx-auto text-gray-200 mb-6 animate-pulse" />
          <p className="text-gray-400 font-black uppercase tracking-[0.3em]">กรุณาเลือกคู่ประเมินเพื่อดึงข้อมูล</p>
        </div>
      )}
    </div>
  );
};

export default AdminEvaluationDetail;
