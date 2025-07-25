import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowLeft,
  RefreshCw,
  Package,
  User,
  CreditCard,
  Calendar
} from 'lucide-react';
import { useAppSelector } from '../hooks/redux';
import { selectLanguage } from '../features/language/languageSlice';
import { apiService } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const TrackingContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;

  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

const TrackingContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

const TrackingHeader = styled.div`
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const OrderNumber = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const OrderStatus = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 1rem;
`;

const RefreshButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const TrackingLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ProgressSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const ProgressTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2F2F2F;
  margin: 0 0 2rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProgressSteps = styled.div`
  position: relative;
`;

const ProgressStep = styled.div<{ completed: boolean; current: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;

  &:last-child {
    margin-bottom: 0;
  }

  &::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 40px;
    width: 2px;
    height: calc(100% + 1rem);
    background: ${props => props.completed ? '#28a745' : '#e0e0e0'};
    z-index: 1;
  }

  &:last-child::before {
    display: none;
  }
`;

const StepIcon = styled.div<{ completed: boolean; current: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => {
    if (props.completed) return '#28a745';
    if (props.current) return '#8B4513';
    return '#e0e0e0';
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  position: relative;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h3<{ completed: boolean; current: boolean }>`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => {
    if (props.completed) return '#28a745';
    if (props.current) return '#8B4513';
    return '#666';
  }};
  margin: 0 0 0.25rem 0;
`;

const StepDescription = styled.p<{ completed: boolean; current: boolean }>`
  color: ${props => {
    if (props.completed) return '#28a745';
    if (props.current) return '#8B4513';
    return '#999';
  }};
  margin: 0;
  font-size: 0.9rem;
`;

const StepTime = styled.div<{ completed: boolean; current: boolean }>`
  color: ${props => {
    if (props.completed) return '#28a745';
    if (props.current) return '#8B4513';
    return '#999';
  }};
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const OrderDetails = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;

  @media (max-width: 1024px) {
    position: static;
  }
`;

const DetailsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2F2F2F;
  margin: 0 0 1.5rem 0;
`;

const DetailsSection = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2F2F2F;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const DetailValue = styled.span`
  color: #2F2F2F;
  font-weight: 500;
  text-align: right;
`;

const OrderItems = styled.div`
  margin-top: 1rem;
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ItemImage = styled.div<{ imageUrl?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: ${props => props.imageUrl 
    ? `url(${props.imageUrl}) center/cover` 
    : 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)'
  };
  flex-shrink: 0;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 600;
  color: #2F2F2F;
  font-size: 0.9rem;
`;

const ItemQuantity = styled.div`
  color: #666;
  font-size: 0.8rem;
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: #8B4513;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
`;

const SummaryTotal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
  padding-top: 1rem;
  border-top: 2px solid #e0e0e0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2F2F2F;
`;

const ContactInfo = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ErrorMessage = styled.div`
  background: #ff6b6b;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
`;

const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const language = useAppSelector(selectLanguage);
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const translations = useMemo(() => ({
    he: {
      orderTracking: 'מעקב הזמנה',
      orderNumber: 'מספר הזמנה',
      backToHome: 'חזור לדף הבית',
      refresh: 'רענן',
      orderProgress: 'התקדמות ההזמנה',
      orderDetails: 'פרטי ההזמנה',
      orderPlaced: 'ההזמנה הושלמה',
      orderPlacedDesc: 'ההזמנה שלך התקבלה בהצלחה',
      orderConfirmed: 'ההזמנה אושרה',
      orderConfirmedDesc: 'המסעדה אישרה את ההזמנה שלך',
      orderPreparing: 'ההזמנה מוכנה',
      orderPreparingDesc: 'המטבח מכין את ההזמנה שלך',
      orderReady: 'ההזמנה מוכנה',
      orderReadyDesc: 'ההזמנה שלך מוכנה לאיסוף/משלוח',
      orderDelivering: 'בדרך אליך',
      orderDeliveringDesc: 'השליח בדרך עם ההזמנה שלך',
      orderDelivered: 'ההזמנה נמסרה',
      orderDeliveredDesc: 'ההזמנה נמסרה בהצלחה',
      orderCancelled: 'ההזמנה בוטלה',
      orderCancelledDesc: 'ההזמנה בוטלה',
      customerInfo: 'פרטי לקוח',
      deliveryInfo: 'פרטי משלוח',
      paymentInfo: 'פרטי תשלום',
      orderItems: 'פריטי ההזמנה',
      subtotal: 'סכום ביניים',
      deliveryFee: 'דמי משלוח',
      total: 'סה"כ',
      name: 'שם',
      phone: 'טלפון',
      email: 'אימייל',
      address: 'כתובת',
      method: 'שיטה',
      status: 'סטטוס',
      date: 'תאריך',
      pickup: 'איסוף',
      delivery: 'משלוח',
      cash: 'מזומן',
      card: 'כרטיס אשראי',
      online: 'תשלום מקוון',
      contactRestaurant: 'צור קשר עם המסעדה',
      restaurantPhone: 'טלפון המסעדה',
      restaurantEmail: 'אימייל המסעדה',
      orderNotFound: 'ההזמנה לא נמצאה',
      orderNotFoundDesc: 'לא ניתן למצוא את ההזמנה המבוקשת',
      tryAgain: 'נסה שוב',
    },
    en: {
      orderTracking: 'Order Tracking',
      orderNumber: 'Order Number',
      backToHome: 'Back to Home',
      refresh: 'Refresh',
      orderProgress: 'Order Progress',
      orderDetails: 'Order Details',
      orderPlaced: 'Order Placed',
      orderPlacedDesc: 'Your order has been successfully placed',
      orderConfirmed: 'Order Confirmed',
      orderConfirmedDesc: 'The restaurant has confirmed your order',
      orderPreparing: 'Order Preparing',
      orderPreparingDesc: 'The kitchen is preparing your order',
      orderReady: 'Order Ready',
      orderReadyDesc: 'Your order is ready for pickup/delivery',
      orderDelivering: 'On the Way',
      orderDeliveringDesc: 'The delivery person is on the way with your order',
      orderDelivered: 'Order Delivered',
      orderDeliveredDesc: 'Your order has been delivered successfully',
      orderCancelled: 'Order Cancelled',
      orderCancelledDesc: 'Your order has been cancelled',
      customerInfo: 'Customer Information',
      deliveryInfo: 'Delivery Information',
      paymentInfo: 'Payment Information',
      orderItems: 'Order Items',
      subtotal: 'Subtotal',
      deliveryFee: 'Delivery Fee',
      total: 'Total',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      method: 'Method',
      status: 'Status',
      date: 'Date',
      pickup: 'Pickup',
      delivery: 'Delivery',
      cash: 'Cash',
      card: 'Credit Card',
      online: 'Online Payment',
      contactRestaurant: 'Contact Restaurant',
      restaurantPhone: 'Restaurant Phone',
      restaurantEmail: 'Restaurant Email',
      orderNotFound: 'Order Not Found',
      orderNotFoundDesc: 'The requested order could not be found',
      tryAgain: 'Try Again',
    }
  }), []);

  const t = useMemo(() => translations[language as keyof typeof translations], [translations, language]);

  // Mock order data for development
  const mockOrder = useMemo(() => ({
    id: orderId,
    order_number: `#${orderId?.padStart(6, '0')}`,
    status: 'preparing',
    customer_name: 'ישראל ישראלי',
    customer_phone: '+972-50-123-4567',
    customer_email: 'israel@example.com',
    delivery_method: 'delivery',
    delivery_address: 'רחוב הרצל 123, תל אביב',
    payment_method: 'cash',
    subtotal: 85,
    delivery_charge: 15,
    total: 100,
    created_at: '2024-01-15T10:30:00Z',
    estimated_delivery_time: '2024-01-15T11:30:00Z',
    order_items: [
      {
        id: 1,
        product_name: 'Kubaneh',
        quantity: 2,
        unit_price: 25,
        total_price: 50,
        image: '/images/kubaneh.jpg',
      },
      {
        id: 2,
        product_name: 'Samneh',
        quantity: 1,
        unit_price: 15,
        total_price: 15,
        image: '/images/samneh.jpg',
      },
      {
        id: 3,
        product_name: 'Red Bisbas',
        quantity: 1,
        unit_price: 12,
        total_price: 12,
        image: '/images/red-bisbas.jpg',
      },
      {
        id: 4,
        product_name: 'Hilbeh',
        quantity: 1,
        unit_price: 10,
        total_price: 10,
        image: '/images/hilbeh.jpg',
      },
    ],
    status_updates: [
      {
        status: 'placed',
        timestamp: '2024-01-15T10:30:00Z',
        description: 'Order placed successfully',
      },
      {
        status: 'confirmed',
        timestamp: '2024-01-15T10:32:00Z',
        description: 'Order confirmed by restaurant',
      },
      {
        status: 'preparing',
        timestamp: '2024-01-15T10:35:00Z',
        description: 'Kitchen started preparing',
      },
    ],
  }), [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you would fetch from API
      // const response = await apiService.getOrder(parseInt(orderId!));
      // setOrder(response.data);
      
      // For now, use mock data
      setTimeout(() => {
        setOrder(mockOrder);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to fetch order details');
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrder();
    setRefreshing(false);
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const getStatusSteps = () => {
    const steps = [
      {
        key: 'placed',
        title: t.orderPlaced,
        description: t.orderPlacedDesc,
        icon: <Package size={20} />,
      },
      {
        key: 'confirmed',
        title: t.orderConfirmed,
        description: t.orderConfirmedDesc,
        icon: <CheckCircle size={20} />,
      },
      {
        key: 'preparing',
        title: t.orderPreparing,
        description: t.orderPreparingDesc,
        icon: <Clock size={20} />,
      },
      {
        key: 'ready',
        title: t.orderReady,
        description: t.orderReadyDesc,
        icon: <CheckCircle size={20} />,
      },
      {
        key: 'delivering',
        title: t.orderDelivering,
        description: t.orderDeliveringDesc,
        icon: <Truck size={20} />,
      },
      {
        key: 'delivered',
        title: t.orderDelivered,
        description: t.orderDeliveredDesc,
        icon: <CheckCircle size={20} />,
      },
    ];

    const statusOrder = ['placed', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered'];
    const currentIndex = statusOrder.indexOf(order?.status || 'placed');

    return steps.map((step, index) => {
      const stepIndex = statusOrder.indexOf(step.key);
      const completed = stepIndex < currentIndex;
      const current = stepIndex === currentIndex;

      return {
        ...step,
        completed,
        current,
        timestamp: order?.status_updates?.find((update: any) => update.status === step.key)?.timestamp,
      };
    });
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

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return t.cash;
      case 'card': return t.card;
      case 'online': return t.online;
      default: return method;
    }
  };

  const getDeliveryMethodText = (method: string) => {
    switch (method) {
      case 'pickup': return t.pickup;
      case 'delivery': return t.delivery;
      default: return method;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !order) {
    return (
      <TrackingContainer>
        <TrackingContent>
          <ErrorMessage>
            <h3>{t.orderNotFound}</h3>
            <p>{t.orderNotFoundDesc}</p>
            <button onClick={handleRefresh} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#8B4513', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {t.tryAgain}
            </button>
          </ErrorMessage>
        </TrackingContent>
      </TrackingContainer>
    );
  }

  return (
    <TrackingContainer>
      <TrackingContent>
        <TrackingHeader>
          <BackButton onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
            {t.backToHome}
          </BackButton>
          <OrderNumber>{order.order_number}</OrderNumber>
          <OrderStatus>{getStatusSteps().find(step => step.current)?.title || t.orderPlaced}</OrderStatus>
          <RefreshButton onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : t.refresh}
          </RefreshButton>
        </TrackingHeader>

        <TrackingLayout>
          <ProgressSection>
            <ProgressTitle>
              <Clock size={20} />
              {t.orderProgress}
            </ProgressTitle>
            
            <ProgressSteps>
              {getStatusSteps().map((step, index) => (
                <ProgressStep key={step.key} completed={step.completed} current={step.current}>
                  <StepIcon completed={step.completed} current={step.current}>
                    {step.icon}
                  </StepIcon>
                  <StepContent>
                    <StepTitle completed={step.completed} current={step.current}>
                      {step.title}
                    </StepTitle>
                    <StepDescription completed={step.completed} current={step.current}>
                      {step.description}
                    </StepDescription>
                    {step.timestamp && (
                      <StepTime completed={step.completed} current={step.current}>
                        {formatDate(step.timestamp)}
                      </StepTime>
                    )}
                  </StepContent>
                </ProgressStep>
              ))}
            </ProgressSteps>
          </ProgressSection>

          <OrderDetails>
            <DetailsTitle>{t.orderDetails}</DetailsTitle>
            
            <DetailsSection>
              <SectionTitle>
                <User size={16} />
                {t.customerInfo}
              </SectionTitle>
              <DetailRow>
                <DetailLabel>{t.name}</DetailLabel>
                <DetailValue>{order.customer_name}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>{t.phone}</DetailLabel>
                <DetailValue>{order.customer_phone}</DetailValue>
              </DetailRow>
              {order.customer_email && (
                <DetailRow>
                  <DetailLabel>{t.email}</DetailLabel>
                  <DetailValue>{order.customer_email}</DetailValue>
                </DetailRow>
              )}
            </DetailsSection>

            <DetailsSection>
              <SectionTitle>
                <MapPin size={16} />
                {t.deliveryInfo}
              </SectionTitle>
              <DetailRow>
                <DetailLabel>{t.method}</DetailLabel>
                <DetailValue>{getDeliveryMethodText(order.delivery_method)}</DetailValue>
              </DetailRow>
              {order.delivery_method === 'delivery' && (
                <DetailRow>
                  <DetailLabel>{t.address}</DetailLabel>
                  <DetailValue>{order.delivery_address}</DetailValue>
                </DetailRow>
              )}
            </DetailsSection>

            <DetailsSection>
              <SectionTitle>
                <CreditCard size={16} />
                {t.paymentInfo}
              </SectionTitle>
              <DetailRow>
                <DetailLabel>{t.method}</DetailLabel>
                <DetailValue>{getPaymentMethodText(order.payment_method)}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>{t.status}</DetailLabel>
                <DetailValue>{order.status}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>{t.date}</DetailLabel>
                <DetailValue>{formatDate(order.created_at)}</DetailValue>
              </DetailRow>
            </DetailsSection>

            <DetailsSection>
              <SectionTitle>{t.orderItems}</SectionTitle>
              <OrderItems>
                {order.order_items.map((item: any) => (
                  <OrderItem key={item.id}>
                    <ItemInfo>
                      <ItemImage imageUrl={item.image} />
                      <ItemDetails>
                        <ItemName>{item.product_name}</ItemName>
                        <ItemQuantity>Qty: {item.quantity}</ItemQuantity>
                      </ItemDetails>
                    </ItemInfo>
                    <ItemPrice>₪{item.total_price}</ItemPrice>
                  </OrderItem>
                ))}
              </OrderItems>
              
              <SummaryRow>
                <DetailLabel>{t.subtotal}</DetailLabel>
                <DetailValue>₪{order.subtotal}</DetailValue>
              </SummaryRow>
              
              {order.delivery_method === 'delivery' && (
                <SummaryRow>
                  <DetailLabel>{t.deliveryFee}</DetailLabel>
                  <DetailValue>₪{order.delivery_charge}</DetailValue>
                </SummaryRow>
              )}
              
              <SummaryTotal>
                <DetailLabel>{t.total}</DetailLabel>
                <DetailValue>₪{order.total}</DetailValue>
              </SummaryTotal>
            </DetailsSection>

            <ContactInfo>
              <SectionTitle>
                <Phone size={16} />
                {t.contactRestaurant}
              </SectionTitle>
              <ContactItem>
                <Phone size={14} />
                <span>{t.restaurantPhone}: +972-3-123-4567</span>
              </ContactItem>
              <ContactItem>
                <Mail size={14} />
                <span>{t.restaurantEmail}: info@samnasalta.com</span>
              </ContactItem>
            </ContactInfo>
          </OrderDetails>
        </TrackingLayout>
      </TrackingContent>
    </TrackingContainer>
  );
};

export default OrderTrackingPage; 