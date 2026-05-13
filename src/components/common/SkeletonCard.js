import React from 'react';
import './SkeletonCard.css';

export const SkeletonCard = () => (
  <div className="skeleton-card card">
    <div className="skeleton-banner shimmer"></div>
    <div className="card-body">
      <div className="skeleton-line shimmer" style={{ width: '80%', height: '18px' }}></div>
      <div className="skeleton-line shimmer" style={{ width: '60%', height: '14px', marginTop: '10px' }}></div>
      <div className="skeleton-line shimmer" style={{ width: '40%', height: '14px', marginTop: '8px' }}></div>
      <div className="skeleton-footer">
        <div className="skeleton-line shimmer" style={{ width: '60px', height: '24px' }}></div>
        <div className="skeleton-line shimmer" style={{ width: '100px', height: '32px', borderRadius: '6px' }}></div>
      </div>
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="grid-3">
    {Array(count).fill(0).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

export default SkeletonCard;