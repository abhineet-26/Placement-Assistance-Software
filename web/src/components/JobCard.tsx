import StatusBadge from './StatusBadge';
import { Card, CardContent, CardActions, Typography, Button, Chip } from '@mui/material';
import {
  CurrencyRupee as MoneyIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
} from '@mui/icons-material';

interface JobCardProps {
  job: {
    title: string;
    company_name: string;
    ctc: string;
    location: string;
    deadline: string;
    skills: string[];
    status?: string;
  };
  onApply?: () => void;
  onView?: () => void;
  actionText?: string;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply, onView, actionText = 'Apply Now' }) => {
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 4px 12px rgba(1, 37, 85, 0.1)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <div className="flex justify-between items-start mb-3 gap-2">
          <div>
            <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
              {job.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {job.company_name}
            </Typography>
          </div>
          {job.status && (
            <StatusBadge status={job.status} />
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-y-2 gap-x-3 mb-4 mt-4">
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            <MoneyIcon fontSize="small" sx={{ mr: 0.5, color: 'text.disabled' }} />
            {job.ctc}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationIcon fontSize="small" sx={{ mr: 0.5, color: 'text.disabled' }} />
            {job.location}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gridColumn: 'span 2' }}>
            <EventIcon fontSize="small" sx={{ mr: 0.5, color: 'text.disabled' }} />
            Apply by {new Date(job.deadline).toLocaleDateString()}
          </Typography>
        </div>
        
        <div className="flex flex-wrap gap-1.5 mt-2">
          {job.skills && job.skills.slice(0, 3).map(skill => (
            <Chip key={skill} label={skill} size="small" variant="outlined" sx={{ bgcolor: 'background.default', fontSize: '0.75rem' }} />
          ))}
          {job.skills && job.skills.length > 3 && (
            <Chip label={`+${job.skills.length - 3} more`} size="small" variant="outlined" sx={{ bgcolor: 'background.default', fontSize: '0.75rem' }} />
          )}
        </div>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
        {onView && (
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={onView}
            fullWidth
            sx={{ fontWeight: 600 }}
          >
            View Details
          </Button>
        )}
        {onApply && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onApply}
            fullWidth
            disableElevation
            sx={{ fontWeight: 600 }}
          >
            {actionText}
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default JobCard;
