import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { selectLanguage } from '../../features/language/languageSlice';
import { fetchOrders, selectOrders, selectOrdersLoading } from '../../features/orders/ordersSlice';
import { fetchProducts, selectProducts, selectProductsLoading } from '../../features/products/productsSlice';
import { fetchDashboardAnalytics, selectDashboardAnalytics, selectAnalyticsLoading } from '../../features/analytics/analyticsSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  margin-bottom: 2rem;
`;

const DashboardTitle = styled.h1`
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const DashboardSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
`;

const RecentActivity = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ActivityTitle = styled.h2`
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-inline-start: 4px solid ${({ theme }) => theme.colors.primary};
  overflow: hidden;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    gap: 0.5rem;
    padding: 0.75rem;
  }

  /* RTL: move the accent border to the other side */
  [dir='rtl'] & {
    border-inline-start: none;
    border-inline-end: 4px solid ${({ theme }) => theme.colors.primary};
  }
`;

const ActivityIcon = styled.div`
  font-size: 1.5rem;
  flex-shrink: 0;
  min-width: 1.5rem;
  text-align: center;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0; /* allow ellipsis */
`;

const ActivityItemTitle = styled.div`
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ActivityDescription = styled.div`
  color: #666;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ActivityTime = styled.div`
  color: #999;
  font-size: 0.8rem;
  white-space: nowrap;
  margin-inline-start: auto;
  flex-shrink: 0;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-2px);
  }
`;

const Dashboard: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Use Redux selectors instead of local state
  const analytics = useAppSelector(selectDashboardAnalytics);
  const analyticsLoading = useAppSelector(selectAnalyticsLoading);
  const products = useAppSelector(selectProducts);
  const productsLoading = useAppSelector(selectProductsLoading);
  const orders = useAppSelector(selectOrders);
  const ordersLoading = useAppSelector(selectOrdersLoading);

  const loading = analyticsLoading || productsLoading || ordersLoading;

  useEffect(() => {
    // Use thunks to populate Redux from API
    dispatch(fetchDashboardAnalytics());
    dispatch(fetchProducts({} as any));
    dispatch(fetchOrders({ status: 'all', page: 1, limit: 10 } as any));
  }, [dispatch]);

  // Calculate stats from Redux state
  const stats = {
    totalOrders: analytics?.month?.orders || 0,
    totalRevenue: analytics?.month?.revenue || 0,
    totalCustomers: analytics?.customers || 0,
    totalProducts: products?.length || 0
  };

  // Create recent activity from Redux state
  const recentActivity = orders?.slice(0, 5).map((order: any) => ({
    id: order.id,
    type: 'order',
    title: `Order #${order.order_number || order.id}`,
    description: `₪${order.total?.toFixed ? order.total.toFixed(2) : order.total}`,
    time: new Date(order.created_at || Date.now()).toLocaleString(),
    icon: '🛒',
    amount: order.total
  })) || [];

  const getContent = () => {
    if (language === 'he') {
      return {
        title: 'דשבורד',
        subtitle: 'סקירה כללית של הפעילות',
        stats: {
          orders: 'הזמנות',
          revenue: 'הכנסות',
          customers: 'לקוחות',
          products: 'מוצרים'
        },
        recentActivity: 'פעילות אחרונה',
        quickActions: 'פעולות מהירות',
        viewOrders: 'צפה בהזמנות',
        addProduct: 'הוסף מוצר',
        viewCustomers: 'צפה בלקוחות',
        viewAnalytics: 'צפה בניתוח'
      };
    } else {
      return {
        title: 'Dashboard',
        subtitle: 'Overview of your business activity',
        stats: {
          orders: 'Orders',
          revenue: 'Revenue',
          customers: 'Customers',
          products: 'Products'
        },
        recentActivity: 'Recent Activity',
        quickActions: 'Quick Actions',
        viewOrders: 'View Orders',
        addProduct: 'Add Product',
        viewCustomers: 'View Customers',
        viewAnalytics: 'View Analytics'
      };
    }
  };

  const content = getContent();

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingSpinner />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>{content.title}</DashboardTitle>
        <DashboardSubtitle>{content.subtitle}</DashboardSubtitle>
      </DashboardHeader>

      <StatsGrid>
        <StatCard>
          <StatIcon>🛒</StatIcon>
          <StatValue>{stats.totalOrders}</StatValue>
          <StatLabel>{content.stats.orders}</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon>💰</StatIcon>
          <StatValue>₪{stats.totalRevenue.toLocaleString()}</StatValue>
          <StatLabel>{content.stats.revenue}</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon>👥</StatIcon>
          <StatValue>{stats.totalCustomers}</StatValue>
          <StatLabel>{content.stats.customers}</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon>🍞</StatIcon>
          <StatValue>{stats.totalProducts}</StatValue>
          <StatLabel>{content.stats.products}</StatLabel>
        </StatCard>
      </StatsGrid>

      <RecentActivity>
        <ActivityTitle>{content.recentActivity}</ActivityTitle>
        <ActivityList>
          {recentActivity.map((activity) => (
            <ActivityItem key={activity.id} onClick={() => navigate(`/order/${activity.id}`)} style={{ cursor: 'pointer' }}>
              <ActivityIcon>{activity.icon}</ActivityIcon>
              <ActivityContent>
                <ActivityItemTitle>{activity.title}</ActivityItemTitle>
                <ActivityDescription>{activity.description}</ActivityDescription>
              </ActivityContent>
              <ActivityTime>{activity.time}</ActivityTime>
            </ActivityItem>
          ))}
        </ActivityList>
      </RecentActivity>

      <QuickActions>
        <ActionButton onClick={() => navigate('/admin/orders')}>
          🛒 {content.viewOrders}
        </ActionButton>
        <ActionButton onClick={() => navigate('/admin/products')}>
          ➕ {content.addProduct}
        </ActionButton>
        <ActionButton onClick={() => navigate('/admin/customers')}>
          👥 {content.viewCustomers}
        </ActionButton>
        <ActionButton onClick={() => navigate('/admin/analytics')}>
          📊 {content.viewAnalytics}
        </ActionButton>
      </QuickActions>
    </DashboardContainer>
  );
};

export default Dashboard;
