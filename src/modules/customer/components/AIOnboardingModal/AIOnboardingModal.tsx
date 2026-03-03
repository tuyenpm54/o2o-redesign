import React, { useState, useEffect } from 'react';
import { Sparkles, X, ChevronRight } from 'lucide-react';
import styles from './AIOnboardingModal.module.css';

export type AIPreferences = {
    peopleCount: string | null;
    dietary: string | null;
};

interface AIOnboardingModalProps {
    onComplete: (preferences: AIPreferences) => void;
    onDismiss: () => void;
}

export const AIOnboardingModal: React.FC<AIOnboardingModalProps> = ({ onComplete, onDismiss }) => {
    const [step, setStep] = useState(1);
    const [preferences, setPreferences] = useState<AIPreferences>({
        peopleCount: null,
        dietary: null
    });

    const handleAnswerPeople = (val: string) => {
        setPreferences(prev => ({ ...prev, peopleCount: val }));
        setStep(2);
    };

    const handleAnswerDietary = (val: string) => {
        const finalPrefs = { ...preferences, dietary: val };
        setPreferences(finalPrefs);
        setStep(3); // Loading step

        // Simulate processing time
        setTimeout(() => {
            onComplete(finalPrefs);
        }, 1200);
    };

    return (
        <div className={styles.overlay} onClick={onDismiss}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.glowBall} />

                {step < 3 && (
                    <button className={styles.closeBtn} onClick={onDismiss}>
                        <X size={16} />
                    </button>
                )}

                <div className={styles.header}>
                    <div className={styles.aiIconWrapper}>
                        <Sparkles size={28} className={styles.aiIcon} />
                    </div>
                    {step === 1 && (
                        <>
                            <h2 className={styles.title}>Chào mừng anh/chị!</h2>
                            <p className={styles.subtitle}>Để O2O phục vụ chu đáo nhất, xin hỏi vài câu nhỏ nhé.</p>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <h2 className={styles.title}>Gần xong rồi ạ!</h2>
                            <p className={styles.subtitle}>Câu cuối cùng để lọc thực đơn chuẩn xác.</p>
                        </>
                    )}
                </div>

                {step === 1 && (
                    <div className={styles.questionContainer}>
                        <h3 className={styles.questionText}>Bàn mình đi mấy người ạ?</h3>
                        <div className={styles.optionsList}>
                            <button className={styles.optionBtn} onClick={() => handleAnswerPeople('1-2 người')}>
                                <span>1 - 2 người</span> <ChevronRight size={18} />
                            </button>
                            <button className={styles.optionBtn} onClick={() => handleAnswerPeople('3-4 người')}>
                                <span>3 - 4 người</span> <ChevronRight size={18} />
                            </button>
                            <button className={styles.optionBtn} onClick={() => handleAnswerPeople('Nhóm Lớn (5+)')}>
                                <span>Nhóm lớn (5+)</span> <ChevronRight size={18} />
                            </button>
                        </div>
                        <button className={styles.skipBtn} onClick={onDismiss}>Bỏ qua</button>
                    </div>
                )}

                {step === 2 && (
                    <div className={styles.questionContainer}>
                        <h3 className={styles.questionText}>Khẩu vị bàn mình thế nào ạ?</h3>
                        <div className={styles.optionsList}>
                            <button className={styles.optionBtn} onClick={() => handleAnswerDietary('Không cay')}>
                                <span>Ít cay / Không cay 🌶️🚫</span> <ChevronRight size={18} />
                            </button>
                            <button className={styles.optionBtn} onClick={() => handleAnswerDietary('Có trẻ em')}>
                                <span>Có trẻ nhỏ 👶</span> <ChevronRight size={18} />
                            </button>
                            <button className={styles.optionBtn} onClick={() => handleAnswerDietary('Bình thường')}>
                                <span>Ăn uống thoải mái 🍲</span> <ChevronRight size={18} />
                            </button>
                        </div>
                        <button className={styles.skipBtn} onClick={() => handleAnswerDietary('Bình thường')}>Bỏ qua</button>
                    </div>
                )}

                {step === 3 && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner} />
                        <h3 className={styles.loadingText}>Đang tinh chỉnh Menu riêng cho bạn...</h3>
                    </div>
                )}
            </div>
        </div>
    );
};
