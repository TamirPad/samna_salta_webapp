import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { selectAuth } from '../../features/auth/authSlice';
import { selectLanguage } from '../../features/language/languageSlice';
import { logoutUser } from '../../features/auth/authSlice';
import { setLanguage } from '../../features/language/languageSlice';
import { selectAdminView, toggleAdminView, setAdminView } from '../../features/ui/uiSlice';
import { selectCartItemsCount } from '../../features/cart/cartSlice';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: ${({ theme }) => theme.gradients.primary};
  color: white;
  padding: 0; /* remove vertical padding so inner content can center perfectly */
  box-shadow: ${({ theme }) => theme.shadows.small};
  position: sticky;
  top: 0;
  z-index: 1000;
  min-height: 56px;
  width: 100%;
  overflow: visible !important; /* avoid clipping edge buttons on mobile/RTL */
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-left: max(0.75rem, env(safe-area-inset-left));
  padding-right: max(0.75rem, env(safe-area-inset-right));
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  position: relative;

  @media (min-width: 768px) {
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
    gap: 1rem;
    min-height: 64px;
  }
`;

/* Logo removed per request to simplify mobile alignment */

const Nav = styled.nav`
  display: none;
  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    justify-content: center;
  }
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  color: white;
  text-decoration: none;
  padding: 0.4rem 0.6rem;
  border-radius: 999px;
  transition: all 0.2s;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.2)' : 'transparent')};
  font-size: 0.9rem;
  white-space: nowrap;
  
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: rgba(255, 255, 255, 0.12);
    }
  }
`;

const NavText = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const CartBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -10px;
  background: ${({ theme }) => theme.colors.error};
  color: white;
  border-radius: 999px;
  padding: 0 6px;
  height: 18px;
  min-width: 18px;
  font-size: 11px;
  line-height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
`;

const UserSection = styled.div`
  display: none;
  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserInfoButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  background: transparent;
  color: inherit;
  border: none;
  cursor: pointer;
  padding: 0;
  border-radius: 6px;

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.8);
    outline-offset: 2px;
  }
`;

const UserAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
`;

const Button = styled.button`
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
  white-space: nowrap;
  min-height: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.5);
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.3rem 0.5rem;
    font-size: 0.75rem;
  }
`;

const LanguageButton = styled(Button)`
  font-weight: 700;
`;

const MobileMenuButton = styled.button`
  display: flex;
  background: rgba(255,255,255,0.12);
  color: white;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 12px;
  transition: all 0.2s;
  min-width: 48px;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1001;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  grid-column: 3;
  justify-self: end;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: rgba(255, 255, 255, 0.18);
    }
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileCartButton = styled(Link)`
  display: flex;
  background: rgba(255,255,255,0.12);
  color: white;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 12px;
  transition: all 0.2s;
  min-width: 48px;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1001;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  grid-column: 1;
  justify-self: start;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: rgba(255, 255, 255, 0.18);
    }
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  flex-direction: column;
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.gradients.primary};
  padding: 0.75rem;
  gap: 0.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  max-height: calc(100vh - 60px);
  overflow-y: auto;
  z-index: 9999;
  width: 100%;
  opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transform: ${({ $isOpen }) => ($isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  transition: all 0.3s ease;
  -webkit-overflow-scrolling: touch;
  padding-left: max(0.75rem, env(safe-area-inset-left));
  padding-right: max(0.75rem, env(safe-area-inset-right));
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
`;

const MobileNavLink = styled(Link)<{ $active: boolean }>`
  color: white;
  text-decoration: none;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  transition: all 0.2s;
  font-weight: ${({ $active }) => ($active ? 800 : 600)};
  background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.2)' : 'transparent')};
  font-size: 1rem;
  display: block;
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  position: relative;
  
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: rgba(255, 255, 255, 0.18);
    }
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
  
  @media (max-width: 428px) {
    padding: 0.625rem 0.875rem;
    font-size: 0.85rem;
    min-height: 48px;
  }
`;

const MobileUserSection = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 0.75rem;
  }
`;

const MobileUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
`;

const MobileUserInfoButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: rgba(255, 255, 255, 0.14);
  }

  &:active {
    background: rgba(255, 255, 255, 0.18);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.8);
    outline-offset: 2px;
  }
`;

const MobileButton = styled.button`
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  width: 100%;
  text-align: left;
  min-height: 44px;
  display: flex;
  align-items: center;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
  
  @media (max-width: 428px) {
    padding: 0.625rem 0.875rem;
    font-size: 0.85rem;
    min-height: 48px;
  }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  
  @media (max-width: 768px) {
    display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9998;
    opacity: ${({ $isOpen }) => $isOpen ? '1' : '0'};
    visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
    transition: all 0.3s ease;
  }
`;

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector(selectAuth);
  const language = useAppSelector(selectLanguage);
  const isAdminView = useAppSelector(selectAdminView);
  const cartCount = useAppSelector(selectCartItemsCount);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleTouchStart);
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('menu-open');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleTouchStart);
      document.body.style.overflow = 'unset';
      document.body.classList.remove('menu-open');
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    // default admins to adminView true on load
    if (isAuthenticated && user?.isAdmin) {
      dispatch(setAdminView(true));
    }
  }, [dispatch, isAuthenticated, user?.isAdmin]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    const next = language === 'he' ? 'en' : 'he';
    dispatch(setLanguage(next));
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/home', label: language === 'he' ? 'בית' : 'Home' },
    { path: '/menu', label: language === 'he' ? 'תפריט' : 'Menu' },
    { path: '/cart', label: language === 'he' ? 'עגלה' : 'Cart' },
    { path: '/orders', label: language === 'he' ? 'ההזמנות שלי' : 'My Orders' },
  ];

  const adminItems = [
    { path: '/admin', label: language === 'he' ? 'דשבורד' : 'Dashboard' },
    { path: '/admin/orders', label: language === 'he' ? 'הזמנות' : 'Orders' },
    { path: '/admin/products', label: language === 'he' ? 'מוצרים' : 'Products' },
    { path: '/admin/customers', label: language === 'he' ? 'לקוחות' : 'Customers' },
    { path: '/admin/analytics', label: language === 'he' ? 'ניתוח' : 'Analytics' },
  ];

  const showAdminNav = isAuthenticated && user?.isAdmin && isAdminView;

  return (
    <HeaderContainer>
      <HeaderContent>
        {/* Logo removed */}

        <Nav>
          {(showAdminNav ? adminItems : navItems).map((item) => {
            const showBadge = item.path === '/cart' && cartCount > 0;
            const aria = showBadge ? `${item.label} (${cartCount})` : item.label;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                $active={isActive(item.path)}
                aria-label={aria}
              >
                <NavText>
                  {item.label}
                  {showBadge && <CartBadge data-testid="cart-count-badge">{cartCount}</CartBadge>}
                </NavText>
              </NavLink>
            );
          })}
        </Nav>

        <UserSection>
          {isAuthenticated && user?.isAdmin && (
            <Button onClick={() => dispatch(toggleAdminView())}>
              {isAdminView ? (language === 'he' ? 'לתצוגת לקוח' : 'Customer View') : (language === 'he' ? 'לתצוגת מנהל' : 'Admin View')}
            </Button>
          )}
          <LanguageButton onClick={toggleLanguage}>
            {language === 'he' ? 'EN' : 'עב'}
          </LanguageButton>
          {isAuthenticated ? (
            <>
              <UserInfo>
                <UserInfoButton
                  onClick={() => navigate('/profile')}
                  aria-label={language === 'he' ? 'פרופיל' : 'Profile'}
                >
                  <UserAvatar>
                    {user?.name?.charAt(0) || 'U'}
                  </UserAvatar>
                  <span>{user?.name || 'User'}</span>
                </UserInfoButton>
              </UserInfo>
              <Button onClick={handleLogout}>
                {language === 'he' ? 'התנתק' : 'Logout'}
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate('/login')}>
              {language === 'he' ? 'התחבר' : 'Login'}
            </Button>
          )}
        </UserSection>

        {/* Cart aligned to left in mobile (customer view only) */}
        {!showAdminNav && (
          <MobileCartButton to="/cart" aria-label={language === 'he' ? 'עגלה' : 'Cart'}>
            🛒
            {cartCount > 0 && <CartBadge style={{ right: -6, top: -6 }}>{cartCount}</CartBadge>}
          </MobileCartButton>
        )}

        {/* Burger aligned to right in mobile */}
        <MobileMenuButton 
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          data-testid="mobile-menu-button"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </MobileMenuButton>
      </HeaderContent>

      <Overlay $isOpen={mobileMenuOpen} onClick={() => setMobileMenuOpen(false)} />
      
      <MobileMenu ref={mobileMenuRef} $isOpen={mobileMenuOpen} data-testid="mobile-menu">
        {(showAdminNav ? adminItems : navItems).map((item) => {
          const showBadge = item.path === '/cart' && cartCount > 0;
          const aria = showBadge ? `${item.label} (${cartCount})` : item.label;
          return (
            <MobileNavLink
              key={item.path}
              to={item.path}
              $active={isActive(item.path)}
              onClick={() => setMobileMenuOpen(false)}
              aria-label={aria}
            >
              {item.label}
              {showBadge && <CartBadge style={{ right: 10, top: 8 }}>{cartCount}</CartBadge>}
            </MobileNavLink>
          );
        })}
        <MobileUserSection>
          {isAuthenticated && user?.isAdmin && (
            <MobileButton onClick={() => { dispatch(toggleAdminView()); setMobileMenuOpen(false); }}>
              {isAdminView ? (language === 'he' ? 'לתצוגת לקוח' : 'Customer View') : (language === 'he' ? 'לתצוגת מנהל' : 'Admin View')}
            </MobileButton>
          )}
          {isAuthenticated ? (
            <>
              <MobileUserInfoButton
                onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                aria-label={language === 'he' ? 'פרופיל' : 'Profile'}
              >
                <UserAvatar>
                  {user?.name?.charAt(0) || 'U'}
                </UserAvatar>
                <span>{user?.name || 'User'}</span>
              </MobileUserInfoButton>
              <MobileButton onClick={handleLogout}>
                {language === 'he' ? 'התנתק' : 'Logout'}
              </MobileButton>
            </>
          ) : (
            <MobileButton onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
              {language === 'he' ? 'התחבר' : 'Login'}
            </MobileButton>
          )}
        </MobileUserSection>
      </MobileMenu>
    </HeaderContainer>
  );
};

export default Header;
