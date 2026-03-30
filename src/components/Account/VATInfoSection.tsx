import React, { useState } from 'react';
import { Building2, Plus, Check, Edit2, X, FileText, Briefcase } from 'lucide-react';
import styles from './VATInfoSection.module.css';

export interface VATProfile {
    id: string;
    companyName: string;
    taxCode: string;
    address: string;
    email?: string;
    isDefault?: boolean;
}

export const VATInfoSection: React.FC = () => {
    const [profiles, setProfiles] = useState<VATProfile[]>([]);
    const [selectedId, setSelectedId] = useState<string>('');
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [companyName, setCompanyName] = useState('');
    const [taxCode, setTaxCode] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const fetchVat = async () => {
            try {
                const res = await fetch('/api/account/vat');
                if (res.ok) {
                    const data = await res.json();
                    if (data.data?.profiles?.length > 0) {
                        setProfiles(data.data.profiles);
                        setSelectedId(data.data.profiles[0].id);
                    }
                }
            } catch (err) {
                console.error('Fetch VAT err:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchVat();
    }, []);

    const handleSaveNew = async () => {
        if (!companyName.trim() || !taxCode.trim() || !address.trim()) {
            alert("Vui lòng nhập đầy đủ Tên công ty, Mã số thuế và Địa chỉ!");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/account/vat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyName, taxCode, address, email: email.trim() || undefined, isDefault: profiles.length === 0 })
            });

            if (res.ok) {
                const data = await res.json();
                const newProfile = data.data.profile;
                setProfiles([newProfile, ...profiles]);
                setSelectedId(newProfile.id);
                setIsAdding(false);
                setCompanyName('');
                setTaxCode('');
                setAddress('');
                setEmail('');
            } else {
                alert("Lưu thất bại, vui lòng thử lại!");
            }
        } catch (err) {
            console.error(err);
            alert("Lưu thất bại, vui lòng thử lại!");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h3 className={styles.title}>Thông tin xuất hoá đơn (VAT)</h3>
            </div>

            <p className={styles.subtitle}>
                Chọn thông tin công ty bên dưới để nhận hoá đơn VAT điện tử qua email.
            </p>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8' }}>
                    Đang tải danh sách VAT...
                </div>
            ) : (
                <div className={styles.profileList}>
                {profiles.map(profile => (
                    <div 
                        key={profile.id} 
                        className={`${styles.vatCard} ${selectedId === profile.id ? styles.selected : ''}`}
                        onClick={() => setSelectedId(profile.id)}
                    >
                        <div className={styles.cardHeader}>
                            <Briefcase size={18} className={styles.buildingIcon} />
                            <h4 className={styles.companyName}>{profile.companyName}</h4>
                            <div className={styles.radioBlock}>
                                {selectedId === profile.id ? (
                                    <div className={styles.radioInner}><Check size={12} strokeWidth={3} color="white" /></div>
                                ) : (
                                    <div className={styles.radioOuter}></div>
                                )}
                            </div>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>MST:</span>
                                <span className={styles.infoValue}>{profile.taxCode}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Địa chỉ:</span>
                                <span className={styles.infoValue}>{profile.address}</span>
                            </div>
                            {profile.email && (
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Email:</span>
                                    <span className={styles.infoValue}>{profile.email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            )}

            {!isAdding ? (
                <button className={styles.addNewBtn} onClick={() => setIsAdding(true)}>
                    <Plus size={18} />
                    <span>Thêm thông tin xuất hoá đơn</span>
                </button>
            ) : (
                <div className={styles.addFormContainer}>
                    <div className={styles.formHeader}>
                        <h4 className={styles.formTitle}>Thêm thông tin mới</h4>
                        <button className={styles.closeBtn} onClick={() => setIsAdding(false)}>
                            <X size={18} />
                        </button>
                    </div>
                    
                    <div className={styles.formBody}>
                        <div className={styles.inputGroup}>
                            <label>Tên công ty (*)</label>
                            <input 
                                type="text" 
                                placeholder="Ví dụ: CÔNG TY TNHH ABC"
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Mã số thuế (*)</label>
                            <input 
                                type="text" 
                                placeholder="Nhập mã số thuế"
                                value={taxCode}
                                onChange={e => setTaxCode(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Địa chỉ công ty (*)</label>
                            <textarea 
                                placeholder="Địa chỉ đăng ký kinh doanh"
                                rows={2}
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Email nhận hoá đơn</label>
                            <input 
                                type="email" 
                                placeholder="ketoan@abc.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <button className={styles.saveBtn} onClick={handleSaveNew} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
                        {saving ? 'Đang lưu...' : 'Xác nhận thêm'}
                    </button>
                </div>
            )}
        </section>
    );
};
