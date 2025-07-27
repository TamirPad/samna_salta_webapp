import React, { ReactElement, ReactNode, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
// import { selectLanguage } from '../../features/language/languageSlice';
import { selectAuth } from '../../features/auth/authSlice';
import {
  fetchDashboardAnalytics,
  clearAnalyticsError,
} from '../../features/analytics/analyticsSlice';
import { apiService } from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

// Styled Components
const AnalyticsContainer = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
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

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 1rem;
`;

const Tab = styled.button<{ $active: boolean }>`
  background: ${props => (props.$active ? '#8B4513' : 'transparent')};
  color: ${props => (props.$active ? 'white' : '#8B4513')};
  border: 2px solid #8b4513;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => (props.$active ? '#8B4513' : '#f8f9fa')};
    transform: translateY(-1px);
  }
`;

const ContentContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #8b4513;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #8b4513;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const ChartContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TableContainer = styled.div`
  margin-top: 2rem;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  background: #8b4513;
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
`;

const Tr = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
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

const AuthButton = styled.button`
  background: #8b4513;
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

const WarningBanner = styled.div`
  background: #fff3cd;
  color: #856404;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid #ffeaa7;
`;

const DateFilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const DateInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const FilterButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background: #218838;
  }
`;

// Types
interface SalesData {
  period: string;
  orders: number;
  revenue: number;
  avg_order_value: number;
}

interface ProductData {
  id: number;
  name: string;
  name_he?: string;
  name_en?: string;
  price: number;
  order_count: number;
  total_quantity: number;
  total_revenue: number;
  avg_quantity_per_order: number;
}

interface CustomerData {
  id: number;
  name: string;
  email: string;
  phone: string;
  order_count: number;
  total_spent: number;
  avg_order_value: number;
  last_order_date: string;
  first_order_date: string;
}

const AdminAnalytics: React.FC = () => {
  // const language = useAppSelector(selectLanguage);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector(selectAuth);
  const { dashboard, isLoading, error } = useAppSelector(
    state => state.analytics
  );

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'sales' | 'products' | 'customers'
  >('dashboard');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productData, setProductData] = useState<ProductData[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [loadingData, setLoadingData] = useState(false);

  // Fetch dashboard data on component mount
  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      dispatch(fetchDashboardAnalytics());
    }
  }, [dispatch, isAuthenticated, user]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearAnalyticsError());
    };
  }, [dispatch]);

  const handleLogin = () => {
    navigate('/login');
  };

  const fetchSalesData = async () => {
    try {
      setLoadingData(true);
      const response = await apiService.getSalesReport({
        ...(dateRange.startDate && { start_date: dateRange.startDate }),
        ...(dateRange.endDate && { end_date: dateRange.endDate }),
        group_by: 'day',
      });
      setSalesData(response.data.data.sales);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchProductData = async () => {
    try {
      setLoadingData(true);
      const response = await apiService.getProductAnalytics({
        ...(dateRange.startDate && { start_date: dateRange.startDate }),
        ...(dateRange.endDate && { end_date: dateRange.endDate }),
      });
      setProductData(response.data.data.products);
    } catch (error) {
      console.error('Error fetching product data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchCustomerData = async () => {
    try {
      setLoadingData(true);
      const response = await apiService.getCustomerAnalytics({
        ...(dateRange.startDate && { start_date: dateRange.startDate }),
        ...(dateRange.endDate && { end_date: dateRange.endDate }),
      });
      setCustomerData(response.data.data.customers);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleTabChange = (
    tab: 'dashboard' | 'sales' | 'products' | 'customers'
  ) => {
    setActiveTab(tab);
    if (tab === 'sales') {
      fetchSalesData();
    } else if (tab === 'products') {
      fetchProductData();
    } else if (tab === 'customers') {
      fetchCustomerData();
    }
  };

  const formatCurrency = (amount: number): string => {
    return `₪${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isAuthenticated) {
    return (
      <AuthContainer>
        <Title>Analytics Dashboard</Title>
        <AuthCard>
          <strong>Authentication Required</strong>
          <p style={{ margin: '1rem 0' }}>Please login to access analytics.</p>
          <ButtonGroup>
            <AuthButton onClick={handleLogin}>
              Login to Access Analytics
            </AuthButton>
          </ButtonGroup>
        </AuthCard>
      </AuthContainer>
    );
  }

  if (!user?.isAdmin) {
    return (
      <AuthContainer>
        <Title>Analytics Dashboard</Title>
        <AuthCard>
          <strong>Access Denied</strong>
          <p style={{ margin: '1rem 0' }}>
            Admin privileges required to access analytics.
          </p>
          <ButtonGroup>
            <AuthButton onClick={() => navigate('/')}>Go to Home</AuthButton>
          </ButtonGroup>
        </AuthCard>
      </AuthContainer>
    );
  }

  return (
    <AnalyticsContainer>
      <Header>
        <Title>Analytics Dashboard</Title>
      </Header>

      {error && (
        <WarningBanner>
          <strong>⚠️ Warning:</strong> {error}
        </WarningBanner>
      )}

      <TabContainer>
        <Tab
          $active={activeTab === 'dashboard'}
          onClick={() => handleTabChange('dashboard')}
        >
          Dashboard
        </Tab>
        <Tab
          $active={activeTab === 'sales'}
          onClick={() => handleTabChange('sales')}
        >
          Sales Reports
        </Tab>
        <Tab
          $active={activeTab === 'products'}
          onClick={() => handleTabChange('products')}
        >
          Product Analytics
        </Tab>
        <Tab
          $active={activeTab === 'customers'}
          onClick={() => handleTabChange('customers')}
        >
          Customer Analytics
        </Tab>
      </TabContainer>

      <ContentContainer>
        {activeTab === 'dashboard' && (
          <>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <StatsGrid>
                  <StatCard>
                    <StatValue>{dashboard?.today?.orders || 0}</StatValue>
                    <StatLabel>Today&apos;s Orders</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>
                      {formatCurrency(dashboard?.today?.revenue || 0)}
                    </StatValue>
                    <StatLabel>Today&apos;s Revenue</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>{dashboard?.customers || 0}</StatValue>
                    <StatLabel>Total Customers</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>{dashboard?.pending_orders || 0}</StatValue>
                    <StatLabel>Pending Orders</StatLabel>
                  </StatCard>
                </StatsGrid>

                <ChartContainer>
                  <p>Revenue Chart - Coming Soon</p>
                </ChartContainer>

                {dashboard?.top_products &&
                  dashboard.top_products.length > 0 && (
                    <TableContainer>
                      <h3>Top Selling Products</h3>
                      <Table>
                        <thead>
                          <tr>
                            <Th>Product</Th>
                            <Th>Orders</Th>
                            <Th>Quantity Sold</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboard.top_products.map(
                            (
                              product: {
                                name: string;
                                order_count: number;
                                total_quantity: number;
                              },
                              index: number
                            ) => (
                              <Tr key={`product-${product.name}-${index}`}>
                                <Td>{product.name}</Td>
                                <Td>{product.order_count}</Td>
                                <Td>{product.total_quantity}</Td>
                              </Tr>
                            )
                          )}
                        </tbody>
                      </Table>
                    </TableContainer>
                  )}
              </>
            )}
          </>
        )}

        {activeTab === 'sales' && (
          <>
            <DateFilterContainer>
              <DateInput
                type='date'
                value={dateRange.startDate}
                onChange={e =>
                  setDateRange(prev => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
              <span>to</span>
              <DateInput
                type='date'
                value={dateRange.endDate}
                onChange={e =>
                  setDateRange(prev => ({ ...prev, endDate: e.target.value }))
                }
              />
              <FilterButton onClick={fetchSalesData}>Apply Filter</FilterButton>
            </DateFilterContainer>

            {loadingData ? (
              <LoadingSpinner />
            ) : (
              <TableContainer>
                <Table>
                  <thead>
                    <tr>
                      <Th>Date</Th>
                      <Th>Orders</Th>
                      <Th>Revenue</Th>
                      <Th>Avg Order Value</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.map((sale, index) => (
                      <Tr key={index}>
                        <Td>{sale.period}</Td>
                        <Td>{sale.orders}</Td>
                        <Td>{formatCurrency(sale.revenue)}</Td>
                        <Td>{formatCurrency(sale.avg_order_value)}</Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
            )}
          </>
        )}

        {activeTab === 'products' && (
          <>
            <DateFilterContainer>
              <DateInput
                type='date'
                value={dateRange.startDate}
                onChange={e =>
                  setDateRange(prev => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
              <span>to</span>
              <DateInput
                type='date'
                value={dateRange.endDate}
                onChange={e =>
                  setDateRange(prev => ({ ...prev, endDate: e.target.value }))
                }
              />
              <FilterButton onClick={fetchProductData}>
                Apply Filter
              </FilterButton>
            </DateFilterContainer>

            {loadingData ? (
              <LoadingSpinner />
            ) : (
              <TableContainer>
                <Table>
                  <thead>
                    <tr>
                      <Th>Product</Th>
                      <Th>Price</Th>
                      <Th>Orders</Th>
                      <Th>Quantity Sold</Th>
                      <Th>Revenue</Th>
                      <Th>Avg Quantity/Order</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {productData.map(product => (
                      <Tr key={product.id}>
                        <Td>{product.name}</Td>
                        <Td>{formatCurrency(product.price)}</Td>
                        <Td>{product.order_count}</Td>
                        <Td>{product.total_quantity}</Td>
                        <Td>{formatCurrency(product.total_revenue)}</Td>
                        <Td>{product.avg_quantity_per_order.toFixed(1)}</Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
            )}
          </>
        )}

        {activeTab === 'customers' && (
          <>
            <DateFilterContainer>
              <DateInput
                type='date'
                value={dateRange.startDate}
                onChange={e =>
                  setDateRange(prev => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
              <span>to</span>
              <DateInput
                type='date'
                value={dateRange.endDate}
                onChange={e =>
                  setDateRange(prev => ({ ...prev, endDate: e.target.value }))
                }
              />
              <FilterButton onClick={fetchCustomerData}>
                Apply Filter
              </FilterButton>
            </DateFilterContainer>

            {loadingData ? (
              <LoadingSpinner />
            ) : (
              <TableContainer>
                <Table>
                  <thead>
                    <tr>
                      <Th>Customer</Th>
                      <Th>Email</Th>
                      <Th>Phone</Th>
                      <Th>Orders</Th>
                      <Th>Total Spent</Th>
                      <Th>Avg Order Value</Th>
                      <Th>Last Order</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerData.map(customer => (
                      <Tr key={customer.id}>
                        <Td>{customer.name}</Td>
                        <Td>{customer.email}</Td>
                        <Td>{customer.phone}</Td>
                        <Td>{customer.order_count}</Td>
                        <Td>{formatCurrency(customer.total_spent)}</Td>
                        <Td>{formatCurrency(customer.avg_order_value)}</Td>
                        <Td>
                          {customer.last_order_date
                            ? formatDate(customer.last_order_date)
                            : 'N/A'}
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </ContentContainer>
    </AnalyticsContainer>
  );
};

export default AdminAnalytics;
