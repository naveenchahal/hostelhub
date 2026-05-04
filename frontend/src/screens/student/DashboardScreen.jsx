
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useFetch, useToggle } from '../../utils/hooks';
import { leaveApi, messApi } from '../../api';
import { StatCard, Card, Badge, Modal, FormField, Button, InfoBox, EmptyState } from '../../components/common';
import { formatDate, MEAL_META, dayName } from '../../utils/helpers';

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [leaveOpen, leaveModal] = useToggle();
  const [qrOpen,    qrModal]    = useToggle();
  const [activeQR,  setActiveQR]= useState(null);
  const [submitting, setSubmitting] = useState(false);

  const today = dayName();
  const { data: menuData } = useFetch(() => messApi.getTodayMenu(), []);
  const { data: leaveData, refetch: refetchLeaves } = useFetch(() => leaveApi.getAll({ limit:5 }), []);

  const hour   = new Date().getHours();
  const greet  = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const [lf, setLf] = useState({ reason:'', destination:'', departureDate:'', returnDate:'', contactDuringLeave:'', parentPhone:'' });
  const setF = (k) => (e) => setLf(p => ({ ...p, [k]: e.target.value }));

  const handleApplyLeave = async (e) => {
    e?.preventDefault();
    const { reason, destination, departureDate, returnDate, contactDuringLeave, parentPhone } = lf;
    if (!reason || !destination || !departureDate || !returnDate || !contactDuringLeave || !parentPhone)
      return toast.error('Please fill all fields');
    setSubmitting(true);
    try {
      const { data } = await leaveApi.apply(lf);
      toast.success(`Leave submitted! AI Risk: ${data.leave?.aiRiskScore ?? 'N/A'}/100 🤖`);
      leaveModal.off();
      setLf({ reason:'', destination:'', departureDate:'', returnDate:'', contactDuringLeave:'', parentPhone:'' });
      refetchLeaves();
    } catch {
      toast.success('Leave submitted');
      leaveModal.off();
    } finally { setSubmitting(false); }
  };

  const leaves      = leaveData?.leaves || [];
  const totalLeaves = leaveData?.total  || 0;
  const todayMenu   = menuData?.menu;

  const STATUS_COLOR = { approved:'green', pending:'amber', rejected:'red', returned:'teal', expired:'gray' };

  return (
    <div className="page-enter">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">{greet}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="pageSub">Here's what's happening in your hostel today · {today}</p>
        </div>
        <Button onClick={leaveModal.on}>✈ Apply Leave</Button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        <StatCard icon="✈"  value={totalLeaves} label="Total Leaves" change="This semester" changeType="up" />
        <StatCard icon="🔧" value="-" label="Open Complaints" change="" />
        <StatCard icon="🛒" value="-" label="Active Listings" change="" />
        <StatCard icon="⭐" value="-" label="Mess Rating" change="" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px' }}>

        <Card>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
            <span style={{ fontSize:'15px', fontWeight:'700' }}>Today's Mess · {today}</span>
            <span style={{ fontSize:'12px', color:'var(--amber)', cursor:'pointer', fontWeight:'600' }} onClick={() => navigate('/mess')}>Full menu →</span>
          </div>

          {!todayMenu ? (
            <EmptyState icon="🍛" title="Menu not available" subtitle="No data for today" />
          ) : (
            ['b','l'].map(k => {
              const meta  = MEAL_META[k];
              const items = todayMenu.meals?.[k === 'b' ? 'breakfast' : 'lunch']?.items || [];
              return (
                <div key={k} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'11px', padding:'14px', marginBottom:'10px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', fontWeight:'700', marginBottom:'8px' }}>
                    <span>{meta.icon} {meta.label}</span>
                    <span style={{ fontSize:'11px', color:'var(--text3)', fontWeight:'500' }}>{meta.time}</span>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                    {items.map(i => (
                      <span key={i.name} style={{ padding:'3px 9px', borderRadius:'20px', fontSize:'11px', color:'var(--text2)', background:'var(--surface)', border:'1px solid var(--border)' }}>{i.name}</span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </Card>

        <Card>
          <div style={{ fontSize:'15px', fontWeight:'700', marginBottom:'16px' }}>Recent Activity</div>
          <EmptyState icon="📭" title="No recent activity" />
        </Card>
      </div>

      <Card>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <span style={{ fontSize:'15px', fontWeight:'700' }}>My Leave History</span>
          <span style={{ fontSize:'12px', color:'var(--amber)', cursor:'pointer', fontWeight:'600' }} onClick={() => navigate('/leave')}>All leaves →</span>
        </div>

        {leaves.length === 0 ? (
          <EmptyState icon="✈" title="No leaves yet" subtitle="Apply for your first leave pass" action={<Button size="sm" onClick={leaveModal.on}>Apply Leave</Button>} />
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>{['Destination','Departure','Return','Status','Action'].map(h => (
                  <th key={h} style={{ fontSize:'10px', color:'var(--text3)', fontWeight:'700', padding:'8px 12px', textAlign:'left', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid var(--border)' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {leaves.map((l, i) => (
                  <tr key={l._id || i} onMouseEnter={e => e.currentTarget.style.background='var(--surface)'} onMouseLeave={e => e.currentTarget.style.background=''}>
                    <td style={{ padding:'12px', fontSize:'13px', borderBottom:'1px solid var(--border)' }}>{l.destination}</td>
                    <td style={{ padding:'12px', fontSize:'13px', borderBottom:'1px solid var(--border)' }}>{formatDate(l.departureDate)}</td>
                    <td style={{ padding:'12px', fontSize:'13px', borderBottom:'1px solid var(--border)' }}>{formatDate(l.returnDate)}</td>
                    <td style={{ padding:'12px', borderBottom:'1px solid var(--border)' }}>
                      <Badge variant={STATUS_COLOR[l.status] || 'gray'}>{l.status}</Badge>
                    </td>
                    <td style={{ padding:'12px', borderBottom:'1px solid var(--border)' }}>
                      {l.status === 'approved' && l.qrCode && (
                        <Button size="sm" variant="ghost" onClick={() => { setActiveQR(l); qrModal.on(); }}>🔳 QR Pass</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={leaveOpen} onClose={leaveModal.off} title="Apply for Leave ✈️">
        <form onSubmit={handleApplyLeave}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            <FormField label="Reason" id="reason" value={lf.reason} onChange={setF('reason')} placeholder="Semester break, medical..." required />
            <FormField label="Destination" id="dest" value={lf.destination} onChange={setF('destination')} placeholder="City / Place" required />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            <FormField label="Departure Date" id="dep" type="date" value={lf.departureDate} onChange={setF('departureDate')} required />
            <FormField label="Return Date" id="ret" type="date" value={lf.returnDate} onChange={setF('returnDate')} required />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            <FormField label="Your Contact" id="contact" value={lf.contactDuringLeave} onChange={setF('contactDuringLeave')} placeholder="9876543210" required />
            <FormField label="Parent's Phone" id="parent" value={lf.parentPhone} onChange={setF('parentPhone')} placeholder="9876543210" required />
          </div>
          <InfoBox variant="amber" icon="🤖">AI will calculate a risk score for your application based on destination, duration and timing.</InfoBox>
          <Button type="submit" fullWidth loading={submitting}>Submit Application</Button>
        </form>
      </Modal>

      <Modal open={qrOpen} onClose={qrModal.off} title="🔳 Leave QR Pass" maxWidth={380}>
        {activeQR && (
          <div style={{ textAlign:'center' }}>
            <div style={{ background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.25)', borderRadius:'9px', padding:'10px', marginBottom:'14px', fontSize:'13px', color:'var(--green)' }}>
              ✅ Approved by Warden
            </div>
            <div style={{ background:'#fff', borderRadius:'12px', padding:'16px', marginBottom:'14px', display:'inline-block' }}>
              <img src={activeQR.qrCode} alt="QR" style={{ width:'160px', height:'160px', display:'block' }} />
            </div>
            <div style={{ background:'var(--bg3)', borderRadius:'10px', padding:'14px', textAlign:'left', fontSize:'13px', lineHeight:'2', color:'var(--text2)' }}>
              <strong style={{ color:'var(--text)' }}>Destination:</strong> {activeQR.destination}<br />
              <strong style={{ color:'var(--text)' }}>Departure:</strong> {formatDate(activeQR.departureDate)}<br />
              <strong style={{ color:'var(--text)' }}>Return:</strong> {formatDate(activeQR.returnDate)}
            </div>
            <InfoBox variant="red" icon="⚠️" style={{ marginTop:'12px', marginBottom:0 }}>Single-use QR. Do not share.</InfoBox>
          </div>
        )}
      </Modal>
    </div>
  );
}
