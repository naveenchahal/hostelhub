import React from 'react';
import styles from './Button.module.css';
import Spinner from './Spinner';

export default function Button({
  children, onClick, type = 'button',
  variant = 'amber', size = 'md',
  loading = false, disabled = false,
  fullWidth = false, className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth ? styles.full : '',
        loading   ? styles.loading : '',
        className,
      ].join(' ')}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}