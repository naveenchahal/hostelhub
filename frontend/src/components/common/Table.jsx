import React from 'react';

export default function Table({ columns, data, emptyText = 'No data found' }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key} style={{
                fontSize:'10px', color:'var(--text3)', fontWeight:'700',
                padding:'10px 14px', textAlign:'left', letterSpacing:'1px',
                textTransform:'uppercase', borderBottom:'1px solid var(--border)',
                whiteSpace:'nowrap',
              }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding:'32px', textAlign:'center', color:'var(--text2)', fontSize:'13px' }}>{emptyText}</td></tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i}
                style={{ transition:'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background='var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background=''}
              >
                {columns.map(c => (
                  <td key={c.key} style={{
                    padding:'13px 14px', fontSize:'13px',
                    borderBottom: i < data.length - 1 ? '1px solid var(--border)' : 'none',
                    color:'var(--text)',
                  }}>
                    {c.render ? c.render(row[c.key], row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}