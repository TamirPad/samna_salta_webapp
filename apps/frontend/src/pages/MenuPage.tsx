import React, { useState, useMemo, useCallback, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { selectLanguage } from "../features/language/languageSlice";
import { addToCart } from "../features/cart/cartSlice";
import {
  selectProductsLoading,
  selectProducts,
  selectCategories,
  fetchProducts,
  fetchCategories,
} from "../features/products/productsSlice";
import LoadingSpinner from "../components/LoadingSpinner";
import { debounce } from "../utils/performance";
import { apiService } from "../utils/api";
import { Product, Category } from "../types";
import { toast } from "react-toastify";

// Styled Components
const MenuContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;

  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

const MenuHeader = styled.div`
  background: linear-gradient(135deg, #00C2FF 0%, #0077CC 100%);
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

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`;

const MenuSubtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;

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

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  outline: none;
  transition: border-color 0.3s ease;
  font-size: 1rem;

  &:focus {
    border-color: #00C2FF;
    box-shadow: 0 0 0 3px rgba(0, 194, 255, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const SearchIconWrapper = styled.span`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 1rem;
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

const CategoryButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.25rem;
  border: 2px solid
    ${(props): string => (props.$active ? "#00C2FF" : "#e0e0e0")};
  background: ${(props): string => (props.$active ? "#00C2FF" : "white")};
  color: ${(props): string => (props.$active ? "white" : "#333")};
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: #00C2FF;
    background: ${(props): string => (props.$active ? "#00C2FF" : "#f8f9fa")};
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid #00C2FF;
    outline-offset: 2px;
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

  @media (max-width: 360px) {
    gap: 0.75rem;
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
    outline: 2px solid #00C2FF;
    outline-offset: 2px;
  }
`;

const ProductImage = styled.div<{ $imageUrl?: string; $emoji?: string }>`
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 12px 12px 0 0;
  background: ${({ $imageUrl }) =>
    $imageUrl ? `url(${$imageUrl}) center/cover` : 'linear-gradient(135deg, #00C2FF 0%, #0077CC 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: white;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
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
  color: #2f2f2f;
  margin: 0;
  flex: 1;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 375px) {
    font-size: 1.1rem;
  }
`;

const ProductPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #00C2FF;
  margin-left: 1rem;

  @media (max-width: 375px) {
    font-size: 1.25rem;
  }
`;

const ProductDescription = styled.p`
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

const AddToCartButton = styled.button<{ $added?: boolean }>`
  width: 100%;
  background: ${({ $added }) => ($added ? "#28a745" : "#00C2FF")};
  color: white;
  border: none;
  padding: 0.875rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;

  &:hover {
    background: ${({ $added }) => ($added ? "#23913b" : "#0077CC")};
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid #fff8dc;
    outline-offset: 2px;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
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

const MenuPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);
  const isLoading = useAppSelector(selectProductsLoading);
  const products = useAppSelector(selectProducts);
  const categories = useAppSelector(selectCategories);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastAddedId, setLastAddedId] = useState<number | null>(null);
  const [optionsByProduct, setOptionsByProduct] = useState<Record<number, any[]>>({});

  // Fetch products and categories on component mount
  useEffect(() => {
    dispatch(fetchProducts({}));
    dispatch(fetchCategories());
  }, [dispatch]);

  // Memoized translations
  const translations = useMemo(
    () => ({
      he: {
        menuTitle: "תפריט סמנה סלטה",
        menuSubtitle: "גלה את המגוון הרחב שלנו של לחמים ומתוקים מסורתיים",
        allCategories: "כל הקטגוריות",
        searchPlaceholder: "חפש מוצרים...",
        addToCart: "הוסף לעגלה",
        preparationTime: "זמן הכנה",
        minutes: "דקות",
        new: "חדש",
        popular: "פופולרי",
        noProducts: "לא נמצאו מוצרים",
        noProductsDesc: "נסה לשנות את הפילטרים שלך או לחפש משהו אחר",
        resultsCount: "נמצאו {count} מוצרים",
        loading: "טוען מוצרים...",
      },
      en: {
        menuTitle: "Samna Salta Menu",
        menuSubtitle:
          "Discover our wide variety of traditional breads and pastries",
        allCategories: "All Categories",
        searchPlaceholder: "Search products...",
        addToCart: "Add to Cart",
        preparationTime: "Prep time",
        minutes: "min",
        new: "New",
        popular: "Popular",
        noProducts: "No products found",
        noProductsDesc:
          "Try changing your filters or search for something else",
        resultsCount: "Found {count} products",
        loading: "Loading products...",
      },
    }),
    [],
  );

  const t = useMemo(
    () => translations[language as keyof typeof translations],
    [translations, language],
  );

  // Memoized data processing
  const displayProducts = useMemo((): Product[] => {
    if (!products || !Array.isArray(products) || products.length === 0) {
      return [];
    }
    return products.map((p: any) => ({ ...p, price: Number(p.price) }));
  }, [products]);

  const displayCategories = useMemo((): Category[] => {
    const allCategories: Category = {
      id: 0,
      name: t.allCategories,
      name_en: t.allCategories,
      name_he: t.allCategories,
      is_active: true,
    };
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return [allCategories];
    }
    // Cast categories to the correct type and ensure is_active property exists
    const typedCategories = categories.map((cat) => ({
      ...cat,
      is_active: (cat as Category & { is_active?: boolean }).is_active ?? true,
    })) as Category[];
    return [allCategories, ...typedCategories];
  }, [categories, t.allCategories]);

  // Memoized filtering logic
  const filteredProducts = useMemo((): Product[] => {
    if (!Array.isArray(displayProducts)) {
      return [];
    }

    let filtered = displayProducts;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category_id === parseInt(selectedCategory),
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          (product.description &&
            product.description.toLowerCase().includes(query)) ||
          (product.name_en && product.name_en.toLowerCase().includes(query)) ||
          (product.name_he && product.name_he.toLowerCase().includes(query)),
      );
    }

    return filtered;
  }, [displayProducts, selectedCategory, searchQuery]);

  // Debounced search handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((query: unknown) => {
      if (typeof query === "string") {
        setSearchQuery(query);
      }
    }, 300),
    [setSearchQuery],
  );

  // Memoized handlers
  const handleAddToCart = useCallback(
    async (product: Product) => {
      // Fetch options if available, pick defaults (first available per option)
      let description: string | undefined;
      try {
        const cached = optionsByProduct[product.id];
        const respData = cached
          ? cached
          : (((await apiService.getProductOptions(product.id)) as any)?.data?.data || []);
        if (!cached) {
          setOptionsByProduct((prev) => ({ ...prev, [product.id]: respData }));
        }
        if (Array.isArray(respData) && respData.length > 0) {
          const parts: string[] = [];
          for (const o of respData) {
            const values = (o.values || []).filter((v: any) => v.is_available !== false);
            const picked = values.slice(0, o.max_selections || 1);
            if (picked.length > 0) {
              parts.push(`${o.name}: ${picked.map((v: any) => v.name).join(', ')}`);
            }
          }
          if (parts.length > 0) description = parts.join(' | ');
        }
      } catch {}

      dispatch(
        addToCart({
          id: product.id.toString(),
          name:
            language === "he"
              ? product.name_he || product.name
              : product.name_en || product.name,
          price: Number(product.price),
          quantity: 1,
          image: product.image_url || product.image || "",
          category: product.category?.name || "",
          description,
        }),
      );

      setLastAddedId(product.id);
      window.setTimeout(() => setLastAddedId((prev) => (prev === product.id ? null : prev)), 900);

      const addedText = language === "he" ? "נוסף לעגלה" : "Added to cart";
      const nameText = language === "he" ? (product.name_he || product.name) : (product.name_en || product.name);
      toast.success(`${nameText} — ${addedText}`, { autoClose: 1200 });
    },
    [dispatch, language, optionsByProduct],
  );

  const handleCategoryChange = useCallback((categoryId: number) => {
    setSelectedCategory(categoryId === 0 ? "all" : categoryId.toString());
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearch(e.target.value);
    },
    [debouncedSearch],
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

  const getProductDescription = useCallback(
    (product: Product): string => {
      return language === "he"
        ? product.description_he || ""
        : product.description_en || product.description || "";
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
          <SearchContainer>
            <SearchIconWrapper>🔍</SearchIconWrapper>
            <SearchInput
              type="text"
              placeholder={t.searchPlaceholder}
              onChange={handleSearchChange}
              aria-label={t.searchPlaceholder}
            />
          </SearchContainer>

          <CategoryFilter>
            {displayCategories.map(
              (category): JSX.Element => (
                <CategoryButton
                  key={category.id}
                  $active={selectedCategory === category.id.toString()}
                  onClick={() => handleCategoryChange(category.id)}
                  aria-label={`Filter by ${getCategoryName(category)}`}
                >
                  {getCategoryName(category)}
                </CategoryButton>
              ),
            )}
          </CategoryFilter>
        </FilterSection>

        <ResultsCount>
          {t.resultsCount.replace(
            "{count}",
            filteredProducts.length.toString(),
          )}
        </ResultsCount>

        <AnimatePresence mode="wait">
          {filteredProducts.length > 0 ? (
            <ProductsGrid>
              {filteredProducts.map(
                (product, index): JSX.Element => (
                  <ProductCard
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View ${getProductName(product)} - ₪${product.price}`}
                    onKeyDown={(e): void => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        // Handle product click if needed
                      }
                    }}
                  >
                    <ProductImage
                      $imageUrl={product.image_url || product.image || ""}
                      $emoji={product.emoji || ""}
                    >
                      {!product.image_url && !product.image && product.emoji && (
                        <span role="img" aria-label={getProductName(product)}>
                          {product.emoji}
                        </span>
                      )}
                      {product.is_new && <ProductBadge>{t.new}</ProductBadge>}
                      {product.is_popular && (
                        <ProductBadge>{t.popular}</ProductBadge>
                      )}
                    </ProductImage>

                    <ProductInfo>
                      <ProductHeader>
                        <ProductName>{getProductName(product)}</ProductName>
                        <ProductPrice>₪{product.price}</ProductPrice>
                      </ProductHeader>

                      <ProductDescription>
                        {getProductDescription(product)}
                      </ProductDescription>

                      <ProductMeta>
                        <MetaItem>
                          <span style={{ fontSize: "14px" }}>⏱️</span>
                          {product.preparation_time_minutes ||
                            product.preparation_time}{" "}
                          {t.minutes}
                        </MetaItem>
                      </ProductMeta>

                      <AddToCartButton
                        $added={lastAddedId === product.id}
                        onClick={(): void => handleAddToCart(product)}
                        disabled={!product.is_active}
                        aria-label={`Add ${getProductName(product)} to cart`}
                      >
                        {lastAddedId === product.id ? "✔ Added!" : `🛒 ${t.addToCart}`}
                      </AddToCartButton>
                    </ProductInfo>
                  </ProductCard>
                ),
              )}
            </ProductsGrid>
          ) : (
            <EmptyState>
              <EmptyStateIcon>🔍</EmptyStateIcon>
              <h3>{t.noProducts}</h3>
              <p>{t.noProductsDesc}</p>
            </EmptyState>
          )}
        </AnimatePresence>
      </MenuContent>
    </MenuContainer>
  );
};

export default React.memo(MenuPage);
