import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { pollApi } from '../../api';
import { useFetch } from '../../utils/hooks';
import { Card, Button, Spinner, EmptyState } from '../../components/common';
import { timeAgo } from '../../utils/helpers';

export default function PollsScreen() {
  const { data, loading, refetch } = useFetch(() => pollApi.getAll(), []);
  const polls = data?.polls || []; // removed demo fallback
  const [voted, setVoted] = useState({});

  const handleVote = async (pollId, optionId) => {
    if (voted[pollId]) return toast.error('You have already voted in this poll');
    try { await pollApi.vote(pollId, optionId); } catch {}
    setVoted(p => ({ ...p, [pollId]: optionId }));
    toast.success('Vote recorded! 📊');
    refetch();
  };

  if (loading) return <div style={{ textAlign:'center', padding:'60px' }}><Spinner /></div>;

  return (
    <div className="page-enter">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Polls & Voting 📊</h1>
          <p className="pageSub">Make your voice heard in hostel decisions</p>
        </div>
      </div>

      {polls.length === 0 ? (
        <EmptyState icon="📊" title="No active polls" subtitle="Wardens will post polls for hostel decisions" />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
          {polls.map(poll => {
            const myVote   = voted[poll._id];
            const hasVoted = !!myVote;
            const total    = poll.totalVotes || poll.options.reduce((s, o) => s + (o.voteCount || o.votes?.length || 0), 0);

            return (
              <Card key={poll._id}>
                {/* Status */}
                <div style={{
                  fontSize:'10px', fontWeight:'800', letterSpacing:'1.5px',
                  color: poll.isActive ? 'var(--amber2)' : 'var(--text3)',
                  marginBottom:'8px',
                }}>
                  {poll.isActive ? '● ACTIVE' : '○ CLOSED'}
                  {poll.expiresAt && poll.isActive && (
                    <span style={{ marginLeft:'8px', color:'var(--text3)', fontWeight:'500', textTransform:'none', letterSpacing:0 }}>
                      · Expires {timeAgo(poll.expiresAt)}
                    </span>
                  )}
                </div>

                <div style={{ fontSize:'15px', fontWeight:'700', marginBottom:'14px', lineHeight:'1.4' }}>
                  {poll.question}
                </div>

                {/* Options */}
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {poll.options.map(opt => {
                    const count   = opt.voteCount || opt.votes?.length || 0;
                    const pct     = total > 0 ? Math.round((count / total) * 100) : 0;
                    const isMyVote= myVote === opt._id;
                    const canVote = poll.isActive && !hasVoted;

                    return (
                      <div
                        key={opt._id}
                        onClick={() => canVote && handleVote(poll._id, opt._id)}
                        style={{
                          padding:'11px 13px',
                          background: isMyVote ? 'rgba(232,160,32,0.1)' : 'var(--bg3)',
                          border:`1px solid ${isMyVote ? 'var(--amber)' : 'var(--border)'}`,
                          borderRadius:'10px',
                          cursor: canVote ? 'pointer' : 'default',
                          display:'flex', alignItems:'center', gap:'10px',
                        }}
                      >
                        <span style={{ fontSize:'13px', flex:'0 0 auto', maxWidth:'160px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {isMyVote && '✓ '}{opt.text}
                        </span>
                        <div style={{ flex:1, height:'4px', background:'var(--border)', borderRadius:'4px', overflow:'hidden' }}>
                          <div style={{ width:`${pct}%`, height:'100%', background:'var(--amber)', borderRadius:'4px' }} />
                        </div>
                        <span style={{ fontSize:'11px', color:'var(--text2)', minWidth:'32px', textAlign:'right', fontWeight:'600' }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'10px', display:'flex', justifyContent:'space-between' }}>
                  <span>{total} total votes</span>
                  <span>by {poll.createdBy?.name}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}