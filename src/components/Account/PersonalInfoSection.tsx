import React, { useState } from 'react';
import { User, Phone, Mail, Calendar, UserCircle2, Edit2, Check, X } from 'lucide-react';
import styles from './PersonalInfoSection.module.css';

export interface UserData {
    name: string;
    phone: string;
    email: string;
    gender: string;
    dob: string;
}

interface PersonalInfoSectionProps {
    userData: UserData;
    onUpdate: (data: UserData) => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ userData, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(userData);

    const handleSave = () => {
        onUpdate(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(userData);
        setIsEditing(false);
    };

    const handleChange = (field: keyof UserData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h3 className={styles.title}>Thông tin cá nhân</h3>
                {!isEditing ? (
                    <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                        <Edit2 size={16} />
                        <span>Sửa</span>
                    </button>
                ) : (
                    <div className={styles.actionBtns}>
                        <button className={styles.cancelBtn} onClick={handleCancel}>
                            <X size={16} />
                        </button>
                        <button className={styles.saveBtn} onClick={handleSave}>
                            <Check size={16} />
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.grid}>
                {/* Name */}
                <div className={`${styles.item} ${isEditing ? styles.editMode : ''}`}>
                    <div className={styles.iconWrapper}>
                        <User size={20} />
                    </div>
                    <div className={styles.content}>
                        <label className={styles.label}>Họ và tên</label>
                        {isEditing ? (
                            <input
                                className={styles.input}
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                autoFocus
                            />
                        ) : (
                            <div className={styles.value}>{userData.name}</div>
                        )}
                    </div>
                </div>

                {/* Gender */}
                <div className={`${styles.item} ${isEditing ? styles.editMode : ''}`}>
                    <div className={styles.iconWrapper}>
                        <UserCircle2 size={20} />
                    </div>
                    <div className={styles.content}>
                        <label className={styles.label}>Giới tính</label>
                        {isEditing ? (
                            <select
                                className={styles.select}
                                value={formData.gender}
                                onChange={(e) => handleChange('gender', e.target.value)}
                            >
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        ) : (
                            <div className={styles.value}>{userData.gender}</div>
                        )}
                    </div>
                </div>

                {/* DOB */}
                <div className={`${styles.item} ${isEditing ? styles.editMode : ''}`}>
                    <div className={styles.iconWrapper}>
                        <Calendar size={20} />
                    </div>
                    <div className={styles.content}>
                        <label className={styles.label}>Ngày sinh</label>
                        {isEditing ? (
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="dd/mm/yyyy"
                                value={formData.dob}
                                onChange={(e) => handleChange('dob', e.target.value)}
                            />
                        ) : (
                            <div className={styles.value}>{userData.dob}</div>
                        )}
                    </div>
                </div>

                {/* Phone */}
                <div className={`${styles.item} ${isEditing ? styles.editMode : ''}`}>
                    <div className={styles.iconWrapper}>
                        <Phone size={20} />
                    </div>
                    <div className={styles.content}>
                        <label className={styles.label}>Số điện thoại</label>
                        {isEditing ? (
                            <input
                                className={styles.input}
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />
                        ) : (
                            <div className={styles.value}>{userData.phone}</div>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div className={`${styles.item} ${isEditing ? styles.editMode : ''}`}>
                    <div className={styles.iconWrapper}>
                        <Mail size={20} />
                    </div>
                    <div className={styles.content}>
                        <label className={styles.label}>Email (Tùy chọn)</label>
                        {isEditing ? (
                            <input
                                className={styles.input}
                                value={formData.email}
                                placeholder="Chưa cập nhật"
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                        ) : (
                            <div className={styles.value}>{userData.email || 'Chưa cập nhật'}</div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
