import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { marketApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useFetch, useToggle } from '../../utils/hooks';
import { Card, Button, Modal, FormField, InfoBox, Spinner, EmptyState } from '../../components/common';

export default function MarketplaceScreen() {
  const { user } = useAuth();
  const [search, setSearch]   = useState('');
  const [sellOpen, sellModal] = useToggle();
  const [sub, setSub]         = useState(false);
  const [form, setForm] = useState({ title:'', description:'', category:'books', condition:'good', price:'', originalPrice:'' });
  const setF = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const { data, loading, refetch } = useFetch(() => marketApi.getAll(), []);
  const listings = data?.listings || [];
  const filtered = listings.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));

  const isSeller = (listing) => {
    const sellerId = listing.seller?._id || listing.seller;
    return sellerId?.toString() === user?._id?.toString();
  };

  const handleInterest = async (id) => {
    try { await marketApi.expressInterest(id); }
    catch (err) { console.log(err); }
    toast.success('Interest expressed! Seller notified 📩');
  };

  const handleMarkSold = async (id) => {
    try {
      await marketApi.markSold(id);
      toast.success('Item sold mark ho gaya! ✅');
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Kuch error hua');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yeh listing delete karna chahte ho?')) return;
    try {
      await marketApi.deleteListing(id);
      toast.success('Listing delete ho gayi! 🗑️');
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Kuch error hua');
    }
  };

  const handleSell = async (e) => {
    e?.preventDefault();
    if (!form.title || !form.price) return toast.error('Title and price required');
    setSub(true);
    try {
      const { data: res } = await marketApi.create({
        ...form,
        price: +form.price,
        originalPrice: form.originalPrice ? +form.originalPrice : undefined
      });
      toast.success(
        res.aiPriceSuggestion?.suggestedPrice
          ? `Listed! AI suggests ₹${res.aiPriceSuggestion.suggestedPrice} 🤖`
          : 'Listing posted!'
      );
      sellModal.off();
      setForm({ title:'', description:'', category:'books', condition:'good', price:'', originalPrice:'' });
      refetch();
    } catch {
      toast.error('Listing failed');
    } finally {
      setSub(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Marketplace 🛒</h1>
          <p className="pageSub">Buy and sell within your hostel community</p>
        </div>
        <Button onClick={sellModal.on}>+ Sell Item</Button>
      </div>

      <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search items..."
          style={{
            padding:'10px 14px',
            background:'var(--bg2)',
            border:'1px solid var(--border)',
            borderRadius:'10px',
            color:'var(--text)',
            fontSize:'13.5px',
            fontFamily:'var(--font-body)',
            outline:'none',
            maxWidth:'280px',
            width:'100%'
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'40px' }}>
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🛒" title="No listings found" />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
          {filtered.map(l => {
            const interestedCount = l.interestedBuyers?.length ?? 0;

            return (
              <div key={l._id}
                style={{
                  background:'var(--bg2)',
                  border:'1px solid var(--border)',
                  borderRadius:'var(--radius)',
                  overflow:'hidden'
                }}
              >
                <div style={{
                  height:'130px',
                  background:'var(--bg3)',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  fontSize:'42px',
                  borderBottom:'1px solid var(--border)'
                }}>
                  {l.emoji || '📦'}
                </div>

                <div style={{ padding:'14px' }}>
                  <div style={{ fontSize:'14px', fontWeight:'600', marginBottom:'6px' }}>{l.title}</div>

                  <div>
                    <span style={{ fontSize:'20px', color:'var(--amber)', fontWeight:'700' }}>₹{l.price}</span>
                    {l.originalPrice && (
                      <span style={{ fontSize:'12px', textDecoration:'line-through', marginLeft:'7px' }}>
                        ₹{l.originalPrice}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize:'11px', marginTop:'6px', marginBottom:'10px', color:'var(--text2)' }}>
                    📍 Block {l.hostelBlock} · {l.condition} · {interestedCount} interested
                  </div>

                  {/* Seller Details Box */}
                  <div style={{
                    display:'flex',
                    alignItems:'center',
                    gap:'10px',
                    margin:'10px 0',
                    padding:'10px 12px',
                    background:'var(--bg3)',
                    borderRadius:'8px',
                    border:'1px solid var(--border)'
                  }}>
                    {/* Avatar */}
                    {l.seller?.profilePhoto ? (
                      <img
                        src={l.seller.profilePhoto}
                        alt={l.seller.name}
                        style={{ width:'36px', height:'36px', borderRadius:'50%', objectFit:'cover', flexShrink:0 }}
                      />
                    ) : (
                      <div style={{
                        width:'36px', height:'36px', borderRadius:'50%',
                        background:'var(--accent)', display:'flex',
                        alignItems:'center', justifyContent:'center',
                        fontSize:'14px', fontWeight:'700', color:'#fff',
                        flexShrink: 0
                      }}>
                        {l.seller?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ overflow:'hidden', flex:1 }}>
                      <div style={{
                        fontSize:'12px', fontWeight:'600', color:'var(--text)',
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
                      }}>
                        👤 {l.seller?.name || 'Unknown'}
                      </div>
                      <div style={{ fontSize:'11px', color:'var(--text2)', marginTop:'2px' }}>
                        🏠 Room {l.seller?.roomNumber || 'N/A'} · Block {l.seller?.hostelBlock || '—'}
                      </div>
                      <div style={{ fontSize:'11px', color:'var(--text2)', marginTop:'2px' }}>
                        📞 {l.seller?.phone || 'Not provided'}
                      </div>
                    </div>
                  </div>

                  {isSeller(l) ? (
                    <div style={{ display:'flex', gap:'8px' }}>
                      <Button fullWidth size="sm" onClick={() => handleMarkSold(l._id)}>
                        Mark Sold
                      </Button>
                      <Button fullWidth size="sm" onClick={() => handleDelete(l._id)}>
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <Button fullWidth size="sm" onClick={() => handleInterest(l._id)}>
                      Express Interest
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={sellOpen} onClose={sellModal.off} title="Create Listing 🛒">
        <form onSubmit={handleSell}>
          <FormField label="Item Title" id="t" value={form.title} onChange={setF('title')} required />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            <FormField label="Category" as="select" value={form.category} onChange={setF('category')}
              options={['books','electronics','clothing','stationery','appliances','other']} />
            <FormField label="Condition" as="select" value={form.condition} onChange={setF('condition')}
              options={['new','like-new','good','fair','poor']} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            <FormField label="Price" type="number" value={form.price} onChange={setF('price')} required />
            <FormField label="Original Price" type="number" value={form.originalPrice} onChange={setF('originalPrice')} />
          </div>

          <FormField label="Description" as="textarea" value={form.description} onChange={setF('description')} />

          <InfoBox variant="amber">AI will suggest a fair market price.</InfoBox>

          <Button type="submit" fullWidth loading={sub}>Post Listing</Button>
        </form>
      </Modal>
    </div>
  );
}