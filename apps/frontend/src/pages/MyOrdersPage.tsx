import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { apiService } from '../utils/api';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  margin-bottom: 1rem;
`;

const OrderList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const OrderItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const Placeholder = styled.div`
  color: #666;
`;

const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Prefer user-specific orders endpoint
        let resp: any;
        try {
          resp = await apiService.getOrders({ status: 'all', page: 1, limit: 10 });
        } catch (_) {}
        if (!resp || !(resp as any).data) {
          resp = await fetch('/api/orders/my', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } });
          resp = { data: await (resp as Response).json() } as any;
        }
        const data = (resp as any)?.data?.data || (resp as any)?.data;
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
          setLoading(false);
          return;
        }
      } catch (_) {
        // ignore
      }
      // Fallback to local last order id
      const lastOrderId = (window as any).__last_order_id__ || localStorage.getItem('lastOrderId');
      if (lastOrderId) {
        setOrders([{ id: lastOrderId, total: '-', status: 'placed' }]);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) return <Container><Card>Loading...</Card></Container>;

  return (
    <Container>
      <Card>
        <Title>My Orders</Title>
        {orders.length === 0 ? (
          <Placeholder>No orders yet.</Placeholder>
        ) : (
          <OrderList>
            {orders.map((o) => (
              <OrderItem key={o.id}>
                <span>{o.order_number || o.id}</span>
                <Link to={`/order/${o.id}`}>View</Link>
              </OrderItem>
            ))}
          </OrderList>
        )}
      </Card>
    </Container>
  );
};

export default MyOrdersPage;
