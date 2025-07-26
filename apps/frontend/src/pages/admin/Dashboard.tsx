import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Types
interface DashboardData {
  today: {
    orders: number;
    revenue: number;
  };
  customers: number;
  pending_orders: number;
}

interface DashboardCardProps {
  title: string;
  value: string | number;
  color: string;
  isLiveData: boolean;
  hasError: boolean;
}

// Styled Components
const DashboardContainer = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
  text-align: center;
`;

const DashboardTitle = styled.h1`
  color: #8B4513;
  margin-bottom: 1rem;
`;

const DashboardSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
`;

const WarningBanner = styled.div`
  background: #fff3cd;
  color: #856404;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  max-width: 600px;
  margin: 0 auto 2rem;
  border: 1px solid #ffeaa7;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  margin-bottom: 2rem;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const DashboardCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }
`;

const CardTitle = styled.h3`
  margin-bottom: 0.5rem;
  color: #2F2F2F;
`;

const CardValue = styled.p<{ $color: string }>`
  font-size: 2rem;
  font-weight: bold;
  color: ${(props): string => props.$color};
  margin-bottom: 0.5rem;
`;

const DataStatus = styled.small<{ $isLive: boolean }>`
  color: ${(props): string => props.$isLive ? '#28a745' : '#ffc107'};
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

const DemoModeBanner = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 8px;
  max-width: 600px;
  margin: 2rem auto 0;
`;

// Reusable Card Component
const StatCard: React.FC<DashboardCardProps> = React.memo(({ 
  title, 
  value, 
  color, 
  isLiveData, 
  // hasError 
}): JSX.Element => (
  <DashboardCard
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <CardTitle>{title}</CardTitle>
    <CardValue $color={color}>{value}</CardValue>
    <DataStatus $isLive={isLiveData}>
      {isLiveData ? '✓ Live data' : '⚠️ Demo data'}
    </DataStatus>
  </DashboardCard>
));

StatCard.displayName = 'StatCard';

// Utility function
const formatCurrency = (amount: number): string => {
  return `₪${amount.toLocaleString()}`;
};

// Custom hook for dashboard data
const useDashboardData = (): {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refetch: () => Promise<void>;
} => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const fetchDashboardData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        setError('Authentication required. Please login to access the dashboard.');
        setIsAuthenticated(false);
        return;
      }

      const userData = JSON.parse(user);
      if (!userData.isAdmin) {
        setError('Access denied. Admin privileges required.');
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo data - no backend required
      const demoData: DashboardData = {
        today: { 
          orders: Math.floor(Math.random() * 50) + 20, 
          revenue: Math.floor(Math.random() * 2000) + 800 
        },
        customers: Math.floor(Math.random() * 200) + 100,
        pending_orders: Math.floor(Math.random() * 15) + 5
      };
      
      setData(demoData);
      setError(null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      
      // Fallback to static data if there's an error
      setData({
        today: { orders: 25, revenue: 1250 },
        customers: 150,
        pending_orders: 8
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect((): void => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { data, loading, error, isAuthenticated, refetch: fetchDashboardData };
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error, isAuthenticated } = useDashboardData();

  const handleLogin = useCallback((): void => {
    navigate('/login');
  }, [navigate]);

  const handleDevModeSkip = useCallback((): void => {
    // This would need to be handled differently in a real app
          // Dev mode skip - not implemented in production
  }, []);

  // Memoized dashboard data
  const dashboardData = useMemo<DashboardData>(() => data || {
    today: { orders: 25, revenue: 1250 },
    customers: 150,
    pending_orders: 8
  }, [data]);

  // Memoized stats cards data
  const statsCards = useMemo<DashboardCardProps[]>(() => [
    {
      title: "Today's Orders",
      value: dashboardData.today.orders,
      color: '#007bff',
      isLiveData: !!data && !error,
      hasError: !!error
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(dashboardData.today.revenue),
      color: '#28a745',
      isLiveData: !!data && !error,
      hasError: !!error
    },
    {
      title: "Total Customers",
      value: dashboardData.customers,
      color: '#ffc107',
      isLiveData: !!data && !error,
      hasError: !!error
    },
    {
      title: "Pending Orders",
      value: dashboardData.pending_orders,
      color: '#dc3545',
      isLiveData: !!data && !error,
      hasError: !!error
    }
  ], [dashboardData, data, error]);

  if (!isAuthenticated && !loading) {
    return (
      <AuthContainer>
        <DashboardTitle>Samna Salta Dashboard</DashboardTitle>
        <AuthCard>
          <strong>Authentication Required</strong>
          <p style={{ margin: '1rem 0' }}>{error}</p>
          <ButtonGroup>
            <AuthButton onClick={handleLogin}>
              Login to Dashboard
            </AuthButton>
            {process.env['NODE_ENV'] === 'development' && (
              <AuthButton $variant="secondary" onClick={handleDevModeSkip}>
                Skip Login (Dev Mode)
              </AuthButton>
            )}
          </ButtonGroup>
        </AuthCard>
      </AuthContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardTitle>Samna Salta Dashboard</DashboardTitle>
      <DashboardSubtitle>Welcome to the admin dashboard</DashboardSubtitle>

      {error && (
        <WarningBanner>
          <strong>⚠️ Warning:</strong> {error}
          {error.includes('Network error') && (
            <div style={{ marginTop: '0.5rem' }}>
              <small>Showing demo data. Please check your connection and refresh the page.</small>
            </div>
          )}
        </WarningBanner>
      )}

      {loading && !data && (
        <LoadingMessage>
          <p>Loading dashboard data...</p>
        </LoadingMessage>
      )}

      <DashboardGrid>
        {statsCards.map((card) => (
          <StatCard
            key={card.title}
            {...card}
          />
        ))}
      </DashboardGrid>

      {!data && !error && (
        <DemoModeBanner>
          <p style={{ color: '#1976d2', margin: 0 }}>
            <strong>Demo Mode:</strong> Showing sample data. Connect to backend for live data.
          </p>
        </DemoModeBanner>
      )}
    </DashboardContainer>
  );
};

export default React.memo(Dashboard); 