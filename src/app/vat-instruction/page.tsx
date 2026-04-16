"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Receipt, CheckCircle, FileText, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    title: 'Bước 1: Tạo hồ sơ VAT',
    desc: 'Thiết lập thông tin công ty của bạn (Tên công ty, MST, Địa chỉ) một lần duy nhất để dùng cho các đơn hàng tiếp theo.',
    icon: <FileText size={56} color="#3B82F6" strokeWidth={1.5} />,
    color: '#3B82F6',
    bgColor: '#3B82F615'
  },
  {
    title: 'Bước 2: Gắn vào hoá đơn',
    desc: 'Chuyển sang tab Lịch sử hoá đơn, chọn hoá đơn mà bạn muốn xuất và chọn hồ sơ VAT tương ứng.',
    icon: <Receipt size={56} color="#10B981" strokeWidth={1.5} />,
    color: '#10B981',
    bgColor: '#10B98115'
  },
  {
    title: 'Bước 3: Hoàn tất & Theo dõi',
    desc: 'Hệ thống sẽ cập nhật trạng thái xuất VAT thành công và gửi hóa đơn điện tử qua Email/Zalo của bạn.',
    icon: <CheckCircle size={56} color="#F59E0B" strokeWidth={1.5} />,
    color: '#F59E0B',
    bgColor: '#F59E0B15'
  }
];

export default function VatInstructionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Done - navigate to account page with VAT view
      router.push('/account?view=VAT_INFO');
    }
  };

  const handleSkip = () => {
    router.push('/account?view=VAT_INFO');
  };

  const stepData = STEPS[currentStep];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: 'var(--menu-bg, #F9FAFB)',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <header style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button 
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', margin: '-8px' }}
        >
          <ChevronLeft size={28} color="var(--menu-text-primary, #111827)" />
        </button>
        <button 
          onClick={handleSkip}
          style={{
            background: 'none', border: 'none', color: 'var(--menu-text-secondary, #6B7280)',
            fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer'
          }}
        >
          Bỏ qua
        </button>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 32px'
      }}>
        {/* Step Image / Icon */}
        <div 
          key={`icon-${currentStep}`}
          style={{
            width: 160,
            height: 160,
            borderRadius: '50%',
            backgroundColor: stepData.bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            animation: 'v_popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          {stepData.icon}
        </div>

        {/* Text Content */}
        <div key={`text-${currentStep}`} style={{ textAlign: 'center', animation: 'v_slideUpFade 0.4s ease-out' }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--menu-text-primary, #111827)',
            marginBottom: '16px',
            letterSpacing: '-0.02em'
          }}>
            {stepData.title}
          </h1>
          <p style={{
            fontSize: '1rem',
            color: 'var(--menu-text-secondary, #4B5563)',
            lineHeight: 1.6,
            maxWidth: '320px',
            margin: '0 auto'
          }}>
            {stepData.desc}
          </p>
        </div>
      </main>

      {/* Footer Area */}
      <footer style={{
        padding: '32px 24px calc(32px + env(safe-area-inset-bottom, 20px))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
        backgroundColor: '#ffffff',
        borderTopLeftRadius: '32px',
        borderTopRightRadius: '32px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.03)'
      }}>
        {/* Progress Dots */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {STEPS.map((_, idx) => (
            <div 
              key={idx}
              style={{
                width: currentStep === idx ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: currentStep === idx ? 'var(--menu-primary, #DF1B41)' : 'var(--menu-bg-tertiary, #E5E7EB)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          style={{
            width: '100%',
            height: '56px',
            borderRadius: '28px',
            backgroundColor: 'var(--menu-primary, #DF1B41)',
            color: '#fff',
            border: 'none',
            fontSize: '1.05rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: '0 8px 24px -6px var(--menu-primary, rgba(223, 27, 65, 0.4))',
            transition: 'transform 0.2s ease',
            WebkitTapHighlightColor: 'transparent'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {currentStep === STEPS.length - 1 ? 'Đi tới trang khai báo VAT' : 'Tiếp tục'}
          {currentStep === STEPS.length - 1 ? <ArrowRight size={20} /> : null}
        </button>
      </footer>

      <style>{`
        @keyframes v_popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes v_slideUpFade {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
