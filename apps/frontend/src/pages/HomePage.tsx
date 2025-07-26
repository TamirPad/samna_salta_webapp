import React, { useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAppSelector } from '../hooks/redux';
import { selectLanguage } from '../features/language/languageSlice';

// Types
interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Product {
  icon: string;
  name: string;
  description: string;
  price: string;
}

// Styled Components
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

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
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
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #D2691E;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
  }

  &:focus {
    outline: 2px solid #FFF8DC;
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 300px;
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

  @media (max-width: 480px) {
    font-size: 1.75rem;
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

const FeatureCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  &:focus-within {
    outline: 2px solid #8B4513;
    outline-offset: 2px;
  }

  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    display: block;
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

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  &:focus-within {
    outline: 2px solid #8B4513;
    outline-offset: 2px;
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
      line-height: 1.5;
    }

    .price {
      font-size: 1.5rem;
      font-weight: 600;
      color: #8B4513;
    }
  }
`;

const SkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 6px;
  background: #8B4513;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1001;
  font-weight: 500;
  transition: top 0.3s ease;

  &:focus {
    top: 6px;
  }
`;

const HomePage: React.FC = () => {
  const language = useAppSelector(selectLanguage);

  // Memoized translations
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

  // Memoized features data
  const features = useMemo((): Feature[] => [
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

  // Memoized products data
  const products = useMemo((): Product[] => [
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

  // Memoized handlers with useCallback
  const handleFeatureClick = useCallback((feature: Feature): void => {
    // TODO: Implement analytics tracking or navigation logic
  }, []);

  const handleProductClick = useCallback((product: Product): void => {
    // TODO: Navigate to menu or product detail
  }, []);

  // Memoized animation variants
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }), []);

  return (
    <HomeContainer>
      <SkipLink href="#main-content">
        {language === 'he' ? 'דלג לתוכן הראשי' : 'Skip to main content'}
      </SkipLink>

      <HeroSection>
        <HeroContent>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <HeroTitle>{t.heroTitle}</HeroTitle>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <HeroSubtitle>{t.heroSubtitle}</HeroSubtitle>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <HeroButtons>
              <CTAButton to="/menu" aria-label={t.viewMenu}>
                {t.viewMenu}
              </CTAButton>
              <CTAButton to="/cart" aria-label={t.orderNow}>
                {t.orderNow}
              </CTAButton>
            </HeroButtons>
          </motion.div>
        </HeroContent>
      </HeroSection>

      <FeaturesSection id="main-content">
        <FeaturesContainer>
          <SectionTitle>{t.featuresTitle}</SectionTitle>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <FeaturesGrid>
              {features.map((feature, index) => (
                <motion.div
                  key={`feature-${feature.title}`}
                  variants={itemVariants}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <FeatureCard
                    onClick={(): void => handleFeatureClick(feature)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Learn more about ${feature.title}`}
                    onKeyDown={(e): void => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleFeatureClick(feature);
                      }
                    }}
                  >
                    <span className="icon" role="img" aria-label={feature.title}>
                      {feature.icon}
                    </span>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </FeatureCard>
                </motion.div>
              ))}
            </FeaturesGrid>
          </motion.div>
        </FeaturesContainer>
      </FeaturesSection>

      <ProductsSection>
        <ProductsContainer>
          <SectionTitle>{t.productsTitle}</SectionTitle>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <ProductsGrid>
              {products.map((product, index) => (
                <motion.div
                  key={`product-${product.name}`}
                  variants={itemVariants}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ProductCard
                    onClick={(): void => handleProductClick(product)}
                    tabIndex={0}
                    role="button"
                    aria-label={`View ${product.name} - ${t.price}${product.price}`}
                    onKeyDown={(e): void => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleProductClick(product);
                      }
                    }}
                  >
                    <div className="product-image" role="img" aria-label={product.name}>
                      {product.icon}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <div className="price">{t.price}{product.price}</div>
                    </div>
                  </ProductCard>
                </motion.div>
              ))}
            </ProductsGrid>
          </motion.div>
        </ProductsContainer>
      </ProductsSection>
    </HomeContainer>
  );
};

export default React.memo(HomePage); 