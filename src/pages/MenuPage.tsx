import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, Clock, Filter } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { selectLanguage } from '../features/language/languageSlice';
import { addToCart } from '../features/cart/cartSlice';
import { selectProducts, selectProductsLoading } from '../features/products/productsSlice';
import { apiService } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const MenuContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;

  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

const MenuHeader = styled.div`
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  color: white;
  padding: 3rem 0;
  text-align: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    padding: 2rem 0;
  }
`;

const MenuTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const MenuSubtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const MenuContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

const FilterSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const CategoryFilter = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const CategoryButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: 2px solid ${props => props.active ? '#8B4513' : '#e0e0e0'};
  background: ${props => props.active ? '#8B4513' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    border-color: #8B4513;
    background: ${props => props.active ? '#8B4513' : '#f8f9fa'};
  }
`;

const SearchInput = styled.input`
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  outline: none;
  transition: border-color 0.3s ease;
  min-width: 200px;

  &:focus {
    border-color: #8B4513;
  }

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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
`;

const ProductImage = styled.div<{ imageUrl?: string }>`
  width: 100%;
  height: 200px;
  background: ${props => props.imageUrl 
    ? `url(${props.imageUrl}) center/cover` 
    : 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  position: relative;
`;

const ProductBadge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #ff6b6b;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const ProductInfo = styled.div`
  padding: 1.5rem;
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const ProductName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2F2F2F;
  margin: 0;
  flex: 1;
`;

const ProductPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #8B4513;
  margin-left: 1rem;
`;

const ProductDescription = styled.p`
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const ProductMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #888;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const AddToCartButton = styled.button`
  width: 100%;
  background: #8B4513;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const MenuPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);
  const products = useAppSelector(selectProducts);
  const isLoading = useAppSelector(selectProductsLoading);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string; name_en?: string; name_he?: string }>>([]);

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          apiService.getProducts(),
          apiService.getCategories()
        ]);
        
        // Handle the responses here when API is ready
        console.log('Products:', productsResponse);
        console.log('Categories:', categoriesResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const translations = useMemo(() => ({
    he: {
      menuTitle: 'תפריט סמנה סלטה',
      menuSubtitle: 'גלה את המגוון הרחב שלנו של לחמים ומתוקים מסורתיים',
      allCategories: 'כל הקטגוריות',
      searchPlaceholder: 'חפש מוצרים...',
      addToCart: 'הוסף לעגלה',
      preparationTime: 'זמן הכנה',
      minutes: 'דקות',
      new: 'חדש',
      popular: 'פופולרי',
      noProducts: 'לא נמצאו מוצרים',
      noProductsDesc: 'נסה לשנות את הפילטרים שלך או לחפש משהו אחר',
    },
    en: {
      menuTitle: 'Samna Salta Menu',
      menuSubtitle: 'Discover our wide variety of traditional breads and pastries',
      allCategories: 'All Categories',
      searchPlaceholder: 'Search products...',
      addToCart: 'Add to Cart',
      preparationTime: 'Prep time',
      minutes: 'min',
      new: 'New',
      popular: 'Popular',
      noProducts: 'No products found',
      noProductsDesc: 'Try changing your filters or search for something else',
    }
  }), []);

  const t = useMemo(() => translations[language as keyof typeof translations], [translations, language]);

  // Mock data for development
  const mockProducts = useMemo(() => [
    {
      id: '1',
      name: 'Kubaneh',
      name_en: 'Kubaneh',
      name_he: 'כובאנה',
      description: 'Traditional Yemenite bread baked overnight with a unique flavor and texture',
      description_en: 'Traditional Yemenite bread baked overnight with a unique flavor and texture',
      description_he: 'לחם תימני מסורתי שנאפה במשך הלילה עם טעם ומרקם ייחודיים',
      price: 25,
      category: 'breads',
      category_en: 'Breads',
      category_he: 'לחמים',
      image: '/images/kubaneh.jpg',
      preparation_time: 30,
      is_new: true,
      is_popular: true,
      available: true,
    },
    {
      id: '2',
      name: 'Samneh',
      name_en: 'Samneh',
      name_he: 'סמנה',
      description: 'Traditional clarified butter made from sheep or goat milk',
      description_en: 'Traditional clarified butter made from sheep or goat milk',
      description_he: 'חמאה מזוקקת מסורתית העשויה מחלב כבשים או עזים',
      price: 15,
      category: 'dairy',
      category_en: 'Dairy',
      category_he: 'מוצרי חלב',
      image: '/images/samneh.jpg',
      preparation_time: 15,
      is_new: false,
      is_popular: true,
      available: true,
    },
    {
      id: '3',
      name: 'Red Bisbas',
      name_en: 'Red Bisbas',
      name_he: 'ביסבוס אדום',
      description: 'Traditional Yemenite spice blend with a rich, aromatic flavor',
      description_en: 'Traditional Yemenite spice blend with a rich, aromatic flavor',
      description_he: 'תערובת תבלינים תימנית מסורתית עם טעם עשיר וארומטי',
      price: 12,
      category: 'spices',
      category_en: 'Spices',
      category_he: 'תבלינים',
      image: '/images/red-bisbas.jpg',
      preparation_time: 5,
      is_new: false,
      is_popular: false,
      available: true,
    },
    {
      id: '4',
      name: 'Hilbeh',
      name_en: 'Hilbeh',
      name_he: 'חילבה',
      description: 'Traditional Yemenite spice made from fenugreek seeds',
      description_en: 'Traditional Yemenite spice made from fenugreek seeds',
      description_he: 'תבלין תימני מסורתי העשוי מזרעי חילבה',
      price: 10,
      category: 'spices',
      category_en: 'Spices',
      category_he: 'תבלינים',
      image: '/images/hilbeh.jpg',
      preparation_time: 5,
      is_new: true,
      is_popular: false,
      available: true,
    },
    {
      id: '5',
      name: 'Jachnun',
      name_en: 'Jachnun',
      name_he: 'ג\'חנון',
      description: 'Traditional Yemenite pastry made from rolled dough',
      description_en: 'Traditional Yemenite pastry made from rolled dough',
      description_he: 'מאפה תימני מסורתי העשוי מבצק מגולגל',
      price: 20,
      category: 'pastries',
      category_en: 'Pastries',
      category_he: 'מאפים',
      image: '/images/jachnun.jpg',
      preparation_time: 45,
      is_new: false,
      is_popular: true,
      available: true,
    },
    {
      id: '6',
      name: 'Malawach',
      name_en: 'Malawach',
      name_he: 'מלאווח',
      description: 'Traditional Yemenite flatbread with flaky layers',
      description_en: 'Traditional Yemenite flatbread with flaky layers',
      description_he: 'לחם שטוח תימני מסורתי עם שכבות מתפוררות',
      price: 18,
      category: 'breads',
      category_en: 'Breads',
      category_he: 'לחמים',
      image: '/images/malawach.jpg',
      preparation_time: 25,
      is_new: false,
      is_popular: true,
      available: true,
    },
  ], []);

  const mockCategories = useMemo(() => [
    { id: 'all', name: t.allCategories, name_en: t.allCategories, name_he: t.allCategories },
    { id: 'breads', name: 'Breads', name_en: 'Breads', name_he: 'לחמים' },
    { id: 'pastries', name: 'Pastries', name_en: 'Pastries', name_he: 'מאפים' },
    { id: 'dairy', name: 'Dairy', name_en: 'Dairy', name_he: 'מוצרי חלב' },
    { id: 'spices', name: 'Spices', name_en: 'Spices', name_he: 'תבלינים' },
  ], [t.allCategories]);

  // Filter products based on category and search
  const filteredProducts = useMemo(() => {
    let filtered = mockProducts;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.name_en && product.name_en.toLowerCase().includes(query)) ||
        (product.name_he && product.name_he.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [mockProducts, selectedCategory, searchQuery]);

  const handleAddToCart = (product: any) => {
    dispatch(addToCart({
      id: product.id,
      name: language === 'he' ? product.name_he : product.name_en || product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      category: language === 'he' ? product.category_he : product.category_en || product.category,
    }));
  };

  const getProductName = (product: any) => {
    return language === 'he' ? product.name_he : product.name_en || product.name;
  };

  const getProductDescription = (product: any) => {
    return language === 'he' ? product.description_he : product.description_en || product.description;
  };

  const getCategoryName = (category: any) => {
    return language === 'he' ? category.name_he : category.name_en || category.name;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <MenuContainer>
      <MenuHeader>
        <MenuTitle>{t.menuTitle}</MenuTitle>
        <MenuSubtitle>{t.menuSubtitle}</MenuSubtitle>
      </MenuHeader>

      <MenuContent>
        <FilterSection>
          <CategoryFilter>
            {mockCategories.map(category => (
              <CategoryButton
                key={category.id}
                active={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
              >
                {getCategoryName(category)}
              </CategoryButton>
            ))}
          </CategoryFilter>
          
          <SearchInput
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </FilterSection>

        <AnimatePresence mode="wait">
          {filteredProducts.length > 0 ? (
            <ProductsGrid>
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ProductImage imageUrl={product.image}>
                    {product.is_new && <ProductBadge>{t.new}</ProductBadge>}
                    {product.is_popular && <ProductBadge>{t.popular}</ProductBadge>}
                  </ProductImage>
                  
                  <ProductInfo>
                    <ProductHeader>
                      <ProductName>{getProductName(product)}</ProductName>
                      <ProductPrice>₪{product.price}</ProductPrice>
                    </ProductHeader>
                    
                    <ProductDescription>{getProductDescription(product)}</ProductDescription>
                    
                    <ProductMeta>
                      <MetaItem>
                        <Clock size={14} />
                        {product.preparation_time} {t.minutes}
                      </MetaItem>
                    </ProductMeta>
                    
                    <AddToCartButton
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.available}
                    >
                      <ShoppingCart size={16} />
                      {t.addToCart}
                    </AddToCartButton>
                  </ProductInfo>
                </ProductCard>
              ))}
            </ProductsGrid>
          ) : (
            <EmptyState>
              <h3>{t.noProducts}</h3>
              <p>{t.noProductsDesc}</p>
            </EmptyState>
          )}
        </AnimatePresence>
      </MenuContent>
    </MenuContainer>
  );
};

export default MenuPage; 