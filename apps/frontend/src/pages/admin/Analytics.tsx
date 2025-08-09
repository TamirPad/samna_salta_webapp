import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux";
import { selectAuth } from "../../features/auth/authSlice";
import { selectLanguage } from "../../features/language/languageSlice";
import { apiService } from "../../utils/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

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
  background: ${(props) => (props.$active ? props.theme.colors.primary : "transparent")};
  color: ${(props) => (props.$active ? "white" : props.theme.colors.primary)};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  padding: 0.625rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  min-height: 44px;

  &:hover {
    background: ${(props) => (props.$active ? props.theme.colors.primary : "#f8f9fa")};
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

const ControlsRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 1rem;
`;

const SmallButton = styled.button<{ $active?: boolean }>`
  padding: 0.4rem 0.7rem;
  border-radius: 6px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : '#e1e5e9')};
  background: ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.08)' : 'white')};
  color: #333;
  cursor: pointer;
  font-size: 0.85rem;
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
  border-inline-start: 4px solid ${({ theme }) => theme.colors.primary};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
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
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.3s ease;
  min-height: 44px;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
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
  const language = useAppSelector(selectLanguage);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "sales" | "products" | "customers"
  >("dashboard");
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [customerSummary, setCustomerSummary] = useState<any | null>(null);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);

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
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [rangeDays, setRangeDays] = useState<number>(30);

  // Local translations
  const translations = useMemo(
    () => ({
      he: {
        title: "דשבורד ניתוחים",
        unauthPrompt: "אנא התחבר כדי לגשת לניתוחים.",
        unauthCta: "התחבר כדי לגשת לניתוחים",
        tabs: { dashboard: "דשבורד", sales: "מכירות", products: "מוצרים", customers: "לקוחות" },
        autoRefresh: "רענון אוטומטי (דקה)",
        stats: {
          todaysOrders: "הזמנות היום",
          todaysRevenue: "הכנסות היום",
          totalCustomers: "סה\"כ לקוחות",
          pendingOrders: "הזמנות ממתינות",
        },
        charts: {
          revenue: "הכנסות",
          orders: "הזמנות",
          aov: "שווי הזמנה ממוצע",
          range: "טווח:",
          topByRevenue: "המובילים לפי הכנסות",
        },
        tables: {
          topSellingProducts: "המוצרים הנמכרים ביותר",
          product: "מוצר",
          orders: "הזמנות",
          revenue: "הכנסות",
          topCustomers: "לקוחות מובילים",
          name: "שם",
          email: "אימייל",
          newThisPeriod: "חדשים בתקופה",
        },
      },
      en: {
        title: "Analytics Dashboard",
        unauthPrompt: "Please login to access analytics.",
        unauthCta: "Login to Access Analytics",
        tabs: { dashboard: "Dashboard", sales: "Sales", products: "Products", customers: "Customers" },
        autoRefresh: "Auto-refresh (1m)",
        stats: {
          todaysOrders: "Today's Orders",
          todaysRevenue: "Today's Revenue",
          totalCustomers: "Total Customers",
          pendingOrders: "Pending Orders",
        },
        charts: {
          revenue: "Revenue",
          orders: "Orders",
          aov: "Avg Order Value",
          range: "Range:",
          topByRevenue: "Top by revenue",
        },
        tables: {
          topSellingProducts: "Top Selling Products",
          product: "Product",
          orders: "Orders",
          revenue: "Revenue",
          topCustomers: "Top Customers",
          name: "Name",
          email: "Email",
          newThisPeriod: "New This Period",
        },
      },
    }),
    [],
  );

  const t = useMemo(
    () => translations[language as keyof typeof translations],
    [translations, language],
  );

  const revenueSeries = useMemo(() => {
    const items = Array.isArray(dashboardData?.revenue_by_day) ? dashboardData.revenue_by_day : [];
    return items.map((d: any) => ({
      date: typeof d.date === 'string' ? d.date.slice(0, 10) : new Date(d.date).toISOString().slice(0, 10),
      revenue: Number(d.revenue || d.total || 0),
      orders: Number(d.orders || 0),
    }));
  }, [dashboardData]);

  const statusSeries = useMemo(() => {
    const items = Array.isArray(dashboardData?.orders_by_status) ? dashboardData.orders_by_status : [];
    return items.map((s: any) => ({ status: s.status, count: Number(s.count || 0) }));
  }, [dashboardData]);

  // Sales tab state
  const [salesSeries, setSalesSeries] = useState<Array<{ period: string; revenue: number; orders: number; aov: number }>>([]);
  // Products tab state
  const [productSeries, setProductSeries] = useState<Array<{ name: string; total_revenue: number; order_count: number; total_quantity: number }>>([]);

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
    // Auto-refresh
    let interval: number | undefined;
    if (isAuthenticated && autoRefresh) {
      interval = window.setInterval(() => {
        loadDashboardData();
      }, 60000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isAuthenticated, autoRefresh]);

  useEffect(() => {
    const loadCustomerAnalytics = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCustomerAnalytics();
        const payload = (response as any)?.data?.data || (response as any)?.data;
        if (payload) {
          setCustomerSummary(payload.summary || null);
          setTopCustomers(payload.top_customers || []);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load customer analytics', e);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated && activeTab === 'customers') {
      loadCustomerAnalytics();
    }
  }, [isAuthenticated, activeTab]);

  // Load Sales analytics on tab open
  useEffect(() => {
    const loadSales = async () => {
      try {
        setLoading(true);
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - (rangeDays - 1));
        const resp = await apiService.getSalesReport({
          start_date: start.toISOString().slice(0, 10),
          end_date: end.toISOString().slice(0, 10),
          group_by: 'day',
        });
        const payload = (resp as any)?.data?.data || (resp as any)?.data;
        const items: any[] = payload?.sales || [];
        setSalesSeries(items.map((it: any) => ({
          period: String(it.period),
          revenue: Number(it.revenue || 0),
          orders: Number(it.orders || 0),
          aov: Number(it.avg_order_value || 0),
        })));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load sales analytics', e);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated && activeTab === 'sales') {
      loadSales();
    }
  }, [isAuthenticated, activeTab, rangeDays]);

  // Load Product analytics on tab open
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - (rangeDays - 1));
        const resp = await apiService.getProductAnalytics({
          start_date: start.toISOString().slice(0, 10),
          end_date: end.toISOString().slice(0, 10),
        });
        const payload = (resp as any)?.data?.data || (resp as any)?.data;
        const items: any[] = payload?.products || [];
        const normalized = items.map((p: any) => ({
          name: p.name || p.name_en || p.name_he,
          total_revenue: Number(p.total_revenue || 0),
          order_count: Number(p.order_count || 0),
          total_quantity: Number(p.total_quantity || 0),
        }));
        setProductSeries(normalized.sort((a: any, b: any) => b.total_revenue - a.total_revenue).slice(0, 10));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load product analytics', e);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated && activeTab === 'products') {
      loadProducts();
    }
  }, [isAuthenticated, activeTab, rangeDays]);

  const handleTabChange = (
    tab: "dashboard" | "sales" | "products" | "customers",
  ) => {
    setActiveTab(tab);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(language === "he" ? "he-IL" : "en-US", {
      style: "currency",
      currency: "ILS",
    }).format(amount);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(language === "he" ? "he-IL" : "en-US");
  };

  if (!isAuthenticated) {
    return (
      <AuthContainer>
        <Title>{t.title}</Title>
        <p style={{ margin: "1rem 0" }}>{t.unauthPrompt}</p>
        <ButtonGroup>
          <AuthButton onClick={() => navigate("/login")}>{t.unauthCta}</AuthButton>
        </ButtonGroup>
      </AuthContainer>
    );
  }

  return (
    <AnalyticsContainer>
      <Header>
        <Title>{t.title}</Title>
      </Header>

      <TabContainer>
        <Tab
          $active={activeTab === "dashboard"}
          onClick={() => handleTabChange("dashboard")}
        >
          {t.tabs.dashboard}
        </Tab>
        <Tab
          $active={activeTab === "sales"}
          onClick={() => handleTabChange("sales")}
        >
          {t.tabs.sales}
        </Tab>
        <Tab
          $active={activeTab === "products"}
          onClick={() => handleTabChange("products")}
        >
          {t.tabs.products}
        </Tab>
        <Tab
          $active={activeTab === "customers"}
          onClick={() => handleTabChange("customers")}
        >
          {t.tabs.customers}
        </Tab>
      </TabContainer>

      <ContentContainer>
        {activeTab === "dashboard" && (
          <>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <ControlsRow>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#666', fontSize: 13 }}>
                    <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
                    {t.autoRefresh}
                  </label>
                </ControlsRow>
                <StatsGrid>
                  <StatCard>
                    <StatValue>{dashboardData?.today?.orders || dashboardData?.today?.count || 0}</StatValue>
                    <StatLabel>{t.stats.todaysOrders}</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>
                      {formatCurrency(dashboardData?.today?.revenue || 0)}
                    </StatValue>
                    <StatLabel>{t.stats.todaysRevenue}</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>{dashboardData?.customers || dashboardData?.total_customers || 0}</StatValue>
                    <StatLabel>{t.stats.totalCustomers}</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>{dashboardData?.pendingOrders || dashboardData?.pending_orders || 0}</StatValue>
                    <StatLabel>{t.stats.pendingOrders}</StatLabel>
                  </StatCard>
                </StatsGrid>

                <ChartContainer>
                  <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer>
                      <LineChart data={revenueSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} dot={false} name={t.charts.revenue} />
                        <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#28a745" strokeWidth={2} dot={false} name={t.charts.orders} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartContainer>

                <ChartContainer>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={statusSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#2563EB" name={t.charts.orders} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartContainer>

                {dashboardData?.top_products &&
                  dashboardData.top_products.length > 0 && (
                    <TableContainer>
                      <h3>{t.tables.topSellingProducts}</h3>
                      <Table>
                        <thead>
                          <tr>
                            <Th>{t.tables.product}</Th>
                            <Th>{t.tables.orders}</Th>
                            <Th>{t.tables.revenue}</Th>
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
                                <Td>{formatCurrency(Number(product.total_revenue || 0))}</Td>
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
          <>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <ControlsRow>
                  <span style={{ color: '#666', fontSize: 13 }}>{t.charts.range}</span>
                  <SmallButton $active={rangeDays === 7} onClick={() => setRangeDays(7)}>7d</SmallButton>
                  <SmallButton $active={rangeDays === 30} onClick={() => setRangeDays(30)}>30d</SmallButton>
                  <SmallButton $active={rangeDays === 90} onClick={() => setRangeDays(90)}>90d</SmallButton>
                </ControlsRow>
                <ChartContainer>
                  <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer>
                      <LineChart data={salesSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} dot={false} name={t.charts.revenue} />
                        <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#28a745" strokeWidth={2} dot={false} name={t.charts.orders} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartContainer>
                <ChartContainer>
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer>
                      <BarChart data={salesSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="aov" fill="#ff7f50" name={t.charts.aov} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartContainer>
              </>
            )}
          </>
        )}

        {activeTab === "products" && (
          <>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <ControlsRow>
                  <span style={{ color: '#666', fontSize: 13 }}>{t.charts.topByRevenue}</span>
                </ControlsRow>
                <ChartContainer>
                  <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer>
                      <BarChart data={productSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: any) => formatCurrency(Number(v) || 0)} />
                        <Legend />
                        <Bar dataKey="total_revenue" fill="#3B82F6" name={t.charts.revenue} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartContainer>
                <ChartContainer>
                  <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Tooltip formatter={(v: any) => formatCurrency(Number(v) || 0)} />
                        <Legend />
                        <Pie data={productSeries.map((p) => ({ name: p.name, value: p.total_revenue }))} dataKey="value" nameKey="name" outerRadius={110} innerRadius={60} label>
                            {productSeries.map((_, idx) => (
                            <Cell key={`pp-cell-${idx}`} fill={["#3B82F6","#10B981","#EF4444","#F59E0B","#6366F1","#22C55E","#0EA5E9","#ff7f50"][idx % 8]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartContainer>
              </>
            )}
          </>
        )}

        {activeTab === "customers" && (
          <>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <StatsGrid>
                  <StatCard>
                    <StatValue>{customerSummary?.total_customers || 0}</StatValue>
                    <StatLabel>{t.stats.totalCustomers}</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>{customerSummary?.new_customers || 0}</StatValue>
                    <StatLabel>{t.tables.newThisPeriod}</StatLabel>
                  </StatCard>
                </StatsGrid>
                {topCustomers && topCustomers.length > 0 && (
                  <TableContainer>
                    <h3>{t.tables.topCustomers}</h3>
                    <Table>
                      <thead>
                        <tr>
                          <Th>{t.tables.name}</Th>
                          <Th>{t.tables.email}</Th>
                          <Th>{t.tables.orders}</Th>
                          <Th>{t.tables.revenue}</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCustomers.map((c: any) => (
                          <tr key={c.id}>
                            <Td>{c.name}</Td>
                            <Td>{c.email}</Td>
                            <Td>{c.orders}</Td>
                            <Td>{formatCurrency(c.revenue || 0)}</Td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </>
        )}
      </ContentContainer>
    </AnalyticsContainer>
  );
};

export default AdminAnalytics;
