"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ChevronRight,
    X,
    ChevronLeft,
    UtensilsCrossed,
    StickyNote,
    Sparkles,
    Wallet,
    MoreHorizontal
} from "lucide-react";
import styles from "./page.module.css";
import { useLanguage } from "@/context/LanguageContext";

type ChatMessage = {
    id: string;
    sender: 'user' | 'restaurant';
    time: string;
    type?: string;
    content: string | React.ReactNode;
    avatar?: boolean;
};

const SUPPORT_OPTIONS = [
    { id: 'cutlery', label: 'Lấy thêm bát đũa', icon: <UtensilsCrossed size={20} /> },
    { id: 'napkin', label: 'Mang khăn giấy', icon: <StickyNote size={20} /> },
    { id: 'clean', label: 'Dọn bàn', icon: <Sparkles size={20} /> },
    { id: 'payment', label: 'Gọi thanh toán', icon: <Wallet size={20} /> },
    { id: 'other', label: 'Yêu cầu khác', icon: <MoreHorizontal size={20} /> },
];

export default function ChatPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t, language } = useLanguage();
    const fromUrl = searchParams.get('from') || '/single-order-page';
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const [supportView, setSupportView] = useState<'OPTIONS' | 'INPUT_OTHER'>('OPTIONS');
    const [otherRequestText, setOtherRequestText] = useState('');

    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchChat = async () => {
        try {
            const res = await fetch('/api/chat');
            const data = await res.json();
            if (Array.isArray(data)) {
                setChatHistory(data);
            }
        } catch (e) {
            console.error("Chat fetch failed:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchChat();
        const interval = setInterval(fetchChat, 5000); // Fast polling for chat
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSupportRequest = async (optionId: string, customText?: string) => {
        let label = customText;
        if (!label) {
            const opt = SUPPORT_OPTIONS.find(o => o.id === optionId);
            if (opt) label = opt.label;
        }
        if (!label) return;

        try {
            await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: t(label),
                    categoryId: optionId === 'other' ? 'OTHER' : 'SUPPORT',
                    typeId: optionId,
                    lang: language
                })
            });
            fetchChat();
        } catch (e) {
            console.error("Failed to send message:", e);
        }
    };

    return (
        <div className={styles.chatPageContainer}>
            <div className={styles.chatHeader}>
                <div className={styles.chatHeaderTitleGroup}>
                    <h3 className={styles.chatTitle}>{t('Phản hồi từ nhà hàng')}</h3>
                </div>
                <button className={styles.chatCloseBtn} onClick={() => router.push(fromUrl)}>
                    <X size={24} />
                </button>
            </div>

            <div className={styles.chatBody} ref={chatScrollRef}>
                {chatHistory.map((msg) => (
                    <div key={msg.id} className={msg.sender === 'user' ? styles.msgUserWrapper : styles.msgRestWrapper}>
                        {msg.sender === 'restaurant' && (
                            <div className={styles.msgRestAvatarPlaceholder}>
                                <img
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Staff&backgroundColor=ffdfbf"
                                    className={styles.msgRestAvatar}
                                    alt="Staff"
                                />
                            </div>
                        )}
                        <div className={msg.sender === 'user' ? styles.msgUserBubble : styles.msgRestBubble}>
                            <div className={msg.sender === 'user' ? styles.msgUserMeta : styles.msgRestMeta}>
                                <span className={styles.msgSenderName}>{msg.sender === 'user' ? t('Bạn') : t('Nhà hàng')}</span>
                                <span className={styles.msgTimeType}>{msg.time}{msg.type && ` | ${t(msg.type)}`}</span>
                            </div>
                            <div className={styles.msgContent}>{msg.content}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.chatFooter}>
                {supportView === 'OPTIONS' ? (
                    <div className={styles.chatOptionsScroll}>
                        {SUPPORT_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                className={styles.chatOptionBtn}
                                data-type={opt.id === 'other' ? 'other' : 'default'}
                                onClick={() => {
                                    if (opt.id === 'other') {
                                        setSupportView('INPUT_OTHER');
                                    } else {
                                        handleSupportRequest(opt.id);
                                    }
                                }}
                            >
                                <span className={styles.optIcon}>{opt.icon}</span>
                                {t(opt.label)}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className={styles.chatInputOtherRow}>
                        <button className={styles.chatOtherBack} onClick={() => setSupportView('OPTIONS')}>
                            <ChevronLeft size={20} />
                        </button>
                        <input
                            className={styles.chatOtherInput}
                            placeholder={t("Nhập yêu cầu khác...")}
                            value={otherRequestText}
                            onChange={(e) => setOtherRequestText(e.target.value)}
                            autoFocus
                        />
                        <button
                            className={styles.chatOtherSendBtn}
                            disabled={!otherRequestText.trim()}
                            onClick={() => {
                                handleSupportRequest('other', otherRequestText);
                                setOtherRequestText('');
                                setSupportView('OPTIONS');
                            }}
                        >
                            {t('Gửi')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
