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
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    return (
        <div className={styles.container}>
            {/* Function List Group 1: Security (Renamed from Account) */}
            <div className={styles.group}>
                <h4 className={styles.groupTitle}>Bảo mật</h4>
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
                <div className={styles.menuItem} onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
                    <div className={`${styles.iconBox} ${styles.orange}`}>
                        <Bell size={20} />
                    </div>
                    <span>Thông báo</span>
                    <div className={`${styles.toggleSwitch} ${notificationsEnabled ? styles.active : ''}`}>
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
                <span>Đăng xuất tài khoản</span>
            </button>

            <div className={styles.version}>
                Phiên bản 1.0.0
            </div>
        </div>
    );
};
