import React, {
  ReactElement,
  ReactNode,
  useState,
  useEffect,
  useMemo,
} from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Eye,
  Edit,
  User,
  Phone,
  MapPin,
  ShoppingCart,
  DollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { selectLanguage } from '../../features/language/languageSlice';
import {
  fetchCustomers,
  fetchCustomerDetails,
  setSelectedCustomer,
  clearCustomersError,
  setCustomersPagination,
} from '../../features/customers/customersSlice';
import LoadingSpinner from '../../components/LoadingSpinner';

const CustomersContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;
`;

const CustomersContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const CustomersHeader = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const CustomersTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2f2f2f;
  margin-bottom: 0.5rem;
`;

const CustomersSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
`;

const CustomersActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  @media (max-width: 768px) {
    max-width: none;
  }
`;

const SearchField = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #8b4513;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  size: 20px;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #8b4513;
    background: #f8f9fa;
  }
`;

const CustomersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CustomerCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CustomerHeader = styled.div`
  background: linear-gradient(135deg, #8b4513 0%, #d2691e 100%);
  color: white;
  padding: 1.5rem;
  text-align: center;
`;

const CustomerAvatar = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1rem;
`;

const CustomerName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
`;

const CustomerEmail = styled.p`
  opacity: 0.9;
  margin: 0;
  font-size: 0.9rem;
`;

const CustomerInfo = styled.div`
  padding: 1.5rem;
`;

const CustomerDetails = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #eee;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: #666;
`;

const DetailLabel = styled.div`
  font-weight: 600;
  color: #666;
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
  color: #2f2f2f;
`;

const CustomerActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button<{
  variant?: 'primary' | 'secondary';
}>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  flex: 1;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #8B4513;
          color: white;
          &:hover { background: #D2691E; }
        `;
      case 'secondary':
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #5a6268; }
        `;
      default:
        return `
          background: #e9ecef;
          color: #495057;
          &:hover { background: #dee2e6; }
        `;
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const PaginationButton = styled.button<{
  active?: boolean;
  disabled?: boolean;
}>`
  padding: 0.5rem 1rem;
  border: 2px solid ${props => (props.active ? '#8B4513' : '#e0e0e0')};
  background: ${props => (props.active ? '#8B4513' : 'white')};
  color: ${props =>
    props.active ? 'white' : props.disabled ? '#ccc' : '#333'};
  border-radius: 8px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    border-color: #8b4513;
    background: ${props => (props.active ? '#8B4513' : '#f8f9fa')};
  }
`;

const CustomerModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2f2f2f;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;

  &:hover {
    color: #333;
  }
`;

const CustomerDetail = styled.div`
  margin-bottom: 1rem;
`;

const AdminCustomers: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const language = useAppSelector(selectLanguage);
  const customers = useAppSelector((state: any) => state.customers.customers);
  const isLoading = useAppSelector((state: any) => state.customers.isLoading);
  const error = useAppSelector((state: any) => state.customers.error);
  const pagination = useAppSelector((state: any) => state.customers.pagination);
  const selectedCustomer = useAppSelector(
    (state: any) => state.customers.selectedCustomer
  );

  const [searchQuery, setSearchQuery] = useState('');

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // All hooks must be called before any conditional returns
  const translations = useMemo(
    () => ({
      he: {
        title: 'ניהול לקוחות',
        subtitle: 'נהל את הלקוחות שלך ועקוב אחר הפעילות שלהם',
        searchPlaceholder: 'חפש לקוחות...',
        filterAll: 'כל הלקוחות',
        filterActive: 'לקוחות פעילים',
        filterInactive: 'לקוחות לא פעילים',
        noCustomers: 'לא נמצאו לקוחות',
        noCustomersDesc: 'אין לקוחות שתואמים לחיפוש שלך',
        customerDetails: 'פרטי לקוח',
        editCustomer: 'ערוך לקוח',
        name: 'שם',
        email: 'אימייל',
        phone: 'טלפון',
        address: 'כתובת',
        totalOrders: 'סה"כ הזמנות',
        totalSpent: 'סה"כ הוצאות',
        memberSince: 'חבר מאז',
        orders: 'הזמנות',
        previous: 'הקודם',
        next: 'הבא',
        page: 'עמוד',
        of: 'מתוך',
        view: 'צפה',
        edit: 'ערוך',
        filter: 'פילטר',
        lastOrder: 'הזמנה אחרונה',
        close: 'סגור',
        notes: 'הערות',
        save: 'שמור',
        cancel: 'ביטול',
      },
      en: {
        title: 'Customer Management',
        subtitle: 'Manage your customers and track their activity',
        searchPlaceholder: 'Search customers...',
        filterAll: 'All Customers',
        filterActive: 'Active Customers',
        filterInactive: 'Inactive Customers',
        noCustomers: 'No customers found',
        noCustomersDesc: 'No customers match your search',
        customerDetails: 'Customer Details',
        editCustomer: 'Edit Customer',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        totalOrders: 'Total Orders',
        totalSpent: 'Total Spent',
        memberSince: 'Member Since',
        orders: 'Orders',
        previous: 'Previous',
        next: 'Next',
        page: 'Page',
        of: 'of',
        view: 'View',
        edit: 'Edit',
        filter: 'Filter',
        lastOrder: 'Last Order',
        close: 'Close',
        notes: 'Notes',
        save: 'Save',
        cancel: 'Cancel',
      },
    }),
    []
  );

  const t = useMemo(
    () => translations[language as keyof typeof translations],
    [translations, language]
  );

  // Check authentication and load customers
  useEffect(() => {
    const checkAuthAndLoadCustomers = async () => {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);

      try {
        await dispatch(fetchCustomers({ page: 1, limit: 20 })).unwrap();
      } catch (err: unknown) {
        if ((err as any).response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
        // Error will be handled by the Redux slice
      }
    };

    checkAuthAndLoadCustomers();
  }, [dispatch]);

  // Load customers when pagination changes
  useEffect(() => {
    if (isAuthenticated && pagination.page > 1) {
      dispatch(
        fetchCustomers({
          search: searchQuery,
          page: pagination.page,
          limit: pagination.limit,
        })
      );
    }
  }, [
    pagination.page,
    pagination.limit,
    dispatch,
    isAuthenticated,
    searchQuery,
  ]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearCustomersError());
    };
  }, [dispatch]);

  /*
  const handleSearch = async () => {
    if (!isAuthenticated) return;
    
    try {
      await dispatch(fetchCustomers({ 
        search: searchQuery, 
        page: 1, 
        limit: pagination.limit 
      })).unwrap();
    } catch (err) {
      // Error handled by Redux slice
    }
  };
  */

  const handleViewCustomer = async (customerId: string) => {
    if (!isAuthenticated) return;

    try {
      await dispatch(fetchCustomerDetails(customerId)).unwrap();
    } catch (err) {
      // Error handled by Redux slice
    }
  };

  const handleEditCustomer = async (_customerId: string) => {
    if (!isAuthenticated) return;

    // TODO: Navigate to edit page or open edit modal
  };

  const handlePageChange = (newPage: number) => {
    if (!isAuthenticated) return;

    dispatch(
      setCustomersPagination({ page: newPage, limit: pagination.limit })
    );
    dispatch(
      fetchCustomers({
        search: searchQuery,
        page: newPage,
        limit: pagination.limit,
      })
    );
  };

  const handleLogin = () => {
    navigate('/login', { state: { from: { pathname: '/customers' } } });
  };

  const getCustomerName = (customer: unknown) => {
    return language === 'he' && (customer as any).name_he
      ? (customer as any).name_he
      : (customer as any).name;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'he' ? 'he-IL' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: 'ILS',
    }).format(amount);
  };

  // Show authentication required screen
  if (!isAuthenticated) {
    return (
      <div
        style={{
          padding: '2rem',
          background: '#f8f9fa',
          minHeight: '100vh',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h1 style={{ color: '#8B4513', marginBottom: '1rem' }}>
          Customers Management
        </h1>
        <div
          style={{
            background: '#fee',
            color: '#c33',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            maxWidth: '500px',
          }}
        >
          <strong>Authentication Required</strong>
          <p style={{ margin: '1rem 0' }}>
            Please login to access customer management.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleLogin}
              style={{
                background: '#8B4513',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Login to Access Customers
            </button>
            {process.env['NODE_ENV'] === 'development' && (
              <button
                onClick={() => {
                  setIsAuthenticated(true);
                }}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
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

  if (isLoading && customers.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <CustomersContainer>
      <CustomersContent>
        <CustomersHeader>
          <CustomersTitle>{t.title}</CustomersTitle>
          <CustomersSubtitle>{t.subtitle}</CustomersSubtitle>

          <CustomersActions>
            <SearchInput>
              <SearchIcon size={20} />
              <SearchField
                type='text'
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </SearchInput>

            <FilterButton>
              <Filter size={16} />
              {t.filter}
            </FilterButton>
          </CustomersActions>
        </CustomersHeader>

        {error && (
          <div
            style={{
              background: '#fee',
              color: '#c33',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        {customers.length > 0 ? (
          <>
            <CustomersGrid>
              {customers.map((customer: unknown) => (
                <CustomerCard key={(customer as any).id}>
                  <CustomerHeader>
                    <CustomerAvatar>
                      {(customer as any).avatar ||
                        (customer as any).name.charAt(0)}
                    </CustomerAvatar>
                    <CustomerInfo>
                      <CustomerName>{getCustomerName(customer)}</CustomerName>
                      <CustomerEmail>{(customer as any).email}</CustomerEmail>
                    </CustomerInfo>
                    <CustomerActions>
                      <ActionButton
                        onClick={() => handleViewCustomer((customer as any).id)}
                      >
                        <Eye size={16} />
                        {t.view}
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleEditCustomer((customer as any).id)}
                      >
                        <Edit size={16} />
                        {t.edit}
                      </ActionButton>
                    </CustomerActions>
                  </CustomerHeader>

                  <CustomerDetails>
                    <DetailItem>
                      <Phone size={16} />
                      <span>{(customer as any).phone}</span>
                    </DetailItem>
                    {(customer as any).address && (
                      <DetailItem>
                        <MapPin size={16} />
                        <span>{(customer as any).address}</span>
                      </DetailItem>
                    )}
                    <DetailItem>
                      <ShoppingCart size={16} />
                      <span>
                        {t.totalOrders}: {(customer as any).total_orders}
                      </span>
                    </DetailItem>
                    <DetailItem>
                      <DollarSign size={16} />
                      <span>
                        {t.totalSpent}:{' '}
                        {formatCurrency((customer as any).total_spent)}
                      </span>
                    </DetailItem>
                    {(customer as any).last_order_date && (
                      <DetailItem>
                        <Calendar size={16} />
                        <span>
                          {t.lastOrder}:{' '}
                          {formatDate((customer as any).last_order_date)}
                        </span>
                      </DetailItem>
                    )}
                    <DetailItem>
                      <User size={16} />
                      <span>
                        {t.memberSince}:{' '}
                        {formatDate((customer as any).member_since)}
                      </span>
                    </DetailItem>
                  </CustomerDetails>
                </CustomerCard>
              ))}
            </CustomersGrid>

            {pagination.pages > 1 && (
              <PaginationContainer>
                <PaginationButton
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft size={16} />
                  {t.previous}
                </PaginationButton>

                <span>
                  {t.page} {pagination.page} {t.of} {pagination.pages}
                </span>

                <PaginationButton
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  {t.next}
                  <ChevronRight size={16} />
                </PaginationButton>
              </PaginationContainer>
            )}
          </>
        ) : (
          <EmptyState>
            <h3>{t.noCustomers}</h3>
            <p>{t.noCustomersDesc}</p>
          </EmptyState>
        )}
      </CustomersContent>

      {/* Customer Modal */}
      {selectedCustomer && (
        <CustomerModal onClick={() => dispatch(setSelectedCustomer(null))}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{t.customerDetails}</ModalTitle>
              <CloseButton onClick={() => dispatch(setSelectedCustomer(null))}>
                ×
              </CloseButton>
            </ModalHeader>

            <CustomerDetail>
              <DetailLabel>Name</DetailLabel>
              <DetailValue>{getCustomerName(selectedCustomer)}</DetailValue>
            </CustomerDetail>

            <CustomerDetail>
              <DetailLabel>Email</DetailLabel>
              <DetailValue>{selectedCustomer.email}</DetailValue>
            </CustomerDetail>

            <CustomerDetail>
              <DetailLabel>{t.phone}</DetailLabel>
              <DetailValue>{selectedCustomer.phone}</DetailValue>
            </CustomerDetail>

            {selectedCustomer.address && (
              <CustomerDetail>
                <DetailLabel>{t.address}</DetailLabel>
                <DetailValue>{selectedCustomer.address}</DetailValue>
              </CustomerDetail>
            )}

            <CustomerDetail>
              <DetailLabel>{t.totalOrders}</DetailLabel>
              <DetailValue>{selectedCustomer.total_orders}</DetailValue>
            </CustomerDetail>

            <CustomerDetail>
              <DetailLabel>{t.totalSpent}</DetailLabel>
              <DetailValue>
                {formatCurrency(selectedCustomer.total_spent)}
              </DetailValue>
            </CustomerDetail>

            <CustomerDetail>
              <DetailLabel>{t.memberSince}</DetailLabel>
              <DetailValue>
                {formatDate(selectedCustomer.member_since)}
              </DetailValue>
            </CustomerDetail>

            {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
              <CustomerDetail>
                <DetailLabel>{t.orders}</DetailLabel>
                <DetailValue>
                  {selectedCustomer.orders.map((order: unknown) => (
                    <div key={(order as any).id}>
                      Order #{(order as any).order_number} -{' '}
                      {formatCurrency((order as any).total)} -{' '}
                      {(order as any).status}
                    </div>
                  ))}
                </DetailValue>
              </CustomerDetail>
            )}
          </ModalContent>
        </CustomerModal>
      )}
    </CustomersContainer>
  );
};

export default AdminCustomers;
