import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
  Skeleton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  SupervisorAccount as AdminIcon,
  Person as UserIcon,
  Assignment as ManagerIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { usersService } from '../../services/api';
import { User } from '../../types';
import PageHeader from '../../components/PageHeader';

const UsersPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'activate' | 'deactivate' | 'delete' | null>(null);
  
  // Queries
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.getUsers
  });
  
  // Mutations
  const activateUserMutation = useMutation({
    mutationFn: usersService.activateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
  
  const deactivateUserMutation = useMutation({
    mutationFn: usersService.deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
  
  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: User['role'] }) => 
      usersService.changeUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
  
  // Handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, userId: string) => {
    setSelectedUserId(userId);
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleEditUser = (userId: string) => {
    navigate(`/users/${userId}`);
    handleMenuClose();
  };
  
  const handleConfirmDialogOpen = (action: 'activate' | 'deactivate' | 'delete') => {
    setConfirmAction(action);
    setConfirmDialogOpen(true);
    handleMenuClose();
  };
  
  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
    setConfirmAction(null);
  };
  
  const handleConfirmAction = async () => {
    if (!selectedUserId) return;
    
    try {
      if (confirmAction === 'activate') {
        await activateUserMutation.mutateAsync(selectedUserId);
      } else if (confirmAction === 'deactivate') {
        await deactivateUserMutation.mutateAsync(selectedUserId);
      }
      
      handleConfirmDialogClose();
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };
  
  const handleChangeRole = async (role: User['role']) => {
    if (!selectedUserId) return;
    
    try {
      await changeRoleMutation.mutateAsync({ id: selectedUserId, role });
      handleMenuClose();
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Paginate users
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Get role chip color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      default:
        return 'info';
    }
  };
  
  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminIcon fontSize="small" />;
      case 'manager':
        return <ManagerIcon fontSize="small" />;
      default:
        return <UserIcon fontSize="small" />;
    }
  };
  
  // Render confirm dialog content
  const renderConfirmDialogContent = () => {
    const user = users.find(u => u.id === selectedUserId);
    if (!user) return null;
    
    const name = `${user.firstName} ${user.lastName}`;
    
    if (confirmAction === 'activate') {
      return (
        <>
          <DialogTitle>Activate User</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to activate the user {name}?
            </DialogContentText>
          </DialogContent>
        </>
      );
    }
    
    if (confirmAction === 'deactivate') {
      return (
        <>
          <DialogTitle>Deactivate User</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to deactivate the user {name}? 
              They will no longer be able to log in to the system.
            </DialogContentText>
          </DialogContent>
        </>
      );
    }
    
    return null;
  };
  
  // Render actions menu for a user
  const renderUserActionsMenu = () => {
    const user = users.find(u => u.id === selectedUserId);
    if (!user) return null;
    
    return (
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleEditUser(user.id)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        
        {user.role !== 'admin' && (
          <MenuItem onClick={() => handleChangeRole('admin')}>
            <ListItemIcon>
              <AdminIcon fontSize="small" />
            </ListItemIcon>
            Make Admin
          </MenuItem>
        )}
        
        {user.role !== 'manager' && (
          <MenuItem onClick={() => handleChangeRole('manager')}>
            <ListItemIcon>
              <ManagerIcon fontSize="small" />
            </ListItemIcon>
            Make Manager
          </MenuItem>
        )}
        
        {user.role !== 'user' && (
          <MenuItem onClick={() => handleChangeRole('user')}>
            <ListItemIcon>
              <UserIcon fontSize="small" />
            </ListItemIcon>
            Make User
          </MenuItem>
        )}
        
        {user.active ? (
          <MenuItem onClick={() => handleConfirmDialogOpen('deactivate')}>
            <ListItemIcon>
              <LockIcon fontSize="small" color="error" />
            </ListItemIcon>
            <Typography color="error">Deactivate</Typography>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleConfirmDialogOpen('activate')}>
            <ListItemIcon>
              <LockOpenIcon fontSize="small" color="success" />
            </ListItemIcon>
            <Typography color="success.main">Activate</Typography>
          </MenuItem>
        )}
      </Menu>
    );
  };
  
  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle="Manage system users and permissions"
        breadcrumbs
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/users/new')}
          >
            Add User
          </Button>
        }
      />
      
      {/* Search and filters */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Users Table */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
      >
        {isLoading ? (
          <Box sx={{ p: 2 }}>
            {[...Array(5)].map((_, index) => (
              <Skeleton 
                key={index}
                variant="rectangular"
                height={53}
                sx={{ mb: 1, borderRadius: 1 }}
              />
            ))}
          </Box>
        ) : error ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" color="error" gutterBottom>
              Error Loading Users
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There was a problem fetching the users. Please try again later.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Box sx={{ py: 3 }}>
                          <Typography variant="body1">
                            No users found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Try adjusting your search criteria
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((user) => (
                      <TableRow 
                        key={user.id}
                        sx={{ 
                          '&:hover': { 
                            bgcolor: 'rgba(0, 0, 0, 0.04)' 
                          },
                          opacity: user.active ? 1 : 0.6
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1">
                              {user.firstName} {user.lastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getRoleIcon(user.role)}
                            label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            color={getRoleColor(user.role) as any}
                            size="small"
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.active ? 'Active' : 'Inactive'}
                            color={user.active ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Actions">
                            <IconButton
                              onClick={(e) => handleMenuOpen(e, user.id)}
                              size="small"
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
      
      {/* User Actions Menu */}
      {renderUserActionsMenu()}
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleConfirmDialogClose}
      >
        {renderConfirmDialogContent()}
        <DialogActions>
          <Button onClick={handleConfirmDialogClose}>Cancel</Button>
          <Button 
            onClick={handleConfirmAction} 
            color={confirmAction === 'activate' ? 'success' : 'error'}
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage; 