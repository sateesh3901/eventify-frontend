import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      textAlign: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ fontSize: '6rem', marginBottom: '16px' }}>🎪</div>
      <h1 style={{ fontSize: '4rem', color: 'var(--primary)', marginBottom: '8px' }}>
        404
      </h1>
      <h2 style={{ color: 'var(--gray-600)', marginBottom: '16px' }}>
        Oops! Page not found
      </h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '32px' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary btn-lg">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;