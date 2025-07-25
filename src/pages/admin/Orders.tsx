import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Edit, Package, Clock, CheckCircle, Truck, XCircle, DollarSign, User } from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import { selectLanguage } from '../../features/language/languageSlice';

const OrdersContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;
`;

const OrdersContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const OrdersHeader = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const OrdersTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2F2F2F;
  margin-bottom: 0.5rem;
`;

const OrdersSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
`;

const OrdersActions = styled.div`
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

const OrdersTable = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 1fr 1fr auto;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  color: #495057;

  @media (max-width: 768px) {
    display: none;
  }
`;

const OrderRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 1fr 1fr auto;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  transition: background 0.3s ease;

  &:hover {
    background: #f8f9fa;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
`;

const OrderCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OrderNumber = styled.div`
  font-weight: 600;
  color: #8B4513;
`;

const CustomerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const CustomerName = styled.div`
  font-weight: 500;
  color: #2F2F2F;
`;

const CustomerPhone = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const OrderItems = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const OrderTotal = styled.div`
  font-weight: 600;
  color: #8B4513;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;

  ${props => {
    switch (props.status) {
      case 'pending':
        return `
          background: #fff3cd;
          color: #856404;
        `;
      case 'confirmed':
        return `
          background: #d1ecf1;
          color: #0c5460;
        `;
      case 'preparing':
        return `
          background: #d4edda;
          color: #155724;
        `;
      case 'ready':
        return `
          background: #cce5ff;
          color: #004085;
        `;
      case 'delivering':
        return `
          background: #e2e3e5;
          color: #383d41;
        `;
      case 'delivered':
        return `
          background: #d4edda;
          color: #155724;
        `;
      case 'cancelled':
        return `
          background: #f8d7da;
          color: #721c24;
        `;
      default:
        return `
          background: #e9ecef;
          color: #495057;
        `;
    }
  }}
`;

const OrderActions = styled.div`
  display: flex;
  gap: 0.5rem;
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

const AdminOrders: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const translations = useMemo(() => ({
    he: {
      title: 'ניהול הזמנות',
      subtitle: 'נהל את כל ההזמנות שלך, עדכן סטטוסים ועקוב אחר התקדמות',
      searchPlaceholder: 'חפש הזמנות...',
      filter: 'פילטר',
      orderNumber: 'מספר הזמנה',
      customer: 'לקוח',
      items: 'פריטים',
      total: 'סה"כ',
      status: 'סטטוס',
      date: 'תאריך',
      actions: 'פעולות',
      view: 'צפה',
      edit: 'ערוך',
      pending: 'ממתין',
      confirmed: 'אושר',
      preparing: 'מכין',
      ready: 'מוכן',
      delivering: 'במשלוח',
      delivered: 'נמסר',
      cancelled: 'בוטל',
      noOrders: 'לא נמצאו הזמנות',
      noOrdersDesc: 'אין הזמנות פעילות כרגע',
    },
    en: {
      title: 'Order Management',
      subtitle: 'Manage all your orders, update statuses and track progress',
      searchPlaceholder: 'Search orders...',
      filter: 'Filter',
      orderNumber: 'Order #',
      customer: 'Customer',
      items: 'Items',
      total: 'Total',
      status: 'Status',
      date: 'Date',
      actions: 'Actions',
      view: 'View',
      edit: 'Edit',
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      delivering: 'Delivering',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      noOrders: 'No orders found',
      noOrdersDesc: 'No active orders at the moment',
    }
  }), []);

  const t = translations[language as keyof typeof translations];

  // Mock orders data
  const mockOrders = useMemo(() => [
    {
      id: '1001',
      order_number: '#1001',
      customer_name: 'אברהם כהן',
      customer_name_en: 'Avraham Cohen',
      customer_phone: '+972-50-123-4567',
      items: [
        { name: 'Kubaneh', quantity: 2, price: 25 },
        { name: 'Samneh', quantity: 1, price: 15 }
      ],
      total: 65,
      status: 'pending',
      created_at: '2024-01-15T10:30:00Z',
      delivery_method: 'delivery',
      delivery_address: 'רחוב הרצל 123, תל אביב',
    },
    {
      id: '1002',
      order_number: '#1002',
      customer_name: 'שרה לוי',
      customer_name_en: 'Sara Levi',
      customer_phone: '+972-52-987-6543',
      items: [
        { name: 'Jachnun', quantity: 1, price: 20 },
        { name: 'Malawach', quantity: 3, price: 18 }
      ],
      total: 74,
      status: 'confirmed',
      created_at: '2024-01-15T09:15:00Z',
      delivery_method: 'pickup',
    },
    {
      id: '1003',
      order_number: '#1003',
      customer_name: 'משה דוד',
      customer_name_en: 'Moshe David',
      customer_phone: '+972-54-555-1234',
      items: [
        { name: 'Red Bisbas', quantity: 2, price: 12 },
        { name: 'Hilbeh', quantity: 1, price: 10 }
      ],
      total: 34,
      status: 'preparing',
      created_at: '2024-01-15T08:45:00Z',
      delivery_method: 'delivery',
      delivery_address: 'רחוב ויצמן 456, חיפה',
    },
    {
      id: '1004',
      order_number: '#1004',
      customer_name: 'רחל גולדברג',
      customer_name_en: 'Rachel Goldberg',
      customer_phone: '+972-53-777-8888',
      items: [
        { name: 'Kubaneh', quantity: 1, price: 25 },
        { name: 'Samneh', quantity: 2, price: 15 },
        { name: 'Jachnun', quantity: 1, price: 20 }
      ],
      total: 75,
      status: 'ready',
      created_at: '2024-01-15T07:30:00Z',
      delivery_method: 'pickup',
    },
    {
      id: '1005',
      order_number: '#1005',
      customer_name: 'יוסף שפירא',
      customer_name_en: 'Yosef Shapiro',
      customer_phone: '+972-51-999-0000',
      items: [
        { name: 'Malawach', quantity: 2, price: 18 },
        { name: 'Red Bisbas', quantity: 1, price: 12 }
      ],
      total: 48,
      status: 'delivering',
      created_at: '2024-01-15T06:15:00Z',
      delivery_method: 'delivery',
      delivery_address: 'רחוב בן גוריון 789, ירושלים',
    },
    {
      id: '1006',
      order_number: '#1006',
      customer_name: 'דבורה רוזן',
      customer_name_en: 'Devora Rosen',
      customer_phone: '+972-55-111-2222',
      items: [
        { name: 'Kubaneh', quantity: 1, price: 25 },
        { name: 'Hilbeh', quantity: 1, price: 10 }
      ],
      total: 35,
      status: 'delivered',
      created_at: '2024-01-14T16:00:00Z',
      delivery_method: 'delivery',
      delivery_address: 'רחוב אלנבי 321, תל אביב',
    },
  ], []);

  const statuses = useMemo(() => [
    { id: 'all', name: language === 'he' ? 'כל הסטטוסים' : 'All Statuses' },
    { id: 'pending', name: t.pending },
    { id: 'confirmed', name: t.confirmed },
    { id: 'preparing', name: t.preparing },
    { id: 'ready', name: t.ready },
    { id: 'delivering', name: t.delivering },
    { id: 'delivered', name: t.delivered },
    { id: 'cancelled', name: t.cancelled },
  ], [language, t]);

  const filteredOrders = useMemo(() => {
    let filtered = mockOrders;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(query) ||
        order.customer_name.toLowerCase().includes(query) ||
        (order.customer_name_en && order.customer_name_en.toLowerCase().includes(query)) ||
        order.customer_phone.includes(query)
      );
    }

    return filtered;
  }, [mockOrders, selectedStatus, searchQuery]);

  const getCustomerName = (order: any) => {
    return language === 'he' ? order.customer_name : order.customer_name_en || order.customer_name;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t.pending;
      case 'confirmed': return t.confirmed;
      case 'preparing': return t.preparing;
      case 'ready': return t.ready;
      case 'delivering': return t.delivering;
      case 'delivered': return t.delivered;
      case 'cancelled': return t.cancelled;
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewOrder = (orderId: string) => {
    // TODO: Implement view order functionality
    console.log('View order:', orderId);
  };

  const handleEditOrder = (orderId: string) => {
    // TODO: Implement edit order functionality
    console.log('Edit order:', orderId);
  };

  return (
    <OrdersContainer>
      <OrdersContent>
        <OrdersHeader>
          <OrdersTitle>{t.title}</OrdersTitle>
          <OrdersSubtitle>{t.subtitle}</OrdersSubtitle>
          
          <OrdersActions>
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
          </OrdersActions>
        </OrdersHeader>

        {filteredOrders.length > 0 ? (
          <OrdersTable>
            <TableHeader>
              <div>{t.orderNumber}</div>
              <div>{t.customer}</div>
              <div>{t.items}</div>
              <div>{t.total}</div>
              <div>{t.status}</div>
              <div>{t.date}</div>
              <div>{t.actions}</div>
            </TableHeader>
            
            {filteredOrders.map((order, index) => (
              <OrderRow
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <OrderCell>
                  <OrderNumber>{order.order_number}</OrderNumber>
                </OrderCell>
                
                <OrderCell>
                  <CustomerInfo>
                    <CustomerName>{getCustomerName(order)}</CustomerName>
                    <CustomerPhone>{order.customer_phone}</CustomerPhone>
                  </CustomerInfo>
                </OrderCell>
                
                <OrderCell>
                  <OrderItems>
                    {order.items.length} {language === 'he' ? 'פריטים' : 'items'}
                  </OrderItems>
                </OrderCell>
                
                <OrderCell>
                  <OrderTotal>₪{order.total}</OrderTotal>
                </OrderCell>
                
                <OrderCell>
                  <StatusBadge status={order.status}>
                    {getStatusText(order.status)}
                  </StatusBadge>
                </OrderCell>
                
                <OrderCell>
                  {formatDate(order.created_at)}
                </OrderCell>
                
                <OrderCell>
                  <OrderActions>
                    <ActionButton onClick={() => handleViewOrder(order.id)}>
                      <Eye size={14} />
                      {t.view}
                    </ActionButton>
                    <ActionButton variant="secondary" onClick={() => handleEditOrder(order.id)}>
                      <Edit size={14} />
                      {t.edit}
                    </ActionButton>
                  </OrderActions>
                </OrderCell>
              </OrderRow>
            ))}
          </OrdersTable>
        ) : (
          <EmptyState>
            <h3>{t.noOrders}</h3>
            <p>{t.noOrdersDesc}</p>
          </EmptyState>
        )}
      </OrdersContent>
    </OrdersContainer>
  );
};

export default AdminOrders; 