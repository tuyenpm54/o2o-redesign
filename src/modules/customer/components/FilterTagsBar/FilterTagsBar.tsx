import React from 'react';
import { Sparkles, X } from 'lucide-react';
import styles from './FilterTagsBar.module.css';

interface FilterTagsBarProps {
    tags: string[];
    onRemoveTag: (tag: string) => void;
    onClearAll: () => void;
}

export const FilterTagsBar: React.FC<FilterTagsBarProps> = ({ tags, onRemoveTag, onClearAll }) => {
    if (!tags || tags.length === 0) return null;

    return (
        <div className={styles.container}>
            <div className={styles.label}>
                <Sparkles size={14} className={styles.tagIcon} fill="currentColor" />
                AI Đang Lọc:
            </div>
            <div className={styles.tagsWrapper}>
                {tags.map((tag, idx) => (
                    <div key={idx} className={styles.tag}>
                        {tag}
                        <button className={styles.removeBtn} onClick={() => onRemoveTag(tag)}>
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
            {tags.length > 0 && (
                <button className={styles.clearAllBtn} onClick={onClearAll}> Xóa hết</button>
            )}
        </div>
    );
};
