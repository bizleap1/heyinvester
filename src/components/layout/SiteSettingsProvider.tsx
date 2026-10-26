'use client';

import React, { createContext, useContext } from 'react';
import { createWhatsAppUrl } from '@/lib/whatsapp';

type SettingsContextType = {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    mahaReraNumber: string;
    instagramUrl: string;
    facebookUrl: string;
    youtubeUrl: string;
    linkedinUrl: string;
    heroSliderInterval?: number;
    phoneRaw: string;
    whatsappUrl: string;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SiteSettingsProvider({ children, settings }: { children: React.ReactNode, settings: any }) {
    // We add computed fields like phoneRaw and whatsappUrl
    const phoneRaw = settings.phone?.replace(/[^\d+]/g, '') || '';
    const whatsappUrl = createWhatsAppUrl(settings.whatsapp || settings.phone, '');
    
    // Create base whatsapp url without message
    const baseWaUrl = `https://wa.me/${(settings.whatsapp || settings.phone || '').replace(/[^\d]/g, '')}`;

    const value = {
        ...settings,
        phoneRaw,
        whatsappUrl: baseWaUrl,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSiteSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
    }
    return context;
}
