import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

import {
  Drawer,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Feedback as FeedbackIcon,
  Event as EventIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';

const drawerWidth = 260;

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.role],
    queryFn: async () => {
      if (user?.role === 'student') return (await api.get('/students/me')).data;
      if (user?.role === 'company') return (await api.get('/companies/me')).data;
      return null;
    },
    enabled: !!user && user.role !== 'admin',
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => (await api.get('/notifications/unread-count')).data.count,
    enabled: !!user,
  });

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('opportunities')) return 'Job Opportunities';
    if (path.includes('applications')) return 'Applications';
    if (path.includes('profile')) return 'Profile';
    if (path.includes('cv')) return 'CV Editor';
    if (path.includes('jobs/new')) return 'Post Job';
    if (path.includes('jobs')) return 'Jobs';
    if (path.includes('companies')) return 'Companies';
    if (path.includes('feedback')) return 'Feedback';
    if (path.includes('notifications')) return 'Notifications';
    if (path.includes('interviews')) return 'Interviews';
    if (path.includes('offers')) return 'Offers';
    if (path.includes('students')) return 'Students';
    return 'Placement Assistant';
  };

  const userName = profile?.name || profile?.company_name || 'Admin User';
  const userInitials = userName.substring(0, 2).toUpperCase();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-white/10 text-white shadow-sm'
        : 'text-white/70 hover:bg-white/5 hover:text-white'
    }`;

  const drawerContent = (
    <div className="flex flex-col h-full bg-primary text-white">
      <div className="flex items-center justify-center h-16 px-6 border-b border-white/10 shrink-0">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <SchoolIcon /> Placement Portal
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {user?.role === 'admin' && (
          <>
            <NavLink to="/admin" end className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <DashboardIcon fontSize="small" /> Dashboard
            </NavLink>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Management</div>
            <NavLink to="/admin/students" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <SchoolIcon fontSize="small" /> Students
            </NavLink>
            <NavLink to="/admin/companies" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <BusinessIcon fontSize="small" /> Pending Companies
            </NavLink>
            <NavLink to="/admin/jobs/pending" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <WorkIcon fontSize="small" /> Pending Jobs
            </NavLink>
            <NavLink to="/admin/jobs" end className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <WorkIcon fontSize="small" /> Active Jobs
            </NavLink>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Operations</div>
            <NavLink to="/admin/applications" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <AssignmentIcon fontSize="small" /> Applications
            </NavLink>
            <NavLink to="/admin/interviews" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <EventIcon fontSize="small" /> Interviews
            </NavLink>
            <NavLink to="/admin/offers" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <LocalOfferIcon fontSize="small" /> Offers
            </NavLink>
            <NavLink to="/admin/feedback" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <FeedbackIcon fontSize="small" /> Feedback
            </NavLink>
            <NavLink to="/admin/notifications" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <NotificationsIcon fontSize="small" /> Notifications
            </NavLink>
          </>
        )}
        
        {user?.role === 'student' && (
          <>
            <NavLink to="/student/dashboard" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <DashboardIcon fontSize="small" /> Dashboard
            </NavLink>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Careers</div>
            <NavLink to="/student/opportunities" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <WorkIcon fontSize="small" /> Opportunities
            </NavLink>
            <NavLink to="/student/applications" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <AssignmentIcon fontSize="small" /> My Applications
            </NavLink>
            <NavLink to="/student/interviews" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <EventIcon fontSize="small" /> My Interviews
            </NavLink>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Account</div>
            <NavLink to="/student/profile" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <PersonIcon fontSize="small" /> My Profile
            </NavLink>
            <NavLink to="/student/cv" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <AssignmentIcon fontSize="small" /> My CV
            </NavLink>
            <NavLink to="/student/feedback" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <FeedbackIcon fontSize="small" /> Submit Feedback
            </NavLink>
            <NavLink to="/student/notifications" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <NotificationsIcon fontSize="small" /> Notifications
            </NavLink>
          </>
        )}

        {user?.role === 'company' && (
          <>
            <NavLink to="/company" end className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <DashboardIcon fontSize="small" /> Dashboard
            </NavLink>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Recruitment</div>
            <NavLink to="/company/jobs" end className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <WorkIcon fontSize="small" /> My Jobs
            </NavLink>
            <NavLink to="/company/jobs/new" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <WorkIcon fontSize="small" /> Post Job
            </NavLink>
            <NavLink to="/company/cvs" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <AssignmentIcon fontSize="small" /> Received CVs
            </NavLink>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Account</div>
            <NavLink to="/company/feedback" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <FeedbackIcon fontSize="small" /> Submit Feedback
            </NavLink>
            <NavLink to="/company/notifications" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <NotificationsIcon fontSize="small" /> Notifications
            </NavLink>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none', position: 'static' },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-border flex items-center px-4 sm:px-8 justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' }, color: 'text.secondary' }}
            >
              <MenuIcon />
            </IconButton>
            <h2 className="text-xl font-semibold text-text-primary hidden sm:block">
              {getPageTitle()}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <IconButton 
              color="inherit" 
              onClick={() => navigate(`/${user?.role}/notifications`)}
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.50' } }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <div className="h-8 w-px bg-border mx-2"></div>
            
            <div 
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1 px-2 rounded-lg transition-colors"
              onClick={handleMenuOpen}
            >
              <div className="flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold text-text-primary">{userName}</span>
                <span className="text-xs text-text-secondary uppercase tracking-wider">{user?.role}</span>
              </div>
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 600 }}>
                {userInitials}
              </Avatar>
            </div>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{ paper: {
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.1))',
                  mt: 1.5,
                  minWidth: 200,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                },
              } }}
            >
              <div className="px-4 py-3 sm:hidden border-b border-border mb-2">
                <p className="text-sm font-semibold text-text-primary">{userName}</p>
                <p className="text-xs text-text-secondary uppercase">{user?.role}</p>
              </div>
              
              {user?.role === 'student' && (
                <MenuItem onClick={() => { handleMenuClose(); navigate('/student/profile'); }}>
                  <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                  Profile
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
