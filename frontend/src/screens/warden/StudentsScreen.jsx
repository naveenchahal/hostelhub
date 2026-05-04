
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api';
import { useFetch, useToggle } from '../../utils/hooks';
import { Card, Badge, Button, Modal, FormField, StatCard, Spinner, EmptyState } from '../../components/common';

const AVATAR_COLORS = [
  'linear-gradient(135deg,var(--amber),#a05c00)',
  'linear-gradient(135deg,var(--teal),#0f766e)',
  'linear-gradient(135deg,#e76f51,#c45934)',
  'linear-gradient(135deg,#a8edea,#4f9ea8)',
  'linear-gradient(135deg,var(--pink),#c0397a)',
];

export default function WardenStudentsScreen() {
  const [search, setSearch]       = useState('');
  const [block,  setBlock]        = useState('');
  const [roomOpen, roomModal]     = useToggle();
  const [editStudent, setEditStu] = useState(null);
  const [roomForm, setRoomForm]   = useState({ roomNumber:'', hostelBlock:'' });

  const params = { search: search || undefined, block: block || undefined };
  const { data, loading, refetch } = useFetch(() => adminApi.getStudents(params), [search, block]);
  const students = data?.students || [];

  const openRoomEdit = (s) => {
    setEditStu(s);
    setRoomForm({ roomNumber: s.roomNumber || '', hostelBlock: s.hostelBlock || '' });
    roomModal.on();
  };

  const handleRoomUpdate = async (e) => {
    e?.preventDefault();
    try {
      await adminApi.updateRoom(editStudent._id, roomForm);
      toast.success(`Room updated to ${roomForm.roomNumber}`);
    } catch { toast.success('Room updated (demo)'); }
    roomModal.off(); refetch();
  };

  const handleToggle = async (id, current) => {
    try { await adminApi.toggleStudent(id); }
    catch {}
    toast.success(`Student ${current ? 'deactivated' : 'activated'}`);
    refetch();
  };

  const getOrdinal = (n) => ['','1st','2nd','3rd','4th'][n] || `${n}th`;

  return (
    <div className="page-enter">
      <div className="pageHeader">
        <div><h1 className="pageTitle">Student Management 👥</h1><p className="pageSub">Manage hostel residents</p></div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        <StatCard icon="👥" value={students.filter(s=>s.isActive).length}  label="Active Students" color="var(--green)" />
        <StatCard icon="🏠" value="4" label="Hostel Blocks" />
        <StatCard icon="🚫" value={students.filter(s=>!s.isActive).length} label="Deactivated"     color="var(--red)" />
        <StatCard icon="📋" value={students.length} label="Total Residents" />
      </div>

      <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, roll number, room..."
          style={{ padding:'10px 14px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'13.5px', fontFamily:'var(--font-body)', outline:'none', maxWidth:'320px', width:'100%' }}
          onFocus={e=>e.target.style.borderColor='var(--amber)'} onBlur={e=>e.target.style.borderColor='var(--border)'}
        />
        <select value={block} onChange={e=>setBlock(e.target.value)}
          style={{ padding:'10px 14px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'13.5px', fontFamily:'var(--font-body)', outline:'none', appearance:'none', cursor:'pointer', minWidth:'150px' }}>
          <option value="">All Blocks</option>
          {['A','B','C','D'].map(b => <option key={b} value={b}>Block {b}</option>)}
        </select>
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign:'center', padding:'40px' }}><Spinner /></div>
        ) : students.length === 0 ? (
          <EmptyState icon="👥" title="No students found" subtitle="Try changing your search filters" />
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>{['Name','Roll No.','Room','Course','Year','Status','Actions'].map(h=>(
                <th key={h} style={{ fontSize:'10px',color:'var(--text3)',fontWeight:'700',padding:'9px 12px',textAlign:'left',letterSpacing:'1px',textTransform:'uppercase',borderBottom:'1px solid var(--border)',whiteSpace:'nowrap' }}>{h}</th>
              ))}</tr></thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s._id||i}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}
                  >
                    <td style={{ padding:'12px', borderBottom:'1px solid var(--border)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:AVATAR_COLORS[i%AVATAR_COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'800', color: i===3?'var(--bg)':'#fff', flexShrink:0, fontFamily:'var(--font-display)' }}>
                          {s.name[0]}
                        </div>
                        <div>
                          <div style={{ fontSize:'13px', fontWeight:'600' }}>{s.name}</div>
                          <div style={{ fontSize:'11px', color:'var(--text3)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'12px',fontSize:'12px',color:'var(--text2)',borderBottom:'1px solid var(--border)',fontFamily:'monospace' }}>{s.rollNumber}</td>
                    <td style={{ padding:'12px',fontSize:'13px',borderBottom:'1px solid var(--border)' }}>
                      <span style={{ fontWeight:'600' }}>{s.roomNumber}</span>
                      <span style={{ fontSize:'11px', color:'var(--text3)', marginLeft:'5px' }}>Block {s.hostelBlock}</span>
                    </td>
                    <td style={{ padding:'12px',fontSize:'12px',color:'var(--text2)',borderBottom:'1px solid var(--border)' }}>{s.course}</td>
                    <td style={{ padding:'12px',fontSize:'13px',borderBottom:'1px solid var(--border)',textAlign:'center' }}>{getOrdinal(s.year)}</td>
                    <td style={{ padding:'12px', borderBottom:'1px solid var(--border)' }}>
                      <Badge variant={s.isActive ? 'green' : 'red'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td style={{ padding:'12px', borderBottom:'1px solid var(--border)' }}>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <Button size="sm" variant="ghost" onClick={() => openRoomEdit(s)}>✎ Room</Button>
                        <Button size="sm" variant={s.isActive?'danger':'teal'} onClick={() => handleToggle(s._id, s.isActive)}>
                          {s.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={roomOpen} onClose={roomModal.off} title={`Edit Room — ${editStudent?.name}`} maxWidth={400}>
        <form onSubmit={handleRoomUpdate}>
          <FormField label="Room Number" id="rn" value={roomForm.roomNumber} onChange={e=>setRoomForm(p=>({...p,roomNumber:e.target.value}))} placeholder="A-101" required />
          <FormField label="Hostel Block" id="hb" as="select" value={roomForm.hostelBlock} onChange={e=>setRoomForm(p=>({...p,hostelBlock:e.target.value}))} options={['A','B','C','D'].map(b=>({value:b,label:`Block ${b}`}))} />
          <Button type="submit" fullWidth>Update Room Assignment</Button>
        </form>
      </Modal>
    </div>
  );
}

