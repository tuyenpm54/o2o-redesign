import React, { useState } from 'react';
import { User, Phone, Mail, Calendar, UserCircle2, Settings, LogOut, ChevronRight, Bell, Shield, HelpCircle, FileText } from 'lucide-react';
import styles from './AccountSettings.module.css';
import { PersonalInfoSection, UserData } from './PersonalInfoSection';

interface AccountSettingsProps {
    userData: UserData;
    onUpdateUserData: (data: UserData) => void;
    onLogout: () => void;
    onVerify?: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({
    userData,
    onUpdateUserData,
    onLogout,
    onVerify
}) => {
    const [view, setView] = useState<'LIST' | 'PERSONAL_INFO'>('LIST');

    if (view === 'PERSONAL_INFO') {
        return (
            <div className={styles.subViewContainer}>
                <button className={styles.backBtn} onClick={() => setView('LIST')}>
                    <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                    Quay lại
                </button>
                <PersonalInfoSection userData={userData} onUpdate={onUpdateUserData} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* User Profile Header */}
            <div className={styles.profileHeader} onClick={() => setView('PERSONAL_INFO')}>
                <div className={styles.avatar}>
                    <User size={32} className={styles.avatarIcon} />
                </div>
                <div className={styles.profileInfo}>
                    <h3 className={styles.userName}>{userData.name}</h3>
                    <p className={styles.userPhone}>{userData.phone}</p>
                    {userData.phone === 'Chưa xác thực' && (
                        <button className={styles.verifyBtn} onClick={(e) => {
                            e.stopPropagation();
                            onVerify?.();
                        }}>
                            Xác thực ngay
                        </button>
                    )}
                </div>
                <ChevronRight size={20} className={styles.chevron} />
            </div>

            {/* Function List Group 1: Account */}
            <div className={styles.group}>
                <h4 className={styles.groupTitle}>Tài khoản</h4>
                <div className={styles.menuItem} onClick={() => setView('PERSONAL_INFO')}>
                    <div className={`${styles.iconBox} ${styles.blue}`}>
                        <UserCircle2 size={20} />
                    </div>
                    <span>Thông tin cá nhân</span>
                    <ChevronRight size={16} className={styles.menuChevron} />
                </div>
                <div className={styles.menuItem}>
                    <div className={`${styles.iconBox} ${styles.green}`}>
                        <Shield size={20} />
                    </div>
                    <span>Bảo mật & Mật khẩu</span>
                    <ChevronRight size={16} className={styles.menuChevron} />
                </div>
            </div>

            {/* Function List Group 2: App Settings */}
            <div className={styles.group}>
                <h4 className={styles.groupTitle}>Ứng dụng</h4>
                <div className={styles.menuItem}>
                    <div className={`${styles.iconBox} ${styles.orange}`}>
                        <Bell size={20} />
                    </div>
                    <span>Thông báo</span>
                    <div className={styles.toggleSwitch}>
                        <div className={styles.toggleKnob} />
                    </div>
                </div>
                <div className={styles.menuItem}>
                    <div className={`${styles.iconBox} ${styles.purple}`}>
                        <Settings size={20} />
                    </div>
                    <span>Cài đặt chung</span>
                    <ChevronRight size={16} className={styles.menuChevron} />
                </div>
            </div>

            {/* Function List Group 3: Support */}
            <div className={styles.group}>
                <h4 className={styles.groupTitle}>Hỗ trợ</h4>
                <div className={styles.menuItem}>
                    <div className={`${styles.iconBox} ${styles.teal}`}>
                        <HelpCircle size={20} />
                    </div>
                    <span>Trung tâm trợ giúp</span>
                    <ChevronRight size={16} className={styles.menuChevron} />
                </div>
                <div className={styles.menuItem}>
                    <div className={`${styles.iconBox} ${styles.gray}`}>
                        <FileText size={20} />
                    </div>
                    <span>Điều khoản sử dụng</span>
                    <ChevronRight size={16} className={styles.menuChevron} />
                </div>
            </div>

            {/* Logout */}
            <button className={styles.logoutBtn} onClick={onLogout}>
                <LogOut size={20} />
                <span>Đăng xuất</span>
            </button>

            <div className={styles.version}>
                Phiên bản 1.0.0
            </div>
        </div>
    );
};
