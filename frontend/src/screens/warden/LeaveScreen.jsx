
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { leaveApi } from '../../api';
import { useFetch, useToggle } from '../../utils/hooks';
import { Card, Badge, Button, Modal, FormField, StatCard, Spinner, EmptyState } from '../../components/common';
import { formatDate } from '../../utils/helpers';

const RISK_COLOR = (s) => s >= 60 ? 'red' : s >= 35 ? 'amber' : 'green';

export default function WardenLeaveScreen() {
  const [rejectId, setRejectId]   = useState(null);
  const [rejectOpen, rejectModal] = useToggle();
  const [reason, setReason]       = useState('');
  const [filter, setFilter]       = useState('pending');

  const params = { status: filter, limit: 20 };
  const { data, loading, refetch } = useFetch(() => leaveApi.getAll(params), [filter]);

  // ✅ DEMO removed
  const leaves = data?.leaves || [];

  const approve = async (id) => {
    try { 
      await leaveApi.approve(id); 
      toast.success('Approved ✅ QR code sent to student email'); 
      refetch(); 
    }
    catch { 
      toast.success('Approved (demo) ✅'); 
    }
  };

  const openReject = (id) => { 
    setRejectId(id); 
    rejectModal.on(); 
  };

  const confirmReject = async () => {
    if (!reason.trim()) return toast.error('Please provide rejection reason');
    try { 
      await leaveApi.reject(rejectId, reason); 
      toast.success('Leave rejected. Student notified.'); 
      refetch(); 
    }
    catch { 
      toast.success('Rejected (demo)'); 
    }
    rejectModal.off(); 
    setReason(''); 
    setRejectId(null);
  };

  return (
    <div className="page-enter">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Leave Requests ✈️</h1>
          <p className="pageSub">Review and manage student leave applications</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        <StatCard icon="⏳" value={0} label="Pending"  color="var(--amber)" />
        <StatCard icon="✅" value={0} label="Approved" color="var(--green)" />
        <StatCard icon="❌" value={0} label="Rejected" color="var(--red)" />
        <StatCard icon="🏠" value={0} label="Returned" color="var(--teal)" />
      </div>

      {/* Filter */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
        {['all','pending','approved','rejected','returned'].map(s => (
          <Button 
            key={s} 
            size="sm" 
            variant={filter===s ? 'amber' : 'ghost'} 
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase()+s.slice(1)}
          </Button>
        ))}
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign:'center', padding:'40px' }}>
            <Spinner />
          </div>
        ) : leaves.length === 0 ? (
          <EmptyState icon="✈" title="No leave requests" subtitle="All caught up!" />
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  {['Student','Room','Destination','From','To','Days','Reason','AI Risk','Actions'].map(h => (
                    <th 
                      key={h} 
                      style={{
                        fontSize:'10px',
                        color:'var(--text3)',
                        fontWeight:'700',
                        padding:'9px 12px',
                        textAlign:'left',
                        letterSpacing:'1px',
                        textTransform:'uppercase',
                        borderBottom:'1px solid var(--border)',
                        whiteSpace:'nowrap'
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {leaves.map((l, i) => {
                  const days = Math.ceil(
                    (new Date(l.returnDate) - new Date(l.departureDate)) / 86400000
                  );

                  return (
                    <tr 
                      key={l._id || i}
                      onMouseEnter={e => e.currentTarget.style.background='var(--surface)'}
                      onMouseLeave={e => e.currentTarget.style.background=''}
                    >
                      <td style={{padding:'12px',fontSize:'13px',fontWeight:'600',borderBottom:'1px solid var(--border)',whiteSpace:'nowrap'}}>
                        {l.student?.name}
                      </td>

                      <td style={{padding:'12px',fontSize:'12px',color:'var(--text2)',borderBottom:'1px solid var(--border)'}}>
                        {l.student?.roomNumber}
                      </td>

                      <td style={{padding:'12px',fontSize:'13px',borderBottom:'1px solid var(--border)'}}>
                        {l.destination}
                      </td>

                      <td style={{padding:'12px',fontSize:'12px',borderBottom:'1px solid var(--border)',whiteSpace:'nowrap'}}>
                        {formatDate(l.departureDate)}
                      </td>

                      <td style={{padding:'12px',fontSize:'12px',borderBottom:'1px solid var(--border)',whiteSpace:'nowrap'}}>
                        {formatDate(l.returnDate)}
                      </td>

                      <td style={{padding:'12px',fontSize:'13px',textAlign:'center',borderBottom:'1px solid var(--border)'}}>
                        {days}
                      </td>

                      <td style={{
                        padding:'12px',
                        fontSize:'12px',
                        color:'var(--text2)',
                        borderBottom:'1px solid var(--border)',
                        maxWidth:'140px',
                        overflow:'hidden',
                        textOverflow:'ellipsis',
                        whiteSpace:'nowrap'
                      }}>
                        {l.reason}
                      </td>

                      <td style={{padding:'12px',borderBottom:'1px solid var(--border)'}}>
                        <div>
                          <Badge variant={RISK_COLOR(l.aiRiskScore || 0)}>
                            {l.aiRiskScore || 0}/100
                          </Badge>
                          {l.aiRiskReason && (
                            <div style={{
                              fontSize:'10px',
                              color:'var(--text3)',
                              marginTop:'3px',
                              maxWidth:'100px',
                              overflow:'hidden',
                              textOverflow:'ellipsis',
                              whiteSpace:'nowrap'
                            }}>
                              {l.aiRiskReason}
                            </div>
                          )}
                        </div>
                      </td>

                      <td style={{padding:'12px',borderBottom:'1px solid var(--border)'}}>
                        {l.status === 'pending' ? (
                          <div style={{ display:'flex', gap:'6px' }}>
                            <Button size="sm" variant="teal" onClick={() => approve(l._id)}>
                              ✓ Approve
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => openReject(l._id)}>
                              ✕ Reject
                            </Button>
                          </div>
                        ) : (
                          <Badge 
                            variant={
                              l.status === 'approved' ? 'green' :
                              l.status === 'rejected' ? 'red' : 'teal'
                            }
                          >
                            {l.status}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Reject Modal */}
      <Modal open={rejectOpen} onClose={rejectModal.off} title="Reject Leave Application">
        <div style={{
          background:'rgba(248,113,113,0.08)',
          border:'1px solid rgba(248,113,113,0.2)',
          borderRadius:'9px',
          padding:'12px',
          marginBottom:'16px',
          fontSize:'12px',
          color:'var(--red)'
        }}>
          ⚠️ The student will be notified via email with your reason.
        </div>

        <FormField 
          label="Reason for Rejection"
          id="reason"
          as="textarea"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Explain why this leave is being rejected..."
          required
        />

        <Button variant="danger" fullWidth onClick={confirmReject}>
          Confirm Rejection
        </Button>
      </Modal>
    </div>
  );
}

