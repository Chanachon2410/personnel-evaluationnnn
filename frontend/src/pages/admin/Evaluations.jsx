import { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { Plus, Edit2, Trash2, Settings, Save, X, Calendar, User, List } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminEvaluations = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', startAt: '', endAt: '', status: '' });

  const fetchEvaluations = async () => {
    try {
      const res = await api.get('/admin/evaluations');
      setEvaluations(res.data);
    } catch (error) {
      Swal.fire('Error', 'ไม่สามารถดึงข้อมูลการประเมินได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const handleCreate = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'เพิ่มการประเมินใหม่',
      html:
        '<div class="text-left"><label class="text-xs font-bold text-gray-400">ชื่อแบบประเมิน</label>' +
        '<input id="swal-input1" class="swal2-input mt-1" placeholder="ชื่อแบบประเมิน">' +
        '<label class="text-xs font-bold text-gray-400">วันที่เริ่ม</label>' +
        '<input id="swal-input2" class="swal2-input mt-1" type="date">' +
        '<label class="text-xs font-bold text-gray-400">วันที่สิ้นสุด</label>' +
        '<input id="swal-input3" class="swal2-input mt-1" type="date"></div>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#1e3a8a',
      preConfirm: () => {
        const name = document.getElementById('swal-input1').value;
        const startAt = document.getElementById('swal-input2').value;
        const endAt = document.getElementById('swal-input3').value;
        if (!name || !startAt || !endAt) {
          Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
          return false;
        }
        return { name, startAt, endAt };
      }
    });

    if (formValues) {
      try {
        await api.post('/admin/evaluations', formValues);
        Swal.fire({ icon: 'success', title: 'สำเร็จ', showConfirmButton: false, timer: 1500 });
        fetchEvaluations();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'ไม่สามารถสร้างการประเมินได้', 'error');
      }
    }
  };

  const startEdit = (evalItem) => {
    setEditingId(evalItem.id);
    setEditForm({
      name: evalItem.name,
      startAt: evalItem.startAt.split('T')[0],
      endAt: evalItem.endAt.split('T')[0],
      status: evalItem.status
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.patch(`/admin/evaluations/${id}`, editForm);
      Swal.fire({ icon: 'success', title: 'อัปเดตข้อมูลแล้ว', showConfirmButton: false, timer: 1000 });
      setEditingId(null);
      fetchEvaluations();
    } catch (error) {
      Swal.fire('Error', 'ไม่สามารถบันทึกการแก้ไขได้', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: 'ข้อมูลการประเมินและหัวข้อทั้งหมดจะถูกลบออกถาวร',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b91c1c',
      confirmButtonText: 'ยืนยัน ลบเลย',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/evaluations/${id}`);
        Swal.fire('ลบแล้ว!', 'ข้อมูลถูกลบเรียบร้อยแล้ว.', 'success');
        fetchEvaluations();
      } catch (error) {
        Swal.fire('Error', 'ไม่สามารถลบข้อมูลได้', 'error');
      }
    }
  };

  if (loading) return <div className="text-center py-10 font-bold text-gray-500">กำลังโหลด...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Settings className="text-primary" /> จัดการข้อมูลการประเมิน
          </h1>
          <p className="text-gray-500 font-medium">เพิ่ม แก้ไข และกำหนดช่วงเวลาการประเมินผล</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg shadow-primary/20">
          <Plus size={20} /> เพิ่มการประเมิน
        </button>
      </div>

      <div className="card p-0 overflow-hidden border-none shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center w-16">ลำดับ</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">ชื่อแบบประเมิน</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">วันที่สร้าง</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">วันเปิด - ปิด</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">ผู้สร้าง</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">สถานะ</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {evaluations.map((evalItem, index) => (
                <tr key={evalItem.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 text-center font-bold text-gray-400">{index + 1}</td>
                  <td className="px-6 py-4">
                    {editingId === evalItem.id ? (
                      <input
                        type="text"
                        className="w-full border-2 border-primary/20 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      />
                    ) : (
                      <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">{evalItem.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500 font-medium">
                    {new Date(evalItem.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === evalItem.id ? (
                      <div className="flex flex-col gap-1">
                        <input
                          type="date"
                          className="text-xs border border-gray-200 rounded px-2 py-1"
                          value={editForm.startAt}
                          onChange={(e) => setEditForm({...editForm, startAt: e.target.value})}
                        />
                        <input
                          type="date"
                          className="text-xs border border-gray-200 rounded px-2 py-1"
                          value={editForm.endAt}
                          onChange={(e) => setEditForm({...editForm, endAt: e.target.value})}
                        />
                      </div>
                    ) : (
                      <div className="text-center text-xs font-bold flex flex-col items-center">
                        <span className="text-green-600">{new Date(evalItem.startAt).toLocaleDateString()}</span>
                        <span className="text-gray-300">ถึง</span>
                        <span className="text-red-600">{new Date(evalItem.endAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <User size={14} />
                      </div>
                      <span className="text-sm font-semibold text-gray-600">{evalItem.creator?.name || 'System'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editingId === evalItem.id ? (
                      <select
                        className="text-xs border border-gray-200 rounded px-2 py-1"
                        value={editForm.status}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      >
                        <option value="DRAFT">ฉบับร่าง (DRAFT)</option>
                        <option value="OPEN">เปิดการประเมิน (OPEN)</option>
                        <option value="CLOSED">ปิดการประเมิน (CLOSED)</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${
                        evalItem.status === 'OPEN' ? 'bg-green-500 text-white' : 
                        evalItem.status === 'CLOSED' ? 'bg-gray-400 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        {evalItem.status === 'OPEN' ? 'กำลังเปิดการประเมิน' : 
                         evalItem.status === 'CLOSED' ? 'ปิดการประเมินแล้ว' : 'ฉบับร่าง'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-1">
                      {editingId === evalItem.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(evalItem.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="บันทึก">
                            <Save size={18} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="ยกเลิก">
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <Link to={`/admin/evaluations/${evalItem.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="รายละเอียด">
                            <List size={18} />
                          </Link>
                          <button onClick={() => startEdit(evalItem)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="แก้ไข">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(evalItem.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="ลบ">
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {evaluations.length === 0 && (
          <div className="text-center py-20 text-gray-400 italic">
            <ClipboardList className="mx-auto mb-4 opacity-20" size={48} />
            ยังไม่มีข้อมูลการประเมิน
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEvaluations;
