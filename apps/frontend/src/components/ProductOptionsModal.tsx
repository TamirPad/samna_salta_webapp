import React, { useEffect, useMemo, useState, useCallback } from 'react';
import styled from 'styled-components';
import { apiService } from '../utils/api';

type OptionValue = { id: number; name: string; name_en?: string; name_he?: string; price_adjustment?: number; is_available?: boolean };
type ProductOption = { id: number; name: string; name_en?: string; name_he?: string; is_required?: boolean; max_selections?: number; values?: OptionValue[] };

interface Props {
  product: { id: number; name: string; name_en?: string; name_he?: string; price: number };
  language: 'he' | 'en';
  onClose: () => void;
  onConfirm: (args: {
    selections: Array<{ option_id: number; option_name: string; values: Array<{ id: number; name: string; price_adjustment: number }> }>;
    description: string | undefined;
    totalAdjustment: number;
  }) => void;
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  @media (max-width: 768px) {
    align-items: flex-end;
  }
`;

const Modal = styled.div.attrs({ role: 'dialog', 'aria-modal': true })`
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 85vh;
  @media (max-width: 768px) {
    border-radius: 16px 16px 0 0;
    max-width: 100%;
    width: 100%;
  }
`;

const Header = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 1;
`;

const DragHandle = styled.div`
  width: 44px;
  height: 5px;
  background: #e5e7eb;
  border-radius: 999px;
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  @media (min-width: 769px) {
    display: none;
  }
`;

const Body = styled.div`
  padding: 1rem 1.25rem;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;
`;

const Footer = styled.div`
  padding: 1rem 1.25rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  position: sticky;
  bottom: 0;
  background: #fff;
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  background: ${({ $variant, theme }) => ($variant === 'primary' ? theme.colors.primary : '#e5e7eb')};
  color: ${({ $variant }) => ($variant === 'primary' ? '#fff' : '#111827')};
  &:hover { opacity: 0.95; }
  min-height: 48px;
`;

const OptionGroup = styled.div`
  margin-bottom: 1rem;
`;
const OptionTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
`;
const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
`;
const ValueChip = styled.button<{ $selected?: boolean }>`
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  border: 2px solid ${({ $selected, theme }) => ($selected ? theme.colors.primary : '#e5e7eb')};
  background: ${({ $selected }) => ($selected ? 'rgba(59,130,246,0.08)' : 'white')};
  cursor: pointer;
  font-size: 0.95rem;
`;

const Note = styled.div`
  color: #6b7280;
  font-size: 0.85rem;
  margin-top: 0.25rem;
`;

const ProductOptionsModal: React.FC<Props> = ({ product, language, onClose, onConfirm }) => {
  const [options, setOptions] = useState<ProductOption[] | null>(null);
  const [selected, setSelected] = useState<Record<number, number[]>>({});
  const [loading, setLoading] = useState(true);
  const firstChipRef = React.useRef<HTMLButtonElement | null>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = React.useRef<number | null>(null);
  const isMobile = typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false;

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await apiService.getProductOptions(product.id);
        const data = (resp as any)?.data?.data || (resp as any)?.data || [];
        setOptions(data);
        // Initialize with defaults: first value if required
        const initial: Record<number, number[]> = {};
        data.forEach((o: ProductOption) => {
          const vals = (o.values || []).filter(v => v.is_available !== false);
          if (o.is_required && vals.length > 0) {
            initial[o.id] = [vals[0].id];
          } else {
            initial[o.id] = [];
          }
        });
        setSelected(initial);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [product.id]);

  const toggleValue = useCallback((option: ProductOption, value: OptionValue) => {
    setSelected(prev => {
      const current = new Set(prev[option.id] || []);
      if (current.has(value.id)) {
        current.delete(value.id);
      } else {
        const maxSel = option.max_selections || 1;
        if (current.size >= maxSel) {
          // remove oldest
          const first = Array.from(current)[0];
          current.delete(first);
        }
        current.add(value.id);
      }
      return { ...prev, [option.id]: Array.from(current) };
    });
  }, []);

  const { valid, selections, description, totalAdjustment } = useMemo(() => {
    if (!options) return { valid: true, selections: [], description: undefined, totalAdjustment: 0 };
    const picked: Array<{ option_id: number; option_name: string; values: Array<{ id: number; name: string; price_adjustment: number }> }> = [];
    let ok = true;
    let parts: string[] = [];
    let adj = 0;
    for (const o of options) {
      const ids = selected[o.id] || [];
      const vals = (o.values || []).filter(v => ids.includes(v.id));
      if (o.is_required && vals.length === 0) ok = false;
      if (vals.length > 0) {
        picked.push({ option_id: o.id, option_name: o.name, values: vals.map(v => ({ id: v.id, name: v.name, price_adjustment: Number(v.price_adjustment || 0) })) });
        parts.push(`${o.name}: ${vals.map(v => v.name).join(', ')}`);
        adj += vals.reduce((s, v) => s + Number(v.price_adjustment || 0), 0);
      }
    }
    return { valid: ok, selections: picked, description: parts.length ? parts.join(' | ') : undefined, totalAdjustment: adj };
  }, [options, selected]);

  if (!options || loading) {
    // If no options (empty array), auto-confirm immediately
    if (!loading && Array.isArray(options) && options.length === 0) {
      onConfirm({ selections: [], description: undefined, totalAdjustment: 0 });
      onClose();
      return null;
    }
    return (
      <Backdrop onClick={onClose}>
        <Modal onClick={(e) => e.stopPropagation()}>
          <Header>{language === 'he' ? 'טוען אפשרויות...' : 'Loading options...'}</Header>
          <Body />
          <Footer>
            <Button onClick={onClose}>{language === 'he' ? 'סגור' : 'Close'}</Button>
          </Footer>
        </Modal>
      </Backdrop>
    );
  }

  // Autofocus first chip when options are loaded
  useEffect(() => {
    if (!loading && options && options.length > 0) {
      const t = setTimeout(() => firstChipRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [loading, options]);

  // Swipe-to-close handlers
  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    startYRef.current = e.touches[0].clientY;
    setDragging(true);
    setDragY(0);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    if (startYRef.current == null) return;
    const dy = e.touches[0].clientY - startYRef.current;
    if (dy > 0) setDragY(Math.min(dy, 200));
  };
  const onTouchEnd = () => {
    if (!isMobile) return;
    const threshold = 100;
    if (dragY > threshold) onClose();
    setDragging(false);
    setDragY(0);
    startYRef.current = null;
  };

  return (
    <Backdrop onClick={onClose}>
      <Modal
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={isMobile ? { transform: dragY ? `translateY(${dragY}px)` : undefined, transition: dragging ? 'none' : 'transform 0.2s ease' } as React.CSSProperties : undefined}
      >
        <Header>
          <DragHandle />
          {language === 'he' ? 'התאם את המנה' : 'Customize Item'} — {language === 'he' ? (product.name_he || product.name) : (product.name_en || product.name)}
        </Header>
        <Body>
          {options.map((o) => (
            <OptionGroup key={o.id}>
              <OptionTitle>
                {o.name} {o.is_required ? '*' : ''}
                <Note>
                  {(o.max_selections || 1) > 1
                    ? (language === 'he' ? `בחר עד ${o.max_selections}` : `Choose up to ${o.max_selections}`)
                    : (language === 'he' ? 'בחר אפשרות אחת' : 'Choose one')}
                </Note>
              </OptionTitle>
              <ValuesGrid>
                {(o.values || []).filter(v => v.is_available !== false).map((v, idx) => {
                  const selectedIds = new Set(selected[o.id] || []);
                  const label = `${v.name}${v.price_adjustment ? ` (+₪${Number(v.price_adjustment)})` : ''}`;
                  const isFirst = idx === 0;
                  return (
                    <ValueChip
                      key={v.id}
                      ref={isFirst ? firstChipRef : undefined}
                      $selected={selectedIds.has(v.id)}
                      onClick={() => toggleValue(o, v)}
                    >
                      {label}
                    </ValueChip>
                  );
                })}
              </ValuesGrid>
            </OptionGroup>
          ))}
          <div style={{ marginTop: '0.5rem', color: '#111827', fontWeight: 600 }}>
            {(language === 'he' ? 'תוספות' : 'Add-ons')}: ₪{totalAdjustment}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            {(language === 'he' ? 'מחיר בסיס' : 'Base price')}: ₪{product.price}
          </div>
        </Body>
        <Footer>
          <Button onClick={onClose}>{language === 'he' ? 'ביטול' : 'Cancel'}</Button>
          <Button $variant="primary" onClick={() => { if (valid) { onConfirm({ selections, description, totalAdjustment }); onClose(); }}} disabled={!valid}>
            {language === 'he' ? 'הוסף לעגלה' : 'Add to Cart'}
          </Button>
        </Footer>
      </Modal>
    </Backdrop>
  );
};

export default ProductOptionsModal;


