import React, { useEffect } from 'react';
import { Order } from '../../features/orders/ordersSlice';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { selectLanguage } from '../../features/language/languageSlice';
import { selectAuth } from '../../features/auth/authSlice';
import { fetchOrders, clearOrdersError } from '../../features/orders/ordersSlice';
import LoadingSpinner from '../../components/LoadingSpinner';

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin: 0;
`;

const OrdersTable = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 120px;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
`;

const OrderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 120px;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  align-items: center;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#fff3cd';
      case 'confirmed': return '#d1ecf1';
      case 'preparing': return '#d4edda';
      case 'ready': return '#d1ecf1';
      case 'delivered': return '#d4edda';
      case 'cancelled': return '#f8d7da';
      default: return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#856404';
      case 'confirmed': return '#0c5460';
      case 'preparing': return '#155724';
      case 'ready': return '#0c5460';
      case 'delivered': return '#155724';
      case 'cancelled': return '#721c24';
      default: return '#6c757d';
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6c757d;
`;

const AuthContainer = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const AuthCard = styled.div`
  background: #fee;
  color: #c33;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  max-width: 500px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const AuthButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  background: ${(props): string => props.$variant === 'secondary' ? '#28a745' : '#8B4513'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
`;

const WarningBanner = styled.div`
  background: #fff3cd;
  color: #856404;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid #ffeaa7;
`;

const DemoModeBanner = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 8px;
  max-width: 600px;
  margin: 2rem auto 0;
`;

const AdminOrders: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector(selectAuth);
  const { orders, isLoading, error } = useAppSelector(state => state.orders);

  // Load orders on component mount
  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      dispatch(fetchOrders({}));
    }
  }, [dispatch, isAuthenticated, user]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearOrdersError());
    };
  }, [dispatch]);

  const handleLogin = () => {
    navigate('/login');
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: { he: string; en: string } } = {
      pending: { he: 'ממתין', en: 'Pending' },
      confirmed: { he: 'אושר', en: 'Confirmed' },
      preparing: { he: 'בהכנה', en: 'Preparing' },
      ready: { he: 'מוכן', en: 'Ready' },
      delivered: { he: 'נמסר', en: 'Delivered' },
      cancelled: { he: 'בוטל', en: 'Cancelled' }
    };
    
    return statusMap[status]?.[language] || status;
  };

  if (!isAuthenticated) {
    return (
      <AuthContainer>
        <Title>Orders Management</Title>
        <AuthCard>
          <strong>Authentication Required</strong>
          <p style={{ margin: '1rem 0' }}>Please login to access orders management.</p>
          <ButtonGroup>
            <AuthButton onClick={handleLogin}>
              Login to Access Orders
            </AuthButton>
          </ButtonGroup>
        </AuthCard>
      </AuthContainer>
    );
  }

  if (!user?.isAdmin) {
    return (
      <AuthContainer>
        <Title>Orders Management</Title>
        <AuthCard>
          <strong>Access Denied</strong>
          <p style={{ margin: '1rem 0' }}>Admin privileges required to access orders management.</p>
          <ButtonGroup>
            <AuthButton onClick={() => navigate('/')}>
              Go to Home
            </AuthButton>
          </ButtonGroup>
        </AuthCard>
      </AuthContainer>
    );
  }

  if (isLoading && !orders.length) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <Header>
        <Title>Orders Management</Title>
      </Header>

      {error && (
        <WarningBanner>
          <strong>⚠️ Warning:</strong> {error}
          {error.includes('Failed to load') && (
            <div style={{ marginTop: '0.5rem' }}>
              <small>Showing demo data. Please check your connection and refresh the page.</small>
            </div>
          )}
        </WarningBanner>
      )}

      <OrdersTable>
        <TableHeader>
          <div>Order ID</div>
          <div>Customer</div>
          <div>Items</div>
          <div>Total</div>
          <div>Status</div>
          <div>Actions</div>
        </TableHeader>
        
        {orders.length === 0 ? (
          <EmptyState>
            <p>No orders found</p>
          </EmptyState>
        ) : (
          orders.map((order: Order) => (
            <OrderRow key={order.id}>
              <div>#{order.id}</div>
              <div>{order.customer_name}</div>
              <div>{order.items?.length || 0} items</div>
              <div>₪{order.total_amount}</div>
              <div>
                <StatusBadge status={order.status}>
                  {getStatusText(order.status)}
                </StatusBadge>
              </div>
              <div>
                <button style={{ padding: '0.5rem', marginRight: '0.5rem' }}>View</button>
                <button style={{ padding: '0.5rem' }}>Edit</button>
              </div>
            </OrderRow>
          ))
        )}
      </OrdersTable>

      {!orders.length && !error && (
        <DemoModeBanner>
          <p style={{ color: '#1976d2', margin: 0 }}>
            <strong>Demo Mode:</strong> Showing sample data. Connect to backend for live data.
          </p>
        </DemoModeBanner>
      )}
    </Container>
  );
};

export default AdminOrders; 