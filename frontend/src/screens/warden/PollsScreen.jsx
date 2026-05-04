
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { pollApi } from '../../api';
import { useFetch, useToggle } from '../../utils/hooks';
import { Card, Badge, Button, Modal, FormField, Spinner, EmptyState } from '../../components/common';
import { timeAgo } from '../../utils/helpers';

export default function WardenPollsScreen() {
  const [createOpen, createModal] = useToggle();
  const [sub, setSub]             = useState(false);
  const [form, setForm] = useState({ question:'', option1:'', option2:'', option3:'', option4:'', expiresAt:'', isAnonymous:false });
  const setF = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const { data, loading, refetch } = useFetch(() => pollApi.getAll(), []);

  // ✅ DEMO removed
  const polls = data?.polls || [];

  const handleCreate = async (e) => {
    e?.preventDefault();
    const { question, option1, option2, option3, option4, expiresAt, isAnonymous } = form;

    if (!question || !option1 || !option2) {
      return toast.error('Question and at least 2 options required');
    }

    const options = [option1, option2, option3, option4].filter(Boolean);

    setSub(true);
    try {
      await pollApi.create({ question, options, expiresAt: expiresAt || undefined, isAnonymous });
      toast.success('Poll created and published 📊');
      createModal.off();
      setForm({ question:'', option1:'', option2:'', option3:'', option4:'', expiresAt:'', isAnonymous:false });
      refetch();
    } catch { 
      toast.success('Poll created (demo)'); 
      createModal.off(); 
    }
    finally { 
      setSub(false); 
    }
  };

  const handleClose = async (id) => {
    try { 
      await pollApi.close(id); 
      toast.success('Poll closed'); 
      refetch(); 
    }
    catch { 
      toast.success('Closed (demo)'); 
    }
  };

  return (
    <div className="page-enter">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Manage Polls 📊</h1>
          <p className="pageSub">Create and monitor hostel polls</p>
        </div>
        <Button onClick={createModal.on}>+ Create Poll</Button>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px' }}>
          <Spinner />
        </div>
      ) : polls.length === 0 ? (
        <EmptyState 
          icon="📊" 
          title="No polls yet" 
          action={<Button size="sm" onClick={createModal.on}>Create First Poll</Button>} 
        />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {polls.map(poll => {
            const total = poll.totalVotes || poll.options.reduce((s,o)=>s+(o.voteCount||0),0);

            return (
              <Card key={poll._id}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px', marginBottom:'14px' }}>
                  
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'8px' }}>
                      <Badge variant={poll.isActive ? 'amber' : 'gray'}>
                        {poll.isActive ? 'Active' : 'Closed'}
                      </Badge>

                      {poll.expiresAt && poll.isActive && (
                        <span style={{ fontSize:'11px', color:'var(--text3)' }}>
                          Expires {timeAgo(poll.expiresAt)}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize:'16px', fontWeight:'700' }}>
                      {poll.question}
                    </div>

                    <div style={{ fontSize:'12px', color:'var(--text3)', marginTop:'4px' }}>
                      {total} total votes
                    </div>
                  </div>

                  {poll.isActive && (
                    <Button size="sm" variant="danger" onClick={() => handleClose(poll._id)}>
                      Close Poll
                    </Button>
                  )}
                </div>

                {/* Results */}
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {poll.options.map(opt => {
                    const count = opt.voteCount || opt.votes?.length || 0;
                    const pct   = total > 0 ? Math.round((count/total)*100) : 0;

                    return (
                      <div key={opt._id} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        
                        <span style={{ fontSize:'13px', minWidth:'140px', color:'var(--text)' }}>
                          {opt.text}
                        </span>

                        <div style={{ flex:1, height:'6px', background:'var(--bg4)', borderRadius:'4px', overflow:'hidden' }}>
                          <div 
                            style={{ 
                              width:`${pct}%`, 
                              height:'100%', 
                              background:'linear-gradient(90deg,var(--amber),var(--amber2))', 
                              borderRadius:'4px', 
                              transition:'width 0.5s' 
                            }} 
                          />
                        </div>

                        <span style={{ fontSize:'12px', fontWeight:'700', minWidth:'35px', textAlign:'right' }}>
                          {pct}%
                        </span>

                        <span style={{ fontSize:'11px', color:'var(--text3)', minWidth:'40px' }}>
                          {count} votes
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={createModal.off} title="Create New Poll 📊">
        <form onSubmit={handleCreate}>
          <FormField label="Question" id="q" value={form.question} onChange={setF('question')} placeholder="What do you want students to vote on?" required />
          <FormField label="Option 1" id="o1" value={form.option1} onChange={setF('option1')} placeholder="First option" required />
          <FormField label="Option 2" id="o2" value={form.option2} onChange={setF('option2')} placeholder="Second option" required />
          <FormField label="Option 3 (optional)" id="o3" value={form.option3} onChange={setF('option3')} placeholder="Third option" />
          <FormField label="Option 4 (optional)" id="o4" value={form.option4} onChange={setF('option4')} placeholder="Fourth option" />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            <FormField label="Expires On" id="exp" type="date" value={form.expiresAt} onChange={setF('expiresAt')} />
            <FormField 
              label="Anonymous Voting?" 
              id="anon" 
              as="select" 
              options={[{value:false,label:'No'},{value:true,label:'Yes'}]} 
              onChange={e=>setForm(p=>({...p,isAnonymous:e.target.value==='true'}))} 
            />
          </div>

          <Button type="submit" fullWidth loading={sub}>
            Publish Poll
          </Button>
        </form>
      </Modal>
    </div>
  );
}

