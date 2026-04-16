"use client";
import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useMenuContext } from '@/app/menu/hooks/useMenuContext';

interface PickupQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber?: string;
}

export function PickupQRModal({ isOpen, onClose, orderNumber = "1255" }: PickupQRModalProps) {
  const { t } = useLanguage();
  const { theme, timeOfDay } = useMenuContext();
  const isDark = timeOfDay === 'evening';

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 99999,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '32px',
      animation: 'fadeIn 0.3s ease-out'
    }} onClick={onClose}>


      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF', // QR always needs white bg
          padding: '32px',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '320px',
          width: '100%',
          position: 'relative'
      }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: '0 0 8px', textAlign: 'center' }}>
              Mã nhận đồ
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: '0 0 24px', textAlign: 'center' }}>
              Đưa mã này cho nhân viên tại quầy
          </p>

          <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('PICKUP:' + orderNumber)}`}
              alt="Pickup QR"
              style={{ width: '200px', height: '200px', marginBottom: '24px' }}
          />

          <div style={{
              background: '#F3F4F6',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '2px'
          }}>
              #{orderNumber}
          </div>
      </div>

      {/* Modern bottom close button */}
      <button 
          onClick={onClose}
          style={{ 
              marginTop: '40px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              height: '56px',
              padding: '0 32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              color: '#FFFFFF', cursor: 'pointer', zIndex: 2,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              fontSize: '1.05rem', fontWeight: 600,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}
      >
          <X size={24} strokeWidth={2.5} />
          {t('Đóng')}
      </button>
    </div>
  );
}
