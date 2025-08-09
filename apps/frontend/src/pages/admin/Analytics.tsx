import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux";
import { selectAuth } from "../../features/auth/authSlice";
import { apiService } from "../../utils/api";
import LoadingSpinner from "../../components/LoadingSpinner";

// Styled Components
const AnalyticsContainer = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
  @media (max-width: 768px) { padding: 1rem; }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin: 0;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.75rem;
  flex-wrap: wrap;
`;

const Tab = styled.button<{ $active: boolean }>`
  background: ${(props) => (props.$active ? "#00C2FF" : "transparent")};
  color: ${(props) => (props.$active ? "white" : "#00C2FF")};
  border: 2px solid #00C2FF;
  padding: 0.625rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  min-height: 44px;

  &:hover {
    background: ${(props) => (props.$active ? "#00C2FF" : "#f8f9fa")};
    transform: translateY(-1px);
  }
`;

const ContentContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  @media (max-width: 768px) { padding: 1rem; }
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
  border-radius: 12px;
  text-align: center;
  border-inline-start: 4px solid #00C2FF;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #00C2FF;
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
  color: #666;
  @media (max-width: 768px) { padding: 0.75rem; }
`;

const AuthContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const AuthButton = styled.button`
  background: #00C2FF;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.3s ease;
  min-height: 44px;

  &:hover {
    background: #0077CC;
  }
`;

const TableContainer = styled.div`
  margin-top: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid #e9ecef;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
`;

const AdminAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(selectAuth);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "sales" | "products" | "customers"
  >("dashboard");
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  // Dashboard data
  const [dashboardData, setDashboardData] = useState<any>({
    today: { orders: 0, revenue: 0 },
    month: { orders: 0, revenue: 0 },
    customers: 0,
    pendingOrders: 0,
    topProducts: [],
    ordersByStatus: [],
    revenueByDay: []
  });

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getDashboardAnalytics();
        const data = (response as any)?.data?.data || (response as any)?.data;
        if (data) {
          setDashboardData(data);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const handleTabChange = (
    tab: "dashboard" | "sales" | "products" | "customers",
  ) => {
    setActiveTab(tab);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
    }).format(amount);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("he-IL");
  };

  if (!isAuthenticated) {
    return (
      <AuthContainer>
        <Title>Analytics Dashboard</Title>
        <p style={{ margin: "1rem 0" }}>Please login to access analytics.</p>
        <ButtonGroup>
          <AuthButton onClick={() => navigate("/login")}>
            Login to Access Analytics
          </AuthButton>
        </ButtonGroup>
      </AuthContainer>
    );
  }

  return (
    <AnalyticsContainer>
      <Header>
        <Title>Analytics Dashboard</Title>
      </Header>

      <TabContainer>
        <Tab
          $active={activeTab === "dashboard"}
          onClick={() => handleTabChange("dashboard")}
        >
          Dashboard
        </Tab>
        <Tab
          $active={activeTab === "sales"}
          onClick={() => handleTabChange("sales")}
        >
          Sales
        </Tab>
        <Tab
          $active={activeTab === "products"}
          onClick={() => handleTabChange("products")}
        >
          Products
        </Tab>
        <Tab
          $active={activeTab === "customers"}
          onClick={() => handleTabChange("customers")}
        >
          Customers
        </Tab>
      </TabContainer>

      <ContentContainer>
        {activeTab === "dashboard" && (
          <>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <StatsGrid>
                  <StatCard>
                    <StatValue>{dashboardData?.today?.orders || dashboardData?.today?.count || 0}</StatValue>
                    <StatLabel>Today&apos;s Orders</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>
                      {formatCurrency(dashboardData?.today?.revenue || 0)}
                    </StatValue>
                    <StatLabel>Today&apos;s Revenue</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>{dashboardData?.customers || dashboardData?.total_customers || 0}</StatValue>
                    <StatLabel>Total Customers</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>{dashboardData?.pendingOrders || dashboardData?.pending_orders || 0}</StatValue>
                    <StatLabel>Pending Orders</StatLabel>
                  </StatCard>
                </StatsGrid>

                <ChartContainer>
                  <p>Revenue and Orders Chart</p>
                  <p>Chart implementation would go here</p>
                </ChartContainer>

                {dashboardData?.top_products &&
                  dashboardData.top_products.length > 0 && (
                    <TableContainer>
                      <h3>Top Selling Products</h3>
                      <Table>
                        <thead>
                          <tr>
                            <Th>Product</Th>
                            <Th>Orders</Th>
                            <Th>Revenue</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.top_products.map(
                            (
                              product: {
                                name: string;
                                order_count: number;
                                total_revenue: number;
                              },
                              index: number,
                            ) => (
                              // eslint-disable-next-line react/no-array-index-key
                              <tr key={`product-${index}`}>
                                <Td>{product.name}</Td>
                                <Td>{product.order_count}</Td>
                                <Td>{formatCurrency(product.total_revenue)}</Td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </Table>
                    </TableContainer>
                  )}
              </>
            )}
          </>
        )}

        {activeTab === "sales" && (
          <ChartContainer>
            <p>Sales Analytics</p>
            <p>Sales charts and reports would be implemented here</p>
          </ChartContainer>
        )}

        {activeTab === "products" && (
          <ChartContainer>
            <p>Product Analytics</p>
            <p>Product performance charts would be implemented here</p>
          </ChartContainer>
        )}

        {activeTab === "customers" && (
          <ChartContainer>
            <p>Customer Analytics</p>
            <p>Customer behavior charts would be implemented here</p>
          </ChartContainer>
        )}
      </ContentContainer>
    </AnalyticsContainer>
  );
};

export default AdminAnalytics;
