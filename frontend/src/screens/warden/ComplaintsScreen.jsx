import React from 'react';
import toast from 'react-hot-toast';
import { complaintApi } from '../../api';
import { useFetch } from '../../utils/hooks';
import { Card, Badge, Button, StatCard, Spinner, EmptyState } from '../../components/common';
import { formatDate, PRIORITY_COLOR } from '../../utils/helpers';

export default function WardenComplaintsScreen() {
  const { data, loading, refetch } = useFetch(() => complaintApi.getAll(), []);
  // ✅ No demo data — empty array if API returns nothing
  const complaints = data?.complaints || [];

  const updateStatus = async (id, status) => {
    try {
      await complaintApi.updateStatus(id, { status });
      toast.success(`Status updated to "${status}"`);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    }
  };

  const STATUS_OPTIONS = ['open', 'in-progress', 'resolved', 'closed'];
  const STATUS_COLOR   = { open:'red', 'in-progress':'amber', resolved:'green', closed:'gray' };

  return (
    <div className="page-enter">
      <div className="pageHeader">
        <div><h1 className="pageTitle">All Complaints 🔧</h1><p className="pageSub">Manage and resolve student complaints</p></div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        <StatCard icon="📂" value={complaints.filter(c => c.status === 'open').length}        label="Open"           color="var(--red)"   />
        <StatCard icon="⚙️" value={complaints.filter(c => c.status === 'in-progress').length} label="In Progress"    color="var(--amber)" />
        <StatCard icon="✅" value={complaints.filter(c => c.status === 'resolved').length}     label="Resolved"       color="var(--green)" />
        <StatCard icon="⏱"  value={complaints.length}                                          label="Total"                               />
      </div>

      <Card>
        {loading
          ? <div style={{ textAlign:'center', padding:'40px' }}><Spinner /></div>
          : complaints.length === 0
            ? <EmptyState icon="🔧" title="No complaints" subtitle="All clear!" />
            : <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr>
                      {['Student','Title','Category','Priority','Status','Date','Update'].map(h => (
                        <th key={h} style={{ fontSize:'10px', color:'var(--text3)', fontWeight:'700', padding:'9px 12px', textAlign:'left', letterSpacing:'1px', textTransform:'uppercase', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c, i) => (
                      <tr key={c._id || i}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        <td style={{ padding:'12px', borderBottom:'1px solid var(--border)' }}>
                          <div style={{ fontSize:'13px', fontWeight:'600' }}>{c.student?.name}</div>
                          <div style={{ fontSize:'11px', color:'var(--text3)' }}>{c.student?.roomNumber}</div>
                        </td>
                        <td style={{ padding:'12px', fontSize:'13px', borderBottom:'1px solid var(--border)', maxWidth:'160px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title}</td>
                        <td style={{ padding:'12px', fontSize:'12px', color:'var(--text2)', borderBottom:'1px solid var(--border)', textTransform:'capitalize' }}>{c.category}</td>
                        <td style={{ padding:'12px', borderBottom:'1px solid var(--border)' }}><Badge variant={PRIORITY_COLOR[c.priority] || 'gray'}>{c.priority}</Badge></td>
                        <td style={{ padding:'12px', borderBottom:'1px solid var(--border)' }}><Badge variant={STATUS_COLOR[c.status] || 'gray'}>{c.status}</Badge></td>
                        <td style={{ padding:'12px', fontSize:'12px', color:'var(--text2)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{formatDate(c.createdAt)}</td>
                        <td style={{ padding:'12px', borderBottom:'1px solid var(--border)' }}>
                          <select
                            defaultValue={c.status}
                            onChange={e => updateStatus(c._id, e.target.value)}
                            style={{ padding:'6px 10px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'7px', color:'var(--text)', fontSize:'11px', fontFamily:'var(--font-body)', outline:'none', cursor:'pointer' }}
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s}>{s.replace('-', ' ').toUpperCase()}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        }
      </Card>
    </div>
  );
}