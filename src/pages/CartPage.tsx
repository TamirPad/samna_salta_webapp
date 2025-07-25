import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  MapPin, 
  Clock, 
  CreditCard,
  Truck,
  Store
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { selectLanguage } from '../features/language/languageSlice';
import { 
  selectCartItems, 
  selectCartItemsCount, 
  selectCartTotal,
  updateQuantity, 
  removeFromCart, 
  clearCart 
} from '../features/cart/cartSlice';

const CartContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;

  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

const CartContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

const CartHeader = styled.div`
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const CartTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CartSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const CartLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const CartItemsSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const CartItemsHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CartItemsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2F2F2F;
  margin: 0;
`;

const CartItemsCount = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const CartItemsList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const CartItem = styled(motion.div)`
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  gap: 1rem;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

const ItemImage = styled.div<{ imageUrl?: string }>`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: ${props => props.imageUrl 
    ? `url(${props.imageUrl}) center/cover` 
    : 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)'
  };
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    height: 120px;
  }
`;

const ItemDetails = styled.div`
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const ItemName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2F2F2F;
  margin: 0 0 0.25rem 0;
`;

const ItemCategory = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
`;

const ItemPrice = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #8B4513;
`;

const ItemControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const QuantityButton = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  background: #f8f9fa;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;

  &:hover {
    background: #e9ecef;
  }

  &:disabled {
    background: #f8f9fa;
    color: #ccc;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.span`
  width: 50px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  font-weight: 600;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
`;

const RemoveButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: #ff6b6b;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #ff5252;
  }
`;

const CartSummary = styled.div`
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

const SummaryTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2F2F2F;
  margin: 0 0 1.5rem 0;
`;

const DeliveryOptions = styled.div`
  margin-bottom: 1.5rem;
`;

const DeliveryOption = styled.label<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid ${props => props.selected ? '#8B4513' : '#e0e0e0'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;

  &:hover {
    border-color: #8B4513;
  }
`;

const DeliveryOptionInput = styled.input`
  display: none;
`;

const DeliveryOptionContent = styled.div`
  flex: 1;
`;

const DeliveryOptionTitle = styled.div`
  font-weight: 600;
  color: #2F2F2F;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DeliveryOptionDescription = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
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

const CheckoutButton = styled.button`
  width: 100%;
  background: #8B4513;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: #D2691E;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const EmptyCartIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const ContinueShoppingButton = styled.button`
  background: #8B4513;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-top: 1rem;

  &:hover {
    background: #D2691E;
  }
`;

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);
  const cartItems = useAppSelector(selectCartItems);
  const cartItemsCount = useAppSelector(selectCartItemsCount);
  const cartTotal = useAppSelector(selectCartTotal);
  
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const translations = useMemo(() => ({
    he: {
      cartTitle: 'עגלת הקניות שלך',
      cartSubtitle: 'בדוק את הפריטים שלך והמשך לתשלום',
      cartItems: 'פריטי עגלה',
      items: 'פריטים',
      pickup: 'איסוף עצמי',
      pickupDesc: 'איסוף מהמסעדה',
      delivery: 'משלוח',
      deliveryDesc: 'משלוח עד הבית',
      deliveryAddress: 'כתובת משלוח',
      deliveryAddressPlaceholder: 'הזן את כתובת המשלוח שלך',
      subtotal: 'סכום ביניים',
      deliveryFee: 'דמי משלוח',
      total: 'סה"כ',
      checkout: 'המשך לתשלום',
      emptyCart: 'העגלה שלך ריקה',
      emptyCartDesc: 'הוסף פריטים מהתפריט כדי להתחיל',
      continueShopping: 'המשך בקניות',
      remove: 'הסר',
      quantity: 'כמות',
    },
    en: {
      cartTitle: 'Your Shopping Cart',
      cartSubtitle: 'Review your items and proceed to checkout',
      cartItems: 'Cart Items',
      items: 'items',
      pickup: 'Pickup',
      pickupDesc: 'Pick up from restaurant',
      delivery: 'Delivery',
      deliveryDesc: 'Home delivery',
      deliveryAddress: 'Delivery Address',
      deliveryAddressPlaceholder: 'Enter your delivery address',
      subtotal: 'Subtotal',
      deliveryFee: 'Delivery Fee',
      total: 'Total',
      checkout: 'Proceed to Checkout',
      emptyCart: 'Your cart is empty',
      emptyCartDesc: 'Add items from the menu to get started',
      continueShopping: 'Continue Shopping',
      remove: 'Remove',
      quantity: 'Quantity',
    }
  }), []);

  const t = useMemo(() => translations[language as keyof typeof translations], [translations, language]);

  const deliveryFee = deliveryMethod === 'delivery' ? 15 : 0;
  const finalTotal = cartTotal + deliveryFee;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeFromCart(itemId));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    
    // Here you would typically save delivery method and address to cart state
    // For now, we'll just navigate to checkout
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/menu');
  };

  if (cartItems.length === 0) {
    return (
      <CartContainer>
        <CartContent>
          <CartHeader>
            <CartTitle>{t.cartTitle}</CartTitle>
            <CartSubtitle>{t.cartSubtitle}</CartSubtitle>
          </CartHeader>
          
          <EmptyCart>
            <EmptyCartIcon>🛒</EmptyCartIcon>
            <h3>{t.emptyCart}</h3>
            <p>{t.emptyCartDesc}</p>
            <ContinueShoppingButton onClick={handleContinueShopping}>
              {t.continueShopping}
            </ContinueShoppingButton>
          </EmptyCart>
        </CartContent>
      </CartContainer>
    );
  }

  return (
    <CartContainer>
      <CartContent>
        <CartHeader>
          <CartTitle>{t.cartTitle}</CartTitle>
          <CartSubtitle>{t.cartSubtitle}</CartSubtitle>
        </CartHeader>

        <CartLayout>
          <CartItemsSection>
            <CartItemsHeader>
              <CartItemsTitle>{t.cartItems}</CartItemsTitle>
              <CartItemsCount>{cartItemsCount} {t.items}</CartItemsCount>
            </CartItemsHeader>
            
            <CartItemsList>
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <CartItem
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ItemImage imageUrl={item.image} />
                    
                    <ItemDetails>
                      <ItemName>{item.name}</ItemName>
                      <ItemCategory>{item.category}</ItemCategory>
                      <ItemPrice>₪{item.price}</ItemPrice>
                    </ItemDetails>
                    
                    <ItemControls>
                      <QuantityControl>
                        <QuantityButton
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </QuantityButton>
                        <QuantityDisplay>{item.quantity}</QuantityDisplay>
                        <QuantityButton
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus size={16} />
                        </QuantityButton>
                      </QuantityControl>
                      
                      <RemoveButton onClick={() => handleRemoveItem(item.id)}>
                        <Trash2 size={16} />
                      </RemoveButton>
                    </ItemControls>
                  </CartItem>
                ))}
              </AnimatePresence>
            </CartItemsList>
          </CartItemsSection>

          <CartSummary>
            <SummaryTitle>Order Summary</SummaryTitle>
            
            <DeliveryOptions>
              <DeliveryOption selected={deliveryMethod === 'pickup'}>
                <DeliveryOptionInput
                  type="radio"
                  name="deliveryMethod"
                  value="pickup"
                  checked={deliveryMethod === 'pickup'}
                  onChange={(e) => setDeliveryMethod(e.target.value as 'pickup' | 'delivery')}
                />
                <Store size={20} />
                <DeliveryOptionContent>
                  <DeliveryOptionTitle>{t.pickup}</DeliveryOptionTitle>
                  <DeliveryOptionDescription>{t.pickupDesc}</DeliveryOptionDescription>
                </DeliveryOptionContent>
              </DeliveryOption>
              
              <DeliveryOption selected={deliveryMethod === 'delivery'}>
                <DeliveryOptionInput
                  type="radio"
                  name="deliveryMethod"
                  value="delivery"
                  checked={deliveryMethod === 'delivery'}
                  onChange={(e) => setDeliveryMethod(e.target.value as 'pickup' | 'delivery')}
                />
                <Truck size={20} />
                <DeliveryOptionContent>
                  <DeliveryOptionTitle>{t.delivery}</DeliveryOptionTitle>
                  <DeliveryOptionDescription>{t.deliveryDesc}</DeliveryOptionDescription>
                </DeliveryOptionContent>
              </DeliveryOption>
            </DeliveryOptions>

            {deliveryMethod === 'delivery' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  {t.deliveryAddress}
                </label>
                <input
                  type="text"
                  placeholder={t.deliveryAddressPlaceholder}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            )}
            
            <SummaryRow>
              <span>{t.subtotal}</span>
              <span>₪{cartTotal}</span>
            </SummaryRow>
            
            {deliveryMethod === 'delivery' && (
              <SummaryRow>
                <span>{t.deliveryFee}</span>
                <span>₪{deliveryFee}</span>
              </SummaryRow>
            )}
            
            <SummaryTotal>
              <span>{t.total}</span>
              <span>₪{finalTotal}</span>
            </SummaryTotal>
            
            <CheckoutButton onClick={handleCheckout}>
              <CreditCard size={20} />
              {t.checkout}
            </CheckoutButton>
          </CartSummary>
        </CartLayout>
      </CartContent>
    </CartContainer>
  );
};

export default CartPage; 