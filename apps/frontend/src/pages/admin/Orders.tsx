import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/redux';
import { selectLanguage } from '../../features/language/languageSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import styled from 'styled-components';

interface Order {
  id: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveryAddress?: string;
  phone?: string;
}

const OrdersContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const OrdersHeader = styled.div`
  margin-bottom: 2rem;
`;

const OrdersTitle = styled.h1`
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const OrdersSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: 2px solid ${({ active }) => active ? '#8B4513' : '#ddd'};
  background: ${({ active }) => active ? '#8B4513' : 'white'};
  color: ${({ active }) => active ? 'white' : '#666'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  
  &:hover {
    border-color: #8B4513;
    background: ${({ active }) => active ? '#A0522D' : '#f8f9fa'};
  }
`;

const OrdersGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const OrderHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const OrderInfo = styled.div`
  flex: 1;
`;

const OrderId = styled.h3`
  color: #2c3e50;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const OrderCustomer = styled.p`
  color: #666;
  margin-bottom: 0.25rem;
`;

const OrderDate = styled.p`
  color: #999;
  font-size: 0.9rem;
`;

const OrderStatus = styled.span<{ status: string }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${({ status }) => {
    switch (status) {
      case 'pending':
        return 'background: #fff3cd; color: #856404;';
      case 'confirmed':
        return 'background: #d1ecf1; color: #0c5460;';
      case 'preparing':
        return 'background: #d4edda; color: #155724;';
      case 'ready':
        return 'background: #cce5ff; color: #004085;';
      case 'delivered':
        return 'background: #d4edda; color: #155724;';
      case 'cancelled':
        return 'background: #f8d7da; color: #721c24;';
      default:
        return 'background: #f8f9fa; color: #6c757d;';
    }
  }}
`;

const OrderBody = styled.div`
  padding: 1.5rem;
`;

const OrderItems = styled.div`
  margin-bottom: 1rem;
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.span`
  font-weight: 500;
  color: #2c3e50;
`;

const ItemQuantity = styled.span`
  color: #666;
  margin-left: 0.5rem;
`;

const ItemPrice = styled.span`
  font-weight: 600;
  color: #8B4513;
`;

const OrderTotal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 2px solid #eee;
  font-weight: 600;
  font-size: 1.1rem;
`;

const TotalLabel = styled.span`
  color: #2c3e50;
`;

const TotalAmount = styled.span`
  color: #8B4513;
  font-size: 1.2rem;
`;

const OrderActions = styled.div`
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background: #8B4513;
          color: white;
          &:hover { background: #A0522D; }
        `;
      case 'secondary':
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #5a6268; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
      default:
        return '';
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const Orders: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockOrders: Order[] = [
          {
            id: 'ORD-001',
            customerName: 'John Doe',
            items: [
              { name: 'Kubaneh', quantity: 2, price: 25 },
              { name: 'Samneh', quantity: 1, price: 15 }
            ],
            total: 65,
            status: 'pending',
            createdAt: '2024-01-15T10:30:00Z',
            deliveryAddress: '123 Main St, Tel Aviv',
            phone: '+972-50-123-4567'
          },
          {
            id: 'ORD-002',
            customerName: 'Sarah Smith',
            items: [
              { name: 'Red Bisbas', quantity: 1, price: 12 },
              { name: 'Hilbeh', quantity: 2, price: 10 }
            ],
            total: 32,
            status: 'confirmed',
            createdAt: '2024-01-15T09:15:00Z',
            deliveryAddress: '456 Oak Ave, Tel Aviv',
            phone: '+972-50-987-6543'
          },
          {
            id: 'ORD-003',
            customerName: 'Mike Johnson',
            items: [
              { name: 'Kubaneh', quantity: 1, price: 25 },
              { name: 'Samneh', quantity: 1, price: 15 },
              { name: 'Red Bisbas', quantity: 1, price: 12 }
            ],
            total: 52,
            status: 'delivered',
            createdAt: '2024-01-14T16:45:00Z',
            deliveryAddress: '789 Pine Rd, Tel Aviv',
            phone: '+972-50-555-1234'
          }
        ];
        
        setOrders(mockOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const getContent = () => {
    if (language === 'he') {
      return {
        title: 'הזמנות',
        subtitle: 'ניהול הזמנות לקוחות',
        filters: {
          all: 'הכל',
          pending: 'ממתין',
          confirmed: 'אושר',
          preparing: 'בהכנה',
          ready: 'מוכן',
          delivered: 'נמסר',
          cancelled: 'בוטל'
        },
        status: {
          pending: 'ממתין',
          confirmed: 'אושר',
          preparing: 'בהכנה',
          ready: 'מוכן',
          delivered: 'נמסר',
          cancelled: 'בוטל'
        },
        actions: {
          confirm: 'אשר',
          prepare: 'הכן',
          ready: 'מוכן',
          deliver: 'מסור',
          cancel: 'בטל'
        },
        empty: 'אין הזמנות להצגה',
        total: 'סה"כ'
      };
    } else {
      return {
        title: 'Orders',
        subtitle: 'Manage customer orders',
        filters: {
          all: 'All',
          pending: 'Pending',
          confirmed: 'Confirmed',
          preparing: 'Preparing',
          ready: 'Ready',
          delivered: 'Delivered',
          cancelled: 'Cancelled'
        },
        status: {
          pending: 'Pending',
          confirmed: 'Confirmed',
          preparing: 'Preparing',
          ready: 'Ready',
          delivered: 'Delivered',
          cancelled: 'Cancelled'
        },
        actions: {
          confirm: 'Confirm',
          prepare: 'Prepare',
          ready: 'Ready',
          deliver: 'Deliver',
          cancel: 'Cancel'
        },
        empty: 'No orders to display',
        total: 'Total'
      };
    }
  };

  const content = getContent();

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  if (loading) {
    return <LoadingSpinner text={language === 'he' ? 'טוען הזמנות...' : 'Loading orders...'} />;
  }

  return (
    <OrdersContainer>
      <OrdersHeader>
        <OrdersTitle>{content.title}</OrdersTitle>
        <OrdersSubtitle>{content.subtitle}</OrdersSubtitle>
      </OrdersHeader>

      <FiltersContainer>
        {Object.entries(content.filters).map(([key, label]) => (
          <FilterButton
            key={key}
            active={filter === key}
            onClick={() => setFilter(key)}
          >
            {label}
          </FilterButton>
        ))}
      </FiltersContainer>

      {filteredOrders.length === 0 ? (
        <EmptyState>
          <EmptyIcon>📦</EmptyIcon>
          <p>{content.empty}</p>
        </EmptyState>
      ) : (
        <OrdersGrid>
          {filteredOrders.map((order) => (
            <OrderCard key={order.id}>
              <OrderHeader>
                <OrderInfo>
                  <OrderId>{order.id}</OrderId>
                  <OrderCustomer>{order.customerName}</OrderCustomer>
                  <OrderDate>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </OrderDate>
                </OrderInfo>
                <OrderStatus status={order.status}>
                  {content.status[order.status]}
                </OrderStatus>
              </OrderHeader>

              <OrderBody>
                <OrderItems>
                  {order.items.map((item, index) => (
                    <OrderItem key={index}>
                      <ItemInfo>
                        <ItemName>{item.name}</ItemName>
                        <ItemQuantity>× {item.quantity}</ItemQuantity>
                      </ItemInfo>
                      <ItemPrice>₪{item.price}</ItemPrice>
                    </OrderItem>
                  ))}
                </OrderItems>

                <OrderTotal>
                  <TotalLabel>{content.total}:</TotalLabel>
                  <TotalAmount>₪{order.total}</TotalAmount>
                </OrderTotal>
              </OrderBody>

              <OrderActions>
                {order.status === 'pending' && (
                  <ActionButton
                    variant="primary"
                    onClick={() => handleStatusChange(order.id, 'confirmed')}
                  >
                    {content.actions.confirm}
                  </ActionButton>
                )}
                {order.status === 'confirmed' && (
                  <ActionButton
                    variant="primary"
                    onClick={() => handleStatusChange(order.id, 'preparing')}
                  >
                    {content.actions.prepare}
                  </ActionButton>
                )}
                {order.status === 'preparing' && (
                  <ActionButton
                    variant="primary"
                    onClick={() => handleStatusChange(order.id, 'ready')}
                  >
                    {content.actions.ready}
                  </ActionButton>
                )}
                {order.status === 'ready' && (
                  <ActionButton
                    variant="primary"
                    onClick={() => handleStatusChange(order.id, 'delivered')}
                  >
                    {content.actions.deliver}
                  </ActionButton>
                )}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <ActionButton
                    variant="danger"
                    onClick={() => handleStatusChange(order.id, 'cancelled')}
                  >
                    {content.actions.cancel}
                  </ActionButton>
                )}
              </OrderActions>
            </OrderCard>
          ))}
        </OrdersGrid>
      )}
    </OrdersContainer>
  );
};

export default Orders;
