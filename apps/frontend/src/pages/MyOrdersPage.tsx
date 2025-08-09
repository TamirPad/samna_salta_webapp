import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { api } from '../utils/api';
import { useAppSelector } from '../hooks/redux';
import { selectLanguage } from '../features/language/languageSlice';
import LoadingSpinner from '../components/LoadingSpinner';
//

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  padding: 1.25rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  margin: 0 0 0.75rem 0;
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Tab = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  border: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary : '#e5e7eb')};
  background: ${({ $active }) => ($active ? 'rgba(59,130,246,0.08)' : '#fff')};
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : '#374151')};
  cursor: pointer;
  font-weight: 600;
`;

const List = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.875rem 1rem;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  background: #fff;
`;

const Meta = styled.div`
  display: grid;
  gap: 0.25rem;
`;

const OrderHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #111827;
`;

const SubMeta = styled.div`
  display: flex;
  gap: 0.75rem;
  color: #6b7280;
  font-size: 0.9rem;
`;

type KnownStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';

const StatusChip = styled.span<{ $status: KnownStatus }>`
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({ $status }) => ({
    pending: '#92400e',
    confirmed: '#065f46',
    preparing: '#1f2937',
    ready: '#1e3a8a',
    delivering: '#7c2d12',
    delivered: '#065f46',
    cancelled: '#991b1b',
  }[$status] || '#374151')};
  background: ${({ $status }) => ({
    pending: '#fef3c7',
    confirmed: '#d1fae5',
    preparing: '#e5e7eb',
    ready: '#dbeafe',
    delivering: '#ffedd5',
    delivered: '#d1fae5',
    cancelled: '#fee2e2',
  }[$status] || '#f3f4f6')};
`;

const Progress = styled.div<{ $percent: number }>`
  position: relative;
  height: 6px;
  background: #eef2f7;
  border-radius: 999px;
  overflow: hidden;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    width: ${({ $percent }) => `${$percent}%`};
    background: linear-gradient(90deg, #60a5fa, #3b82f6);
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'ghost' }>`
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: ${({ $variant, theme }) => ($variant === 'ghost' ? '1px solid #e5e7eb' : 'none')};
  background: ${({ $variant, theme }) => ($variant === 'primary' ? theme.colors.primary : '#fff')};
  color: ${({ $variant }) => ($variant === 'primary' ? '#fff' : '#111827')};
  cursor: pointer;
  font-weight: 600;
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: #6b7280;
`;

type OrderRow = {
  id: number;
  order_number?: string;
  status: string;
  total?: number;
  created_at?: string;
};

const statusOrder = ['placed', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered'];

const MyOrdersPage: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');

  const loadOrders = useCallback(async (nextPage: number, replace = false) => {
    try {
      setLoading(true);
      const limit = 10;
      const resp = await api.get('/orders/my', { params: { page: nextPage, limit } });
      const payload = (resp as any)?.data;
      const data: OrderRow[] = (payload?.data as any[]) || [];
      const pagination = payload?.pagination;
      setHasMore(Boolean(pagination && nextPage < Number(pagination.pages)));
      setOrders((prev) => (replace ? data : [...prev, ...data]));
      setPage(nextPage);
    } catch (_) {
      // Fallback: display last order id if available
      if (nextPage === 1 && orders.length === 0) {
        const lastOrderId = (window as any).__last_order_id__ || localStorage.getItem('lastOrderId');
        if (lastOrderId) setOrders([{ id: Number(lastOrderId), status: 'placed' } as any]);
      }
    } finally {
      setLoading(false);
    }
  }, [orders.length]);

  useEffect(() => {
    loadOrders(1, true);
  }, [loadOrders]);

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((o) => String(o.status || '').toLowerCase() === filter);
  }, [orders, filter]);

  const progressPercent = (status: string): number => {
    const idx = statusOrder.indexOf((status || '').toLowerCase());
    if (idx < 0) return 15;
    return Math.round(((idx + 1) / statusOrder.length) * 100);
  };

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString(language === 'he' ? 'he-IL' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '';

  const labels = useMemo(() => ({
    he: {
      title: 'ההזמנות שלי',
      all: 'הכל', pending: 'ממתין', confirmed: 'אושרה', preparing: 'בהכנה', ready: 'מוכנה', delivering: 'במשלוח', delivered: 'נמסרה', cancelled: 'בוטלה',
      view: 'מעקב', reorder: 'הזמנה חוזרת', total: 'סה"כ', placed: 'הוזמנה', loadMore: 'טען עוד', empty: 'אין הזמנות עדיין',
    },
    en: {
      title: 'My Orders',
      all: 'All', pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing', ready: 'Ready', delivering: 'Delivering', delivered: 'Delivered', cancelled: 'Cancelled',
      view: 'Track', reorder: 'Reorder', total: 'Total', placed: 'Placed', loadMore: 'Load more', empty: 'No orders yet',
    }
  }), []);

  const L = (labels as any)[language] as any;

  return (
    <Container>
      <Card>
        <Title>{L.title}</Title>
        <Toolbar>
          <Tabs>
            {['all','pending','confirmed','preparing','ready','delivering','delivered','cancelled'].map((s) => (
              <Tab key={s} $active={filter === s} onClick={() => setFilter(s)}>{L[s] || s}</Tab>
            ))}
          </Tabs>
          {loading && <LoadingSpinner size="small" text="" />}
        </Toolbar>

        {filtered.length === 0 && !loading ? (
          <EmptyState>{L.empty}</EmptyState>
        ) : (
          <List>
            {filtered.map((o) => (
              <Row key={o.id}>
                <Meta>
                  <OrderHeading>
                    Order #{o.id}
                    <StatusChip $status={((o.status || 'pending').toLowerCase() as KnownStatus)}>{L[(o.status || 'pending').toLowerCase()] || o.status}</StatusChip>
                  </OrderHeading>
                  <SubMeta>
                    <span>{L.total}: ₪{Number(o.total || 0).toFixed(2)}</span>
                    <span>• {L.placed}: {formatDate(o.created_at)}</span>
                  </SubMeta>
                  <Progress $percent={progressPercent(o.status)} />
                </Meta>
                <Actions>
                  <Button $variant="ghost" onClick={() => navigate(`/order/${o.id}`)}>{L.view}</Button>
                  <Button $variant="primary" onClick={() => navigate('/menu')}>{L.reorder}</Button>
                </Actions>
              </Row>
            ))}
          </List>
        )}

        {hasMore && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <Button $variant="ghost" onClick={() => loadOrders(page + 1)}>{L.loadMore}</Button>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default MyOrdersPage;
