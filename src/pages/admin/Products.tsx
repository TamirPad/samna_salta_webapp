import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit, Trash2, Eye, Package, DollarSign, Clock } from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import { selectLanguage } from '../../features/language/languageSlice';

const ProductsContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;
`;

const ProductsContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const ProductsHeader = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const ProductsTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2F2F2F;
  margin-bottom: 0.5rem;
`;

const ProductsSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
`;

const ProductsActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  @media (max-width: 768px) {
    max-width: none;
  }
`;

const SearchField = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #8B4513;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  size: 20px;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #8B4513;
    background: #f8f9fa;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #8B4513;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease;

  &:hover {
    background: #D2691E;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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

const ProductImage = styled.div<{ emoji?: string }>`
  width: 100%;
  height: 200px;
  background: ${props => props.emoji 
    ? 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)'
    : 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: white;
  position: relative;
`;

const ProductStatus = styled.span<{ active: boolean }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${props => props.active ? '#28a745' : '#dc3545'};
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
  margin-bottom: 1rem;
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

const ProductActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  flex: 1;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #8B4513;
          color: white;
          &:hover { background: #D2691E; }
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
        return `
          background: #e9ecef;
          color: #495057;
          &:hover { background: #dee2e6; }
        `;
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const AdminProducts: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const translations = useMemo(() => ({
    he: {
      title: 'ניהול מוצרים',
      subtitle: 'נהל את המוצרים שלך, הוסף חדשים ועדכן קיימים',
      searchPlaceholder: 'חפש מוצרים...',
      filter: 'פילטר',
      addProduct: 'הוסף מוצר',
      active: 'פעיל',
      inactive: 'לא פעיל',
      view: 'צפה',
      edit: 'ערוך',
      delete: 'מחק',
      noProducts: 'לא נמצאו מוצרים',
      noProductsDesc: 'הוסף מוצרים חדשים כדי להתחיל',
      category: 'קטגוריה',
      price: 'מחיר',
      prepTime: 'זמן הכנה',
      minutes: 'דקות',
    },
    en: {
      title: 'Product Management',
      subtitle: 'Manage your products, add new ones and update existing ones',
      searchPlaceholder: 'Search products...',
      filter: 'Filter',
      addProduct: 'Add Product',
      active: 'Active',
      inactive: 'Inactive',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      noProducts: 'No products found',
      noProductsDesc: 'Add new products to get started',
      category: 'Category',
      price: 'Price',
      prepTime: 'Prep Time',
      minutes: 'min',
    }
  }), []);

  const t = translations[language as keyof typeof translations];

  // Mock products data
  const mockProducts = useMemo(() => [
    {
      id: '1',
      name: 'Kubaneh',
      name_en: 'Kubaneh',
      name_he: 'כובאנה',
      price: 25,
      category: 'breads',
      category_en: 'Breads',
      category_he: 'לחמים',
      emoji: '🍞',
      preparation_time: 30,
      is_active: true,
    },
    {
      id: '2',
      name: 'Samneh',
      name_en: 'Samneh',
      name_he: 'סמנה',
      price: 15,
      category: 'dairy',
      category_en: 'Dairy',
      category_he: 'מוצרי חלב',
      emoji: '🧈',
      preparation_time: 15,
      is_active: true,
    },
    {
      id: '3',
      name: 'Red Bisbas',
      name_en: 'Red Bisbas',
      name_he: 'ביסבוס אדום',
      price: 12,
      category: 'spices',
      category_en: 'Spices',
      category_he: 'תבלינים',
      emoji: '🌶️',
      preparation_time: 5,
      is_active: false,
    },
    {
      id: '4',
      name: 'Hilbeh',
      name_en: 'Hilbeh',
      name_he: 'חילבה',
      price: 10,
      category: 'spices',
      category_en: 'Spices',
      category_he: 'תבלינים',
      emoji: '🌿',
      preparation_time: 5,
      is_active: true,
    },
    {
      id: '5',
      name: 'Jachnun',
      name_en: 'Jachnun',
      name_he: 'ג\'חנון',
      price: 20,
      category: 'pastries',
      category_en: 'Pastries',
      category_he: 'מאפים',
      emoji: '🥐',
      preparation_time: 45,
      is_active: true,
    },
    {
      id: '6',
      name: 'Malawach',
      name_en: 'Malawach',
      name_he: 'מלאווח',
      price: 18,
      category: 'breads',
      category_en: 'Breads',
      category_he: 'לחמים',
      emoji: '🥖',
      preparation_time: 25,
      is_active: true,
    },
  ], []);

  const categories = useMemo(() => [
    { id: 'all', name: language === 'he' ? 'כל הקטגוריות' : 'All Categories' },
    { id: 'breads', name: language === 'he' ? 'לחמים' : 'Breads' },
    { id: 'pastries', name: language === 'he' ? 'מאפים' : 'Pastries' },
    { id: 'dairy', name: language === 'he' ? 'מוצרי חלב' : 'Dairy' },
    { id: 'spices', name: language === 'he' ? 'תבלינים' : 'Spices' },
  ], [language]);

  const filteredProducts = useMemo(() => {
    let filtered = mockProducts;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        (product.name_en && product.name_en.toLowerCase().includes(query)) ||
        (product.name_he && product.name_he.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [mockProducts, selectedCategory, searchQuery]);

  const getProductName = (product: any) => {
    return language === 'he' ? product.name_he : product.name_en || product.name;
  };

  const getCategoryName = (category: any) => {
    return language === 'he' ? category.name_he : category.name_en || category.name;
  };

  const handleAddProduct = () => {
    // TODO: Implement add product functionality
    console.log('Add product clicked');
  };

  const handleViewProduct = (productId: string) => {
    // TODO: Implement view product functionality
    console.log('View product:', productId);
  };

  const handleEditProduct = (productId: string) => {
    // TODO: Implement edit product functionality
    console.log('Edit product:', productId);
  };

  const handleDeleteProduct = (productId: string) => {
    // TODO: Implement delete product functionality
    console.log('Delete product:', productId);
  };

  return (
    <ProductsContainer>
      <ProductsContent>
        <ProductsHeader>
          <ProductsTitle>{t.title}</ProductsTitle>
          <ProductsSubtitle>{t.subtitle}</ProductsSubtitle>
          
          <ProductsActions>
            <SearchInput>
              <SearchIcon size={20} />
              <SearchField
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchInput>
            
            <FilterButton>
              <Filter size={16} />
              {t.filter}
            </FilterButton>
            
            <AddButton onClick={handleAddProduct}>
              <Plus size={16} />
              {t.addProduct}
            </AddButton>
          </ProductsActions>
        </ProductsHeader>

        {filteredProducts.length > 0 ? (
          <ProductsGrid>
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ProductImage emoji={product.emoji}>
                  <span style={{ fontSize: '4rem' }}>{product.emoji}</span>
                  <ProductStatus active={product.is_active}>
                    {product.is_active ? t.active : t.inactive}
                  </ProductStatus>
                </ProductImage>
                
                <ProductInfo>
                  <ProductHeader>
                    <ProductName>{getProductName(product)}</ProductName>
                    <ProductPrice>₪{product.price}</ProductPrice>
                  </ProductHeader>
                  
                  <ProductMeta>
                    <MetaItem>
                      <Package size={14} />
                      {getCategoryName({ name_en: product.category_en, name_he: product.category_he })}
                    </MetaItem>
                    <MetaItem>
                      <Clock size={14} />
                      {product.preparation_time} {t.minutes}
                    </MetaItem>
                  </ProductMeta>
                  
                  <ProductActions>
                    <ActionButton onClick={() => handleViewProduct(product.id)}>
                      <Eye size={14} />
                      {t.view}
                    </ActionButton>
                    <ActionButton variant="secondary" onClick={() => handleEditProduct(product.id)}>
                      <Edit size={14} />
                      {t.edit}
                    </ActionButton>
                    <ActionButton variant="danger" onClick={() => handleDeleteProduct(product.id)}>
                      <Trash2 size={14} />
                      {t.delete}
                    </ActionButton>
                  </ProductActions>
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
      </ProductsContent>
    </ProductsContainer>
  );
};

export default AdminProducts; 