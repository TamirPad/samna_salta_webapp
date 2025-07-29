import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { selectAuth, selectUser } from '../../features/auth/authSlice';
import { selectLanguage } from '../../features/language/languageSlice';
import { logoutUser } from '../../features/auth/authSlice';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: #f0f0f0;
  }
`;

const LogoIcon = styled.span`
  font-size: 2rem;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const NavLink = styled(Link)<{ active: boolean }>`
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
  font-weight: ${({ active }) => active ? '600' : '400'};
  background: ${({ active }) => active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const Button = styled.button`
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const LanguageButton = styled.button`
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: transparent;
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div<{ isOpen: boolean }>`
  display: none;
  
  @media (max-width: 768px) {
    display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #8B4513;
    padding: 1rem;
    gap: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const MobileNavLink = styled(Link)<{ active: boolean }>`
  color: white;
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
  font-weight: ${({ active }) => active ? '600' : '400'};
  background: ${({ active }) => active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector(selectAuth);
  const language = useAppSelector(selectLanguage);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const toggleLanguage = () => {
    // Language toggle logic would go here
    console.log('Toggle language');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/home', label: language === 'he' ? 'בית' : 'Home' },
    { path: '/menu', label: language === 'he' ? 'תפריט' : 'Menu' },
    { path: '/cart', label: language === 'he' ? 'עגלה' : 'Cart' },
  ];

  const adminItems = [
    { path: '/admin', label: language === 'he' ? 'דשבורד' : 'Dashboard' },
    { path: '/admin/orders', label: language === 'he' ? 'הזמנות' : 'Orders' },
    { path: '/admin/products', label: language === 'he' ? 'מוצרים' : 'Products' },
    { path: '/admin/customers', label: language === 'he' ? 'לקוחות' : 'Customers' },
    { path: '/admin/analytics', label: language === 'he' ? 'ניתוח' : 'Analytics' },
  ];

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/home">
          <LogoIcon>🍽️</LogoIcon>
          {language === 'he' ? 'סמנה סלטה' : 'Samna Salta'}
        </Logo>

        <Nav>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              active={isActive(item.path)}
            >
              {item.label}
            </NavLink>
          ))}
          
          {isAuthenticated && user?.isAdmin && (
            <>
              {adminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  active={isActive(item.path)}
                >
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </Nav>

        <UserSection>
          <LanguageButton onClick={toggleLanguage}>
            {language === 'he' ? 'EN' : 'עב'}
          </LanguageButton>
          
          {isAuthenticated ? (
            <>
              <UserInfo>
                <UserAvatar>
                  {user?.name?.charAt(0) || 'U'}
                </UserAvatar>
                <span>{user?.name || 'User'}</span>
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

        <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          ☰
        </MobileMenuButton>
      </HeaderContent>

      <MobileMenu isOpen={mobileMenuOpen}>
        {navItems.map((item) => (
          <MobileNavLink
            key={item.path}
            to={item.path}
            active={isActive(item.path)}
            onClick={() => setMobileMenuOpen(false)}
          >
            {item.label}
          </MobileNavLink>
        ))}
        
        {isAuthenticated && user?.isAdmin && (
          <>
            {adminItems.map((item) => (
              <MobileNavLink
                key={item.path}
                to={item.path}
                active={isActive(item.path)}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </MobileNavLink>
            ))}
          </>
        )}
      </MobileMenu>
    </HeaderContainer>
  );
};

export default Header;
