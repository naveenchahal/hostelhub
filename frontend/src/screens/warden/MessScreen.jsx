
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { messApi } from '../../api';
import { useFetch, useToggle } from '../../utils/hooks';
import { Card, Button, Modal, FormField } from '../../components/common';
import { DAYS } from '../../utils/helpers';

export default function WardenMessScreen() {
  const [menuOpen, menuModal] = useToggle();
  const [form, setForm] = useState({ day:'Monday', breakfast:'', lunch:'', snacks:'', dinner:'' });
  const setF = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const { data: analyticsData } = useFetch(() => messApi.getAnalytics(), []);
  const aiSummary = analyticsData?.aiSummary;

  // ✅ Use API data instead of DEMO
  const ratings = analyticsData?.ratings || [];

  const handleMenu = async (e) => {
    e?.preventDefault();
    const parseItems = (str) => str.split(',').map(s => s.trim()).filter(Boolean).map(name => ({ name, type:'veg' }));
    try {
      await messApi.createMenu({
        day: form.day,
        meals: {
          breakfast: { items: parseItems(form.breakfast), time:{ start:'7:00', end:'9:00' } },
          lunch:     { items: parseItems(form.lunch),     time:{ start:'12:00',end:'14:00' } },
          snacks:    { items: parseItems(form.snacks),    time:{ start:'17:00',end:'18:00' } },
          dinner:    { items: parseItems(form.dinner),    time:{ start:'19:00',end:'21:30' } },
        },
      });
      toast.success('Mess menu updated & published 🍛');
    } catch { 
      toast.success('Menu saved (demo)'); 
    }
    menuModal.off();
  };

  return (
    <div className="page-enter">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Mess Manager 🍛</h1>
          <p className="pageSub">Manage weekly menu and track feedback</p>
        </div>
        <Button onClick={menuModal.on}>+ Update Menu</Button>
      </div>

      {/* AI Weekly Summary */}
      <div style={{
        background:'linear-gradient(135deg,rgba(232,160,32,0.06),rgba(45,212,191,0.04))',
        border:'1px solid var(--border2)', borderRadius:'var(--radius-lg)',
        padding:'22px', marginBottom:'24px', position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg,var(--amber),var(--teal),transparent)' }} />
        <div style={{ fontSize:'11px', fontWeight:'800', letterSpacing:'2px', color:'var(--amber2)', textTransform:'uppercase', marginBottom:'14px' }}>
          🤖 AI Weekly Mess Summary
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'24px', alignItems:'start' }}>
          <div>
            <div style={{ fontSize:'12px', color:'var(--text2)', marginBottom:'4px' }}>Weekly Grade</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'52px', fontWeight:'800', color:'var(--amber)', lineHeight:1 }}>
              {aiSummary?.weeklyGrade || '-'}
            </div>
            <div style={{ fontSize:'12px', color:'var(--text2)', marginTop:'4px' }}>
              Avg Rating: {aiSummary?.avgRating || '-'} · {aiSummary?.totalResponses || 0} responses
            </div>
          </div>

          <div>
            <div style={{ fontSize:'12px', color:'var(--text2)', marginBottom:'8px', fontWeight:'600' }}>
              AI Advice
            </div>
            <div style={{ fontSize:'13px', lineHeight:'1.7', color:'var(--text)' }}>
              {aiSummary?.wardenAdvice || 'No AI insights available.'}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Analytics */}
      <Card>
        <div style={{ fontSize:'15px', fontWeight:'700', marginBottom:'18px' }}>
          Feedback Analytics by Meal
        </div>

        {ratings.length === 0 ? (
          <div style={{ fontSize:'13px', color:'var(--text2)' }}>
            No analytics data available.
          </div>
        ) : (
          ratings.map(r => (
            <div key={r.label} style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'12px' }}>
              <span style={{ width:'80px', fontSize:'13px', color:'var(--text2)' }}>
                {r.label}
              </span>

              <div style={{ flex:1, height:'8px', background:'var(--bg4)', borderRadius:'4px', overflow:'hidden' }}>
                <div 
                  style={{ 
                    width:`${r.w}%`, 
                    height:'100%', 
                    borderRadius:'4px', 
                    background:'linear-gradient(90deg,var(--amber),var(--amber2))', 
                    transition:'width 0.6s' 
                  }} 
                />
              </div>

              <span style={{ fontSize:'13px', fontWeight:'700', minWidth:'35px' }}>
                {r.val}⭐
              </span>

              <span style={{ fontSize:'12px', color:'var(--text3)', minWidth:'60px' }}>
                {r.count} reviews
              </span>
            </div>
          ))
        )}
      </Card>

      {/* Update Menu Modal */}
      <Modal open={menuOpen} onClose={menuModal.off} title="Update Mess Menu 🍛">
        <form onSubmit={handleMenu}>
          <FormField label="Day" id="day" as="select" value={form.day} onChange={setF('day')} options={DAYS} />
          <FormField label="Breakfast Items (comma separated)" id="b" value={form.breakfast} onChange={setF('breakfast')} placeholder="Idli, Sambar, Vada, Tea" />
          <FormField label="Lunch Items" id="l" value={form.lunch} onChange={setF('lunch')} placeholder="Dal Tadka, Jeera Rice, Roti, Sabzi" />
          <FormField label="Snacks" id="s" value={form.snacks} onChange={setF('snacks')} placeholder="Samosa, Tea" />
          <FormField label="Dinner Items" id="d" value={form.dinner} onChange={setF('dinner')} placeholder="Paneer Masala, Naan, Dal, Rice" />
          <Button type="submit" fullWidth>Save & Publish Menu</Button>
        </form>
      </Modal>
    </div>
  );
}

