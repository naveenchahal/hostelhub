
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { complaintApi } from '../../api';
import { useFetch, useToggle } from '../../utils/hooks';
import { Card, Badge, Button, Modal, FormField, InfoBox, StatCard, EmptyState, Spinner } from '../../components/common';
import { formatDate, PRIORITY_COLOR, STATUS_COLOR } from '../../utils/helpers';

export default function ComplaintsScreen() {
  const [open, modal] = useToggle();
  const [sub, setSub] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', category:'electricity', roomNumber:'' });
  const setF = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const { data, loading, refetch } = useFetch(() => complaintApi.getAll(), []);
  const complaints = data?.complaints || [];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.title || !form.description) return toast.error('Title and description required');
    setSub(true);
    try {
      const { data:res } = await complaintApi.create(form);
      toast.success(`Complaint filed! AI Priority: ${(res.complaint?.priority||'medium').toUpperCase()} 🤖`);
      modal.off(); 
      setForm({ title:'', description:'', category:'electricity', roomNumber:'' }); 
      refetch();
    } catch { 
      toast.success('Complaint submitted (demo)'); 
      modal.off(); 
    }
    finally  { 
      setSub(false); 
    }
  };

  const openCount       = complaints.filter(c=>c.status==='open').length;
  const progressCount   = complaints.filter(c=>c.status==='in-progress').length;
  const resolvedCount   = complaints.filter(c=>c.status==='resolved').length;

  return (
    <div className="page-enter">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Complaints 🔧</h1>
          <p className="pageSub">Report and track hostel maintenance issues</p>
        </div>
        <Button onClick={modal.on}>+ File Complaint</Button>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'24px' }}>
        <StatCard icon="📂" value={openCount} label="Open" color="var(--red)" />
        <StatCard icon="⚙️" value={progressCount} label="In Progress" color="var(--amber)" />
        <StatCard icon="✅" value={resolvedCount} label="Resolved" color="var(--green)" />
        <StatCard icon="⏱" value="-" label="Avg Resolution" />
      </div>

      <Card>
        {loading ? (
          <div style={{textAlign:'center',padding:'40px'}}>
            <Spinner/>
          </div>
        ) : complaints.length === 0 ? (
          <EmptyState 
            icon="🔧" 
            title="No complaints yet" 
            action={<Button size="sm" onClick={modal.on}>File Now</Button>}
          />
        ) : (
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr>
                  {['Title','Category','AI Priority','Status','Date','Rating'].map(h=>(
                    <th key={h} style={{fontSize:'10px',color:'var(--text3)',fontWeight:'700',padding:'8px 12px',textAlign:'left',letterSpacing:'1px',textTransform:'uppercase',borderBottom:'1px solid var(--border)'}}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {complaints.map((c,i)=>(
                  <tr key={c._id||i}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}
                  >
                    <td style={{padding:'12px',fontSize:'13px',borderBottom:'1px solid var(--border)'}}>
                      {c.title}
                    </td>

                    <td style={{padding:'12px',fontSize:'13px',borderBottom:'1px solid var(--border)',textTransform:'capitalize'}}>
                      {c.category}
                    </td>

                    <td style={{padding:'12px',borderBottom:'1px solid var(--border)'}}>
                      <Badge variant={PRIORITY_COLOR[c.priority]||'gray'}>
                        {c.priority}
                      </Badge>
                    </td>

                    <td style={{padding:'12px',borderBottom:'1px solid var(--border)'}}>
                      <Badge variant={STATUS_COLOR[c.status]||'gray'}>
                        {c.status}
                      </Badge>
                    </td>

                    <td style={{padding:'12px',fontSize:'12px',color:'var(--text2)',borderBottom:'1px solid var(--border)'}}>
                      {formatDate(c.createdAt)}
                    </td>

                    <td style={{padding:'12px',fontSize:'13px',borderBottom:'1px solid var(--border)'}}>
                      {c.rating ? '⭐'.repeat(c.rating) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={open} onClose={modal.off} title="File a Complaint 🔧">
        <form onSubmit={handleSubmit}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
            <FormField 
              label="Category" 
              id="cat" 
              as="select" 
              value={form.category} 
              onChange={setF('category')}
              options={['electricity','plumbing','furniture','internet','cleanliness','pest','security','other']}
            />
            <FormField 
              label="Room Number" 
              id="room" 
              value={form.roomNumber} 
              onChange={setF('roomNumber')} 
              placeholder="A-101"
            />
          </div>

          <FormField 
            label="Title" 
            id="title" 
            value={form.title} 
            onChange={setF('title')} 
            placeholder="Brief description" 
            required
          />

          <FormField 
            label="Description" 
            id="desc" 
            as="textarea" 
            value={form.description} 
            onChange={setF('description')} 
            placeholder="Describe the issue in detail..." 
            required
          />

          <InfoBox variant="amber" icon="🤖">
            AI will auto-assign priority: Low / Medium / High / Urgent
          </InfoBox>

          <Button type="submit" fullWidth loading={sub}>
            Submit Complaint
          </Button>
        </form>
      </Modal>
    </div>
  );
}

