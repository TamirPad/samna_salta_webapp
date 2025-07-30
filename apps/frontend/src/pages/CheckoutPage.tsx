import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Banknote,
  Lock,
  CheckCircle,
  ArrowLeft,
  Truck,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { selectLanguage } from "../features/language/languageSlice";
import {
  selectCartItems,
  selectCartTotal,
  clearCart,
  CartItem,
} from "../features/cart/cartSlice";
// import { apiService } from '../utils/api'; // Uncomment when backend API is ready

const CheckoutContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;

  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

const CheckoutContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

const CheckoutHeader = styled.div`
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

const CheckoutTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CheckoutSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
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

const CheckoutLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const CheckoutForm = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const FormSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2f2f2f;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormLabel = styled.label`
  font-weight: 600;
  color: #2f2f2f;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormInput = styled.input`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #8b4513;
  }

  &.error {
    border-color: #ff6b6b;
  }
`;

const FormTextarea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #8b4513;
  }

  &.error {
    border-color: #ff6b6b;
  }
`;

const PaymentOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PaymentOption = styled.label<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid ${(props) => (props.selected ? "#8B4513" : "#e0e0e0")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #8b4513;
  }
`;

const PaymentOptionInput = styled.input`
  display: none;
`;

const PaymentOptionContent = styled.div`
  flex: 1;
`;

const PaymentOptionTitle = styled.div`
  font-weight: 600;
  color: #2f2f2f;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PaymentOptionDescription = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
`;

const OrderSummary = styled.div`
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

const OrderItems = styled.div`
  margin-bottom: 1.5rem;
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

const ItemImage = styled.div<{ $imageUrl?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: ${({ $imageUrl }) =>
    $imageUrl ? `url(${$imageUrl}) center/cover` : 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 600;
  color: #2f2f2f;
  font-size: 0.9rem;
`;

const ItemQuantity = styled.div`
  color: #666;
  font-size: 0.8rem;
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: #8b4513;
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
  color: #2f2f2f;
`;

const PlaceOrderButton = styled.button`
  width: 100%;
  background: #8b4513;
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
    background: #d2691e;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);
  const cartItems = useAppSelector(selectCartItems) as CartItem[];

  const cartTotal = useAppSelector(selectCartTotal);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    delivery_address: "",
    delivery_instructions: "",
    special_instructions: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "online"
  >("cash");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">(
    "pickup",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const translations = useMemo(
    () => ({
      he: {
        checkoutTitle: "השלמת הזמנה",
        checkoutSubtitle: "הזן את פרטי ההזמנה שלך",
        backToCart: "חזור לעגלה",
        customerInfo: "פרטי לקוח",
        name: "שם מלא",
        phone: "מספר טלפון",
        email: "כתובת אימייל",
        deliveryInfo: "פרטי משלוח",
        deliveryAddress: "כתובת משלוח",
        deliveryInstructions: "הוראות משלוח",
        specialInstructions: "הוראות מיוחדות",
        paymentMethod: "אמצעי תשלום",
        cash: "מזומן",
        card: "כרטיס אשראי",
        online: "תשלום מקוון",
        cashDesc: "תשלום במזומן בעת קבלת ההזמנה",
        cardDesc: "תשלום בכרטיס אשראי בעת קבלת ההזמנה",
        onlineDesc: "תשלום מקוון מאובטח",
        orderSummary: "סיכום הזמנה",
        subtotal: "סכום ביניים",
        deliveryFee: "דמי משלוח",
        total: 'סה"כ',
        placeOrder: "השלמת הזמנה",
        orderPlaced: "ההזמנה הושלמה בהצלחה!",
        requiredField: "שדה זה הוא חובה",
        invalidEmail: "כתובת אימייל לא תקינה",
        invalidPhone: "מספר טלפון לא תקין",
      },
      en: {
        checkoutTitle: "Complete Order",
        checkoutSubtitle: "Enter your order details",
        backToCart: "Back to Cart",
        customerInfo: "Customer Information",
        name: "Full Name",
        phone: "Phone Number",
        email: "Email Address",
        deliveryInfo: "Delivery Information",
        deliveryAddress: "Delivery Address",
        deliveryInstructions: "Delivery Instructions",
        specialInstructions: "Special Instructions",
        paymentMethod: "Payment Method",
        cash: "Cash",
        card: "Credit Card",
        online: "Online Payment",
        cashDesc: "Pay with cash upon delivery",
        cardDesc: "Pay with credit card upon delivery",
        onlineDesc: "Secure online payment",
        orderSummary: "Order Summary",
        subtotal: "Subtotal",
        deliveryFee: "Delivery Fee",
        total: "Total",
        placeOrder: "Place Order",
        orderPlaced: "Order placed successfully!",
        requiredField: "This field is required",
        invalidEmail: "Invalid email address",
        invalidPhone: "Invalid phone number",
      },
    }),
    [],
  );

  const t = useMemo(
    () => translations[language as keyof typeof translations],
    [translations, language],
  );

  const deliveryFee = deliveryMethod === "delivery" ? 15 : 0;
  const finalTotal = cartTotal + deliveryFee;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors["customer_name"] = t.requiredField;
    }

    if (!formData.customer_phone.trim()) {
      newErrors["customer_phone"] = t.requiredField;
    } else if (
      !/^[+]?[1-9][\d]{0,15}$/.test(formData.customer_phone.replace(/\s/g, ""))
    ) {
      newErrors["customer_phone"] = t.invalidPhone;
    }

    if (
      formData.customer_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)
    ) {
      newErrors["customer_email"] = t.invalidEmail;
    }

    if (deliveryMethod === "delivery" && !formData.delivery_address.trim()) {
      newErrors["delivery_address"] = t.requiredField;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // const orderData = {
      //   customer_name: formData.customer_name,
      //   customer_phone: formData.customer_phone,
      //   customer_email: formData.customer_email || undefined,
      //   delivery_method: deliveryMethod,
      //   delivery_address: deliveryMethod === 'delivery' ? formData.delivery_address : undefined,
      //   delivery_instructions: formData.delivery_instructions || undefined,
      //   special_instructions: formData.special_instructions || undefined,
      //   payment_method: paymentMethod,
      //   order_items: cartItems.map(item => ({
      //     product_id: item.id,
      //     product_name: item.name,
      //     quantity: item.quantity,
      //     unit_price: item.price,
      //     total_price: item.price * item.quantity,
      //   })),
      //   subtotal: cartTotal,
      //   delivery_charge: deliveryFee,
      //   total: finalTotal,
      // };

      // Submit order to API (mocked for now)
      // const response = await apiService.createOrder(orderData);

      // Mock successful order creation
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: Math.floor(Math.random() * 10000) + 1000,
          },
        },
      };

      if (mockResponse.data?.success) {
        setSubmitSuccess(true);
        dispatch(clearCart());

        // Redirect to order tracking page after a short delay
        setTimeout(() => {
          navigate(`/order/${mockResponse.data.data.id}`);
        }, 2000);
      }
    } catch (error) {
      // console.error('Error placing order:', error);
      setErrors({ submit: "Failed to place order. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToCart = () => {
    navigate("/cart");
  };

  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <CheckoutContainer>
      <CheckoutContent>
        <CheckoutHeader style={{ position: "relative" }}>
          <BackButton onClick={handleBackToCart}>
            <ArrowLeft size={16} />
            {t.backToCart}
          </BackButton>
          <CheckoutTitle>{t.checkoutTitle}</CheckoutTitle>
          <CheckoutSubtitle>{t.checkoutSubtitle}</CheckoutSubtitle>
        </CheckoutHeader>

        <form onSubmit={handleSubmit}>
          <CheckoutLayout>
            <CheckoutForm>
              <FormSection>
                <SectionTitle>
                  <User size={20} />
                  {t.customerInfo}
                </SectionTitle>
                <FormGrid>
                  <FormGroup>
                    <FormLabel>
                      <User size={16} />
                      {t.name} *
                    </FormLabel>
                    <FormInput
                      type="text"
                      value={formData.customer_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("customer_name", e.target.value)
                      }
                      className={errors["customer_name"] ? "error" : ""}
                    />
                    {errors["customer_name"] && (
                      <ErrorMessage>{errors["customer_name"]}</ErrorMessage>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>
                      <Phone size={16} />
                      {t.phone} *
                    </FormLabel>
                    <FormInput
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("customer_phone", e.target.value)
                      }
                      className={errors["customer_phone"] ? "error" : ""}
                    />
                    {errors["customer_phone"] && (
                      <ErrorMessage>{errors["customer_phone"]}</ErrorMessage>
                    )}
                  </FormGroup>
                </FormGrid>

                <FormGroup style={{ marginTop: "1rem" }}>
                  <FormLabel>
                    <Mail size={16} />
                    {t.email}
                  </FormLabel>
                  <FormInput
                    type="email"
                    value={formData.customer_email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("customer_email", e.target.value)
                    }
                    className={errors["customer_email"] ? "error" : ""}
                  />
                  {errors["customer_email"] && (
                    <ErrorMessage>{errors["customer_email"]}</ErrorMessage>
                  )}
                </FormGroup>
              </FormSection>

              <FormSection>
                <SectionTitle>
                  <MapPin size={20} />
                  {t.deliveryInfo}
                </SectionTitle>

                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="pickup"
                      checked={deliveryMethod === "pickup"}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDeliveryMethod(
                          e.target.value as "pickup" | "delivery",
                        )
                      }
                    />
                    <Truck size={16} />
                    {language === "he" ? "איסוף" : "Pickup"}
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="delivery"
                      checked={deliveryMethod === "delivery"}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDeliveryMethod(
                          e.target.value as "pickup" | "delivery",
                        )
                      }
                    />
                    <Truck size={16} />
                    {language === "he" ? "משלוח" : "Delivery"}
                  </label>
                </div>

                {deliveryMethod === "delivery" && (
                  <FormGroup>
                    <FormLabel>
                      <MapPin size={16} />
                      {t.deliveryAddress} *
                    </FormLabel>
                    <FormInput
                      type="text"
                      value={formData.delivery_address}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("delivery_address", e.target.value)
                      }
                      className={errors["delivery_address"] ? "error" : ""}
                    />
                    {errors["delivery_address"] && (
                      <ErrorMessage>{errors["delivery_address"]}</ErrorMessage>
                    )}
                  </FormGroup>
                )}

                <FormGroup>
                  <FormLabel>{t.deliveryInstructions}</FormLabel>
                  <FormTextarea
                    value={formData.delivery_instructions}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleInputChange("delivery_instructions", e.target.value)
                    }
                    placeholder={t.deliveryInstructions}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>{t.specialInstructions}</FormLabel>
                  <FormTextarea
                    value={formData.special_instructions}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleInputChange("special_instructions", e.target.value)
                    }
                    placeholder={t.specialInstructions}
                  />
                </FormGroup>
              </FormSection>

              <FormSection>
                <SectionTitle>
                  <CreditCard size={20} />
                  {t.paymentMethod}
                </SectionTitle>

                <PaymentOptions>
                  <PaymentOption selected={paymentMethod === "cash"}>
                    <PaymentOptionInput
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPaymentMethod(
                          e.target.value as "cash" | "card" | "online",
                        )
                      }
                    />
                    <Banknote size={20} />
                    <PaymentOptionContent>
                      <PaymentOptionTitle>{t.cash}</PaymentOptionTitle>
                      <PaymentOptionDescription>
                        {t.cashDesc}
                      </PaymentOptionDescription>
                    </PaymentOptionContent>
                  </PaymentOption>

                  <PaymentOption selected={paymentMethod === "card"}>
                    <PaymentOptionInput
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPaymentMethod(
                          e.target.value as "cash" | "card" | "online",
                        )
                      }
                    />
                    <CreditCard size={20} />
                    <PaymentOptionContent>
                      <PaymentOptionTitle>{t.card}</PaymentOptionTitle>
                      <PaymentOptionDescription>
                        {t.cardDesc}
                      </PaymentOptionDescription>
                    </PaymentOptionContent>
                  </PaymentOption>

                  <PaymentOption selected={paymentMethod === "online"}>
                    <PaymentOptionInput
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPaymentMethod(
                          e.target.value as "cash" | "card" | "online",
                        )
                      }
                    />
                    <Lock size={20} />
                    <PaymentOptionContent>
                      <PaymentOptionTitle>{t.online}</PaymentOptionTitle>
                      <PaymentOptionDescription>
                        {t.onlineDesc}
                      </PaymentOptionDescription>
                    </PaymentOptionContent>
                  </PaymentOption>
                </PaymentOptions>
              </FormSection>
            </CheckoutForm>

            <OrderSummary>
              <SummaryTitle>{t.orderSummary}</SummaryTitle>

              <OrderItems>
                {cartItems.map((item) => (
                  <OrderItem key={item.id}>
                    <ItemInfo>
                      <ItemImage $imageUrl={item.image} />
                      <ItemDetails>
                        <ItemName>{item.name}</ItemName>
                        <ItemQuantity>Qty: {item.quantity}</ItemQuantity>
                      </ItemDetails>
                    </ItemInfo>
                    <ItemPrice>₪{item.price * item.quantity}</ItemPrice>
                  </OrderItem>
                ))}
              </OrderItems>

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

              {submitSuccess && (
                <SuccessMessage>
                  <CheckCircle size={16} />
                  {t.orderPlaced}
                </SuccessMessage>
              )}

              {errors["submit"] && (
                <ErrorMessage>{errors["submit"]}</ErrorMessage>
              )}

              <PlaceOrderButton type="submit" disabled={isSubmitting}>
                <Lock size={20} />
                {isSubmitting ? "Processing..." : t.placeOrder}
              </PlaceOrderButton>
            </OrderSummary>
          </CheckoutLayout>
        </form>
      </CheckoutContent>
    </CheckoutContainer>
  );
};

export default CheckoutPage;
