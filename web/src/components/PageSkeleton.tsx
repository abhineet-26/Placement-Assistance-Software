import { Box, Skeleton, Grid, Card, CardContent } from '@mui/material';

export default function PageSkeleton() {
  return (
    <Box sx={{ width: '100%', animate: 'pulse' }}>
      {/* Header Skeleton */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Skeleton variant="text" width={250} height={40} />
          <Skeleton variant="text" width={400} height={20} />
        </Box>
        <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Stats row skeleton */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid size={{xs: 12, sm: 6, md: 3}} key={i}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Skeleton variant="circular" width={40} height={40} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="40%" height={32} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main content area skeleton */}
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Skeleton variant="text" width={200} height={32} />
        </Box>
        <Box sx={{ p: 0 }}>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ p: 2, display: 'flex', gap: 2, borderBottom: i < 4 ? 1 : 0, borderColor: 'divider' }}>
              <Skeleton variant="rectangular" width={60} height={60} sx={{ borderRadius: 1 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="20%" height={20} />
              </Box>
              <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
