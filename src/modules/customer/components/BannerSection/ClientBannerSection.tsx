"use client";

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { BannerSlider } from '../BannerSlider/BannerSlider';

export const ClientBannerSection = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) {
        return (
            <div style={{ padding: '1rem 1.25rem 0', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={() => setIsVisible(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.7rem',
                        color: '#94a3b8',
                        background: '#f1f5f9',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <Eye size={12} /> Hiện banner quảng cáo
                </button>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative' }}>
            <BannerSlider />
            <button
                onClick={() => setIsVisible(false)}
                style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    zIndex: 10,
                    background: 'rgba(0,0,0,0.3)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '0.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                }}
            >
                <EyeOff size={10} /> Ẩn
            </button>
        </div>
    );
};
