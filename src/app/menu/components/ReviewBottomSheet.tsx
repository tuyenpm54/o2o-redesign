"use client";
import React, { useState } from 'react';
import { CheckCircle2, Receipt, Smile, Frown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReviewBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  resid: string;
  tableid: string;
  isPrepaid?: boolean;
}

const BAD_REASONS = [
  'Thái độ phục vụ',
  'Đồ ăn/nước uống',
  'Thời gian chờ lâu',
  'Vệ sinh không gian',
  'Giá cả'
];

export function ReviewBottomSheet({ isOpen, onClose, resid, tableid, isPrepaid }: ReviewBottomSheetProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [rating, setRating] = useState<number | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset state when opened
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRating(null);
      setSelectedReasons([]);
      setIsAnimating(false);
    }
  }, [isOpen]);

  const toggleReason = (r: string) => {
    setSelectedReasons(prev => 
      prev.includes(r) ? prev.filter(item => item !== r) : [...prev, r]
    );
  };

  const handleRatingSelect = (selected: number) => {
    if (isAnimating) return;
    setRating(selected);
    
    if (selected === 2) {
      setIsAnimating(true);
      // API call would go here to log the rating
      
      // Auto advance after short delay for visual feedback
      setTimeout(() => {
        setStep(2);
        setIsAnimating(false);
      }, 450);
    } else {
      // For selected === 1, we wait for user to select reasons
    }
  };

  const handleSubmitBadRating = () => {
    if (selectedReasons.length === 0) return;
    setIsAnimating(true);
    // API call would go here to log the rating and reasons
    setTimeout(() => {
      setStep(2);
      setIsAnimating(false);
    }, 300);
  };

  const handleClearTableAndRedirect = async () => {
    try {
      if (isPrepaid || tableid?.toUpperCase() === 'COUNTER') {
        await fetch('/api/table/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resid, tableid }),
        });
      }
      localStorage.removeItem(`draftOrder_${resid}_${tableid}`);
      
      let redirectUrl = `/menu?resid=${resid}&tableid=${tableid}`;
      if (isPrepaid) {
        redirectUrl += '&paytype=PREPAID';
      }
      
      if (typeof window !== 'undefined') window.location.href = redirectUrl;
      onClose();
    } catch(e) {
      console.error(e);
      let redirectUrl = `/menu?resid=${resid}&tableid=${tableid}`;
      if (isPrepaid) {
        redirectUrl += '&paytype=PREPAID';
      }
      if (typeof window !== 'undefined') window.location.href = redirectUrl;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 99998,
          opacity: 1,
          animation: 'v_fadeIn 0.3s ease-out'
        }}
        onClick={step === 2 ? handleClearTableAndRedirect : undefined}
      />
      <div
        style={{
          position: 'fixed',
          left: 0, right: 0, bottom: 0,
          backgroundColor: 'var(--menu-card-bg, #ffffff)',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          padding: '32px 24px',
          paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 20px))',
          zIndex: 99999,
          boxShadow: '0 -8px 32px rgba(0,0,0,0.1)',
          animation: 'v_slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'opacity 0.3s', opacity: isAnimating ? 0.4 : 1 }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--menu-text-primary, #111827)', marginBottom: '6px', textAlign: 'center', letterSpacing: '-0.02em' }}>
              {rating === 1 ? 'Điểm nào làm bạn chưa ý?' : 'Trải nghiệm của bạn thế nào?'}
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--menu-text-secondary, #6B7280)', marginBottom: rating === 1 ? '16px' : '32px', textAlign: 'center', lineHeight: 1.5 }}>
              {rating === 1 
                ? 'Hãy cho chúng mình biết lý do để phục vụ tốt hơn.'
                : <React.Fragment>Một chạm đánh giá để giúp chúng mình<br/>phục vụ bạn tốt hơn ở lần sau nhé!</React.Fragment>}
            </p>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: rating === 1 ? '24px' : '16px', width: '100%', padding: '0 8px' }}>
              {(!rating || rating === 2) && (
                <button
                  onClick={() => handleRatingSelect(2)}
                  disabled={isAnimating}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    background: rating === 2 ? '#10B98115' : 'var(--menu-bg-secondary, #F3F4F6)',
                    border: 'none',
                    borderRadius: '28px',
                    padding: '32px 16px',
                    cursor: isAnimating ? 'default' : 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: rating === 2 ? 'scale(0.96)' : 'scale(1)',
                    boxShadow: rating === 2 ? 'inset 0 0 0 2px #10B981' : '0 4px 20px -8px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ 
                    width: 64, height: 64, borderRadius: '50%', 
                    background: rating === 2 ? '#10B981' : '#FFFFFF', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: rating === 2 ? '#fff' : '#10B981',
                    boxShadow: rating === 2 ? '0 8px 16px -4px rgba(16, 185, 129, 0.4)' : '0 4px 12px rgba(0,0,0,0.04)',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}>
                    <Smile size={36} strokeWidth={rating === 2 ? 3 : 2.5} />
                  </div>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: rating === 2 ? '#10B981' : 'var(--menu-text-primary, #111827)' }}>
                    Hài lòng
                  </span>
                </button>
              )}

              {(!rating || rating === 1) && (
                <button
                  onClick={() => handleRatingSelect(1)}
                  disabled={isAnimating || rating === 1}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    background: rating === 1 ? '#EF444415' : 'var(--menu-bg-secondary, #F3F4F6)',
                    border: 'none',
                    borderRadius: '28px',
                    padding: rating === 1 ? '16px' : '32px 16px',
                    cursor: rating === 1 ? 'default' : (isAnimating ? 'default' : 'pointer'),
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: rating === 1 ? 'scale(0.96)' : 'scale(1)',
                    boxShadow: rating === 1 ? 'inset 0 0 0 2px #EF4444' : '0 4px 20px -8px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ 
                    width: rating === 1 ? 48 : 64, height: rating === 1 ? 48 : 64, borderRadius: '50%', 
                    background: rating === 1 ? '#EF4444' : '#FFFFFF', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: rating === 1 ? '#fff' : '#EF4444',
                    boxShadow: rating === 1 ? '0 8px 16px -4px rgba(239, 68, 68, 0.4)' : '0 4px 12px rgba(0,0,0,0.04)',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}>
                    <Frown size={rating === 1 ? 28 : 36} strokeWidth={rating === 1 ? 3 : 2.5} />
                  </div>
                  <span style={{ fontSize: rating === 1 ? '0.95rem' : '1.05rem', fontWeight: 800, color: rating === 1 ? '#EF4444' : 'var(--menu-text-primary, #111827)' }}>
                    Có điểm chê
                  </span>
                </button>
              )}
            </div>

            {rating === 1 && (
              <div style={{ width: '100%', animation: 'v_fadeIn 0.3s ease-out' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                  {BAD_REASONS.map(r => (
                    <button 
                      key={r}
                      onClick={() => toggleReason(r)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '100px',
                        border: selectedReasons.includes(r) ? '1px solid #EF4444' : '1px solid var(--menu-border, #E5E7EB)',
                        background: selectedReasons.includes(r) ? '#EF444415' : 'transparent',
                        color: selectedReasons.includes(r) ? '#EF4444' : 'var(--menu-text-secondary, #4B5563)',
                        fontSize: '0.9rem',
                        fontWeight: selectedReasons.includes(r) ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                
                <button
                  disabled={selectedReasons.length === 0}
                  onClick={handleSubmitBadRating}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '20px',
                    background: selectedReasons.length === 0 ? 'var(--menu-bg-tertiary, #E5E7EB)' : 'var(--menu-primary, #ef4444)',
                    color: selectedReasons.length === 0 ? 'var(--menu-text-tertiary, #9CA3AF)' : '#ffffff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: selectedReasons.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: selectedReasons.length > 0 ? '0 8px 20px -6px var(--menu-primary, rgba(239, 68, 68, 0.5))' : 'none',
                  }}
                >
                  Gửi góp ý
                </button>
              </div>
            )}
            
            {(!rating || rating === 2) && (
              <button
                onClick={handleClearTableAndRedirect}
                disabled={isAnimating}
                style={{
                  background: 'none', border: 'none', color: 'var(--menu-text-tertiary, #9CA3AF)', 
                  fontWeight: 600, padding: '16px', fontSize: '0.95rem', cursor: 'pointer', marginTop: '8px'
                }}
              >
                Bỏ qua
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'v_fadeIn 0.3s ease-out' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#10B98115', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <CheckCircle2 size={40} color="#10B981" strokeWidth={2.5} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--menu-text-primary)', marginBottom: '12px', textAlign: 'center', letterSpacing: '-0.02em' }}>
              Cảm ơn bạn!
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--menu-text-secondary)', marginBottom: '36px', textAlign: 'center', lineHeight: 1.5, padding: '0 16px' }}>
              Ý kiến của bạn góp phần rất lớn giúp chúng mình cải thiện chất lượng mỗi ngày.
            </p>

            <button
              onClick={() => {
                onClose();
                router.push('/vat-instruction');
              }}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '20px',
                background: 'var(--menu-bg-secondary)',
                color: 'var(--menu-text-primary)',
                fontWeight: 700,
                fontSize: '1rem',
                border: '1px solid var(--menu-border, rgba(0,0,0,0.05))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '16px',
                cursor: 'pointer'
              }}
            >
              <Receipt size={20} />
              Hướng dẫn xuất hoá đơn VAT
            </button>
            
            <button
              onClick={handleClearTableAndRedirect}
              style={{
                background: 'none', border: 'none', color: 'var(--menu-text-secondary)', 
                fontWeight: 700, padding: '12px', fontSize: '0.95rem', cursor: 'pointer'
              }}
            >
              Trở về Menu gọi món
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes v_fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes v_slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
