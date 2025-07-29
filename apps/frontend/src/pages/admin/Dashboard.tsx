import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../hooks/redux';
import { selectLanguage } from '../../features/language/languageSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import styled from 'styled-components';

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
  color: #8B4513;
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
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #8B4513;
`;

const ActivityIcon = styled.div`
  font-size: 1.5rem;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityItemTitle = styled.div`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const ActivityDescription = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const ActivityTime = styled.div`
  color: #999;
  font-size: 0.8rem;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const ActionButton = styled.button`
  background: #8B4513;
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
  
  &:hover {
    background: #A0522D;
    transform: translateY(-2px);
  }
`;

const Dashboard: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalOrders: 156,
          totalRevenue: 45230,
          totalCustomers: 89,
          totalProducts: 24
        });
        
        setRecentActivity([
          {
            id: 1,
            type: 'order',
            title: 'New Order #1234',
            description: 'Order placed by John Doe',
            time: '2 minutes ago',
            icon: '🛒'
          },
          {
            id: 2,
            type: 'customer',
            title: 'New Customer',
            description: 'Sarah Smith registered',
            time: '15 minutes ago',
            icon: '👤'
          },
          {
            id: 3,
            type: 'product',
            title: 'Product Updated',
            description: 'Kubaneh price updated',
            time: '1 hour ago',
            icon: '🍞'
          }
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

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
    return <LoadingSpinner text={language === 'he' ? 'טוען דשבורד...' : 'Loading dashboard...'} />;
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
            <ActivityItem key={activity.id}>
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
        <ActionButton>
          🛒 {content.viewOrders}
        </ActionButton>
        <ActionButton>
          ➕ {content.addProduct}
        </ActionButton>
        <ActionButton>
          👥 {content.viewCustomers}
        </ActionButton>
        <ActionButton>
          📊 {content.viewAnalytics}
        </ActionButton>
      </QuickActions>
    </DashboardContainer>
  );
};

export default Dashboard;
