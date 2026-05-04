import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { adminApi, leaveApi, notifApi } from '../../api';
import { useFetch, useToggle } from '../../utils/hooks';
import { Card, StatCard, Badge, Button, Modal, FormField, Spinner, EmptyState } from '../../components/common';
import { formatDate } from '../../utils/helpers';

const RISK_COLOR = (score) => score >= 60 ? 'red' : score >= 35 ? 'amber' : 'green';

export default function WardenDashboard() {
  const navigate = useNavigate();
  const [bcOpen, bcModal] = useToggle();
  const [sub, setSub]     = useState(false);
  const [bc, setBc]       = useState({ title:'', message:'', priority:'normal' });
  const setF = (k) => (e) => setBc(p => ({ ...p, [k]: e.target.value }));

  const { data: dashData, loading, refetch } = useFetch(() => adminApi.getDashboard(), []);

  // ✅ No demo data — real data only
  const stats        = dashData?.stats        || { totalStudents:0, pendingLeaves:0, openComplaints:0, activeListings:0, activePolls:0 };
  const recentLeaves = dashData?.recentLeaves || [];
  const urgentComps  = dashData?.urgentComplaints || [];

  const handleApprove = async (id) => {
    try {
      await leaveApi.approve(id);
      toast.success('Leave approved ✅ QR sent to student email');
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve leave');
    }
  };

  const handleReject = async (id) => {
    try {
      await leaveApi.reject(id, 'Rejected by warden');
      toast.success('Leave rejected. Student notified.');
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject leave');
    }
  };

  const handleBroadcast = async () => {
    if (!bc.title || !bc.message) return toast.error('Title and message required');
    setSub(true);
    try {
      await notifApi.broadcast(bc);
      toast.success('Announcement sent to all students 📢');
      bcModal.off();
      setBc({ title:'', message:'', priority:'normal' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setSub(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="pageHeader">
        <div><h1 className="pageTitle">Warden Dashboard 🏛️</h1><p className="pageSub">Hostel management overview</p></div>
        <Button onClick={bcModal.on}>📢 Broadcast</Button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        <StatCard icon="👥" value={stats.totalStudents}  label="Total Students"  change="Active students"  changeType="up"   />
        <StatCard icon="✈"  value={stats.pendingLeaves}  label="Pending Leaves"  change="Needs attention"  changeType="down" color="var(--amber)" />
        <StatCard icon="🔧" value={stats.openComplaints} label="Open Complaints" change="Needs attention"  changeType="down" color="var(--red)"   />
        <StatCard icon="📊" value={stats.activePolls}    label="Active Polls"    change="Live polls"       changeType="up"   />
      </div>

      {/* AI Insights */}
      <div style={{
        background:'linear-gradient(135deg,rgba(232,160,32,0.06),rgba(45,212,191,0.04))',
        border:'1px solid var(--border2)', borderRadius:'var(--radius-lg)',
        padding:'22px', marginBottom:'24px', position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg,var(--amber),var(--teal),transparent)' }} />
        <div style={{ fontSize:'11px', fontWeight:'800', letterSpacing:'2px', color:'var(--amber2)', textTransform:'uppercase', marginBottom:'14px' }}>
          🤖 AI Insights This Week
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
          {[
            { label:'Complaint Trends', text:'Check complaint patterns and schedule maintenance accordingly.' },
            { label:'Leave Risk Flags', text:'Review high-risk leave applications before approving.' },
            { label:'Mess Feedback',    text:'Monitor mess ratings and address student concerns.' },
          ].map(item => (
            <div key={item.label} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', borderRadius:'10px', padding:'14px' }}>
              <div style={{ fontSize:'10px', color:'var(--text3)', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px' }}>{item.label}</div>
              <div style={{ fontSize:'13px', lineHeight:'1.6', color:'var(--text2)' }}>{item.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>

        {/* Pending Leaves */}
        <Card>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
            <span style={{ fontSize:'15px', fontWeight:'700' }}>Pending Leave Requests</span>
            <span style={{ fontSize:'12px', color:'var(--amber)', cursor:'pointer', fontWeight:'600' }} onClick={() => navigate('/warden/leave-requests')}>All →</span>
          </div>
          {loading
            ? <div style={{ textAlign:'center', padding:'20px' }}><Spinner /></div>
            : recentLeaves.length === 0
              ? <EmptyState icon="✈" title="No pending leaves" subtitle="All caught up!" />
              : <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr>
                        {['Student','Dest.','Days','Risk','Actions'].map(h => (
                          <th key={h} style={{ fontSize:'10px', color:'var(--text3)', fontWeight:'700', padding:'7px 10px', textAlign:'left', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid var(--border)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentLeaves.slice(0, 3).map((l, i) => {
                        const days = Math.ceil((new Date(l.returnDate) - new Date(l.departureDate)) / 86400000);
                        return (
                          <tr key={l._id || i}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                            onMouseLeave={e => e.currentTarget.style.background = ''}
                          >
                            <td style={{ padding:'10px', fontSize:'12px', borderBottom:'1px solid var(--border)' }}>
                              <div style={{ fontWeight:'600' }}>{l.student?.name}</div>
                              <div style={{ fontSize:'10px', color:'var(--text3)' }}>{l.student?.roomNumber}</div>
                            </td>
                            <td style={{ padding:'10px', fontSize:'12px', borderBottom:'1px solid var(--border)' }}>{l.destination}</td>
                            <td style={{ padding:'10px', fontSize:'12px', borderBottom:'1px solid var(--border)' }}>{days}d</td>
                            <td style={{ padding:'10px', borderBottom:'1px solid var(--border)' }}>
                              <Badge variant={RISK_COLOR(l.aiRiskScore || 0)}>{l.aiRiskScore || 0}/100</Badge>
                            </td>
                            <td style={{ padding:'10px', borderBottom:'1px solid var(--border)' }}>
                              <div style={{ display:'flex', gap:'4px' }}>
                                <Button size="sm" variant="teal"   onClick={() => handleApprove(l._id)}>✓</Button>
                                <Button size="sm" variant="danger" onClick={() => handleReject(l._id)}>✕</Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
          }
        </Card>

        {/* Urgent Complaints */}
        <Card>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
            <span style={{ fontSize:'15px', fontWeight:'700' }}>Urgent Complaints</span>
            <span style={{ fontSize:'12px', color:'var(--amber)', cursor:'pointer', fontWeight:'600' }} onClick={() => navigate('/warden/complaints')}>All →</span>
          </div>
          {loading
            ? <div style={{ textAlign:'center', padding:'20px' }}><Spinner /></div>
            : urgentComps.length === 0
              ? <EmptyState icon="🔧" title="No urgent complaints" subtitle="All clear!" />
              : urgentComps.map((c, i) => (
                  <div key={c._id || i} style={{ display:'flex', alignItems:'flex-start', gap:'12px', padding:'12px 0', borderBottom: i < urgentComps.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width:'8px', height:'8px', borderRadius:'50%', background: c.priority === 'urgent' ? 'var(--red)' : 'var(--amber)', marginTop:'5px', flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'13px', fontWeight:'600' }}>{c.title}</div>
                      <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'2px' }}>{c.student?.name} · {c.student?.roomNumber}</div>
                    </div>
                    <Badge variant={c.priority === 'urgent' ? 'red' : 'amber'}>{c.priority}</Badge>
                  </div>
                ))
          }
        </Card>
      </div>

      {/* Broadcast Modal */}
      <Modal open={bcOpen} onClose={bcModal.off} title="📢 Broadcast Announcement">
        <div>
          <FormField label="Title"    id="bt"  value={bc.title}    onChange={setF('title')}    placeholder="Announcement title" />
          <FormField label="Message"  id="bm"  as="textarea" value={bc.message}  onChange={setF('message')}  placeholder="Write your announcement for all students..." />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            <FormField label="Priority" id="bp" as="select" value={bc.priority} onChange={setF('priority')}
              options={[{ value:'normal', label:'Normal' }, { value:'high', label:'High' }]} />
            <FormField label="Target" id="bt2" as="select"
              options={['All Students','Block A','Block B','Block C','Block D']} />
          </div>
          <Button fullWidth loading={sub} onClick={handleBroadcast}>Send Announcement 📨</Button>
        </div>
      </Modal>
    </div>
  );
}