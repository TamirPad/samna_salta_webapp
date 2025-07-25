import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAppSelector } from '../hooks/redux';
import { selectLanguage } from '../features/language/languageSlice';

const HomeContainer = styled.div`
  min-height: 100vh;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }

  @media (max-width: 768px) {
    padding: 2rem 0;
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const HeroButtons = styled(motion.div)`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const FeaturesSection = styled.section`
  padding: 4rem 0;
  background: #FFF8DC;

  @media (max-width: 768px) {
    padding: 2rem 0;
  }
`;

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #2F2F2F;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FeatureCard = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #8B4513;
  }

  p {
    color: #666;
    line-height: 1.6;
  }
`;

const ProductsSection = styled.section`
  padding: 4rem 0;
  background: white;

  @media (max-width: 768px) {
    padding: 2rem 0;
  }
`;

const ProductsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
`;

const ProductCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .product-image {
    width: 100%;
    height: 200px;
    background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
  }

  .product-info {
    padding: 1.5rem;

    h3 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      color: #2F2F2F;
    }

    p {
      color: #666;
      margin-bottom: 1rem;
    }

    .price {
      font-size: 1.5rem;
      font-weight: 600;
      color: #8B4513;
    }
  }
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background: #8B4513;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: #D2691E;
    transform: translateY(-2px);
  }
`;

const HomePage: React.FC = () => {
  const language = useAppSelector(selectLanguage);

  const translations = useMemo(() => ({
    he: {
      heroTitle: 'ברוכים הבאים לסמנה סלטה',
      heroSubtitle: 'המאפייה הטובה ביותר בעיר עם מגוון רחב של לחמים טריים ומתוקים',
      viewMenu: 'צפה בתפריט',
      orderNow: 'הזמן עכשיו',
      featuresTitle: 'למה לבחור בנו?',
      freshBread: 'לחם טרי',
      freshBreadDesc: 'כל הלחמים שלנו נאפים טריים כל יום עם המרכיבים האיכותיים ביותר',
      traditionalRecipes: 'מתכונים מסורתיים',
      traditionalRecipesDesc: 'אנו משתמשים במתכונים מסורתיים שעברו מדור לדור',
      fastDelivery: 'משלוח מהיר',
      fastDeliveryDesc: 'משלוח מהיר ואמין לכל רחבי העיר תוך 30 דקות',
      productsTitle: 'המוצרים שלנו',
      kubaneh: 'כובאנה',
      kubanehDesc: 'לחם תימני מסורתי עם טעם ייחודי',
      samneh: 'סמנה',
      samnehDesc: 'חמאה מזוקקת מסורתית',
      redBisbas: 'ביסבוס אדום',
      redBisbasDesc: 'תבלין תימני מסורתי',
      hilbeh: 'חילבה',
      hilbehDesc: 'תבלין תימני מסורתי',
      price: '₪',
    },
    en: {
      heroTitle: 'Welcome to Samna Salta',
      heroSubtitle: 'The best bakery in town with a wide variety of fresh breads and pastries',
      viewMenu: 'View Menu',
      orderNow: 'Order Now',
      featuresTitle: 'Why Choose Us?',
      freshBread: 'Fresh Bread',
      freshBreadDesc: 'All our breads are baked fresh daily with the finest ingredients',
      traditionalRecipes: 'Traditional Recipes',
      traditionalRecipesDesc: 'We use traditional recipes passed down from generation to generation',
      fastDelivery: 'Fast Delivery',
      fastDeliveryDesc: 'Fast and reliable delivery throughout the city within 30 minutes',
      productsTitle: 'Our Products',
      kubaneh: 'Kubaneh',
      kubanehDesc: 'Traditional Yemenite bread with unique flavor',
      samneh: 'Samneh',
      samnehDesc: 'Traditional clarified butter',
      redBisbas: 'Red Bisbas',
      redBisbasDesc: 'Traditional Yemenite spice',
      hilbeh: 'Hilbeh',
      hilbehDesc: 'Traditional Yemenite spice',
      price: '$',
    }
  }), []);

  const t = useMemo(() => translations[language as keyof typeof translations], [translations, language]);

  const features = useMemo(() => [
    {
      icon: '🍞',
      title: t.freshBread,
      description: t.freshBreadDesc,
    },
    {
      icon: '👨‍🍳',
      title: t.traditionalRecipes,
      description: t.traditionalRecipesDesc,
    },
    {
      icon: '🚚',
      title: t.fastDelivery,
      description: t.fastDeliveryDesc,
    },
  ], [t]);

  const products = useMemo(() => [
    {
      icon: '🍞',
      name: t.kubaneh,
      description: t.kubanehDesc,
      price: '25',
    },
    {
      icon: '🧈',
      name: t.samneh,
      description: t.samnehDesc,
      price: '15',
    },
    {
      icon: '🌶️',
      name: t.redBisbas,
      description: t.redBisbasDesc,
      price: '12',
    },
    {
      icon: '🌿',
      name: t.hilbeh,
      description: t.hilbehDesc,
      price: '10',
    },
  ], [t]);

  return (
    <HomeContainer>
      <HeroSection>
        <HeroContent>
          <HeroTitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {t.heroTitle}
          </HeroTitle>
          <HeroSubtitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t.heroSubtitle}
          </HeroSubtitle>
          <HeroButtons
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <CTAButton to="/menu">{t.viewMenu}</CTAButton>
            <CTAButton to="/cart">{t.orderNow}</CTAButton>
          </HeroButtons>
        </HeroContent>
      </HeroSection>

      <FeaturesSection>
        <FeaturesContainer>
          <SectionTitle>{t.featuresTitle}</SectionTitle>
          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </FeaturesContainer>
      </FeaturesSection>

      <ProductsSection>
        <ProductsContainer>
          <SectionTitle>{t.productsTitle}</SectionTitle>
          <ProductsGrid>
            {products.map((product, index) => (
              <ProductCard
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="product-image">{product.icon}</div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="price">{t.price}{product.price}</div>
                </div>
              </ProductCard>
            ))}
          </ProductsGrid>
        </ProductsContainer>
      </ProductsSection>
    </HomeContainer>
  );
};

export default HomePage; 