const fs = require('fs');
const file = '/Users/tuyenpham712/Work/o2o-redesign/src/app/menu/components/CheckoutSheet.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

const correctBlock = `                    <div style={{ padding: '0 20px 24px' }}>
                        <div style={{ 
                            background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                            borderRadius: '20px', overflow: 'hidden',
                            border: \`1px solid \${interactiveBorder}\`
                        }}>
                            {/* Voucher Row */}
                            <div 
                                onClick={() => {
                                    if (isGuest) {
                                        setLoginReason('VOUCHER');
                                        setIsLoginOpen(true);
                                    } else {
                                        setIsVoucherDrawerOpen(true);
                                    }
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '20px', borderBottom: \`1px solid \${interactiveBorder}\`,
                                    background: voucherCode ? \`\${theme.accent}10\` : 'transparent',
                                    cursor: 'pointer', transition: 'background 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ 
                                        width: 44, height: 44, borderRadius: '14px', 
                                        background: voucherCode ? theme.accent : (isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9'),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: voucherCode ? '#fff' : '#10B981'
                                    }}>
                                        <Ticket size={24} strokeWidth={2.5} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 700, fontSize: '1rem', color: voucherCode ? theme.accent : theme.textPrimary, marginBottom: 2 }}>
                                            {t('Ưu đãi & Mã giảm giá')}
                                        </span>
                                        <span style={{ fontSize: '0.85rem', color: theme.textSecondary, fontWeight: 500 }}>
                                            {voucherCode || t('Nhấn để áp dụng')}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ color: voucherCode ? theme.accent : theme.textSecondary }}>
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                            
                            {/* Payment Row */}
                            <div 
                                onClick={() => setIsPaymentDrawerOpen(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '20px', background: 'transparent',
                                    cursor: 'pointer', transition: 'background 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ 
                                        width: 44, height: 44, borderRadius: '14px', 
                                        background: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' 
                                    }}>
                                        <activePaymentMethod.icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 700, fontSize: '1rem', color: theme.textPrimary, marginBottom: 2 }}>{t(activePaymentMethod.label)}</span>
                                        <span style={{ fontSize: '0.85rem', color: theme.textSecondary, fontWeight: 500 }}>
                                            {selectedMethod.startsWith('BANK:') ? selectedMethod.split(':')[1] : t('Nhấn để đổi phương thức...')}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ color: theme.textSecondary }}>
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    </div>`;

// We inject correctBlock to replace lines 372 through 469 (index 372 to 469).
lines.splice(372, 98, correctBlock);
fs.writeFileSync(file, lines.join('\n'));
console.log('Fixed');
