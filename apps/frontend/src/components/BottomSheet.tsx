import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';

interface BottomSheetProps {
  open: boolean;
  title?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number | string;
}

const Backdrop = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: ${({ $open }) => ($open ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    align-items: flex-end;
  }
`;

const Sheet = styled.div<{ $maxWidth?: number | string }>`
  width: 100%;
  max-width: ${({ $maxWidth }) => ($maxWidth != null ? $maxWidth : '560px')};
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 90vh;

  @media (max-width: 768px) {
    max-width: 100%;
    border-radius: 16px 16px 0 0;
  }
`;

const Header = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #eee;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.div`
  font-weight: 600;
`;

const Body = styled.div`
  padding: 1rem 1.25rem;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;
`;

const Footer = styled.div`
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #eee;
  background: #fff;
  position: sticky;
  bottom: 0;
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
`;

const BottomSheet: React.FC<BottomSheetProps> = ({ open, title, onClose, children, footer, maxWidth }) => {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef<number | null>(null);
  const isMobile = typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false;

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

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
    if (dy > 0) setDragY(Math.min(dy, 200));
  }, [isMobile]);

  const onTouchEnd = useCallback(() => {
    if (!isMobile) return;
    const threshold = 100;
    if (dragY > threshold) onClose();
    setDragging(false);
    setDragY(0);
    startYRef.current = null;
  }, [dragY, isMobile, onClose]);

  return (
    <Backdrop $open={open} onClick={onClose}>
      <Sheet
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={isMobile ? { transform: dragY ? `translateY(${dragY}px)` : undefined, transition: dragging ? 'none' : 'transform 0.2s ease' } as React.CSSProperties : undefined}
        $maxWidth={maxWidth}
        role="dialog"
        aria-modal="true"
      >
        <Header>
          <Title>{title}</Title>
          <CloseBtn onClick={onClose} aria-label="Close">✕</CloseBtn>
        </Header>
        <Body>
          {children}
        </Body>
        {footer && <Footer>{footer}</Footer>}
      </Sheet>
    </Backdrop>
  );
};

export default BottomSheet;


