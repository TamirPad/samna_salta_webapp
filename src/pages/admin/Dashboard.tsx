import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Clock, 
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
  Package,
  Truck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import { selectLanguage } from '../../features/language/languageSlice';
import { apiService } from '../../utils/api';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;

  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

const DashboardContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

const DashboardHeader = styled.div`
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const DashboardTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const DashboardSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #2F2F2F;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const StatChange = styled.div<{ positive: boolean }>`
  color: ${props => props.positive ? '#28a745' : '#dc3545'};
  font-size: 0.8rem;
  font-weight: 600;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2F2F2F;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SectionAction = styled.button`
  background: #8B4513;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;

  &:hover {
    background: #D2691E;
  }
`;

const OrdersList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const OrderItem = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: background 0.3s ease;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const OrderStatus = styled.div<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#fff3cd';
      case 'confirmed': return '#d1ecf1';
      case 'preparing': return '#d4edda';
      case 'ready': return '#d1ecf1';
      case 'delivering': return '#cce5ff';
      case 'delivered': return '#d4edda';
      case 'cancelled': return '#f8d7da';
      default: return '#e9ecef';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#856404';
      case 'confirmed': return '#0c5460';
      case 'preparing': return '#155724';
      case 'ready': return '#0c5460';
      case 'delivering': return '#004085';
      case 'delivered': return '#155724';
      case 'cancelled': return '#721c24';
      default: return '#495057';
    }
  }};
`;

const OrderInfo = styled.div`
  flex: 1;
`;

const OrderNumber = styled.div`
  font-weight: 600;
  color: #2F2F2F;
  margin-bottom: 0.25rem;
`;

const OrderCustomer = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const OrderTotal = styled.div`
  font-weight: 600;
  color: #8B4513;
  font-size: 1.1rem;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const QuickAction = styled.button`
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    border-color: #8B4513;
    background: #fff;
  }
`;

const QuickActionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #8B4513;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const QuickActionLabel = styled.div`
  font-weight: 600;
  color: #2F2F2F;
  font-size: 0.9rem;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const AlertCard = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const AlertTitle = styled.div`
  font-weight: 600;
  color: #856404;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AlertMessage = styled.div`
  color: #856404;
  font-size: 0.9rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const Dashboard: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const translations = useMemo(() => ({
    he: {
      dashboardTitle: 'לוח בקרה',
      dashboardSubtitle: 'ברוכים הבאים ללוח הבקרה של סמנה סלטה',
      totalOrders: 'סה"כ הזמנות',
      totalRevenue: 'סה"כ הכנסות',
      totalCustomers: 'סה"כ לקוחות',
      averageOrder: 'ממוצע הזמנה',
      recentOrders: 'הזמנות אחרונות',
      viewAllOrders: 'צפה בכל ההזמנות',
      quickActions: 'פעולות מהירות',
      addProduct: 'הוסף מוצר',
      viewMenu: 'צפה בתפריט',
      manageOrders: 'נהל הזמנות',
      viewCustomers: 'צפה בלקוחות',
      alerts: 'התראות',
      lowStock: 'מלאי נמוך',
      lowStockDesc: 'יש מוצרים עם מלאי נמוך שדורשים תשומת לב',
      pendingOrders: 'הזמנות ממתינות',
      pendingOrdersDesc: 'יש הזמנות ממתינות לאישור',
      noOrders: 'אין הזמנות',
      noOrdersDesc: 'אין הזמנות להצגה כרגע',
      orderStatus: {
        pending: 'ממתין',
        confirmed: 'אושר',
        preparing: 'מוכן',
        ready: 'מוכן',
        delivering: 'בדרך',
        delivered: 'נמסר',
        cancelled: 'בוטל',
      },
    },
    en: {
      dashboardTitle: 'Dashboard',
      dashboardSubtitle: 'Welcome to Samna Salta Dashboard',
      totalOrders: 'Total Orders',
      totalRevenue: 'Total Revenue',
      totalCustomers: 'Total Customers',
      averageOrder: 'Average Order',
      recentOrders: 'Recent Orders',
      viewAllOrders: 'View All Orders',
      quickActions: 'Quick Actions',
      addProduct: 'Add Product',
      viewMenu: 'View Menu',
      manageOrders: 'Manage Orders',
      viewCustomers: 'View Customers',
      alerts: 'Alerts',
      lowStock: 'Low Stock',
      lowStockDesc: 'Some products have low stock that need attention',
      pendingOrders: 'Pending Orders',
      pendingOrdersDesc: 'There are orders waiting for confirmation',
      noOrders: 'No Orders',
      noOrdersDesc: 'No orders to display at the moment',
      orderStatus: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        preparing: 'Preparing',
        ready: 'Ready',
        delivering: 'Delivering',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
      },
    }
  }), []);

  const t = useMemo(() => translations[language as keyof typeof translations], [translations, language]);

  // Mock data for development
  const mockAnalytics = useMemo(() => ({
    total_orders: 156,
    total_revenue: 12450,
    total_customers: 89,
    average_order_value: 79.8,
    orders_today: 12,
    revenue_today: 960,
    orders_this_week: 45,
    revenue_this_week: 3580,
  }), []);

  const mockRecentOrders = useMemo(() => [
    {
      id: 1,
      order_number: '#000123',
      customer_name: 'ישראל ישראלי',
      status: 'preparing',
      total: 85,
      created_at: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      order_number: '#000122',
      customer_name: 'שרה כהן',
      status: 'delivering',
      total: 120,
      created_at: '2024-01-15T09:15:00Z',
    },
    {
      id: 3,
      order_number: '#000121',
      customer_name: 'משה לוי',
      status: 'delivered',
      total: 65,
      created_at: '2024-01-15T08:45:00Z',
    },
    {
      id: 4,
      order_number: '#000120',
      customer_name: 'רחל גולדברג',
      status: 'pending',
      total: 95,
      created_at: '2024-01-15T08:20:00Z',
    },
    {
      id: 5,
      order_number: '#000119',
      customer_name: 'דוד רוזן',
      status: 'ready',
      total: 75,
      created_at: '2024-01-15T07:55:00Z',
    },
  ], []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would fetch from API
        // const [analyticsResponse, ordersResponse] = await Promise.all([
        //   apiService.getAnalytics(),
        //   apiService.getOrders({ limit: 5 })
        // ]);
        
        // For now, use mock data
        setTimeout(() => {
          setAnalytics(mockAnalytics);
          setRecentOrders(mockRecentOrders);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [mockAnalytics, mockRecentOrders]);

  const formatCurrency = (amount: number) => {
    return `₪${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'he' ? 'he-IL' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'confirmed': return <CheckCircle size={16} />;
      case 'preparing': return <Package size={16} />;
      case 'ready': return <CheckCircle size={16} />;
      case 'delivering': return <Truck size={16} />;
      case 'delivered': return <CheckCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardContainer>
      <DashboardContent>
        <DashboardHeader>
          <DashboardTitle>{t.dashboardTitle}</DashboardTitle>
          <DashboardSubtitle>{t.dashboardSubtitle}</DashboardSubtitle>
        </DashboardHeader>

        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StatIcon color="#007bff">
              <ShoppingCart size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>{analytics?.total_orders || 0}</StatValue>
              <StatLabel>{t.totalOrders}</StatLabel>
              <StatChange positive={true}>+12% from last week</StatChange>
            </StatContent>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <StatIcon color="#28a745">
              <DollarSign size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>{formatCurrency(analytics?.total_revenue || 0)}</StatValue>
              <StatLabel>{t.totalRevenue}</StatLabel>
              <StatChange positive={true}>+8% from last week</StatChange>
            </StatContent>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <StatIcon color="#ffc107">
              <Users size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>{analytics?.total_customers || 0}</StatValue>
              <StatLabel>{t.totalCustomers}</StatLabel>
              <StatChange positive={true}>+5% from last week</StatChange>
            </StatContent>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <StatIcon color="#17a2b8">
              <TrendingUp size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>{formatCurrency(analytics?.average_order_value || 0)}</StatValue>
              <StatLabel>{t.averageOrder}</StatLabel>
              <StatChange positive={true}>+3% from last week</StatChange>
            </StatContent>
          </StatCard>
        </StatsGrid>

        <DashboardGrid>
          <MainSection>
            <Section>
              <SectionHeader>
                <SectionTitle>
                  <ShoppingCart size={20} />
                  {t.recentOrders}
                </SectionTitle>
                <SectionAction>
                  <Eye size={16} />
                  {t.viewAllOrders}
                </SectionAction>
              </SectionHeader>
              
              <OrdersList>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <OrderItem key={order.id}>
                      <OrderStatus status={order.status}>
                        {getStatusIcon(order.status)}
                        {t.orderStatus[order.status as keyof typeof t.orderStatus]}
                      </OrderStatus>
                      <OrderInfo>
                        <OrderNumber>{order.order_number}</OrderNumber>
                        <OrderCustomer>{order.customer_name}</OrderCustomer>
                      </OrderInfo>
                      <OrderTotal>{formatCurrency(order.total)}</OrderTotal>
                    </OrderItem>
                  ))
                ) : (
                  <EmptyState>
                    <h3>{t.noOrders}</h3>
                    <p>{t.noOrdersDesc}</p>
                  </EmptyState>
                )}
              </OrdersList>
            </Section>

            <Section>
              <SectionHeader>
                <SectionTitle>
                  <Plus size={20} />
                  {t.quickActions}
                </SectionTitle>
              </SectionHeader>
              
              <div style={{ padding: '1.5rem' }}>
                <QuickActions>
                  <QuickAction>
                    <QuickActionIcon>
                      <Plus size={20} />
                    </QuickActionIcon>
                    <QuickActionLabel>{t.addProduct}</QuickActionLabel>
                  </QuickAction>
                  
                  <QuickAction>
                    <QuickActionIcon>
                      <Eye size={20} />
                    </QuickActionIcon>
                    <QuickActionLabel>{t.viewMenu}</QuickActionLabel>
                  </QuickAction>
                  
                  <QuickAction>
                    <QuickActionIcon>
                      <ShoppingCart size={20} />
                    </QuickActionIcon>
                    <QuickActionLabel>{t.manageOrders}</QuickActionLabel>
                  </QuickAction>
                  
                  <QuickAction>
                    <QuickActionIcon>
                      <Users size={20} />
                    </QuickActionIcon>
                    <QuickActionLabel>{t.viewCustomers}</QuickActionLabel>
                  </QuickAction>
                </QuickActions>
              </div>
            </Section>
          </MainSection>

          <Sidebar>
            <Section>
              <SectionHeader>
                <SectionTitle>
                  <AlertCircle size={20} />
                  {t.alerts}
                </SectionTitle>
              </SectionHeader>
              
              <div style={{ padding: '1.5rem' }}>
                <AlertCard>
                  <AlertTitle>
                    <AlertCircle size={16} />
                    {t.lowStock}
                  </AlertTitle>
                  <AlertMessage>{t.lowStockDesc}</AlertMessage>
                </AlertCard>
                
                <AlertCard>
                  <AlertTitle>
                    <Clock size={16} />
                    {t.pendingOrders}
                  </AlertTitle>
                  <AlertMessage>{t.pendingOrdersDesc}</AlertMessage>
                </AlertCard>
              </div>
            </Section>
          </Sidebar>
        </DashboardGrid>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default Dashboard; 