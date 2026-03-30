"use client";

import { useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface ServiceRequest {
  label: string;
  status: string;
  timestamp: number;
}

interface UseServiceRequestsReturn {
  activeServiceRequests: ServiceRequest[];
  handleSendServiceRequests: (requestLabels: string[], otherText?: string) => Promise<void>;
}

export function useServiceRequests(
  resid: string | null,
  tableid: string | null,
  userId: string | undefined,
  setToast: (toast: { message: string; submessage: string } | null) => void
): UseServiceRequestsReturn {
  const { t } = useLanguage();
  const [activeServiceRequests, setActiveServiceRequests] = useState<ServiceRequest[]>([]);

  const handleSendServiceRequests = useCallback(async (requestLabels: string[], otherText?: string) => {
    const finalRequests = [...requestLabels];
    if (otherText) finalRequests.push(`${t('Khác')}: ${otherText}`);

    const newRequests = finalRequests.map(label => ({
      label,
      status: 'PENDING',
      timestamp: Date.now()
    }));

    setActiveServiceRequests(prev => [...prev, ...newRequests]);

    for (const label of finalRequests) {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resid, tableid, user_id: userId,
          content: label,
          type: 'SUPPORT'
        })
      });
    }

    setToast({
      message: t('Đã gửi yêu cầu!'),
      submessage: t('Nhân viên sẽ có mặt ngay sếp nhé.')
    });
    setTimeout(() => setToast(null), 3000);
  }, [resid, tableid, userId, t, setToast]);

  return {
    activeServiceRequests,
    handleSendServiceRequests,
  };
}
