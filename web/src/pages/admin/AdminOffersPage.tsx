import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import PageSkeleton from '../../components/PageSkeleton';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { LocalOffer as OfferIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';

type Offer = {
  id: string;
  student_name?: string;
  company_name?: string;
  job_title?: string;
  package?: number;
  status: string;
  created_at: string;
};

export default function AdminOffersPage() {
  const { data: offers, isLoading } = useQuery<Offer[]>({
    queryKey: ['admin', 'offers'],
    queryFn: async () => (await api.get('/admin/offers')).data,
  });

  if (isLoading) return <PageSkeleton />;

  const acceptedOffers = offers?.filter(o => o.status === 'accepted') || [];
  const avgPackage = acceptedOffers.length
    ? (acceptedOffers.reduce((sum, o) => sum + (o.package || 0), 0) / acceptedOffers.length).toFixed(2)
    : 'N/A';
  const maxPackage = acceptedOffers.length
    ? Math.max(...acceptedOffers.map(o => o.package || 0)).toFixed(2)
    : 'N/A';

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ fontWeight: 700, color: 'secondary.main', letterSpacing: 1.2 }}>
          Operations
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
          Job Offers
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track all placement offers extended to students, including package details.
        </Typography>
      </Box>

      {/* Summary stats */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
        <Chip icon={<OfferIcon />} label={`${offers?.length ?? 0} Total Offers`} variant="outlined" />
        <Chip label={`${acceptedOffers.length} Accepted`} color="success" variant="outlined" />
        <Chip
          icon={<TrendingUpIcon />}
          label={`Avg Package: ₹${avgPackage} LPA`}
          color="primary"
          variant="outlined"
        />
        <Chip label={`Max: ₹${maxPackage} LPA`} color="secondary" variant="outlined" />
      </Box>

      <Card variant="outlined" sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 360px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Job Title</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }} align="right">Package (LPA)</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Offer Date</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {offers?.map((offer) => (
                <TableRow key={offer.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{offer.student_name || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{offer.company_name || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{offer.job_title || '—'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {offer.package ? `₹${offer.package}` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {offer.created_at
                        ? new Date(offer.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })
                        : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={offer.status}
                      size="small"
                      color={offer.status === 'accepted' ? 'success' : offer.status === 'declined' ? 'error' : 'default'}
                      sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {(!offers || offers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <OfferIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                      <Typography color="text.secondary" sx={{ fontWeight: 600 }}>No offers yet</Typography>
                      <Typography variant="body2" color="text.disabled">
                        Placement offers will appear here when companies extend them.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: 'block' }}>
        {offers?.length ?? 0} total offer records
      </Typography>
    </Box>
  );
}
