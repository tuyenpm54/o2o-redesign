const fs = require('fs');
const file = 'src/app/menu/MenuView.tsx';
let txt = fs.readFileSync(file, 'utf8');

// 1. Delete MemberLobbyLocal
txt = txt.replace(/function MemberLobbyLocal[\s\S]*?^}\n/m, '');

// 2. Add activeRoundIndex state
txt = txt.replace('const [isStatusToastOpen, setIsStatusToastOpen] = useState(false);', 'const [isStatusToastOpen, setIsStatusToastOpen] = useState(false);\n  const [activeRoundIndex, setActiveRoundIndex] = useState(0);');

// 3. Replace unifiedContextCard block
const startTok = '{/* Unified Context Card: Greeting + Member Lobby + Order Stepper */}';
const targetEndTok = '          );\\n        })()}';
const newJSX = `{/* Table Hub Card (Dual-State) */}
        {(() => {
          const memberCount = tableMembers.length;
          const colors = ["#3B82F6", "#EF4444", "#EC4899", "#F59E0B", "#8B5CF6", "#10B981"];
          
          // Group orders into rounds
          const groupedRounds = activeOrders.reduce((acc, order) => {
            const ts = Number(order.timestamp);
            const d = new Date(isNaN(ts) ? order.timestamp : ts);
            const timeStr = !isNaN(d.getTime()) ? d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
            
            let groupKey = timeStr || 'Không rõ giờ';
            if (order.round) {
              groupKey = timeStr ? \`Lượt \${order.round} - \${timeStr}\` : \`Lượt \${order.round}\`;
            }
            
            if (!acc[groupKey]) acc[groupKey] = { key: groupKey, time: timeStr, items: [], total: 0, pending: 0, cooking: 0, ready: 0 };
            
            acc[groupKey].items.push(order);
            const qty = Number(order.qty) || 1;
            acc[groupKey].total += qty;
            
            const st = (order.status || 'pending').toLowerCase();
            if (st === 'pending' || st === 'chờ xác nhận') acc[groupKey].pending += qty;
            else if (st === 'cooking' || st === 'preparing' || st === 'đang nấu' || st === 'đang chế biến' || st === 'confirmed') acc[groupKey].cooking += qty;
            else if (st === 'ready' || st === 'served' || st === 'đã sẵn sàng' || st === 'đã phục vụ') acc[groupKey].ready += qty;
            
            return acc;
          }, {});

          const roundKeys = Object.keys(groupedRounds).sort();
          const hasOrders = roundKeys.length > 0;
          const currentStep = hasOrders ? 3 : (cartItems.length > 0 ? 2 : 1);
          
          return (
            <div className={styles.unifiedContextCard}>
              {/* STATE 1: Pre-Order */}
              {!hasOrders ? (
                <>
                  <div className={styles.hubAvatarRow} onClick={() => router.push(\`/table-orders?resid=\${resid}&tableid=\${tableid}&from=\${encodeURIComponent(pathname + '?' + searchParams.toString())}\`)}>
                    <div className={styles.hubAvatarStack}>
                      <div className={styles.hubAvatars}>
                        {tableMembers.slice(0, 3).map((m, idx) => {
                          const color = m.color || colors[m.name.length % colors.length];
                          const initials = m.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                          return (
                            <div key={m.id} className={styles.hubAvatarMini} style={{ zIndex: 10 - idx }}>
                              {m.avatar ? <img src={m.avatar} alt={m.name} /> : <span style={{ color }}>{initials}</span>}
                            </div>
                          );
                        })}
                      </div>
                      <span className={styles.hubMemberText}>{t('đang trong bàn')}</span>
                    </div>
                    <div className={styles.hubMemberCount}>
                      {memberCount} {t('người')} <ChevronRight size={14} style={{ color: 'var(--menu-text-secondary)', opacity: 0.5 }} />
                    </div>
                  </div>
                  
                  <div className={styles.unifiedGreeting}>
                    <div className={styles.hubGreetingCompact}>{greeting}</div>
                  </div>
                  
                  <div className={styles.unifiedStepperRow}>
                    <OrderStepper currentStep={currentStep} />
                  </div>
                </>
              ) : (
                /* STATE 2: Post-Order */
                (() => {
                  const safeRoundIndex = Math.min(activeRoundIndex, Math.max(0, roundKeys.length - 1));
                  const key = roundKeys[safeRoundIndex];
                  if (!key) return null;
                  const r = groupedRounds[key];
                  const roundNumber = key.split(' - ')[0];
                  
                  const progressMsg = r.ready === r.total ? t('Đã phục vụ xong') : \`\${r.ready}/\${r.total} món\`;
                  const progressColor = r.ready === r.total ? "var(--menu-accent, #10b981)" : (r.cooking > 0 ? "#f59e0b" : "#3b82f6");
                  const progressPercent = Math.round((r.ready / r.total) * 100);

                  const feedItems = [];
                  r.items.sort((a, b) => {
                    const statusVal = (s) => (s.includes('cook') || s.includes('nấu') || s.includes('biến') ? 3 : (s.includes('ready') || s.includes('sẵn') ? 2 : 1));
                    return statusVal(b.status || '') - statusVal(a.status || '');
                  }).slice(0, 3).forEach((item, i) => {
                    const st = (item.status || 'pending').toLowerCase();
                    let icon = "⏳"; let desc = "Chờ xác nhận";
                    if (st.includes('cook') || st.includes('nấu') || st.includes('biến') || st.includes('confirmed')) { icon = "🔥"; desc = "Đang chế biến"; }
                    if (st.includes('ready') || st.includes('sẵn') || st.includes('served') || st.includes('phục vụ')) { icon = "✅"; desc = "Đã lên món"; }
                    feedItems.push({ id: item.id || i, name: item.name, icon, desc, qty: item.qty });
                  });

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className={styles.hubAvatarRowCompact} onClick={() => router.push(\`/table-orders?resid=\${resid}&tableid=\${tableid}&from=\${encodeURIComponent(pathname + '?' + searchParams.toString())}\`)}>
                        <div className={styles.hubAvatarStack}>
                          <div className={styles.hubAvatars}>
                            {tableMembers.slice(0, 3).map((m, idx) => {
                              const color = m.color || colors[m.name.length % colors.length];
                              const initials = m.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                              return (
                                <div key={m.id} className={styles.hubAvatarMini} style={{ zIndex: 10 - idx, width: 20, height: 20, fontSize: '0.5rem' }}>
                                  {m.avatar ? <img src={m.avatar} alt={m.name} /> : <span style={{ color }}>{initials}</span>}
                                </div>
                              );
                            })}
                          </div>
                          <span className={styles.hubMemberText} style={{ fontSize: '0.8rem' }}>{t('đang trong bàn')}</span>
                        </div>
                        <div className={styles.hubMemberCount} style={{ fontSize: '0.8rem' }}>
                          {memberCount} {t('người')} <ChevronRight size={12} style={{ color: 'var(--menu-text-secondary)', opacity: 0.5 }} />
                        </div>
                      </div>

                      <div className={styles.hubRoundHeader}>
                        <div className={styles.hubRoundTitle}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: progressColor }}></div>
                          {roundNumber} {r.time && <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--menu-text-secondary)', marginLeft: 4 }}>• {r.time}</span>}
                        </div>
                        <div className={styles.hubRoundStatus} style={{ color: progressColor }}>{progressMsg}</div>
                      </div>

                      <div className={styles.hubProgressBar}>
                        <div className={styles.hubProgressFill} style={{ width: \`\${progressPercent}%\`, background: progressColor }}></div>
                      </div>

                      <div className={styles.hubEventFeed}>
                        {feedItems.map((fi, i) => (
                          <div key={fi.id + '-' + i} className={styles.hubEventItem}>
                            <span className={styles.hubEventIcon}>{fi.icon}</span>
                            <div className={styles.hubEventContent}>
                              <span className={styles.hubEventName}>{fi.qty}x {fi.name}</span>
                              <span className={styles.hubEventDesc}>— {fi.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {roundKeys.length > 1 && (
                        <div className={styles.hubDots}>
                          {roundKeys.map((_, idx) => (
                             <div
                                key={idx}
                                className={\`\${styles.hubDot} \${idx === safeRoundIndex ? styles.hubDotActive : ''}\`}
                                onClick={(e) => { e.stopPropagation(); setActiveRoundIndex(idx); }}
                             />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          );
        })()}`;

const startIdx = txt.indexOf(startTok);
let endIdx = txt.indexOf('        })()}', startIdx);
if(endIdx !== -1) {
    endIdx += 13; // length of '        })()}'
    txt = txt.substring(0, startIdx) + newJSX + txt.substring(endIdx);
} else {
    console.error("End token not found");
}

fs.writeFileSync(file, txt);
console.log('Done');
