
import React from 'react';
import { Pencil, CloudSun } from 'lucide-react';
import styles from './Greeting.module.css';

interface GreetingProps {
    userName?: string;
}

export const Greeting: React.FC<GreetingProps> = ({ userName = 'Tuấn Nguyễn' }) => {
    const getGreetingTime = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <CloudSun size={24} className={styles.icon} color="#F59E0B" />
                <span className={styles.text}>
                    {getGreetingTime()} <span className={styles.userName}>{userName}</span>
                </span>
                <button className={styles.editBtn}>
                    <Pencil size={14} color="#3b82f6" />
                </button>
            </div>
        </div>
    );
};
