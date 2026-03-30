"use client";

import React from 'react';
import MenuView from './MenuView';
import SingleOrderPage from '../single-order-page/page';
import { useMenuContext } from './hooks/useMenuContext';

interface ClientWrapperProps {
    style: string;
    tableid: string;
    resid: string;
    displayConfig: any[];
}

export default function ClientWrapper({ style, tableid, resid, displayConfig }: ClientWrapperProps) {
    const { cssVars } = useMenuContext();

    const wrapperStyle: React.CSSProperties = {
        ...cssVars as any,
        minHeight: '100vh',
        width: '100%',
        background: cssVars['--menu-bg-gradient'],
        color: cssVars['--menu-text'],
        transition: 'background 0.5s ease, color 0.5s ease',
    };

    if (style === 'single-order-page' || style === 'order') {
        return <div style={wrapperStyle}><SingleOrderPage /></div>; // Need to ensure SingleOrderPage works without suspense/client router mismatch
    }

    if (style === 'v3') {
        return <div style={wrapperStyle}><MenuView isV3={true} displayConfig={displayConfig} /></div>;
    }

    return <div style={wrapperStyle}><MenuView displayConfig={displayConfig} /></div>;
}
