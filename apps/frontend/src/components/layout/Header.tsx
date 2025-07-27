import React, {
  ReactElement,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  memo,
  useMemo,
} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import {
  selectLanguage,
  setLanguage,
} from '../../features/language/languageSlice';
import { selectCartItemsCount } from '../../features/cart/cartSlice';
import { logoutUser } from '../../features/auth/authSlice';

// Types
interface NavItem {
  path: string;
  label: string;
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

// Styled Components
const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #8b4513 0%, #d2691e 100%);
  color: white;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;

const Nav = styled.nav`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }

  /* iPhone optimization */
  @media (max-width: 428px) {
    padding: 0 1rem;
  }

  @media (max-width: 375px) {
    padding: 0 0.75rem;
  }

  @media (max-width: 320px) {
    padding: 0 0.5rem;
  }
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 6px;

  &:hover {
    color: #fff8dc;
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid #fff8dc;
    outline-offset: 2px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
  min-height: 44px;
  display: flex;
  align-items: center;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid #fff8dc;
    outline-offset: 2px;
  }

  ${(props): string =>
    props.$active
      ? `
    background-color: rgba(255, 255, 255, 0.2);
    color: #FFF8DC;
  `
      : ''}

  /* Active indicator */
  ${(props): string =>
    props.$active
      ? `
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background-color: #FFF8DC;
      border-radius: 1px;
    }
  `
      : ''}
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  min-width: 44px;
  min-height: 44px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:focus {
    outline: 2px solid #fff8dc;
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* iPhone optimization */
  @media (max-width: 428px) {
    font-size: 1.75rem;
    padding: 0.875rem;
    min-width: 48px;
    min-height: 48px;
  }
`;

const MobileMenu = styled(motion.div)`
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #8b4513;
  padding: 1rem;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileNavLink = styled(Link)<{ $active?: boolean }>`
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  min-height: 44px;
  display: flex;
  align-items: center;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
  }

  &:focus {
    outline: 2px solid #fff8dc;
    outline-offset: 2px;
  }

  ${(props): string =>
    props.$active
      ? `
    background-color: rgba(255, 255, 255, 0.2);
    color: #FFF8DC;
  `
      : ''}
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LanguageToggle = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid #fff8dc;
    outline-offset: 2px;
  }

  /* iPhone optimization */
  @media (max-width: 428px) {
    padding: 0.875rem 1.25rem;
    min-width: 48px;
    min-height: 48px;
  }
`;

const CartButton = styled(Link)`
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  min-width: 44px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid #fff8dc;
    outline-offset: 2px;
  }

  /* iPhone optimization */
  @media (max-width: 428px) {
    padding: 0.875rem 1.25rem;
    min-width: 48px;
    min-height: 48px;
  }
`;

const CartBadge = styled(motion.span)`
  background: #d2691e;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  position: absolute;
  top: -8px;
  right: -8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const SkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 6px;
  background: #8b4513;
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

const LogoutButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 0.5rem;

  &:hover {
    background: #c82333;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MobileLogoutButton = styled.button`
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  color: #dc3545;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const Header: React.FC = (): JSX.Element => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);
  const cartItemsCount = useAppSelector(selectCartItemsCount);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const isAdmin = useAppSelector(state => state.auth.user?.isAdmin || false);

  // Memoized navigation items
  const navItems = useMemo(
    (): NavItem[] => [
      { path: '/home', label: language === 'he' ? 'בית' : 'Home' },
      { path: '/menu', label: language === 'he' ? 'תפריט' : 'Menu' },
      {
        path: '/admin',
        label: language === 'he' ? 'דשבורד' : 'Dashboard',
        requiresAuth: true,
        adminOnly: true,
      },
      {
        path: '/admin/orders',
        label: language === 'he' ? 'הזמנות' : 'Orders',
        requiresAuth: true,
        adminOnly: true,
      },
      {
        path: '/admin/analytics',
        label: language === 'he' ? 'ניתוח' : 'Analytics',
        requiresAuth: true,
        adminOnly: true,
      },
      {
        path: '/admin/products',
        label: language === 'he' ? 'מוצרים' : 'Products',
        requiresAuth: true,
        adminOnly: true,
      },
      {
        path: '/admin/customers',
        label: language === 'he' ? 'לקוחות' : 'Customers',
        requiresAuth: true,
        adminOnly: true,
      },
    ],
    [language]
  );

  // Filter navigation items based on auth and admin status
  const filteredNavItems = useMemo(
    (): NavItem[] =>
      navItems.filter(item => {
        if (item.requiresAuth && !isAuthenticated) return false;
        if (item.adminOnly && !isAdmin) return false;
        return true;
      }),
    [navItems, isAuthenticated, isAdmin]
  );

  const toggleLanguage = useCallback((): void => {
    dispatch(setLanguage(language === 'he' ? 'en' : 'he'));
  }, [dispatch, language]);

  const toggleMobileMenu = useCallback((): void => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback((): void => {
    setIsMobileMenuOpen(false);
  }, []);

  const isActive = useCallback(
    (path: string): boolean => location.pathname === path,
    [location.pathname]
  );

  const handleLogout = useCallback((): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(logoutUser());
    navigate('/');
  }, [dispatch, navigate]);

  // Handle escape key to close mobile menu
  React.useEffect((): (() => void) => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest('[data-mobile-menu]')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleClickOutside);

    return (): void => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when route changes
  React.useEffect((): void => {
    closeMobileMenu();
  }, [location.pathname, closeMobileMenu]);

  // Prevent body scroll when mobile menu is open
  React.useEffect((): (() => void) => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return (): void => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Don't show header on login page
  if (location.pathname === '/' || location.pathname === '/login') {
    return <></>;
  }

  return (
    <HeaderContainer>
      <SkipLink href='#main-content'>
        {language === 'he' ? 'דלג לתוכן הראשי' : 'Skip to main content'}
      </SkipLink>

      <Nav>
        <Logo
          to='/home'
          aria-label={
            language === 'he' ? 'סמנה סלטה - דף הבית' : 'Samna Salta - Home'
          }
        >
          🍞 {language === 'he' ? 'סמנה סלטה' : 'Samna Salta'}
        </Logo>

        <NavLinks
          role='navigation'
          aria-label={language === 'he' ? 'ניווט ראשי' : 'Main navigation'}
        >
          {filteredNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              $active={isActive(item.path)}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              {item.label}
            </NavLink>
          ))}
        </NavLinks>

        <HeaderActions>
          {isAuthenticated && isAdmin && (
            <LogoutButton onClick={handleLogout}>
              {language === 'he' ? 'התנתק' : 'Logout'}
            </LogoutButton>
          )}

          <LanguageToggle
            onClick={toggleLanguage}
            aria-label={
              language === 'he'
                ? 'החלף שפה לאנגלית'
                : 'Switch language to Hebrew'
            }
          >
            {language === 'he' ? 'EN' : 'עב'}
          </LanguageToggle>

          <CartButton
            to='/cart'
            aria-label={language === 'he' ? 'עגלת קניות' : 'Shopping cart'}
          >
            🛒 {language === 'he' ? 'עגלה' : 'Cart'}
            {cartItemsCount > 0 && (
              <CartBadge
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {cartItemsCount}
              </CartBadge>
            )}
          </CartButton>

          <MobileMenuButton
            onClick={toggleMobileMenu}
            aria-label={language === 'he' ? 'תפריט ניווט' : 'Navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls='mobile-menu'
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </MobileMenuButton>
        </HeaderActions>
      </Nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            id='mobile-menu'
            data-mobile-menu
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            role='navigation'
            aria-label={language === 'he' ? 'ניווט נייד' : 'Mobile navigation'}
          >
            {filteredNavItems.map(item => (
              <MobileNavLink
                key={item.path}
                to={item.path}
                $active={isActive(item.path)}
                onClick={closeMobileMenu}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                {item.label}
              </MobileNavLink>
            ))}
            {isAuthenticated && isAdmin && (
              <MobileLogoutButton
                onClick={(): void => {
                  handleLogout();
                  closeMobileMenu();
                }}
              >
                {language === 'he' ? 'התנתק' : 'Logout'}
              </MobileLogoutButton>
            )}
          </MobileMenu>
        )}
      </AnimatePresence>
    </HeaderContainer>
  );
};

export default memo(Header);
