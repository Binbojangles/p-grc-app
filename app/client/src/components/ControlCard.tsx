import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  useTheme,
  CardActionArea,
  Divider,
  Chip
} from '@mui/material';
import { Control } from '../types';
import StatusBadge from './StatusBadge';

interface ControlCardProps {
  control: Control;
  onClick: (id: string) => void;
}

const ControlCard: React.FC<ControlCardProps> = ({ control, onClick }) => {
  const theme = useTheme();
  
  const getNextReviewStatus = () => {
    if (!control.nextReviewDate) return null;
    
    const nextReview = new Date(control.nextReviewDate);
    const today = new Date();
    const diffDays = Math.ceil((nextReview.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Review Overdue', color: theme.palette.error.main };
    } else if (diffDays <= 7) {
      return { text: `Review Due in ${diffDays} days`, color: theme.palette.warning.main };
    } else if (diffDays <= 30) {
      return { text: `Review Due in ${diffDays} days`, color: theme.palette.info.main };
    } else {
      return { text: `Next Review: ${nextReview.toLocaleDateString()}`, color: theme.palette.success.main };
    }
  };
  
  const reviewStatus = getNextReviewStatus();
  
  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.15)`,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardActionArea 
        onClick={() => onClick(control.id)}
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'stretch',
          height: '100%',
          padding: 0
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: 'rgba(63, 136, 239, 0.05)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="subtitle1" 
              fontWeight="bold"
              color="primary"
            >
              {control.controlId}
            </Typography>
            <Chip 
              label={`CMMC Level ${control.level}`} 
              size="small" 
              color={control.level === 1 ? "primary" : "secondary"}
              sx={{ ml: 1, height: 22, fontSize: '0.7rem' }}
            />
          </Box>
          <StatusBadge 
            status={control.implementationStatus} 
            type="implementation"
            size="small"
          />
        </Box>
        
        <CardContent sx={{ p: 2, flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
            {control.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {control.description.length > 120 
              ? `${control.description.substring(0, 120)}...` 
              : control.description}
          </Typography>
          
          <Divider sx={{ my: 1.5 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Category:
            </Typography>
            <Typography variant="caption" fontWeight="medium">
              {control.category}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Review Frequency:
            </Typography>
            <Typography variant="caption" fontWeight="medium">
              {control.reviewFrequency.charAt(0).toUpperCase() + control.reviewFrequency.slice(1)}
            </Typography>
          </Box>
          
          {reviewStatus && (
            <Box sx={{ 
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              textAlign: 'center'
            }}>
              <Typography 
                variant="caption" 
                fontWeight="bold"
                sx={{ color: reviewStatus.color }}
              >
                {reviewStatus.text}
              </Typography>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ControlCard; 