import React, {
  ReactElement,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchDashboardAnalytics,
  clearAnalyticsError,
} from "../../features/analytics/analyticsSlice";
import { selectAuth } from "../../features/auth/authSlice";

// Types
interface DashboardData {
  today: {
    orders: number;
    revenue: number;
  };
  month: {
    orders: number;
    revenue: number;
  };
  customers: number;
  pendingOrders: number;
  topProducts: Array<{
    name: string;
    name_he?: string;
    name_en?: string;
    order_count: number;
    total_quantity: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  revenueByDay: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
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
  color: #8b4513;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const CardTitle = styled.h3`
  margin-bottom: 0.5rem;
  color: #2f2f2f;
`;

const CardValue = styled.p<{ $color: string }>`
  font-size: 2rem;
  font-weight: bold;
  color: ${(props): string => props.$color};
  margin-bottom: 0.5rem;
`;

const DataStatus = styled.small<{ $isLive: boolean }>`
  color: ${(props): string => (props.$isLive ? "#28a745" : "#ffc107")};
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

const AuthButton = styled.button<{
  $variant?: "primary" | "secondary";
}>`
  background: ${(props): string =>
    props.$variant === "secondary" ? "#28a745" : "#8B4513"};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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
const StatCard: React.FC<DashboardCardProps> = React.memo(
  ({ title, value, color, isLiveData }): JSX.Element => (
    <DashboardCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CardTitle>{title}</CardTitle>
      <CardValue $color={color}>{value}</CardValue>
      <DataStatus $isLive={isLiveData}>
        {isLiveData ? "✓ Live data" : "⚠️ Demo data"}
      </DataStatus>
    </DashboardCard>
  ),
);

StatCard.displayName = "StatCard";

// Utility function
const formatCurrency = (amount: number): string => {
  return `₪${amount.toLocaleString()}`;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector(selectAuth);
  const { dashboard, isLoading, error } = useAppSelector(
    (state) => state.analytics,
  );

  // Fetch dashboard data on component mount
  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      // Add a small delay to prevent rapid successive calls
      const timer = setTimeout(() => {
        dispatch(fetchDashboardAnalytics());
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [dispatch, isAuthenticated, user?.isAdmin]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearAnalyticsError());
    };
  }, [dispatch]);

  const handleLogin = useCallback((): void => {
    navigate("/login");
  }, [navigate]);

  // Memoized dashboard data
  const dashboardData = useMemo<DashboardData>(() => {
    if (dashboard) {
      return {
        today: dashboard.today,
        month: dashboard.month,
        customers: dashboard.customers,
        pendingOrders: dashboard.pending_orders || 0,
        topProducts: dashboard.top_products || [],
        ordersByStatus: dashboard.orders_by_status || [],
        revenueByDay: dashboard.revenue_by_day || [],
      };
    }
    return {
      today: { orders: 25, revenue: 1250 },
      month: { orders: 150, revenue: 7500 },
      customers: 150,
      pendingOrders: 8,
      topProducts: [],
      ordersByStatus: [],
      revenueByDay: [],
    };
  }, [dashboard]);

  // Memoized stats cards data
  const statsCards = useMemo<DashboardCardProps[]>(
    () => [
      {
        title: "Today's Orders",
        value: dashboardData.today.orders,
        color: "#007bff",
        isLiveData: !!dashboard && !error,
        hasError: !!error,
      },
      {
        title: "Today's Revenue",
        value: formatCurrency(dashboardData.today.revenue),
        color: "#28a745",
        isLiveData: !!dashboard && !error,
        hasError: !!error,
      },
      {
        title: "Total Customers",
        value: dashboardData.customers,
        color: "#ffc107",
        isLiveData: !!dashboard && !error,
        hasError: !!error,
      },
      {
        title: "Pending Orders",
        value: dashboardData.pendingOrders,
        color: "#dc3545",
        isLiveData: !!dashboard && !error,
        hasError: !!error,
      },
    ],
    [dashboardData, dashboard, error],
  );

  if (!isAuthenticated) {
    return (
      <AuthContainer>
        <DashboardTitle>Samna Salta Dashboard</DashboardTitle>
        <AuthCard>
          <strong>Authentication Required</strong>
          <p style={{ margin: "1rem 0" }}>
            Please login to access the admin dashboard.
          </p>
          <ButtonGroup>
            <AuthButton onClick={handleLogin}>Login to Dashboard</AuthButton>
          </ButtonGroup>
        </AuthCard>
      </AuthContainer>
    );
  }

  if (!user?.isAdmin) {
    return (
      <AuthContainer>
        <DashboardTitle>Samna Salta Dashboard</DashboardTitle>
        <AuthCard>
          <strong>Access Denied</strong>
          <p style={{ margin: "1rem 0" }}>
            Admin privileges required to access this dashboard.
          </p>
          <ButtonGroup>
            <AuthButton onClick={() => navigate("/")}>Go to Home</AuthButton>
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
          {error.includes("Network error") && (
            <div style={{ marginTop: "0.5rem" }}>
              <small>
                Showing demo data. Please check your connection and refresh the
                page.
              </small>
            </div>
          )}
        </WarningBanner>
      )}

      {isLoading && !dashboard && (
        <LoadingMessage>
          <p>Loading dashboard data...</p>
        </LoadingMessage>
      )}

      <DashboardGrid>
        {statsCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </DashboardGrid>

      {!dashboard && !error && (
        <DemoModeBanner>
          <p style={{ color: "#1976d2", margin: 0 }}>
            <strong>Demo Mode:</strong> Showing sample data. Connect to backend
            for live data.
          </p>
        </DemoModeBanner>
      )}
    </DashboardContainer>
  );
};

export default React.memo(Dashboard);
