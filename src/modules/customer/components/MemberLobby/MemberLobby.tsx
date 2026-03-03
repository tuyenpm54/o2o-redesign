import React from 'react';
import { Users, ChevronRight, Trophy } from 'lucide-react';
import styles from './MemberLobby.module.css';
import { useRouter, usePathname } from 'next/navigation';

export interface Member {
    id: string;
    name: string;
    avatar?: string;
    color?: string;
    status: 'ordering' | 'done';
    hasTrophy?: boolean;
}

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    qty: number;
    status: string;
}

interface MemberLobbyProps {
    tableId: string;
    members: Member[];
    theme?: 'light' | 'dark' | 'transparent';
}

export const MemberLobby: React.FC<MemberLobbyProps> = ({
    tableId,
    members,
    theme = 'light'
}) => {
    const router = useRouter();

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const COLORS = ['#3B82F6', '#EF4444', '#EC4899', '#F59E0B', '#8B5CF6', '#10B981'];
    const getColor = (name: string, color?: string) => color || COLORS[name.length % COLORS.length];

    const pathname = usePathname();

    const handleNavigate = () => {
        router.push(`/table-orders?from=${pathname}`);
    };

    return (
        <div className={`${styles.lobbyWrapper} ${styles[theme]}`}>
            {/* Collapsed Card */}
            <div className={styles.lobbyCard} onClick={handleNavigate}>
                <div className={styles.cardHeader}>
                    <div className={styles.titleGroup}>
                        <Users size={18} className={styles.titleIcon} />
                        <span className={styles.titleText}>Người cùng bàn</span>
                    </div>
                    <div className={styles.onlineBadge}>
                        {members.length} tại bàn
                    </div>
                </div>

                <div className={styles.membersListStacked}>
                    <div className={styles.avatarStack}>
                        {members.slice(0, 5).map((member, index) => (
                            <div
                                key={member.id}
                                className={styles.stackedAvatarItem}
                                style={{ zIndex: 10 - index }}
                            >
                                {member.avatar ? (
                                    <img src={member.avatar} alt={member.name} className={styles.avatarImgSmall} />
                                ) : (
                                    <div
                                        className={styles.avatarInitialsSmall}
                                        style={{ backgroundColor: getColor(member.name, member.color) }}
                                    >
                                        {getInitials(member.name)}
                                    </div>
                                )}
                                {member.hasTrophy && index === 0 && (
                                    <div className={styles.miniTrophy}>
                                        <Trophy size={8} fill="currentColor" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {members.length > 5 && (
                        <span className={styles.moreCount}>+{members.length - 5}</span>
                    )}
                    <span className={styles.inlineStatus}>
                        đang chọn món...
                    </span>
                    <ChevronRight size={14} className={styles.inlineChevron} />
                </div>

            </div>
        </div>
    );
};
