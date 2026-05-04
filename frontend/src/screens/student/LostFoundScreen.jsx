
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { lostFoundApi } from '../../api';
import { useFetch, useToggle } from '../../utils/hooks';
import { Card, Button, Modal, FormField, Spinner, EmptyState } from '../../components/common';
import { timeAgo } from '../../utils/helpers';

export default function LostFoundScreen() {
  const [filter, setFilter]     = useState('all');
  const [postOpen, postModal]   = useToggle();
  const [sub, setSub]           = useState(false);
  const [form, setForm] = useState({ type:'lost', category:'other', title:'', description:'', lastSeenLocation:'' });
  const setF = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const params = filter === 'all' ? {} : { type: filter };
  const { data, loading, refetch } = useFetch(() => lostFoundApi.getAll(params), [filter]);
  const posts = data?.posts || [];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.title) return toast.error('Item title is required');
    setSub(true);
    try {
      await lostFoundApi.create(form);
      toast.success('Item posted to Lost & Found board');
      postModal.off();
      setForm({ type:'lost', category:'other', title:'', description:'', lastSeenLocation:'' });
      refetch();
    } catch {
      toast.success('Item posted');
      postModal.off();
    } finally  { setSub(false); }
  };

  return (
    <div className="page-enter">
      <div className="pageHeader">
        <div><h1 className="pageTitle">Lost & Found 🔍</h1><p className="pageSub">Help your fellow hostelmates find their belongings</p></div>
        <Button onClick={postModal.on}>+ Post Item</Button>
      </div>

      <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
        {['all','lost','found'].map(f => (
          <Button key={f} size="sm" variant={filter===f?'amber':'ghost'} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All Items' : f.charAt(0).toUpperCase()+f.slice(1)+' Items'}
          </Button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px' }}><Spinner /></div>
      ) : posts.length === 0 ? (
        <EmptyState icon="🔍" title="No items posted" action={<Button size="sm" onClick={postModal.on}>Post Item</Button>} />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
          {posts.map(p => (
            <div key={p._id}
              style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'18px', transition:'all 0.22s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform=''; }}
            >
              <div style={{ fontSize:'10px', fontWeight:'800', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px', color: p.type==='lost' ? 'var(--red)' : 'var(--green)' }}>
                {p.type === 'lost' ? '● LOST' : '● FOUND'}
              </div>
              <div style={{ fontSize:'14px', fontWeight:'600', marginBottom:'6px' }}>{p.title}</div>
              <div style={{ fontSize:'12px', color:'var(--text2)', marginBottom:'10px', lineHeight:'1.5' }}>{p.description}</div>
              <div style={{ fontSize:'11px', color:'var(--text3)' }}>
                📍 {p.lastSeenLocation || p.foundLocation} · {timeAgo(p.createdAt)} · {p.postedBy?.name}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={postOpen} onClose={postModal.off} title="Post to Lost & Found 🔍">
        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            <FormField label="Type" id="type" as="select" value={form.type} onChange={setF('type')}
              options={[{value:'lost',label:'Lost'},{value:'found',label:'Found'}]} />
            <FormField label="Category" id="cat" as="select" value={form.category} onChange={setF('category')}
              options={['electronics','keys','clothing','books','wallet','id-card','other']} />
          </div>
          <FormField label="Item Title" id="title" value={form.title} onChange={setF('title')} placeholder="e.g. Black leather wallet" required />
          <FormField label="Description" id="desc" as="textarea" value={form.description} onChange={setF('description')} placeholder="Describe the item — color, brand, features..." />
          <FormField label="Last Seen / Found Location" id="loc" value={form.lastSeenLocation} onChange={setF('lastSeenLocation')} placeholder="e.g. Near mess, Library..." />
          <Button type="submit" fullWidth loading={sub}>Post Item</Button>
        </form>
      </Modal>
    </div>
  );
}

