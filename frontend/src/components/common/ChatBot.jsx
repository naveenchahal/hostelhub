import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '../../api';
import styles from './ChatBot.module.css';

const FALLBACKS = {
  mess:      'Mess timings: 🌅 Breakfast 7–9am · ☀️ Lunch 12–2pm · 🌆 Snacks 5–6pm · 🌙 Dinner 7–10:30pm',
  leave:     'Go to Leave Pass → "+Apply Leave". Fill destination, dates & contacts. Warden approves within 24 hrs. QR pass sent by email.',
  complaint: 'Go to Complaints → "+File Complaint". Describe the issue. AI auto-assigns priority. Resolution in 24–72 hrs.',
  wifi:      'WiFi username = roll number. Contact warden for password. File a complaint under "Internet" for issues.',
  gate:      'Gate curfew: 10 PM weekdays, 11 PM weekends. Always carry hostel ID.',
  laundry:   'Laundry in Block A basement — ₹20/wash. Open 7am–9pm. Iron free in common room.',
  market:    'Marketplace: sell items to hostelmates. Go to Marketplace → "+Sell Item". AI suggests fair pricing!',
};

export default function ChatBot() {
  const [open, setOpen]     = useState(false);
  const [msgs, setMsgs]     = useState([
    { from:'bot', text:"Hi! I'm HostelBot 🤖 Ask me anything about hostel — mess, leave, complaints, marketplace..." }
  ]);
  const [input, setInput]   = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [msgs, typing]);

  const send = async () => {
    const msg = input.trim();
    if (!msg) return;
    setInput('');
    setMsgs(p => [...p, { from:'user', text:msg }]);
    setTyping(true);

    try {
      const { data } = await aiApi.chat(msg);
      setMsgs(p => [...p, { from:'bot', text:data.reply }]);
    } catch {
      const key = Object.keys(FALLBACKS).find(k => msg.toLowerCase().includes(k));
      const reply = FALLBACKS[key] || "I can help with mess, leave, complaints, gate rules, WiFi and more. What do you need? 😊";
      setMsgs(p => [...p, { from:'bot', text:reply }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <button className={styles.fab} onClick={() => setOpen(p => !p)} title="Ask HostelBot">
        {open ? '✕' : '🤖'}
      </button>

      {/* Panel */}
      {open && (
        <div className={styles.panel}>
          <div className={styles.head}>
            <div className={styles.headIcon}>🤖</div>
            <div>
              <div className={styles.headName}>HostelBot</div>
              <div className={styles.headSub}>AI Assistant · Always here</div>
            </div>
            <button className={styles.headClose} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className={styles.messages}>
            {msgs.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.from === 'user' ? styles.userMsg : styles.botMsg}`}>
                {m.text}
              </div>
            ))}
            {typing && <div className={`${styles.msg} ${styles.botMsg} ${styles.typing}`}>•••</div>}
            <div ref={bottomRef} />
          </div>

          <div className={styles.footer}>
            <input
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask me anything..."
            />
            <button className={styles.sendBtn} onClick={send}>→</button>
          </div>
        </div>
      )}
    </>
  );
}