import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { messApi } from '../../api';
import { Card, Button } from '../../components/common';
import { DAYS, MEAL_META } from '../../utils/helpers';

export default function MessScreen() {
  const [activeDay, setActiveDay] = useState('Monday');
  const [rating, setRating]       = useState(0);
  const [meal, setMeal]           = useState('breakfast');
  const [comment, setComment]     = useState('');

  const menu = {}; // removed demo data

  const handleFeedback = async () => {
    if (!rating) return toast.error('Please select a rating');
    try { await messApi.submitFeedback({ mealType:meal, rating, comment }); }
    catch {}
    toast.success(`${rating}⭐ feedback for ${meal} submitted!`);
    setRating(0); setComment('');
  };

  return (
    <div className="page-enter">
      <div className="pageHeader">
        <div><h1 className="pageTitle">Mess Menu 🍛</h1><p className="pageSub">Weekly menu & rate your meals</p></div>
      </div>

      {/* Day tabs */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
        {DAYS.map(d => (
          <Button key={d} size="sm" variant={activeDay===d?'amber':'ghost'} onClick={() => setActiveDay(d)}>
            {d.slice(0,3)}
          </Button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
        {/* Menu display */}
        <div>
          {Object.keys(menu).length === 0 && (
            <div style={{ color:'var(--text3)', fontSize:'13px' }}>No menu available</div>
          )}
        </div>

        <div>
          {/* Rate meal */}
          <Card style={{ marginBottom:'16px' }}>
            <div style={{ fontSize:'15px', fontWeight:'700', marginBottom:'16px' }}>Rate Today's Meal</div>

            <div style={{ marginBottom:'14px' }}>
              <label style={{ fontSize:'11px', fontWeight:'700', color:'var(--text3)', letterSpacing:'1px', textTransform:'uppercase', display:'block', marginBottom:'7px' }}>MEAL</label>
              <select value={meal} onChange={e=>setMeal(e.target.value)}
                style={{ width:'100%', padding:'11px 14px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'13.5px', fontFamily:'var(--font-body)', outline:'none', appearance:'none' }}>
                {['breakfast','lunch','snacks','dinner'].map(m=><option key={m}>{m}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:'14px' }}>
              <label style={{ fontSize:'11px', fontWeight:'700', color:'var(--text3)', letterSpacing:'1px', textTransform:'uppercase', display:'block', marginBottom:'7px' }}>RATING</label>
              <div style={{ display:'flex', gap:'6px' }}>
                {[1,2,3,4,5].map(n => (
                  <span key={n}
                    style={{ fontSize:'24px', cursor:'pointer', opacity:n<=rating?1:0.25 }}
                    onClick={() => setRating(n)}
                  >⭐</span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:'14px' }}>
              <label style={{ fontSize:'11px', fontWeight:'700', color:'var(--text3)', letterSpacing:'1px', textTransform:'uppercase', display:'block', marginBottom:'7px' }}>COMMENT</label>
              <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="How was the food today?"
                rows={3} style={{ width:'100%', padding:'11px 14px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'13.5px', fontFamily:'var(--font-body)', outline:'none', resize:'vertical' }}/>
            </div>

            <Button fullWidth onClick={handleFeedback}>Submit Rating</Button>
          </Card>

          {/* Weekly ratings (empty for now) */}
          <Card>
            <div style={{ fontSize:'15px', fontWeight:'700', marginBottom:'14px' }}>This Week's Ratings</div>
            <div style={{ color:'var(--text3)', fontSize:'13px' }}>No ratings available</div>
          </Card>
        </div>
      </div>
    </div>
  );
}