import React, { useEffect } from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import styles from './StatusToast.module.css';

interface StatusToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  onActionClick?: () => void;
}

export const StatusToast: React.FC<StatusToastProps> = ({
  message,
  isVisible,
  onClose,
  onActionClick
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Show for 4 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const handleClick = () => {
    if (onActionClick) onActionClick();
    onClose();
  };

  return (
    <div className={styles.toastOverlay} onClick={handleClick}>
      <div className={styles.toastContent}>
        <CheckCircle2 size={18} className={styles.toastIcon} />
        <span className={styles.toastMessage}>{message}</span>
        <ChevronRight size={16} className={styles.toastArrow} />
      </div>
    </div>
  );
};
