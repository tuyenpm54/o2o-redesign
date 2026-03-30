"use client";

import React from 'react';
import { ShoppingBag, Eye, Send, X } from 'lucide-react';
import styles from './OrderStepper.module.css';

interface OrderStepperProps {
    currentStep: 1 | 2 | 3;
    onDismiss?: () => void;
}

const STEPS = [
    { id: 1, label: 'Lướt thực đơn', icon: Eye },
    { id: 2, label: 'Chọn món', icon: ShoppingBag },
    { id: 3, label: 'Gửi yêu cầu', icon: Send },
];

export const OrderStepper: React.FC<OrderStepperProps> = ({ currentStep, onDismiss }) => {
    return (
        <div className={styles.stepperWrapper}>
            <div className={styles.stepperTrack}>
                {STEPS.map((step, idx) => {
                    const isActive = step.id === currentStep;
                    const isDone = step.id < currentStep;
                    const StepIcon = step.icon;

                    return (
                        <React.Fragment key={step.id}>
                            {idx > 0 && (
                                <div className={`${styles.stepLine} ${isDone ? styles.stepLineDone : ''}`} />
                            )}
                            <div className={`${styles.stepItem} ${isActive ? styles.stepActive : ''} ${isDone ? styles.stepDone : ''}`}>
                                <div className={styles.stepCircle}>
                                    <StepIcon size={12} />
                                </div>
                                <span className={styles.stepLabel}>{step.label}</span>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
            {onDismiss && (
                <button className={styles.dismissBtn} onClick={onDismiss} aria-label="Ẩn hướng dẫn">
                    <X size={14} />
                </button>
            )}
        </div>
    );
};
