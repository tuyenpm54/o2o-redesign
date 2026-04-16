"use client";

import React, { useState } from 'react';
import { Star, CheckCircle2, ChevronRight, MessageSquareHeart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';

export function PrepaidReviewModal({ 
  isOpen, 
  resid, 
  tableid,
  userId
}: { 
  isOpen: boolean; 
  resid: string; 
  tableid: string;
  userId: string | undefined;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Push feedback securely
    await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            resid, tableid, user_id: userId,
            content: `Đánh giá: ${rating} sao. ${comment ? `Bình luận: ${comment}. ` : ''}${tags.length ? `Tags: ${tags.join(', ')}` : ''}`,
            type: 'SUPPORT'
        })
    });
    
    // Write feedback to KV store to be grabbed by complete flow if needed (optional since we're completing it)
    await fetch('/api/admin/dashboard/health-index', { // Or a specific API if we want to store it formally
        // mock logic for storing review
    }).catch(() => {});

    // Complete session
    await fetch('/api/sessions/complete_prepaid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resid, tableid })
    });

    setIsSubmitting(false);
    
    // Redirect out and finish session
    if (userId) {
       router.push(`/menu?resid=${resid}&tableid=${tableid}&ratingCompleted=true`);
    } else {
       router.push(`/`);
    }
  };

  const tagOptions = ['Món ăn ngon', 'Sạch sẽ', 'Lên món nhanh', 'Thái độ tốt', 'Giá hợp lý'];

  const toggleTag = (tg: string) => {
    if (tags.includes(tg)) {
      setTags(tags.filter(t => t !== tg));
    } else {
      setTags([...tags, tg]);
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideUpReview {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 100000,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        <div style={{
          background: '#fff', width: '100%',
          borderRadius: '32px 32px 0 0', padding: '32px 24px',
          paddingBottom: 'calc(32px + env(safe-area-inset-bottom))',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          animation: 'slideUpReview 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: '#FCE7F3',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px'
        }}>
          <MessageSquareHeart size={32} color="#DF1B41" />
        </div>
        
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px', color: '#1E293B', textAlign: 'center' }}>
          {t('Bạn thấy bữa ăn thế nào?')}
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#64748B', textAlign: 'center', marginBottom: '24px' }}>
          {t('Đánh giá của bạn giúp cửa hàng phục vụ tốt hơn')}
        </p>

        {/* Stars */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[1,2,3,4,5].map(v => (
            <button 
              key={v}
              onClick={() => setRating(v)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                transform: rating >= v ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              <Star size={36} fill={rating >= v ? "#F59E0B" : "transparent"} color={rating >= v ? "#F59E0B" : "#CBD5E1"} />
            </button>
          ))}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
          {tagOptions.map(tg => {
            const isActive = tags.includes(tg);
            return (
              <button
                key={tg}
                onClick={() => toggleTag(tg)}
                style={{
                  padding: '8px 16px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600,
                  border: isActive ? '1.5px solid #DF1B41' : '1.5px solid #E2E8F0',
                  background: isActive ? '#FFF1F2' : '#F8FAFC',
                  color: isActive ? '#DF1B41' : '#64748B',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {t(tg)}
              </button>
            );
          })}
        </div>

        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            width: '100%', padding: '16px', borderRadius: '100px',
            background: isSubmitting ? '#94A3B8' : '#111827',
            color: '#fff', fontSize: '1.05rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 10px 25px rgba(17,24,39,0.2)'
          }}
        >
          {isSubmitting ? t('Đang gửi...') : t('Gửi & Hoàn tất lượt ăn')}
          {!isSubmitting && <ChevronRight size={18} />}
        </button>
      </div>
      </div>
    </>
  );
}
