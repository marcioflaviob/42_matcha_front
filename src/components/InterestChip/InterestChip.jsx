import React from 'react';
import { Chip } from 'primereact/chip';
import './InterestChip.css';

const InterestChip = ({ 
  label, 
  removable = false, 
  onRemove = null, 
  className = '', 
  ...props 
}) => {
  return (
    <Chip 
      label={label}
      className={`interest-chip ${className}`}
      removable={removable}
      onRemove={onRemove}
      {...props}
    />
  );
};

export default InterestChip;