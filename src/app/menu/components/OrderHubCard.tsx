import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import styles from '../page.module.css';

import { TableMember, User, OrderItem, CartItem } from '@/types';

interface OrderHubCardProps {
  tableMembers: TableMember[];
  user: User | null;
  resid: string;
  tableid: string;
  pathname: string;
  searchParams: import('next/navigation').ReadonlyURLSearchParams;
  activeOrders: OrderItem[];
  orderRounds: any[];
  cartItems: CartItem[];
  t: (key: string) => string;
  activeRoundIndex: number;
  setActiveRoundIndex: (index: number) => void;
  setIsCartDrawerOpen: (open: boolean) => void;
  setIsStaffModalOpen: (open: boolean) => void;
  OrderStepper: React.FC<{ currentStep: 1 | 2 | 3 }>;
  greeting: string;
}

export const OrderHubCard: React.FC<OrderHubCardProps> = ({
  tableMembers,
  user,
  resid,
  tableid,
  pathname,
  searchParams,
  activeOrders,
  orderRounds,
  cartItems,
  t,
  activeRoundIndex,
  setActiveRoundIndex,
  setIsCartDrawerOpen,
  setIsStaffModalOpen,
  OrderStepper,
  greeting
}) => {
  const router = useRouter();
  const [hasReminded, setHasReminded] = useState(false);
  const [isReminding, setIsReminding] = useState(false);

  // Only count members who have placed orders
  const orderedMembers = useMemo(() => 
    tableMembers.filter((m: TableMember) => (m as any).confirmedOrders?.length > 0),
    [tableMembers]
  );
  const memberCount = orderedMembers.length || tableMembers.length;
  const displayMembers = orderedMembers.length > 0 ? orderedMembers : tableMembers;
  const colors = ["#3B82F6", "#EF4444", "#EC4899", "#F59E0B", "#8B5CF6", "#10B981"];
  const tableLink = `/table-orders?resid=${resid}&tableid=${tableid}&from=${encodeURIComponent(pathname + '?' + searchParams.toString())}`;
  
  // Avatar row renderer
  const renderAvatarRow = (compact: boolean) => (
    <div className={compact ? styles.hubAvatarRowCompact : styles.hubAvatarRow} onClick={() => router.push(tableLink)}>
      <div className={styles.hubAvatarStack}>
        <div className={styles.hubAvatars}>
          {displayMembers.slice(0, 3).map((m: TableMember, idx: number) => {
            const color = m.color || colors[idx % colors.length];
            const initials = m.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
            const size = compact ? 28 : 32;
            return (
              <div 
                key={m.id} 
                className={styles.hubAvatarMini} 
                style={{ 
                  position: 'relative',
                  zIndex: 10 - idx, 
                  width: size, 
                  height: size, 
                  fontSize: compact ? '0.7rem' : '0.8rem',
                  borderColor: color,
                  borderWidth: '1.5px',
                  borderStyle: 'solid',
                  backgroundColor: 'var(--menu-card-bg)', // Solid background so transparent PNGs don't overlap messily
                  boxShadow: `0 0 0 2px var(--menu-card-bg)`, // Creates a clean cutout between overlapping avatars
                  padding: 0,
                }}
              >
                {m.avatar ? (
                  <img src={m.avatar} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <span style={{ 
                    color, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '100%', 
                    height: '100%', 
                    background: `${color}18`, // Tint overlaid on solid background
                    borderRadius: '50%'
                  }}>
                    {initials}
                  </span>
                )}
              </div>
            );
          })}
          {displayMembers.length > 3 && (
            <div 
              className={styles.hubAvatarMini} 
              style={{ 
                position: 'relative',
                zIndex: 6, 
                width: compact ? 28 : 32, 
                height: compact ? 28 : 32, 
                fontSize: compact ? '0.65rem' : '0.7rem', 
                backgroundColor: 'var(--menu-card-bg)', 
                borderColor: '#94a3b8',
                borderWidth: '1.5px',
                borderStyle: 'solid',
                boxShadow: `0 0 0 2px var(--menu-card-bg)`,
                padding: 0
              }}
            >
              <span style={{ 
                color: '#64748b', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '100%', 
                height: '100%', 
                background: '#f1f5f9', 
                borderRadius: '50%'
              }}>
                +{displayMembers.length - 3}
              </span>
            </div>
          )}
        </div>
        <span className={styles.hubMemberText} style={compact ? { fontSize: '0.8rem' } : {}}>
          {(tableMembers.length === 1 || orderedMembers.length === 0) ? t('đang chọn món') : t('đã chọn món')}
        </span>
      </div>
      <div className={styles.hubMemberCount} style={compact ? { fontSize: '0.8rem' } : {}}>
        {memberCount} {t('người')} <ChevronRight size={compact ? 12 : 14} style={{ color: 'var(--menu-text-secondary)', opacity: 0.5 }} />
      </div>
    </div>
  );

  // Group orders into rounds
  // Group orders into rounds based on the orderRounds array passed from the backend
  const groupedRounds = useMemo(() => {
    if (!orderRounds || orderRounds.length === 0) return {};
    return orderRounds.reduce((acc: Record<string, any>, round: any) => {
      const ts = Number(round.createdAt);
      const d = new Date(isNaN(ts) ? round.createdAt : ts);
      const timeStr = !isNaN(d.getTime()) ? d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
      
      const groupKey = round.roundId || 'legacy';
      
      const r = { 
        key: groupKey, 
        time: timeStr, 
        items: round.items || [], 
        total: 0, 
        pending: 0, confirmed: 0, cooking: 0, ready: 0, served: 0, 
        timestamp: ts, 
        lastUpdatedAt: ts,
        userId: round.userId,
        userName: round.userName,
        roundNumber: round.roundNumber
      };

      if (r.items && Array.isArray(r.items)) {
        r.items.forEach((order: OrderItem) => {
          const orderUpdatedAt = order.status_updated_at 
            ? new Date(order.status_updated_at).getTime()
            : (isNaN(ts) ? new Date(order.timestamp).getTime() : ts);
          if (orderUpdatedAt > r.lastUpdatedAt) r.lastUpdatedAt = orderUpdatedAt;
          
          const qty = Number(order.qty) || 1;
          r.total += qty;
          const st = (order.status || 'pending').toLowerCase();
          if (st === 'pending' || st === 'chờ xác nhận') r.pending += qty;
          else if (st === 'confirmed' || st === 'đã xác nhận' || st === 'chờ chế biến') r.confirmed += qty;
          else if (st === 'cooking' || st === 'preparing' || st === 'đang nấu' || st === 'đang chế biến') r.cooking += qty;
          else if (st === 'ready' || st === 'đã sẵn sàng' || st === 'chuẩn bị mang ra' || st === 'đang mang ra' || st === 'chờ phục vụ') r.ready += qty;
          else if (st === 'served' || st === 'đã phục vụ') r.served += qty;
        });
      }

      acc[groupKey] = r;
      return acc;
    }, {} as Record<string, any>);
  }, [orderRounds]);

  const roundKeys = useMemo(() => (orderRounds || []).map((r: any) => r.roundId || 'legacy'), [orderRounds]);
  const hasOrders = roundKeys.length > 0;
  const currentStep = hasOrders ? 3 : (cartItems.length > 0 ? 2 : 1);
  
  // Auto-focus logic: Most recently updated round
  let autoFocusIndex = 0;
  if (hasOrders) {
    let maxUpdatedAt = -1;
    let targetIndex = -1;
    
    roundKeys.forEach((k, idx) => {
      const r = groupedRounds[k];
      if (r.served < r.total) { // incomplete
        if (r.lastUpdatedAt > maxUpdatedAt) {
          maxUpdatedAt = r.lastUpdatedAt;
          targetIndex = idx;
        }
      }
    });
    
    if (targetIndex === -1) {
      maxUpdatedAt = -1;
      roundKeys.forEach((k, idx) => {
        const r = groupedRounds[k];
        if (r.lastUpdatedAt > maxUpdatedAt) {
          maxUpdatedAt = r.lastUpdatedAt;
          targetIndex = idx;
        }
      });
    }
    
    autoFocusIndex = targetIndex !== -1 ? targetIndex : roundKeys.length - 1;
  }
  const effectiveAutoFocus = autoFocusIndex;


  return (
    <div className={styles.unifiedContextCard}>
      {/* ==== NC0: Pre-Order ==== */}
      {!hasOrders ? (
        <>
          {renderAvatarRow(false)}
          <div className={styles.unifiedGreeting}>
            <div className={styles.hubGreetingCompact}>{greeting}</div>
          </div>
          <div className={styles.unifiedStepperRow}>
            <OrderStepper currentStep={currentStep as 1 | 2 | 3} />
          </div>
        </>
      ) : (
        /* ==== NC1-NC8: Post-Order ==== */
        (() => {
          const safeRoundIndex = Math.min(
            activeRoundIndex === -1 ? effectiveAutoFocus : activeRoundIndex,
            Math.max(0, roundKeys.length - 1)
          );
          const key = roundKeys[safeRoundIndex];
          if (!key) return null;
          const r = groupedRounds[key];
          const roundTimestamp = r.timestamp;
          
          // Detect context (NC1-NC8)
          const allPending = r.pending === r.total;
          const allConfirmed = r.confirmed === r.total;
          const allServed = r.served === r.total;
          const hasCooking = r.cooking > 0;
          const hasReady = r.ready > 0;
          const hasServed = r.served > 0;
          
          let isPendingDelay = false;
          let isConfirmedDelay = false;
          let isCookingDelay = false;

          // Compute delays precisely per item based on their time in CURRENT status
          const delayedItems = r.items.filter((item: OrderItem) => {
            const st = (item.status || 'pending').toLowerCase();
            const itemTs = Number(item.status_updated_at) || Number(item.timestamp) || roundTimestamp;
            const itemMin = Math.floor((Date.now() - itemTs) / 60000);
            
            if ((st === 'pending' || st === 'chờ xác nhận') && itemMin >= 5) {
                isPendingDelay = true;
                return true;
            }
            if ((st === 'confirmed' || st.includes('xác nhận')) && itemMin >= 5) {
                isConfirmedDelay = true;
                return true;
            }
            if ((st.includes('cook') || st.includes('nấu') || st.includes('biến')) && itemMin >= 15) {
                isCookingDelay = true;
                return true;
            }
            return false;
          });
          
          const isDelay = delayedItems.length > 0;
          let maxDelay = 0;
          if (isDelay) {
            maxDelay = Math.max(...delayedItems.map((i: OrderItem) => Math.floor((Date.now() - (Number(i.status_updated_at) || Number(i.timestamp) || roundTimestamp)) / 60000)));
          }

          let contextIcon: React.ReactNode = <img src="/icons/status_pending.png" alt="Pending" style={{ width: 14, height: 14, verticalAlign: 'middle', borderRadius: '50%' }} />;
          let statusGif = "/images/status/wait-confirm.gif";
          let contextColor = "#3b82f6";
          let statusText = t("Chờ xác nhận");
          let statusSubText = "";
          
          if (allServed) {
            statusGif = "/images/status/done.gif";
            contextIcon = <img src="/icons/status_served.png" alt="Served" style={{ width: 16, height: 16, verticalAlign: 'middle', borderRadius: '50%' }} />;
            contextColor = "#10b981";
            statusText = t("Đủ món rồi! ✨");
            statusSubText = t("Chúc cả nhà ngon miệng");
          } else if (hasReady) {
            statusGif = "/images/status/done.gif";
            contextIcon = <img src="/icons/status_ready.png" alt="Ready" style={{ width: 16, height: 16, verticalAlign: 'middle', borderRadius: '50%' }} />;
            contextColor = "#3b82f6";
            statusText = t("Sắp mang ra bàn");
            statusSubText = `${r.ready}/${r.total} ${t('món đã xong')}`;
          } else if (hasServed && hasCooking) {
            statusGif = "/images/status/cooking.gif";
            contextIcon = <img src="/icons/status_cooking.png" alt="Cooking" style={{ width: 16, height: 16, verticalAlign: 'middle', borderRadius: '50%' }} />;
            contextColor = "#f59e0b";
            statusText = t("Bếp đang làm tiếp");
            statusSubText = `${r.served}/${r.total} ${t('món đã lên')}`;
          } else if (hasCooking) {
            statusGif = "/images/status/cooking.gif";
            contextIcon = <img src="/icons/status_cooking.png" alt="Cooking" style={{ width: 16, height: 16, verticalAlign: 'middle', borderRadius: '50%' }} />;
            contextColor = "#f59e0b";
            statusText = t("Đang chế biến 🔥");
            statusSubText = `${r.cooking}/${r.total} ${t('món')}`;
          } else if (allConfirmed) {
            statusGif = "/images/status/wait-confirm.gif";
            contextIcon = <img src="/icons/status_served.png" alt="Confirmed" style={{ width: 16, height: 16, verticalAlign: 'middle', borderRadius: '50%', filter: 'hue-rotate(60deg)' }} />;
            contextColor = "#10b981";
            statusText = t("Đã chốt đơn ✓");
            statusSubText = t("Đang chuyển xuống bếp");
          } else if (allPending) {
            statusGif = "/images/status/wait-confirm.gif";
            contextIcon = <img src="/icons/status_pending.png" alt="Pending" style={{ width: 16, height: 16, verticalAlign: 'middle', borderRadius: '50%' }} />;
            contextColor = "#f59e0b";
            statusText = t("Đã nhận đơn");
            statusSubText = t("Chờ xác nhận nhé");
          } else {
            statusGif = "/images/status/wait-confirm.gif";
            contextIcon = <img src="/icons/status_pending.png" alt="Processing" style={{ width: 16, height: 16, verticalAlign: 'middle', borderRadius: '50%' }} />;
            contextColor = "#3b82f6";
            statusText = t("Đang xử lý");
            statusSubText = t("Chờ một lát nhé");
          }
          
          // Override status when delayed — merge warning into status text
          // Only show delay for the CURRENT highest phase of the round.
          let appliedDelayStr = '';
          let appliedActionText = '';
          let appliedSubActionText = '';
          let shouldOverride = false;

          if (allServed) {
             shouldOverride = false;
          } else if (hasReady) {
             shouldOverride = false; // Usually don't complain if food is ready to serve
          } else if (hasCooking) {
             if (isCookingDelay) {
                 shouldOverride = true;
                 appliedActionText = t('Lên món chậm');
                 appliedSubActionText = t('Nhấn để hối lên món');
                 appliedDelayStr = maxDelay >= 60 ? `${Math.floor(maxDelay / 60)}h${maxDelay % 60 > 0 ? `${maxDelay % 60}p` : ''}` : `${maxDelay}p`;
                 // Keep the progress in subtext
                 statusSubText = `${r.cooking}/${r.total} ${t('món đang làm')}`;
             }
          } else if (allConfirmed || r.confirmed > 0) {
             if (isConfirmedDelay) {
                 shouldOverride = true;
                 appliedActionText = t('Bếp chưa nấu');
                 appliedSubActionText = t('Nhấn để tôi giục bếp');
                 appliedDelayStr = maxDelay >= 60 ? `${Math.floor(maxDelay / 60)}h${maxDelay % 60 > 0 ? `${maxDelay % 60}p` : ''}` : `${maxDelay}p`;
             }
          } else {
             if (isPendingDelay) {
                 shouldOverride = true;
                 appliedActionText = t('Chưa nhận đơn');
                 appliedSubActionText = t('Nhấn để nhắc phục vụ');
                 appliedDelayStr = maxDelay >= 60 ? `${Math.floor(maxDelay / 60)}h${maxDelay % 60 > 0 ? `${maxDelay % 60}p` : ''}` : `${maxDelay}p`;
             }
          }

          if (shouldOverride) {
            contextIcon = <img src="/icons/status_delay.png" alt="Delay" style={{ width: 16, height: 16, verticalAlign: 'middle', borderRadius: '50%' }} />;
            contextColor = "#ef4444";
            
            // For cooking delay, we might want to keep the cooking gif, but red is fine.
            if (isCookingDelay && hasCooking) {
               statusGif = "/images/status/cooking.gif";
               statusText = `${appliedActionText} (${t('Trễ')} ${appliedDelayStr.trim()})`;
            } else {
               statusGif = "/images/status/wait-confirm.gif";
               statusText = `${appliedActionText} (${t('Trễ')} ${appliedDelayStr.trim()})`;
               statusSubText = isReminding ? t('Đang gọi...') : (hasReminded ? t('Đã nhắc nhân viên!') : appliedSubActionText);
            }
          }

          let bottomLineContent = null;
          const newCartItemsCount = cartItems.reduce((acc, c) => acc + (c.quantity || 1), 0);
          
          if (newCartItemsCount > 0) {
            bottomLineContent = (
              <div className={styles.notifyLine} onClick={() => setIsCartDrawerOpen(true)}>
                <div className={styles.redDot}></div>
                <span>{t('Có')} {newCartItemsCount} {t('món mới trong giỏ hàng chờ gửi order!')}</span>
              </div>
            );
          }
          
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {renderAvatarRow(true)}

              {/* Round Header */}
              <div className={styles.hubRoundHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className={styles.hubRoundTitle} style={{ fontSize: '0.88rem', flex: 1, display: 'flex', alignItems: 'center' }}>
                  {(() => {
                    if (orderedMembers.length > 1 && r.userId) {
                      const roundUser = tableMembers.find(m => String(m.id) === String(r.userId));
                      if (roundUser) {
                        const color = roundUser.color || colors[0];
                        const initials = roundUser.name.split(" ").map((n:string)=>n[0]).join("").toUpperCase().slice(0, 2);
                        return (
                          <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: roundUser.avatar ? 'var(--menu-card-bg)' : `${color}15`, border: `1.5px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                            {roundUser.avatar ? <img src={roundUser.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={roundUser.name} /> : <span style={{ fontSize: '0.55rem', color, fontWeight: 800 }}>{initials}</span>}
                          </div>
                        );
                      }
                    }
                    return <span style={{ display: 'flex', alignItems: 'center', marginRight: '6px' }}>{contextIcon}</span>;
                  })()}
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ fontWeight: 800 }}>
                      {orderedMembers.length > 1 && r.roundNumber > 0 ? `${r.userName?.split(' ')[0] || 'Khách'} ${t('gọi lúc')} ${r.time}` : `${t('Đơn lúc')} ${r.time}`}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--menu-text-secondary)', marginLeft: '4px' }}>
                      {r.total ? `• ${r.total} ${t('món')}` : ''}
                    </span>
                  </span>
                </div>
                {roundKeys.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '12px' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveRoundIndex(Math.max(0, safeRoundIndex - 1)); }}
                      style={{ 
                        background: safeRoundIndex === 0 ? 'transparent' : 'var(--menu-bg-secondary)', 
                        border: 'none', padding: '4px', borderRadius: '50%', 
                        color: safeRoundIndex === 0 ? 'rgba(150,150,150,0.3)' : 'var(--menu-text-primary)', 
                        cursor: safeRoundIndex === 0 ? 'default' : 'pointer', display: 'flex' 
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--menu-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                      {safeRoundIndex + 1}/{roundKeys.length}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveRoundIndex(Math.min(roundKeys.length - 1, safeRoundIndex + 1)); }}
                      style={{ 
                        background: safeRoundIndex === roundKeys.length - 1 ? 'transparent' : 'var(--menu-bg-secondary)', 
                        border: 'none', padding: '4px', borderRadius: '50%', 
                        color: safeRoundIndex === roundKeys.length - 1 ? 'rgba(150,150,150,0.3)' : 'var(--menu-text-primary)', 
                        cursor: safeRoundIndex === roundKeys.length - 1 ? 'default' : 'pointer', display: 'flex' 
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Prominent Status Banner */}
              <div 
                className={`${styles.prominentStatusBanner} ${isDelay && !hasReminded ? styles.blinkAttention : ''}`} 
                style={{ 
                  backgroundColor: `${contextColor}15`, 
                  border: `1px solid ${contextColor}30`, 
                  cursor: isDelay && !hasReminded ? 'pointer' : 'default',
                  borderRadius: isDelay ? '16px' : undefined,
                  opacity: isReminding ? 0.7 : 1,
                  pointerEvents: isReminding || hasReminded ? 'none' : 'auto'
                }}
                onClick={isDelay && !hasReminded ? async () => {
                  try {
                    setIsReminding(true);
                    await fetch('/api/chat', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        resid, 
                        tableid, 
                        user_id: user?.id || null,
                        content: t('Xác nhận quá lâu'),
                        type: 'SUPPORT'
                      })
                    });
                    setHasReminded(true);
                  } catch (e) {
                    console.error("Failed to send support request", e);
                  } finally {
                    setIsReminding(false);
                  }
                } : undefined}
              >
                <div className={styles.prominentStatusGif}>
                   <img src={statusGif} alt={statusText} />
                </div>
                <div className={styles.prominentStatusInfo}>
                   <div className={styles.prominentStatusTitle} style={{ color: contextColor }}>
                      <div>{statusText}</div>
                      {statusSubText && (
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, opacity: 0.85, marginTop: '2px' }}>
                          {statusSubText}
                        </div>
                      )}
                   </div>
                </div>
              </div>

              {bottomLineContent}
            </div>
          );
        })()
      )}
    </div>
  );
};
