import React from 'react';

const inputStyle = {
  width:'100%', padding:'11px 14px',
  background:'var(--bg3)', border:'1px solid var(--border)',
  borderRadius:'10px', color:'var(--text)',
  fontSize:'13.5px', fontFamily:'var(--font-body)',
  outline:'none', transition:'border-color 0.2s, box-shadow 0.2s',
};

const focusStyle = {
  borderColor:'var(--amber)',
  boxShadow:'0 0 0 3px rgba(232,160,32,0.08)',
};

export default function FormField({
  label, id, type = 'text', value, onChange,
  placeholder, required, error,
  as = 'input', options = [], rows = 4,
  style = {},
}) {
  const [focused, setFocused] = React.useState(false);

  const commonProps = {
    id, value, onChange,
    placeholder,
    required,
    style: { ...inputStyle, ...(focused ? focusStyle : {}), ...style },
    onFocus: () => setFocused(true),
    onBlur:  () => setFocused(false),
  };

  return (
    <div style={{ marginBottom:'16px' }}>
      {label && (
        <label htmlFor={id} style={{
          display:'block', fontSize:'11px', fontWeight:'700',
          color:'var(--text3)', letterSpacing:'1px',
          textTransform:'uppercase', marginBottom:'7px',
        }}>{label}{required && <span style={{color:'var(--red)',marginLeft:3}}>*</span>}</label>
      )}

      {as === 'textarea' ? (
        <textarea {...commonProps} rows={rows} style={{ ...commonProps.style, resize:'vertical' }} />
      ) : as === 'select' ? (
        <select {...commonProps} style={{ ...commonProps.style, appearance:'none', cursor:'pointer' }}>
          {options.map(o => (
            <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
          ))}
        </select>
      ) : (
        <input {...commonProps} type={type} />
      )}

      {error && <p style={{ fontSize:'12px', color:'var(--red)', marginTop:'5px' }}>{error}</p>}
    </div>
  );
}