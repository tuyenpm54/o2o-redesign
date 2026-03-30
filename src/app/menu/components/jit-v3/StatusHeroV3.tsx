"use client";

import React from 'react';
import { ChefHat, ShoppingBag, Clock, ChevronRight, AlertCircle, CheckCircle2, Ghost } from 'lucide-react';
import styles from './StatusHeroV3.module.css';
import '../../../../styles/jit-v3.css';
import { useLanguage } from '@/context/LanguageContext';

interface StatusHeroV3Props {
  latestStatus: string | null;
  minutesSinceLastOrder: number | null;
  intent: string | null;
  onCallStaff: () => void;
}

export function StatusHeroV3({ latestStatus, minutesSinceLastOrder, intent, onCallStaff }: StatusHeroV3Props) {
  const { t } = useLanguage();

  const isDelayed = minutesSinceLastOrder !== null && minutesSinceLastOrder > 15 && latestStatus === 'Cooking';
  const isUnconfirmed = intent === 'UNCONFIRMED_ALERT';

  const getStatusClass = () => {
    switch (latestStatus) {
      case 'Pending':
      case 'Confirmed': return 'status-pending';
      case 'Cooking': return 'status-cooking';
      case 'Ready': return 'status-ready';
      case 'Served': return 'status-served';
      default: return '';
    }
  };

  const renderStatusVisual = () => {
    if (latestStatus === 'Pending' || latestStatus === 'Confirmed' || isUnconfirmed) {
      return (
        <div className={styles.statusIconWrapper}>
          <img src="/images/status/wait-confirm.gif" alt="waiting" className="statusGif" />
        </div>
      );
    }
    if (latestStatus === 'Cooking') {
      return (
        <div className={styles.statusIconWrapper}>
          <img src="/images/status/cooking.gif" alt="cooking" className="statusGif" />
        </div>
      );
    }
    if (latestStatus === 'Ready') {
      return (
        <div className={styles.statusIconWrapper}>
          <img src="/images/status/done.gif" alt="done" className="statusGif" />
        </div>
      );
    }
    if (latestStatus === 'Served') {
      return (
        <div className={styles.statusIconWrapper}>
          <div className="statusCheckIcon">
            <CheckCircle2 size={24} />
          </div>
        </div>
      );
    }
    return (
      <div className={styles.statusIconWrapper}>
        <Ghost size={32} color="#94A3B8" />
      </div>
    );
  };

  const getStatusLabel = () => {
    switch (latestStatus) {
      case 'Pending': return t('Đang đợi nhà hàng xác nhận');
      case 'Confirmed': return t('Đã nhận đơn');
      case 'Cooking': return t('Cửa hàng đang làm đồ');
      case 'Ready': return t('Đồ của bạn đã làm xong rồi đó');
      case 'Served': return t('Đơn hàng đã giao thành công');
      default: return isUnconfirmed ? t('Bạn có món trong giỏ kìa') : t('Đang xem menu');
    }
  };

  const getStatusDesc = () => {
    if (isDelayed) return t('Dường như đơn hàng có chút chậm trễ...');
    if (latestStatus === 'Cooking') return t('Món của bàn sẽ ra trong ít phút nữa');
    if (latestStatus === 'Ready') return t('Nhân viên sẽ mang ra bàn ngay ạ');
    if (latestStatus === 'Served') return t('Chúc bạn một bữa ăn thật ngon miệng!');
    if (isUnconfirmed) return t('Chốt đơn luôn để nhà hàng chuẩn bị nhé?');
    return t('O2O hân hạnh phục vụ quý khách');
  };

  return (
    <div className={`pulsarContainer ${getStatusClass()}`}>
      {renderStatusVisual()}
      
      <div className="statusInfoContent">
        <h2 className="mainStatusText">
          {getStatusLabel()}
        </h2>
        <p className="statusDesc">
          {getStatusDesc()}
        </p>

        {isDelayed && (
          <button className="proactiveButton" style={{ marginTop: 8 }} onClick={onCallStaff}>
            <AlertCircle size={16} />
            {t('Đồ của tôi sao chưa có?')}
          </button>
        )}

        {latestStatus === 'Cooking' && !isDelayed && (
          <div className="progressBarTrack" style={{ margin: '8px 0 0' }}>
              <div className="progressBarFill" style={{ width: '60%', background: '#000' }}></div>
          </div>
        )}
      </div>

      {minutesSinceLastOrder !== null && latestStatus !== 'Served' && (
        <div className={styles.timeBadgeAbs}>
          <Clock size={10} /> {minutesSinceLastOrder} ph
        </div>
      )}
    </div>
  );
}
