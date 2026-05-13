import React from 'react';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="page-loader">
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
        {message}
      </p>
    </div>
  );
};

export default Loader;