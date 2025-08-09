import React, { useEffect, useMemo, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { selectLanguage } from '../../features/language/languageSlice';
import {
  fetchProducts,
  fetchCategories,
  selectProducts,
  selectCategories,
  selectProductsLoading,
  createProduct,
  updateProductAsync,
  deleteProduct as deleteProductThunk,
} from '../../features/products/productsSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Edit, Trash2, Package, Search, Plus, Filter, Image as ImageIcon, Upload as UploadIcon } from 'lucide-react';
import { apiService } from '../../utils/api';
import { toast } from 'react-toastify';

// Types
interface Product {
  id: number;
  name: string;
  name_en?: string;
  name_he?: string;
  description?: string;
  description_en?: string;
  description_he?: string;
  price: number;
  category_id?: number;
  category_name?: string;
  category_name_en?: string;
  category_name_he?: string;
  image_url?: string;
  is_active: boolean;
  is_popular: boolean;
  is_new: boolean;
  preparation_time_minutes?: number;
  display_order?: number;
  created_at: string;
  updated_at: string;
  emoji?: string;
}

interface CategoryOption {
  id: number;
  name?: string;
  name_en?: string;
  name_he?: string;
}

// Styled Components
const ProductsContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
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
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
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
  color: #6c757d;
  pointer-events: none;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;

  &:hover {
    background: #f8f9fa;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  min-height: 44px;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
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
  @media (max-width: 360px) {
    gap: 0.75rem;
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
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const ProductImage = styled.div<{ $imageUrl?: string; $emoji?: string }>`
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 12px 12px 0 0;
  background: ${({ $imageUrl, theme }) =>
    $imageUrl ? `url(${$imageUrl}) center/cover` : theme.gradients.primary};
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

const ProductStatus = styled.span<{ $active: boolean }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${(props) => (props.$active ? "#28a745" : "#dc3545")};
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProductPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
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

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'primary':
        return `
          background-color: ${'${({ theme }) => theme.colors.primary}'};
          color: white;
          &:hover {
            background-color: ${'${({ theme }) => theme.colors.primaryDark}'};
          }
        `;
      case 'secondary':
        return `
          background-color: #6c757d;
          color: white;
          &:hover {
            background-color: #5a6268;
          }
        `;
      case 'danger':
        return `
          background-color: #dc3545;
          color: white;
          &:hover {
            background-color: #c82333;
          }
        `;
      default:
        return `
          background-color: ${'${({ theme }) => theme.colors.primary}'};
          color: white;
          &:hover {
            background-color: ${'${({ theme }) => theme.colors.primaryDark}'};
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

// Modal + form styles
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    align-items: flex-end;
    padding: 0 env(safe-area-inset-right) max(env(safe-area-inset-bottom), 8px) env(safe-area-inset-left);
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 95%;
  max-width: 560px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    border-radius: 16px 16px 0 0;
    max-height: 90vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;

  @media (max-width: 360px) {
    padding: 0.75rem 1rem;
  }
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
`;

const ModalBody = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;

  @media (max-width: 360px) {
    padding: 0.75rem 1rem;
  }
`;

const FormRow = styled.label`
  display: grid;
  gap: 0.25rem;
  font-size: 0.9rem;
`;

const TextInput = styled.input`
  padding: 0.625rem 0.75rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.95rem;
`;

const TextArea = styled.textarea`
  padding: 0.625rem 0.75rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.95rem;
  min-height: 80px;
`;

const SelectInput = styled.select`
  padding: 0.625rem 0.75rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #eee;
  position: sticky;
  bottom: 0;
  background: white;

  @media (max-width: 360px) {
    padding: 0.5rem 1rem;
  }
`;

const SecondaryBtn = styled.button`
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  background: white;
`;

const PrimaryBtn = styled.button`
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
`;

const AdminProducts: React.FC = () => {
  const language = useAppSelector(selectLanguage);
  const dispatch = useAppDispatch();
  
  // Use Redux selectors instead of local state
  const reduxProducts = useAppSelector(selectProducts);
  const categories = useAppSelector(selectCategories);
  const isLoading = useAppSelector(selectProductsLoading);
  
  // Convert Redux products to local interface
  const products: Product[] = (reduxProducts || []).map((reduxProduct: any) => ({
    id: reduxProduct.id,
    name: reduxProduct.name || reduxProduct.name_en || reduxProduct.name_he || 'Unknown Product',
    name_en: reduxProduct.name_en,
    name_he: reduxProduct.name_he,
    description: reduxProduct.description || reduxProduct.description_en || reduxProduct.description_he,
    description_en: reduxProduct.description_en,
    description_he: reduxProduct.description_he,
    price: parseFloat(reduxProduct.price),
    category_id: reduxProduct.category_id,
    category_name: reduxProduct.category_name || reduxProduct.category_name_en || reduxProduct.category_name_he,
    category_name_en: reduxProduct.category_name_en,
    category_name_he: reduxProduct.category_name_he,
    image_url: reduxProduct.image_url,
    is_active: reduxProduct.is_active,
    is_popular: reduxProduct.is_popular,
    is_new: reduxProduct.is_new,
    preparation_time_minutes: reduxProduct.preparation_time_minutes,
    display_order: reduxProduct.display_order,
    created_at: reduxProduct.created_at,
    updated_at: reduxProduct.updated_at,
    emoji: reduxProduct.emoji
  }));

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({
    name: '',
    name_en: '',
    name_he: '',
    description: '',
    price: 0,
    category_id: undefined,
    image_url: '',
    emoji: '',
    is_active: true,
    preparation_time_minutes: 15,
    display_order: 0,
  });
  const [uploading, setUploading] = useState<boolean>(false);
  const nameInputRef = React.useRef<HTMLInputElement | null>(null);
  const modalContentRef = React.useRef<HTMLDivElement | null>(null);
  const isMobile = typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false;
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = React.useRef<number | null>(null);

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchProducts({}));
    dispatch(fetchCategories());
  }, [dispatch]);

  // Helper functions
  const getProductName = useCallback((product: Product): string => {
    if (language === 'he' && product.name_he) return product.name_he;
    if (language === 'en' && product.name_en) return product.name_en;
    return product.name;
  }, [language]);

  const getCategoryName = useCallback((category: { name?: string; name_en?: string; name_he?: string }): string => {
    if (language === 'he' && category.name_he) return category.name_he;
    if (language === 'en' && category.name_en) return category.name_en;
    return category.name || '';
  }, [language]);

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

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return products;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return products.filter(product => {
      const name = getProductName(product).toLowerCase();
      const description = (product.description || '').toLowerCase();
      const category = getCategoryName({
        name: product.category_name,
        name_en: product.category_name_en,
        name_he: product.category_name_he
      }).toLowerCase();
      
      return name.includes(searchLower) || 
             description.includes(searchLower) || 
             category.includes(searchLower);
    });
  }, [products, searchTerm, getProductName, getCategoryName]);

  // Debounced search handler
  const debouncedSearch = useCallback(
    (query: unknown) => {
      if (typeof query === "string") {
        setSearchTerm(query);
      }
    },
    [],
  );

  const debouncedSearchHandler = useCallback(
    (query: unknown) => {
      debouncedSearch(query);
    },
    [debouncedSearch],
  );

  // Memoized handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearchHandler(e.target.value);
    },
    [debouncedSearchHandler],
  );

  const openAddModal = useCallback(() => {
    setEditingProduct(null);
    setForm({
      name: '',
      name_en: '',
      name_he: '',
      description: '',
      price: 0,
      category_id: categories?.[0]?.id,
      image_url: '',
      emoji: '',
      is_active: true,
      preparation_time_minutes: 15,
      display_order: 0,
    });
    setIsModalOpen(true);
  }, [categories]);

  // Removed view product handler (no separate view mode)

  const handleEditProduct = useCallback(
    (productId: number) => {
      try {
        const prod = products.find(p => p.id === productId);
        if (!prod) return;
        setEditingProduct(prod);
        setForm({
          name: prod.name,
          name_en: prod.name_en || '',
          name_he: prod.name_he || '',
          description: prod.description || '',
          price: prod.price,
          category_id: prod.category_id,
          image_url: prod.image_url || '',
          emoji: prod.emoji || '',
          is_active: prod.is_active,
          preparation_time_minutes: prod.preparation_time_minutes || 15,
          display_order: prod.display_order || 0,
        });
        setIsModalOpen(true);
      } catch (err) {
        // no-op
      }
    },
    [products],
  );

  // Autofocus the name field when modal opens
  useEffect(() => {
    let timeoutId: number | undefined;
    if (isModalOpen) {
      timeoutId = window.setTimeout(() => nameInputRef.current?.focus(), 50);
    }
    return () => {
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }
    };
  }, [isModalOpen]);

  // Keyboard avoidance: scroll focused input into view within the modal
  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target && modalContentRef.current) {
        // Find closest scrollable (ModalBody) and ensure the input is visible
        const body = modalContentRef.current.querySelector('[data-modal-body="1"]') as HTMLElement | null;
        if (body && target.scrollIntoView) {
          setTimeout(() => {
            target.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }, 50);
        }
      }
    };
    document.addEventListener('focusin', handler);
    return () => document.removeEventListener('focusin', handler);
  }, [isModalOpen]);

  // Swipe-to-close on mobile
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    startYRef.current = e.touches[0].clientY;
    setDragging(true);
    setDragY(0);
  }, [isMobile]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    if (startYRef.current == null) return;
    const dy = e.touches[0].clientY - startYRef.current;
    if (dy > 0) {
      setDragY(Math.min(dy, 200));
    }
  }, [isMobile]);

  const onTouchEnd = useCallback(() => {
    if (!isMobile) return;
    const threshold = 100;
    if (dragY > threshold) {
      setIsModalOpen(false);
    }
    setDragging(false);
    setDragY(0);
    startYRef.current = null;
  }, [dragY, isMobile]);

  const handleDeleteProduct = useCallback(
    async (productId: number) => {
      try {
        if (window.confirm(t.confirmDelete)) {
          await dispatch(deleteProductThunk(productId));
          toast.success(language === 'he' ? 'המוצר הוסר' : 'Product deleted');
          dispatch(fetchProducts({}));
        }
      } catch (err) {
        toast.error(language === 'he' ? 'מחיקה נכשלה' : 'Delete failed');
      }
    },
    [dispatch, t.confirmDelete, language],
  );

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const name = (target as any).name as string;
    const value = (target as any).value as string;

    let nextValue: any = value;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      nextValue = target.checked;
    } else if (
      name === 'price' ||
      name === 'display_order' ||
      name === 'preparation_time_minutes' ||
      name === 'category_id'
    ) {
      nextValue = value === '' ? '' : Number(value);
    }

    setForm(prev => ({
      ...prev,
      [name]: nextValue,
    }));
  }, []);

  const handleImageFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const resp = await apiService.uploadProductImage(file);
      const url = (resp as any)?.data?.data?.url;
      if (url) {
        setForm(prev => ({ ...prev, image_url: url }));
        toast.success(language === 'he' ? 'תמונה הועלתה' : 'Image uploaded');
      } else {
        toast.error(language === 'he' ? 'העלאת תמונה נכשלה' : 'Upload failed');
      }
    } catch {
      toast.error(language === 'he' ? 'העלאת תמונה נכשלה' : 'Upload failed');
    } finally {
      setUploading(false);
      // reset input value to allow re-upload same file if needed
      if (e.target) e.target.value = '';
    }
  }, [language]);

  const handleSubmitForm = useCallback(async () => {
    try {
      if (!form.name || !form.price) {
        toast.error(language === 'he' ? 'שם ומחיר נדרשים' : 'Name and price are required');
        return;
      }
      if (editingProduct) {
        await dispatch(updateProductAsync({ id: editingProduct.id, productData: form as any }));
        toast.success(language === 'he' ? 'המוצר עודכן' : 'Product updated');
      } else {
        await dispatch(createProduct(form as any));
        toast.success(language === 'he' ? 'מוצר נוצר' : 'Product created');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      dispatch(fetchProducts({}));
    } catch (err) {
      toast.error(language === 'he' ? 'שמירה נכשלה' : 'Save failed');
    }
  }, [dispatch, editingProduct, form, language]);

  return (
    <ProductsContainer>
      <ProductsContent>
        <ProductsHeader>
          <ProductsTitle>{t.title}</ProductsTitle>
          <ProductsSubtitle>{t.subtitle}</ProductsSubtitle>

          {/* error && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </ErrorMessage>
          ) */}

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

            <AddButton onClick={openAddModal} aria-label={t.addProduct}>
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

        {isLoading ? (
            <LoadingSpinner />
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <ProductsGrid>
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id}>
                  <ProductImage $imageUrl={product.image_url} $emoji={product.emoji}>
                    {!product.image_url && product.emoji && (
                      <span role="img" aria-label={getProductName(product)}>
                        {product.emoji}
                      </span>
                    )}
                    <ProductStatus $active={product.is_active}>
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
                          name:
                            product.category_name || product.category_name_en || product.category_name_he || "",
                          name_en: product.category_name_en || "",
                          name_he: product.category_name_he || "",
                        })}
                      </MetaItem>
                      <MetaItem>
                        <span style={{ fontSize: "14px" }}>⏱️</span>
                        {product.preparation_time_minutes || 0} {t.minutes}
                      </MetaItem>
                    </ProductMeta>

                    <ProductActions>
                      {/* View button removed */}
                      <Button
                        $variant="secondary"
                        onClick={() => handleEditProduct(product.id)}
                        aria-label={`Edit ${getProductName(product)}`}
                      >
                        <Edit size={14} />
                        {t.edit}
                      </Button>
                      <Button
                        $variant="danger"
                        onClick={() => handleDeleteProduct(product.id)}
                        aria-label={`Delete ${getProductName(product)}`}
                      >
                        <Trash2 size={14} />
                        {t.delete}
                      </Button>
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
      </ProductsContent>
      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent
            ref={modalContentRef}
            onClick={e => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={isMobile ? { transform: dragY ? `translateY(${dragY}px)` : undefined, transition: dragging ? 'none' : 'transform 0.2s ease' } : undefined}
          >
            <ModalHeader>
              <ModalTitle>{editingProduct ? (language === 'he' ? 'עריכת מוצר' : 'Edit Product') : (language === 'he' ? 'מוצר חדש' : 'New Product')}</ModalTitle>
              <SecondaryBtn onClick={() => setIsModalOpen(false)}>{language === 'he' ? 'סגור' : 'Close'}</SecondaryBtn>
            </ModalHeader>
            <ModalBody data-modal-body="1">
              <FormRow>
                {language === 'he' ? 'שם' : 'Name'}
                <TextInput ref={nameInputRef as any} name="name" value={form.name as any} onChange={handleFormChange} />
              </FormRow>
              <FormRow>
                {language === 'he' ? 'מחיר (₪)' : 'Price (₪)'}
                <TextInput name="price" type="number" min={0} step={0.5} value={form.price as any} onChange={handleFormChange} />
              </FormRow>
              <FormRow>
                {language === 'he' ? 'קטגוריה' : 'Category'}
                <SelectInput name="category_id" value={(form.category_id as any) ?? ''} onChange={handleFormChange}>
                  <option value="">{language === 'he' ? 'בחר קטגוריה' : 'Select category'}</option>
                  {(categories || []).map((c: CategoryOption) => (
                    <option key={c.id} value={c.id}>{language === 'he' ? (c.name_he || c.name || c.name_en) : (c.name_en || c.name || c.name_he)}</option>
                  ))}
                </SelectInput>
              </FormRow>
              <FormRow>
                {language === 'he' ? 'תיאור' : 'Description'}
                <TextArea name="description" value={(form.description as any) || ''} onChange={handleFormChange} style={{ minHeight: 120 }} />
              </FormRow>
              <FormRow>
                {language === 'he' ? 'תמונה (URL)' : 'Image URL'}
                <TextInput name="image_url" value={(form.image_url as any) || ''} onChange={handleFormChange} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <label htmlFor="imageFile" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#2563EB' }}>
                    <UploadIcon size={16} /> {language === 'he' ? 'העלה תמונה' : 'Upload image'}
                  </label>
                  <input id="imageFile" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFile} />
                  {uploading ? <span>{language === 'he' ? 'מעלה...' : 'Uploading...'}</span> : null}
                </div>
                {form.image_url ? (
                  <div style={{ marginTop: 8 }}>
                    <img src={form.image_url} alt="preview" style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid #eee' }} />
                  </div>
                ) : null}
              </FormRow>
              <FormRow>
                {language === 'he' ? 'אימוג׳י' : 'Emoji'}
                <TextInput name="emoji" value={(form.emoji as any) || ''} onChange={handleFormChange} />
              </FormRow>
              <FormRow>
                {language === 'he' ? 'זמן הכנה (דק׳)' : 'Prep time (min)'}
                <TextInput name="preparation_time_minutes" type="number" min={0} step={1} value={(form.preparation_time_minutes as any) ?? 15} onChange={handleFormChange} />
              </FormRow>
              <FormRow>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" name="is_active" checked={Boolean(form.is_active)} onChange={handleFormChange} />
                  {language === 'he' ? 'מוצר פעיל' : 'Active product'}
                </label>
              </FormRow>
            </ModalBody>
            <ModalFooter>
              <SecondaryBtn onClick={() => setIsModalOpen(false)}>{language === 'he' ? 'בטל' : 'Cancel'}</SecondaryBtn>
              <PrimaryBtn onClick={handleSubmitForm}>{language === 'he' ? 'שמור' : 'Save'}</PrimaryBtn>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </ProductsContainer>
  );
};

export default React.memo(AdminProducts);
