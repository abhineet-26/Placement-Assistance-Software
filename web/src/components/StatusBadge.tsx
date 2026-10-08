import { Chip } from '@mui/material';

export default function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  const normalized = (status || '').toLowerCase();
  
  let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
  
  if (['active', 'approved', 'placed', 'hired', 'accepted', 'completed'].includes(normalized)) {
    color = "success";
  } else if (['pending', 'in-progress'].includes(normalized)) {
    color = "warning";
  } else if (['rejected', 'cancelled', 'failed'].includes(normalized)) {
    color = "error";
  } else if (['shortlisted', 'interview'].includes(normalized)) {
    color = "info";
  }

  return (
    <Chip 
      label={status} 
      color={color} 
      size="small"
      className={`capitalize font-medium ${className}`} 
      sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600 }}
    />
  );
}
