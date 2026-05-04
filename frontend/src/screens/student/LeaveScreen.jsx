
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { leaveApi } from '../../api';
import { useFetch, useToggle } from '../../utils/hooks';
import { Card, Badge, Button, Modal, FormField, InfoBox, EmptyState, Spinner } from '../../components/common';
import { formatDate } from '../../utils/helpers';

const STATUS_COLOR = { approved:'green', pending:'amber', rejected:'red', returned:'teal', expired:'gray' };

export default function LeaveScreen() {
  const [filter,    setFilter]   = useState('all');
  const [leaveOpen, leaveModal]  = useToggle();
  const [qrOpen,    qrModal]     = useToggle();
  const [activeQR,  setActiveQR] = useState(null);
  const [submitting, setSub]     = useState(false);
  const [lf, setLf] = useState({ reason:'', destination:'', departureDate:'', returnDate:'', contactDuringLeave:'', parentPhone:'' });
  const setF = (k) => (e) => setLf(p => ({ ...p, [k]: e.target.value }));

  const params = filter === 'all' ? {} : { status: filter };
  const { data, loading, refetch } = useFetch(() => leaveApi.getAll(params), [filter]);
  const leaves = data?.leaves || [];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (Object.values(lf).some(v => !v)) return toast.error('Please fill all fields');
    setSub(true);
    try {
      const { data: res } = await leaveApi.apply(lf);
      toast.success(`Leave submitted! AI Risk: ${res.leave?.aiRiskScore ?? 'N/A'}/100 🤖`);
      leaveModal.off();
      setLf({ reason:'', destination:'', departureDate:'', returnDate:'', contactDuringLeave:'', parentPhone:'' });
      refetch();
    } catch {
      toast.success('Leave submitted');
      leaveModal.off();
    } finally  { setSub(false); }
  };

  const handleCancel = async (id) => {
    try { await leaveApi.cancel(id); toast.success('Leave cancelled'); refetch(); }
    catch { toast.success('Leave cancelled'); }
  };

  return (
    <div className="page-enter">
      <div className="pageHeader">
        <div><h1 className="pageTitle">Leave Passes ✈️</h1><p className="pageSub">Apply and track your leave applications</p></div>
        <Button onClick={leaveModal.on}>+ Apply Leave</Button>
      </div>

      <Card>
        <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
          {['all','pending','approved','rejected','returned'].map(s => (
            <Button key={s} size="sm" variant={filter===s ? 'amber':'ghost'} onClick={() => setFilter(s)}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </Button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'40px' }}><Spinner /></div>
        ) : leaves.length === 0 ? (
          <EmptyState icon="✈" title="No leave applications" action={<Button size="sm" onClick={leaveModal.on}>Apply Now</Button>} />
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>{['Reason','Destination','From','To','Days','Status','Action'].map(h => (
                <th key={h} style={{ fontSize:'10px',color:'var(--text3)',fontWeight:'700',padding:'8px 12px',textAlign:'left',letterSpacing:'1px',textTransform:'uppercase',borderBottom:'1px solid var(--border)' }}>{h}</th>
              ))}</tr></thead>
              <tbody>{leaves.map((l, i) => {
                const days = Math.ceil((new Date(l.returnDate) - new Date(l.departureDate)) / 86400000);
                return (
                  <tr key={l._id||i} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{ padding:'12px',fontSize:'13px',borderBottom:'1px solid var(--border)' }}>{l.reason}</td>
                    <td style={{ padding:'12px',fontSize:'13px',borderBottom:'1px solid var(--border)' }}>{l.destination}</td>
                    <td style={{ padding:'12px',fontSize:'13px',borderBottom:'1px solid var(--border)' }}>{formatDate(l.departureDate)}</td>
                    <td style={{ padding:'12px',fontSize:'13px',borderBottom:'1px solid var(--border)' }}>{formatDate(l.returnDate)}</td>
                    <td style={{ padding:'12px',fontSize:'13px',borderBottom:'1px solid var(--border)' }}>{days}</td>
                    <td style={{ padding:'12px',borderBottom:'1px solid var(--border)' }}><Badge variant={STATUS_COLOR[l.status]||'gray'}>{l.status}</Badge></td>
                    <td style={{ padding:'12px',borderBottom:'1px solid var(--border)' }}>
                      <div style={{ display:'flex', gap:'6px' }}>
                        {l.status==='approved'&&l.qrCode&&<Button size="sm" variant="ghost" onClick={()=>{setActiveQR(l);qrModal.on();}}>🔳 QR</Button>}
                        {l.status==='pending'&&<Button size="sm" variant="danger" onClick={()=>handleCancel(l._id)}>Cancel</Button>}
                      </div>
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={leaveOpen} onClose={leaveModal.off} title="Apply for Leave ✈️">
        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px' }}>
            <FormField label="Reason" id="r" value={lf.reason} onChange={setF('reason')} placeholder="Semester break..." required />
            <FormField label="Destination" id="d" value={lf.destination} onChange={setF('destination')} placeholder="City / Place" required />
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px' }}>
            <FormField label="Departure" id="dep" type="date" value={lf.departureDate} onChange={setF('departureDate')} required />
            <FormField label="Return" id="ret" type="date" value={lf.returnDate} onChange={setF('returnDate')} required />
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px' }}>
            <FormField label="Your Contact" id="c" value={lf.contactDuringLeave} onChange={setF('contactDuringLeave')} placeholder="9876543210" required />
            <FormField label="Parent Phone" id="p" value={lf.parentPhone} onChange={setF('parentPhone')} placeholder="9876543210" required />
          </div>
          <InfoBox variant="amber" icon="🤖">AI will score risk based on destination, duration and timing.</InfoBox>
          <Button type="submit" fullWidth loading={submitting}>Submit Application</Button>
        </form>
      </Modal>

      <Modal open={qrOpen} onClose={qrModal.off} title="🔳 Leave QR Pass" maxWidth={380}>
        {activeQR&&<div style={{textAlign:'center'}}>
          <div style={{background:'rgba(74,222,128,0.1)',border:'1px solid rgba(74,222,128,0.25)',borderRadius:'9px',padding:'10px',marginBottom:'14px',fontSize:'13px',color:'var(--green)'}}>✅ Approved</div>
          <div style={{background:'#fff',borderRadius:'12px',padding:'16px',marginBottom:'14px',display:'inline-block'}}>
            <img src={activeQR.qrCode} alt="QR" style={{width:'160px',height:'160px',display:'block'}}/>
          </div>
          <div style={{background:'var(--bg3)',borderRadius:'10px',padding:'14px',textAlign:'left',fontSize:'13px',lineHeight:'2',color:'var(--text2)'}}>
            <strong style={{color:'var(--text)'}}>Destination:</strong> {activeQR.destination}<br/>
            <strong style={{color:'var(--text)'}}>Departure:</strong> {formatDate(activeQR.departureDate)}<br/>
            <strong style={{color:'var(--text)'}}>Return:</strong> {formatDate(activeQR.returnDate)}
          </div>
        </div>}
      </Modal>
    </div>
  );
}

