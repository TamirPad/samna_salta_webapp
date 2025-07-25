import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Edit, User, Mail, Phone, MapPin, ShoppingCart, DollarSign, Calendar } from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import { selectLanguage } from '../../features/language/languageSlice';

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
  color: #2F2F2F;
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
    border-color: #8B4513;
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
    border-color: #8B4513;
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
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
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

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: #666;
`;

const InfoIcon = styled.div`
  color: #8B4513;
  display: flex;
  align-items: center;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: #999;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-weight: 500;
  color: #2F2F2F;
`;

const CustomerStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #8B4513;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const CustomerActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
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

const AdminCustomers: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const [searchQuery, setSearchQuery] = useState('');

  const translations = useMemo(() => ({
    he: {
      title: 'ניהול לקוחות',
      subtitle: 'נהל את הלקוחות שלך, צפה בהיסטוריית הזמנות ופרטי קשר',
      searchPlaceholder: 'חפש לקוחות...',
      filter: 'פילטר',
      view: 'צפה',
      edit: 'ערוך',
      phone: 'טלפון',
      address: 'כתובת',
      totalOrders: 'סה"כ הזמנות',
      totalSpent: 'סה"כ הוצאות',
      lastOrder: 'הזמנה אחרונה',
      memberSince: 'חבר מאז',
      noCustomers: 'לא נמצאו לקוחות',
      noCustomersDesc: 'אין לקוחות רשומים כרגע',
    },
    en: {
      title: 'Customer Management',
      subtitle: 'Manage your customers, view order history and contact details',
      searchPlaceholder: 'Search customers...',
      filter: 'Filter',
      view: 'View',
      edit: 'Edit',
      phone: 'Phone',
      address: 'Address',
      totalOrders: 'Total Orders',
      totalSpent: 'Total Spent',
      lastOrder: 'Last Order',
      memberSince: 'Member Since',
      noCustomers: 'No customers found',
      noCustomersDesc: 'No customers registered at the moment',
    }
  }), []);

  const t = translations[language as keyof typeof translations];

  // Mock customers data
  const mockCustomers = useMemo(() => [
    {
      id: '1',
      name: 'אברהם כהן',
      name_en: 'Avraham Cohen',
      email: 'avraham.cohen@email.com',
      phone: '+972-50-123-4567',
      address: 'רחוב הרצל 123, תל אביב',
      total_orders: 15,
      total_spent: 1250,
      last_order: '2024-01-15T10:30:00Z',
      member_since: '2023-03-15T00:00:00Z',
      avatar: 'א',
    },
    {
      id: '2',
      name: 'שרה לוי',
      name_en: 'Sara Levi',
      email: 'sara.levi@email.com',
      phone: '+972-52-987-6543',
      address: 'רחוב ויצמן 456, חיפה',
      total_orders: 8,
      total_spent: 680,
      last_order: '2024-01-15T09:15:00Z',
      member_since: '2023-06-20T00:00:00Z',
      avatar: 'ש',
    },
    {
      id: '3',
      name: 'משה דוד',
      name_en: 'Moshe David',
      email: 'moshe.david@email.com',
      phone: '+972-54-555-1234',
      address: 'רחוב בן גוריון 789, ירושלים',
      total_orders: 22,
      total_spent: 1890,
      last_order: '2024-01-15T08:45:00Z',
      member_since: '2022-11-10T00:00:00Z',
      avatar: 'מ',
    },
    {
      id: '4',
      name: 'רחל גולדברג',
      name_en: 'Rachel Goldberg',
      email: 'rachel.goldberg@email.com',
      phone: '+972-53-777-8888',
      address: 'רחוב אלנבי 321, תל אביב',
      total_orders: 12,
      total_spent: 950,
      last_order: '2024-01-15T07:30:00Z',
      member_since: '2023-08-05T00:00:00Z',
      avatar: 'ר',
    },
    {
      id: '5',
      name: 'יוסף שפירא',
      name_en: 'Yosef Shapiro',
      email: 'yosef.shapiro@email.com',
      phone: '+972-51-999-0000',
      address: 'רחוב רוטשילד 654, תל אביב',
      total_orders: 5,
      total_spent: 320,
      last_order: '2024-01-15T06:15:00Z',
      member_since: '2023-12-01T00:00:00Z',
      avatar: 'י',
    },
    {
      id: '6',
      name: 'דבורה רוזן',
      name_en: 'Devora Rosen',
      email: 'devora.rosen@email.com',
      phone: '+972-55-111-2222',
      address: 'רחוב דיזנגוף 987, תל אביב',
      total_orders: 18,
      total_spent: 1450,
      last_order: '2024-01-14T16:00:00Z',
      member_since: '2023-01-15T00:00:00Z',
      avatar: 'ד',
    },
  ], []);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return mockCustomers;

    const query = searchQuery.toLowerCase();
    return mockCustomers.filter(customer => 
      customer.name.toLowerCase().includes(query) ||
      (customer.name_en && customer.name_en.toLowerCase().includes(query)) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone.includes(query)
    );
  }, [mockCustomers, searchQuery]);

  const getCustomerName = (customer: any) => {
    return language === 'he' ? customer.name : customer.name_en || customer.name;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `₪${amount.toLocaleString()}`;
  };

  const handleViewCustomer = (customerId: string) => {
    // TODO: Implement view customer functionality
    console.log('View customer:', customerId);
  };

  const handleEditCustomer = (customerId: string) => {
    // TODO: Implement edit customer functionality
    console.log('Edit customer:', customerId);
  };

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
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchInput>
            
            <FilterButton>
              <Filter size={16} />
              {t.filter}
            </FilterButton>
          </CustomersActions>
        </CustomersHeader>

        {filteredCustomers.length > 0 ? (
          <CustomersGrid>
            {filteredCustomers.map((customer, index) => (
              <CustomerCard
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <CustomerHeader>
                  <CustomerAvatar>{customer.avatar}</CustomerAvatar>
                  <CustomerName>{getCustomerName(customer)}</CustomerName>
                  <CustomerEmail>{customer.email}</CustomerEmail>
                </CustomerHeader>
                
                <CustomerInfo>
                  <InfoItem>
                    <InfoIcon>
                      <Phone size={16} />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>{t.phone}</InfoLabel>
                      <InfoValue>{customer.phone}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIcon>
                      <MapPin size={16} />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>{t.address}</InfoLabel>
                      <InfoValue>{customer.address}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                  
                  <CustomerStats>
                    <StatItem>
                      <StatValue>{customer.total_orders}</StatValue>
                      <StatLabel>{t.totalOrders}</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue>{formatCurrency(customer.total_spent)}</StatValue>
                      <StatLabel>{t.totalSpent}</StatLabel>
                    </StatItem>
                  </CustomerStats>
                  
                  <InfoItem>
                    <InfoIcon>
                      <Calendar size={16} />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>{t.lastOrder}</InfoLabel>
                      <InfoValue>{formatDate(customer.last_order)}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIcon>
                      <User size={16} />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>{t.memberSince}</InfoLabel>
                      <InfoValue>{formatDate(customer.member_since)}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                  
                  <CustomerActions>
                    <ActionButton onClick={() => handleViewCustomer(customer.id)}>
                      <Eye size={14} />
                      {t.view}
                    </ActionButton>
                    <ActionButton variant="secondary" onClick={() => handleEditCustomer(customer.id)}>
                      <Edit size={14} />
                      {t.edit}
                    </ActionButton>
                  </CustomerActions>
                </CustomerInfo>
              </CustomerCard>
            ))}
          </CustomersGrid>
        ) : (
          <EmptyState>
            <h3>{t.noCustomers}</h3>
            <p>{t.noCustomersDesc}</p>
          </EmptyState>
        )}
      </CustomersContent>
    </CustomersContainer>
  );
};

export default AdminCustomers; 