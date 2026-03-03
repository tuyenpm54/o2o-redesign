export type ShopModel = 'A' | 'B' | 'C';

export interface StoreInfo {
    name: string;
    address: string;
}

export interface AuthConfig {
    enableOtp: boolean;
    verificationEndpoint?: string; // e.g., '/api/verify-otp'
    mockOtpValue?: string;
}

export interface ShopConfig {
    model: ShopModel;
    storeInfo: StoreInfo;
    language: 'vi' | 'en';
    authConfig: AuthConfig;
}

export const shopConfig: ShopConfig = {
    model: 'A', // Default to Model A (Trả sau)
    storeInfo: {
        name: 'O2O Restaurant',
        address: '123 Đường Nam Kỳ Khởi Nghĩa, Quận 1, TP.HCM',
    },
    language: 'vi',
    authConfig: {
        enableOtp: true,
        mockOtpValue: '123456',
        verificationEndpoint: '/api/mock-verify'
    }
};
