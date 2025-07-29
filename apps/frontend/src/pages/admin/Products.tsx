import React, { useState, useMemo, useCallback } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Package,
  Filter,
} from "lucide-react";
import { useAppSelector } from "../../hooks/redux";
import { selectLanguage } from "../../features/language/languageSlice";
import { debounce } from "../../utils/performance";

// Types
interface Product {
  id: string;
  name: string;
  name_en?: string;
  name_he?: string;
  price: number;
  category: string;
  category_en?: string;
  category_he?: string;
  emoji?: string;
  preparation_time: number;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  name_en?: string;
  name_he?: string;
}

// Styled Components
const ProductsContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;

  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

const ProductsContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

const ProductsHeader = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const ProductsTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2f2f2f;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`;

const ProductsSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.5;
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
  font-size: 1rem;

  &:focus {
    border-color: #8b4513;
    box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  width: 1rem;
  height: 1rem;
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
  font-weight: 500;
  min-height: 44px;

  &:hover {
    border-color: #8b4513;
    background: #f8f9fa;
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid #8b4513;
    outline-offset: 2px;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #8b4513;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
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
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  &:focus-within {
    outline: 2px solid #8b4513;
    outline-offset: 2px;
  }
`;

const ProductImage = styled.div<{ emoji?: string }>`
  width: 100%;
  height: 200px;
  background: ${(props) =>
    props.emoji
      ? "linear-gradient(135deg, #8B4513 0%, #D2691E 100%)"
      : "linear-gradient(135deg, #8B4513 0%, #D2691E 100%)"};
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
  background: ${(props) => (props.active ? "#28a745" : "#dc3545")};
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
  color: #2f2f2f;
  margin: 0;
  flex: 1;
  line-height: 1.3;
`;

const ProductPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #8b4513;
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

const ActionButton = styled.button<{
  variant?: "primary" | "secondary" | "danger";
}>`
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
  min-height: 44px;

  ${(props) => {
    switch (props.variant) {
      case "primary":
        return `
          background: #8B4513;
          color: white;
          &:hover { 
            background: #D2691E; 
            transform: translateY(-1px);
          }
          &:focus {
            outline: 2px solid #FFF8DC;
            outline-offset: 2px;
          }
        `;
      case "secondary":
        return `
          background: #6c757d;
          color: white;
          &:hover { 
            background: #5a6268; 
            transform: translateY(-1px);
          }
          &:focus {
            outline: 2px solid #FFF8DC;
            outline-offset: 2px;
          }
        `;
      case "danger":
        return `
          background: #dc3545;
          color: white;
          &:hover { 
            background: #c82333; 
            transform: translateY(-1px);
          }
          &:focus {
            outline: 2px solid #FFF8DC;
            outline-offset: 2px;
          }
        `;
      default:
        return `
          background: #e9ecef;
          color: #495057;
          &:hover { 
            background: #dee2e6; 
            transform: translateY(-1px);
          }
          &:focus {
            outline: 2px solid #8B4513;
            outline-offset: 2px;
          }
        `;
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const ResultsCount = styled.div`
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
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

const AdminProducts: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory] = useState("all");
  const [error, setError] = useState<string>("");

  // Memoized translations
  const translations = useMemo(
    () => ({
      he: {
        title: "ניהול מוצרים",
        subtitle: "נהל את המוצרים שלך, הוסף חדשים ועדכן קיימים",
        searchPlaceholder: "חפש מוצרים...",
        filter: "פילטר",
        addProduct: "הוסף מוצר",
        active: "פעיל",
        inactive: "לא פעיל",
        view: "צפה",
        edit: "ערוך",
        delete: "מחק",
        noProducts: "לא נמצאו מוצרים",
        noProductsDesc: "הוסף מוצרים חדשים כדי להתחיל",
        category: "קטגוריה",
        price: "מחיר",
        prepTime: "זמן הכנה",
        minutes: "דקות",
        resultsCount: "נמצאו {count} מוצרים",
        errorOccurred: "אירעה שגיאה",
        confirmDelete: "האם אתה בטוח שברצונך למחוק מוצר זה?",
      },
      en: {
        title: "Product Management",
        subtitle: "Manage your products, add new ones and update existing ones",
        searchPlaceholder: "Search products...",
        filter: "Filter",
        addProduct: "Add Product",
        active: "Active",
        inactive: "Inactive",
        view: "View",
        edit: "Edit",
        delete: "Delete",
        noProducts: "No products found",
        noProductsDesc: "Add new products to get started",
        category: "Category",
        price: "Price",
        prepTime: "Prep Time",
        minutes: "min",
        resultsCount: "Found {count} products",
        errorOccurred: "An error occurred",
        confirmDelete: "Are you sure you want to delete this product?",
      },
    }),
    [],
  );

  const t = useMemo(
    () => translations[language as keyof typeof translations],
    [translations, language],
  );

  // Memoized mock products data
  const mockProducts = useMemo(
    (): Product[] => [
      {
        id: "1",
        name: "Kubaneh",
        name_en: "Kubaneh",
        name_he: "כובאנה",
        price: 25,
        category: "breads",
        category_en: "Breads",
        category_he: "לחמים",
        emoji: "🍞",
        preparation_time: 30,
        is_active: true,
      },
      {
        id: "2",
        name: "Samneh",
        name_en: "Samneh",
        name_he: "סמנה",
        price: 15,
        category: "dairy",
        category_en: "Dairy",
        category_he: "מוצרי חלב",
        emoji: "🧈",
        preparation_time: 15,
        is_active: true,
      },
      {
        id: "3",
        name: "Red Bisbas",
        name_en: "Red Bisbas",
        name_he: "ביסבוס אדום",
        price: 12,
        category: "spices",
        category_en: "Spices",
        category_he: "תבלינים",
        emoji: "🌶️",
        preparation_time: 5,
        is_active: false,
      },
      {
        id: "4",
        name: "Hilbeh",
        name_en: "Hilbeh",
        name_he: "חילבה",
        price: 10,
        category: "spices",
        category_en: "Spices",
        category_he: "תבלינים",
        emoji: "🌿",
        preparation_time: 5,
        is_active: true,
      },
      {
        id: "5",
        name: "Jachnun",
        name_en: "Jachnun",
        name_he: "ג'חנון",
        price: 20,
        category: "pastries",
        category_en: "Pastries",
        category_he: "מאפים",
        emoji: "🥐",
        preparation_time: 45,
        is_active: true,
      },
      {
        id: "6",
        name: "Malawach",
        name_en: "Malawach",
        name_he: "מלאווח",
        price: 18,
        category: "breads",
        category_en: "Breads",
        category_he: "לחמים",
        emoji: "🥖",
        preparation_time: 25,
        is_active: true,
      },
    ],
    [],
  );

  // Memoized filtered products
  const filteredProducts = useMemo((): Product[] => {
    let filtered = mockProducts;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory,
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          (product.name_en && product.name_en.toLowerCase().includes(query)) ||
          (product.name_he && product.name_he.toLowerCase().includes(query)),
      );
    }

    return filtered;
  }, [mockProducts, selectedCategory, searchQuery]);

  // Debounced search handler
  const debouncedSearch = useCallback((query: unknown) => {
    if (typeof query === "string") {
      setSearchQuery(query);
    }
  }, []);

  const debouncedSearchHandler = useMemo(
    () => debounce(debouncedSearch, 300),
    [debouncedSearch],
  );

  // Memoized handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearchHandler(e.target.value);
    },
    [debouncedSearchHandler],
  );

  const handleAddProduct = useCallback(() => {
    try {
      // Add product functionality can be implemented here
    } catch (err) {
      setError(t.errorOccurred);
    }
  }, [t.errorOccurred]);

  const handleViewProduct = useCallback(
    (_productId: string) => {
      try {
        // View product functionality can be implemented here
      } catch (err) {
        setError(t.errorOccurred);
      }
    },
    [t.errorOccurred],
  );

  const handleEditProduct = useCallback(
    (_productId: string) => {
      try {
        // Edit product functionality can be implemented here
      } catch (err) {
        setError(t.errorOccurred);
      }
    },
    [t.errorOccurred],
  );

  const handleDeleteProduct = useCallback(
    (_productId: string) => {
      try {
        if (window.confirm(t.confirmDelete)) {
          // Delete product functionality can be implemented here
        }
      } catch (err) {
        setError(t.errorOccurred);
      }
    },
    [t.confirmDelete, t.errorOccurred],
  );

  // Utility functions
  const getProductName = useCallback(
    (product: Product): string => {
      return language === "he"
        ? product.name_he || product.name
        : product.name_en || product.name;
    },
    [language],
  );

  const getCategoryName = useCallback(
    (category: Category): string => {
      return language === "he"
        ? category.name_he || category.name
        : category.name_en || category.name;
    },
    [language],
  );

  return (
    <ProductsContainer>
      <ProductsContent>
        <ProductsHeader>
          <ProductsTitle>{t.title}</ProductsTitle>
          <ProductsSubtitle>{t.subtitle}</ProductsSubtitle>

          {error && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </ErrorMessage>
          )}

          <ProductsActions>
            <SearchInput>
              <SearchIcon />
              <SearchField
                type="text"
                placeholder={t.searchPlaceholder}
                onChange={handleSearchChange}
                aria-label={t.searchPlaceholder}
              />
            </SearchInput>

            <FilterButton aria-label={t.filter}>
              <Filter size={16} />
              {t.filter}
            </FilterButton>

            <AddButton onClick={handleAddProduct} aria-label={t.addProduct}>
              <Plus size={16} />
              {t.addProduct}
            </AddButton>
          </ProductsActions>
        </ProductsHeader>

        <ResultsCount>
          {t.resultsCount.replace(
            "{count}",
            (filteredProducts?.length || 0).toString(),
          )}
        </ResultsCount>

        <AnimatePresence mode="wait">
          {filteredProducts && filteredProducts.length > 0 ? (
            <ProductsGrid>
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${getProductName(product)} - ₪${product.price}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleViewProduct(product.id);
                    }
                  }}
                >
                  <ProductImage emoji={product.emoji || ""}>
                    <span role="img" aria-label={getProductName(product)}>
                      {product.emoji}
                    </span>
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
                        {getCategoryName({
                          id: product.category,
                          name:
                            product.category_en || product.category_he || "",
                          name_en: product.category_en || "",
                          name_he: product.category_he || "",
                        })}
                      </MetaItem>
                      <MetaItem>
                        <span style={{ fontSize: "14px" }}>⏱️</span>
                        {product.preparation_time} {t.minutes}
                      </MetaItem>
                    </ProductMeta>

                    <ProductActions>
                      <ActionButton
                        onClick={() => handleViewProduct(product.id)}
                        aria-label={`View ${getProductName(product)}`}
                      >
                        <Eye size={14} />
                        {t.view}
                      </ActionButton>
                      <ActionButton
                        variant="secondary"
                        onClick={() => handleEditProduct(product.id)}
                        aria-label={`Edit ${getProductName(product)}`}
                      >
                        <Edit size={14} />
                        {t.edit}
                      </ActionButton>
                      <ActionButton
                        variant="danger"
                        onClick={() => handleDeleteProduct(product.id)}
                        aria-label={`Delete ${getProductName(product)}`}
                      >
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
              <EmptyStateIcon>📦</EmptyStateIcon>
              <h3>{t.noProducts}</h3>
              <p>{t.noProductsDesc}</p>
            </EmptyState>
          )}
        </AnimatePresence>
      </ProductsContent>
    </ProductsContainer>
  );
};

export default React.memo(AdminProducts);
