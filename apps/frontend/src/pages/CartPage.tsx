import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Truck,
  Store,
  AlertCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { selectLanguage } from "../features/language/languageSlice";
import {
  selectCartItems,
  selectCartTotal,
  selectCartItemsCount,
  updateQuantity,
  removeFromCart,
  CartItem,
} from "../features/cart/cartSlice";

// Types
interface DeliveryMethod {
  id: "pickup" | "delivery";
  title: string;
  description: string;
  icon: React.ReactNode;
  fee: number;
}

// Styled Components
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
  background: linear-gradient(135deg, #8b4513 0%, #d2691e 100%);
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

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`;

const CartSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.5;
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
  color: #2f2f2f;
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

const CartItemContainer = styled(motion.div)`
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

const ItemImage = styled.div<{ $imageUrl?: string }>`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: ${({ $imageUrl }) =>
    $imageUrl ? `url(${$imageUrl}) center/cover` : 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
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
  color: #2f2f2f;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
`;

const ItemCategory = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
`;

const ItemPrice = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #8b4513;
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
  transition: all 0.3s ease;
  min-height: 44px;
  min-width: 44px;

  &:hover {
    background: #e9ecef;
    transform: scale(1.05);
  }

  &:focus {
    outline: 2px solid #8b4513;
    outline-offset: 2px;
  }

  &:disabled {
    background: #f8f9fa;
    color: #ccc;
    cursor: not-allowed;
    transform: none;
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
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  min-width: 44px;

  &:hover {
    background: #ff5252;
    transform: scale(1.05);
  }

  &:focus {
    outline: 2px solid #ff6b6b;
    outline-offset: 2px;
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
  color: #2f2f2f;
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
  border: 2px solid
    ${(props): string => (props.selected ? "#8B4513" : "#e0e0e0")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
  min-height: 44px;

  &:hover {
    border-color: #8b4513;
    transform: translateY(-1px);
  }

  &:focus-within {
    outline: 2px solid #8b4513;
    outline-offset: 2px;
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
  color: #2f2f2f;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DeliveryOptionDescription = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
`;

const DeliveryAddressInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const SummaryTotal = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e0e0e0;
  font-size: 1.25rem;
  font-weight: bold;
  color: #8b4513;
`;

const CheckoutButton = styled.button`
  width: 100%;
  background: #8b4513;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;

  &:hover {
    background: #d2691e;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
  }

  &:focus {
    outline: 2px solid #fff8dc;
    outline-offset: 2px;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
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
  background: #8b4513;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  min-height: 44px;

  &:hover {
    background: #d2691e;
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid #fff8dc;
    outline-offset: 2px;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);
  const cartItems = useAppSelector(selectCartItems) as CartItem[];
  const cartItemsCount = useAppSelector(selectCartItemsCount);
  const cartTotal = useAppSelector(selectCartTotal);

  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">(
    "pickup",
  );
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [error, setError] = useState<string>("");

  // Memoized translations
  const translations = useMemo(
    () => ({
      he: {
        cartTitle: "עגלת הקניות שלך",
        cartSubtitle: "בדוק את הפריטים שלך והמשך לתשלום",
        cartItems: "פריטי עגלה",
        items: "פריטים",
        pickup: "איסוף עצמי",
        pickupDesc: "איסוף מהמסעדה",
        delivery: "משלוח",
        deliveryDesc: "משלוח עד הבית",
        deliveryAddress: "כתובת משלוח",
        deliveryAddressPlaceholder: "הזן את כתובת המשלוח שלך",
        subtotal: "סכום ביניים",
        deliveryFee: "דמי משלוח",
        total: 'סה"כ',
        checkout: "המשך לתשלום",
        emptyCart: "העגלה שלך ריקה",
        emptyCartDesc: "הוסף פריטים מהתפריט כדי להתחיל",
        continueShopping: "המשך בקניות",
        remove: "הסר",
        quantity: "כמות",
        deliveryAddressRequired: "כתובת משלוח נדרשת",
        errorOccurred: "אירעה שגיאה",
      },
      en: {
        cartTitle: "Your Shopping Cart",
        cartSubtitle: "Review your items and proceed to checkout",
        cartItems: "Cart Items",
        items: "items",
        pickup: "Pickup",
        pickupDesc: "Pick up from restaurant",
        delivery: "Delivery",
        deliveryDesc: "Home delivery",
        deliveryAddress: "Delivery Address",
        deliveryAddressPlaceholder: "Enter your delivery address",
        subtotal: "Subtotal",
        deliveryFee: "Delivery Fee",
        total: "Total",
        checkout: "Proceed to Checkout",
        emptyCart: "Your cart is empty",
        emptyCartDesc: "Add items from the menu to get started",
        continueShopping: "Continue Shopping",
        remove: "Remove",
        quantity: "Quantity",
        deliveryAddressRequired: "Delivery address is required",
        errorOccurred: "An error occurred",
      },
    }),
    [],
  );

  const t = useMemo(
    () => translations[language as keyof typeof translations],
    [translations, language],
  );

  // Memoized delivery methods
  const deliveryMethods = useMemo(
    (): DeliveryMethod[] => [
      {
        id: "pickup",
        title: t.pickup,
        description: t.pickupDesc,
        icon: <Store size={20} />,
        fee: 0,
      },
      {
        id: "delivery",
        title: t.delivery,
        description: t.deliveryDesc,
        icon: <Truck size={20} />,
        fee: 15,
      },
    ],
    [t],
  );

  const deliveryFee = useMemo(
    () =>
      deliveryMethods.find((method) => method.id === deliveryMethod)?.fee || 0,
    [deliveryMethods, deliveryMethod],
  );

  const finalTotal = useMemo(
    () => cartTotal + deliveryFee,
    [cartTotal, deliveryFee],
  );

  // Memoized handlers
  const handleQuantityChange = useCallback(
    (itemId: string, newQuantity: number): void => {
      if (newQuantity < 1) return;
      dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
    },
    [dispatch],
  );

  const handleRemoveItem = useCallback(
    (itemId: string): void => {
      dispatch(removeFromCart(itemId));
    },
    [dispatch],
  );

  const handleDeliveryMethodChange = useCallback(
    (method: "pickup" | "delivery"): void => {
      setDeliveryMethod(method);
      setError("");
      if (method === "pickup") {
        setDeliveryAddress("");
      }
    },
    [],
  );

  const handleDeliveryAddressChange = useCallback((address: string): void => {
    setDeliveryAddress(address);
    setError("");
  }, []);

  const handleCheckout = useCallback((): void => {
    if (cartItems.length === 0) return;

    if (deliveryMethod === "delivery" && !deliveryAddress.trim()) {
      setError(t.deliveryAddressRequired);
      return;
    }

    try {
      // Here you would typically save delivery method and address to cart state
      // For now, we'll just navigate to checkout
      navigate("/checkout");
    } catch (err) {
      setError(t.errorOccurred);
    }
  }, [cartItems.length, deliveryMethod, deliveryAddress, navigate, t]);

  const handleContinueShopping = useCallback((): void => {
    navigate("/menu");
  }, [navigate]);

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
            <ContinueShoppingButton
              onClick={handleContinueShopping}
              aria-label={t.continueShopping}
            >
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
              <CartItemsCount>
                {cartItemsCount} {t.items}
              </CartItemsCount>
            </CartItemsHeader>

            <CartItemsList>
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <CartItemContainer
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ItemImage $imageUrl={item.image} />

                    <ItemDetails>
                      <ItemName>{item.name}</ItemName>
                      <ItemCategory>{item.category}</ItemCategory>
                      <ItemPrice>₪{item.price}</ItemPrice>
                    </ItemDetails>

                    <ItemControls>
                      <QuantityControl>
                        <QuantityButton
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus size={16} />
                        </QuantityButton>
                        <QuantityDisplay>{item.quantity}</QuantityDisplay>
                        <QuantityButton
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus size={16} />
                        </QuantityButton>
                      </QuantityControl>

                      <RemoveButton
                        onClick={() => handleRemoveItem(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 size={16} />
                      </RemoveButton>
                    </ItemControls>
                  </CartItemContainer>
                ))}
              </AnimatePresence>
            </CartItemsList>
          </CartItemsSection>

          <CartSummary>
            <SummaryTitle>Order Summary</SummaryTitle>

            {error && (
              <ErrorMessage>
                <AlertCircle size={16} />
                {error}
              </ErrorMessage>
            )}

            <DeliveryOptions>
              {deliveryMethods.map((method) => (
                <DeliveryOption
                  key={method.id}
                  selected={deliveryMethod === method.id}
                >
                  <DeliveryOptionInput
                    type="radio"
                    name="deliveryMethod"
                    value={method.id}
                    checked={deliveryMethod === method.id}
                    onChange={() => handleDeliveryMethodChange(method.id)}
                  />
                  {method.icon}
                  <DeliveryOptionContent>
                    <DeliveryOptionTitle>{method.title}</DeliveryOptionTitle>
                    <DeliveryOptionDescription>
                      {method.description}
                    </DeliveryOptionDescription>
                  </DeliveryOptionContent>
                </DeliveryOption>
              ))}
            </DeliveryOptions>

            {deliveryMethod === "delivery" && (
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                  }}
                >
                  {t.deliveryAddress}
                </label>
                <DeliveryAddressInput
                  type="text"
                  placeholder={t.deliveryAddressPlaceholder}
                  value={deliveryAddress}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleDeliveryAddressChange(e.target.value)
                  }
                  aria-label={t.deliveryAddressPlaceholder}
                />
              </div>
            )}

            <SummaryRow>
              <span>{t.subtotal}</span>
              <span>₪{cartTotal}</span>
            </SummaryRow>

            {deliveryMethod === "delivery" && (
              <SummaryRow>
                <span>{t.deliveryFee}</span>
                <span>₪{deliveryFee}</span>
              </SummaryRow>
            )}

            <SummaryTotal>
              <span>{t.total}</span>
              <span>₪{finalTotal}</span>
            </SummaryTotal>

            <CheckoutButton
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              aria-label={t.checkout}
            >
              <CreditCard size={20} />
              {t.checkout}
            </CheckoutButton>
          </CartSummary>
        </CartLayout>
      </CartContent>
    </CartContainer>
  );
};

export default React.memo(CartPage);
