export default function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  const normalized = (status || '').toLowerCase();
  
  let colors = 'bg-gray-100 text-gray-700';
  if (['active', 'approved', 'placed', 'hired', 'accepted', 'completed'].includes(normalized)) {
    colors = 'bg-green-100 text-green-800';
  } else if (['pending', 'in-progress'].includes(normalized)) {
    colors = 'bg-orange-100 text-orange-800';
  } else if (['rejected', 'cancelled', 'failed'].includes(normalized)) {
    colors = 'bg-red-100 text-red-800';
  } else if (['shortlisted', 'interview'].includes(normalized)) {
    colors = 'bg-blue-100 text-blue-800';
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize whitespace-nowrap ${colors} ${className}`}>
      {status}
    </span>
  );
}
