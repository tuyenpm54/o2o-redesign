import React from 'react';
import styles from './SocialNotification.module.css';

interface NotificationProps {
    avatar: string;
    userName: string;
    actionText: string;
    visible: boolean;
}

export const SocialNotification: React.FC<NotificationProps> = ({ avatar, userName, actionText, visible }) => {
    if (!visible) return null;

    return (
        <div className={styles.notification}>
            <div className={styles.toast}>
                <img src={avatar} className={styles.avatar} alt={userName} />
                <p className={styles.toastText}>
                    <span className={styles.userName}>{userName}</span> {actionText}
                </p>
            </div>
        </div>
    );
};
