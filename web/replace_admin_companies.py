with open("src/pages/admin/PendingCompaniesPage.tsx", "w") as f:
    f.write("""import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import PageSkeleton from '../../components/PageSkeleton';
import StatusBadge from '../../components/StatusBadge';
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
  Button,
  Tabs,
  Tab,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

type Company = {
  id: string;
  user_id: string;
  company_name: string;
  contact_person: string | null;
  contact_phone: string | null;
  about: string | null;
  approval_status: 'pending_approval' | 'approved' | 'rejected';
};

export default function PendingCompaniesPage() {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);

  const { data: companies, isLoading } = useQuery<Company[]>({
    queryKey: ['admin-companies'],
    queryFn: async () => {
      const res = await api.get('/companies/');
      return res.data;
    }
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/companies/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/companies/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
    }
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, company: Company) => {
    setAnchorEl(event.currentTarget);
    setSelectedCompany(company);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCompany(null);
  };

  const handleApprove = () => {
    if (selectedCompany) approveMutation.mutate(selectedCompany.id);
    handleMenuClose();
  };

  const handleReject = () => {
    if (selectedCompany) rejectMutation.mutate(selectedCompany.id);
    handleMenuClose();
  };

  if (isLoading) return <PageSkeleton />;

  const filteredCompanies = companies?.filter((c) => {
    if (tabValue === 0) return c.approval_status === 'pending_approval';
    if (tabValue === 1) return c.approval_status === 'approved';
    if (tabValue === 2) return c.approval_status === 'rejected';
    return true;
  }) || [];

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
          Companies Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve company registrations to allow them to post jobs.
        </Typography>
      </Box>
      
      <Card variant="outlined" sx={{ overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1, bgcolor: 'surface.main' }}>
          <Tabs value={tabValue} onChange={(_, nv) => setTabValue(nv)}>
            <Tab label="Pending" />
            <Tab label="Approved" />
            <Tab label="Rejected" />
            <Tab label="All" />
          </Tabs>
        </Box>
        
        {filteredCompanies.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">No companies found in this category.</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Company Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact Person</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {company.company_name}
                    </TableCell>
                    <TableCell>{company.contact_person || '-'}</TableCell>
                    <TableCell>{company.contact_phone || '-'}</TableCell>
                    <TableCell>
                      <StatusBadge status={company.approval_status === 'pending_approval' ? 'pending' : company.approval_status} />
                    </TableCell>
                    <TableCell align="right">
                      {company.approval_status === 'pending_approval' ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => rejectMutation.mutate(company.id)}
                            disabled={rejectMutation.isPending}
                          >
                            Reject
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => approveMutation.mutate(company.id)}
                            disabled={approveMutation.isPending}
                          >
                            Approve
                          </Button>
                        </Stack>
                      ) : (
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, company)}>
                          <MoreVertIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleApprove} disabled={selectedCompany?.approval_status === 'approved'}>
          <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
          <ListItemText>Approve</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleReject} disabled={selectedCompany?.approval_status === 'rejected'}>
          <ListItemIcon><CloseIcon color="error" fontSize="small" /></ListItemIcon>
          <ListItemText>Reject</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
""")
