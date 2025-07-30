import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { selectAuth } from '../../features/auth/authSlice';
import { selectLanguage } from '../../features/language/languageSlice';
import { logoutUser } from '../../features/auth/authSlice';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  color: white;
  padding: 0.75rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  min-height: 60px;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  
  @media (max-width: 768px) {
    padding: 0 0.5rem;
    gap: 0.5rem;
  }
`;

const Logo = styled(Link)`
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  
  &:hover {
    color: #f0f0f0;
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    gap: 0.25rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const LogoIcon = styled.span`
  font-size: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  justify-content: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  color: white;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  transition: all 0.2s;
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  background: ${({ $active }) => $active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  font-size: 0.9rem;
  white-space: nowrap;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.25rem;
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
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8rem;
  white-space: nowrap;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  @media (max-width: 480px) {
    padding: 0.3rem 0.5rem;
    font-size: 0.75rem;
  }
`;

const LanguageButton = styled.button`
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: 480px) {
    padding: 0.15rem 0.3rem;
    font-size: 0.7rem;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: transparent;
  color: white;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  display: none;
  
  @media (max-width: 768px) {
    display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #8B4513;
    padding: 1rem;
    gap: 0.75rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    max-height: 80vh;
    overflow-y: auto;
    z-index: 9999;
    width: 100%;
    opacity: ${({ $isOpen }) => $isOpen ? '1' : '0'};
    visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
    transform: ${({ $isOpen }) => $isOpen ? 'translateY(0)' : 'translateY(-10px)'};
    transition: all 0.3s ease;
  }
`;

const MobileNavLink = styled(Link)<{ $active: boolean }>`
  color: white;
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  background: ${({ $active }) => $active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  font-size: 0.9rem;
  display: block;
  width: 100%;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
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
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
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
    setMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    // Language toggle logic would go here
    // eslint-disable-next-line no-console
    console.log('Toggle language');
  };

  const toggleMobileMenu = () => {
    // eslint-disable-next-line no-console
    console.log('Mobile menu toggle clicked, current state:', mobileMenuOpen);
    setMobileMenuOpen(prev => !prev);
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
              $active={isActive(item.path)}
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
                  $active={isActive(item.path)}
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

        <MobileMenuButton onClick={toggleMobileMenu}>
          {mobileMenuOpen ? '✕' : '☰'}
        </MobileMenuButton>
      </HeaderContent>

      <MobileMenu $isOpen={mobileMenuOpen}>
        {navItems.map((item) => (
          <MobileNavLink
            key={item.path}
            to={item.path}
            $active={isActive(item.path)}
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
                $active={isActive(item.path)}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </MobileNavLink>
            ))}
          </>
        )}
        
        <MobileUserSection>
          {isAuthenticated ? (
            <>
              <MobileUserInfo>
                <UserAvatar>
                  {user?.name?.charAt(0) || 'U'}
                </UserAvatar>
                <span>{user?.name || 'User'}</span>
              </MobileUserInfo>
              <MobileButton onClick={handleLogout}>
                {language === 'he' ? 'התנתק' : 'Logout'}
              </MobileButton>
            </>
          ) : (
            <MobileButton onClick={() => {
              navigate('/login');
              setMobileMenuOpen(false);
            }}>
              {language === 'he' ? 'התחבר' : 'Login'}
            </MobileButton>
          )}
        </MobileUserSection>
      </MobileMenu>
    </HeaderContainer>
  );
};

export default Header;
