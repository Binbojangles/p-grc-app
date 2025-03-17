import React from 'react';
import { Chip, ChipProps } from '@mui/material';

type StatusType = 'task' | 'implementation' | 'review';

type StatusBadgeProps = {
  status: string;
  type: StatusType;
  size?: 'small' | 'medium';
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type, size = 'medium' }) => {
  let color: ChipProps['color'] = 'default';
  let label = status;
  
  // Format the status label to be more readable
  const formatLabel = (str: string) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  if (type === 'task') {
    switch (status) {
      case 'completed':
        color = 'success';
        break;
      case 'in-progress':
        color = 'info';
        break;
      case 'pending':
        color = 'warning';
        break;
      case 'overdue':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    label = formatLabel(status);
  } else if (type === 'implementation') {
    switch (status) {
      case 'implemented':
        color = 'success';
        break;
      case 'partially-implemented':
        color = 'warning';
        label = 'Partial';
        break;
      case 'not-implemented':
        color = 'error';
        label = 'Not Implemented';
        break;
      case 'not-applicable':
        color = 'default';
        label = 'N/A';
        break;
      default:
        color = 'default';
        label = formatLabel(status);
    }
  } else if (type === 'review') {
    switch (status) {
      case 'approved':
        color = 'success';
        break;
      case 'pending':
        color = 'warning';
        break;
      case 'rejected':
        color = 'error';
        break;
      case 'needs-review':
        color = 'info';
        label = 'Needs Review';
        break;
      default:
        color = 'default';
        label = formatLabel(status);
    }
  }
  
  return (
    <Chip
      label={label}
      color={color}
      size={size}
      variant="filled"
      sx={{
        fontWeight: 'medium',
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        height: size === 'small' ? 24 : 32,
      }}
    />
  );
};

export default StatusBadge; 