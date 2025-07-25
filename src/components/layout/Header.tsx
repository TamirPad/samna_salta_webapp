import React, { useState, useCallback, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { selectLanguage, setLanguage } from '../../features/language/languageSlice';
import { selectCartItemsCount } from '../../features/cart/cartSlice';
import { AnimatePresence } from 'framer-motion';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  color: white;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

  &:hover {
    color: #FFF8DC;
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
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #FFF8DC;
  }

  ${props => props.$active && `
    background-color: rgba(255, 255, 255, 0.2);
    color: #FFF8DC;
  `}
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  /* iPhone optimization */
  min-width: 44px;
  min-height: 44px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  @media (max-width: 768px) {
    display: block;
  }

  /* iPhone optimization */
  @media (max-width: 428px) {
    font-size: 1.75rem;
    padding: 0.75rem;
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
  background: #8B4513;
  padding: 1rem;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileNavLink = styled(Link)<{ $active?: boolean }>`
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  ${props => props.$active && `
    background-color: rgba(255, 255, 255, 0.2);
  `}
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
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const CartButton = styled(Link)`
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const CartBadge = styled.span`
  background: #D2691E;
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
`;

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);
  const cartItemsCount = useAppSelector(selectCartItemsCount);

  const toggleLanguage = useCallback(() => {
    dispatch(setLanguage(language === 'he' ? 'en' : 'he'));
  }, [dispatch, language]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  const navItems = [
    { path: '/', label: language === 'he' ? 'בית' : 'Home' },
    { path: '/menu', label: language === 'he' ? 'תפריט' : 'Menu' },
  ];

  return (
    <HeaderContainer>
      <Nav>
        <Logo to="/">
          🍞 {language === 'he' ? 'סמנה סלטה' : 'Samna Salta'}
        </Logo>

        <NavLinks>
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} $active={isActive(item.path)}>
              {item.label}
            </NavLink>
          ))}
        </NavLinks>

        <HeaderActions>
          <LanguageToggle onClick={toggleLanguage}>
            {language === 'he' ? 'EN' : 'עב'}
          </LanguageToggle>
          
          <CartButton to="/cart">
            🛒 {language === 'he' ? 'עגלה' : 'Cart'}
            {cartItemsCount > 0 && <CartBadge>{cartItemsCount}</CartBadge>}
          </CartButton>

          <MobileMenuButton onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? '✕' : '☰'}
          </MobileMenuButton>
        </HeaderActions>
      </Nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navItems.map((item) => (
              <MobileNavLink
                key={item.path}
                to={item.path}
                $active={isActive(item.path)}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </MobileNavLink>
            ))}
          </MobileMenu>
        )}
      </AnimatePresence>
    </HeaderContainer>
  );
};

export default memo(Header); 