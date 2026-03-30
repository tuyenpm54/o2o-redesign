'use client';

import React, { useState } from 'react';
import styles from './OnboardingForm.module.css';
import { UserData } from './PersonalInfoSection';

interface OnboardingFormProps {
    userData: UserData;
    onComplete: (data: Partial<UserData>) => void;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ userData, onComplete }) => {
    const [name, setName] = useState(userData.name || '');
    const [dob, setDob] = useState(userData.dob || '');
    const [gender, setGender] = useState(userData.gender || 'Nam');
    const [email, setEmail] = useState(userData.email || '');

    const handleSubmit = () => {
        if (name.trim()) {
            onComplete({ name, dob, gender, email });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Cập nhật thông tin 👋</h1>
                <p className={styles.subtitle}>
                    Vui lòng cung cấp đầy đủ thông tin để nhà hàng phục vụ bạn chu đáo hơn nhé!
                </p>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Họ và tên <span className={styles.required}>*</span></label>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="VD: Tuấn, Hoa..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                />
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Giới tính</label>
                    <select
                        className={styles.select}
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                    >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Ngày sinh</label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="DD/MM/YYYY"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                    type="email"
                    className={styles.input}
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className={styles.actions}>
                <button 
                    className={styles.submitBtn} 
                    onClick={handleSubmit}
                    disabled={name.trim() === ''}
                >
                    Hoàn tất & Tiếp tục
                </button>
            </div>
        </div>
    );
};
