import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { selectLanguage } from '../../features/language/languageSlice';
import { apiService } from '../../utils/api';
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

const AdminOrders: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Load orders on component mount
  useEffect(() => {
    checkAuthAndLoadOrders();
  }, []);

  const checkAuthAndLoadOrders = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login to access orders.');
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      
      const response = await apiService.getOrders({});
      setOrders(response.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      
      if (err.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        setError('Session expired. Please login again.');
        setIsAuthenticated(false);
      } else if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError(err.message || 'Failed to load orders');
      }
      
      // Fallback to demo data if API fails
      setOrders([
        {
          id: 1,
          customer_name: 'John Doe',
          items_count: 3,
          total_amount: 85.50,
          status: 'pending'
        },
        {
          id: 2,
          customer_name: 'Jane Smith',
          items_count: 2,
          total_amount: 45.00,
          status: 'confirmed'
        },
        {
          id: 3,
          customer_name: 'Mike Johnson',
          items_count: 1,
          total_amount: 25.00,
          status: 'delivered'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate('/login', { state: { from: { pathname: '/orders' } } });
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

  if (!isAuthenticated && !loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        background: '#f8f9fa', 
        minHeight: '100vh',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{ color: '#8B4513', marginBottom: '1rem' }}>
          Orders Management
        </h1>
        <div style={{ 
          background: '#fee', 
          color: '#c33', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          maxWidth: '500px'
        }}>
          <strong>Authentication Required</strong>
          <p style={{ margin: '1rem 0' }}>{error}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={handleLogin}
              style={{
                background: '#8B4513',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Login to Access Orders
            </button>
            {process.env['NODE_ENV'] === 'development' && (
              <button 
                onClick={() => {
                  setIsAuthenticated(true);
                  setError(null);
                }}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Skip Login (Dev Mode)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading && !orders.length) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <Header>
        <Title>Orders Management</Title>
      </Header>

      {error && (
        <div style={{ 
          background: '#fff3cd', 
          color: '#856404', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          border: '1px solid #ffeaa7'
        }}>
          <strong>⚠️ Warning:</strong> {error}
          {error.includes('Failed to load') && (
            <div style={{ marginTop: '0.5rem' }}>
              <small>Showing demo data. Please check your connection and refresh the page.</small>
            </div>
          )}
        </div>
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
          orders.map((order: any) => (
            <OrderRow key={order.id}>
              <div>#{order.id}</div>
              <div>{order.customer_name}</div>
              <div>{order.items_count || 0} items</div>
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

      {error && !isAuthenticated && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#e3f2fd', 
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '2rem auto 0'
        }}>
          <p style={{ color: '#1976d2', margin: 0 }}>
            <strong>Demo Mode:</strong> Showing sample data. Connect to backend for live data.
          </p>
        </div>
      )}
    </Container>
  );
};

export default AdminOrders; 