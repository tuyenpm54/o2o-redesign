'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'vi' | 'en';

interface Translations {
    [key: string]: {
        vi: string;
        en: string;
    };
}

export const translations: Translations = {
    // Order Statuses
    'Chờ xác nhận': { vi: 'Chờ xác nhận', en: 'Awaiting Confirmation' },
    'Chờ chế biến': { vi: 'Chờ chế biến', en: 'Awaiting Preparation' },
    'Đang chế biến': { vi: 'Đang chế biến', en: 'Now Cooking' },
    'Chờ phục vụ': { vi: 'Chờ phục vụ', en: 'Ready to Serve' },
    'Đang mang ra': { vi: 'Đang mang ra', en: 'Being Served' },
    'Đã phục vụ': { vi: 'Đã phục vụ', en: 'Served' },
    'Đang chọn': { vi: 'Đang chọn', en: 'Selecting' },
    'COOKING': { vi: 'Đang chế biến', en: 'Now Cooking' },
    'READY': { vi: 'Chờ phục vụ', en: 'Ready to Serve' },
    'SERVED': { vi: 'Đã phục vụ', en: 'Served' },
    'CONFIRMED': { vi: 'Chờ xác nhận', en: 'Awaiting Confirmation' },

    // UI Elements
    'Gợi ý thông minh': { vi: 'Gợi ý thông minh', en: 'Smart Choices' },
    'Khám phá': { vi: 'Khám phá', en: 'Discover' },
    'Gửi yêu cầu gọi món': { vi: 'Gửi yêu cầu gọi món', en: 'Send Order Request' },
    'Chi tiết gọi món': { vi: 'Chi tiết gọi món', en: 'Order Details' },
    'Bàn': { vi: 'Bàn', en: 'Table' },
    'Tôi': { vi: 'Tôi', en: 'Me' },
    'Cả bàn': { vi: 'Cả bàn', en: 'All Table' },
    'Xem món đã gọi': { vi: 'Xem món đã gọi', en: 'View Placed Orders' },
    'Đăng nhập': { vi: 'Đăng nhập', en: 'Login' },
    'Khách': { vi: 'Khách', en: 'Guest' },
    'Thành viên': { vi: 'Thành viên', en: 'Member' },
    'Thông báo': { vi: 'Thông báo', en: 'Notification' },
    'Tiếng Việt': { vi: 'Tiếng Việt', en: 'Vietnamese' },
    'Tiếng Anh': { vi: 'Tiếng Anh', en: 'English' },
    'Ngôn ngữ': { vi: 'Ngôn ngữ', en: 'Language' },
    'Người cùng bàn': { vi: 'Người cùng bàn', en: 'Table Members' },
    'tại bàn': { vi: 'tại bàn', en: 'at table' },
    'đang chọn món...': { vi: 'đang chọn món...', en: 'selecting items...' },
    'Dành riêng cho bạn': { vi: 'Dành riêng cho bạn', en: 'Specially for you' },
    'Chào bạn!': { vi: 'Chào bạn!', en: 'Hello!' },
    'Đã xong': { vi: 'Đã xong', en: 'Done' },
    'món': { vi: 'món', en: 'items' },
    'Best choice, Món hot thử ngay 🔥': { vi: 'Best choice, Món hot thử ngay 🔥', en: 'Best choice, Hot items try now 🔥' },
    'Xin chào': { vi: 'Xin chào', en: 'Hello' },
    'rất vui thấy bạn quay trở lại, bạn vẫn yêu cầu:': { vi: 'rất vui thấy bạn quay trở lại, bạn vẫn yêu cầu:', en: 'glad to see you back, do you still want:' },
    'như thường lệ chứ?': { vi: 'như thường lệ chứ?', en: 'as usual?' },
    'Món đang chọn': { vi: 'Món đang chọn', en: 'Selecting' },
    'Món đã gọi': { vi: 'Món đã gọi', en: 'Placed Orders' },
    'Chưa có món nào': { vi: 'Chưa có món nào', en: 'No items yet' },
    'Hoá đơn tạm tính': { vi: 'Hoá đơn tạm tính', en: 'Pre-bill' },
    'Mang hương vị đến gần bạn hơn': { vi: 'Mang hương vị đến gần bạn hơn', en: 'Bringing taste closer to you' },
    'Chính sách bảo mật': { vi: 'Chính sách bảo mật', en: 'Privacy Policy' },
    'Điều khoản dịch vụ': { vi: 'Điều khoản dịch vụ', en: 'Terms of Service' },
    'Hỗ trợ': { vi: 'Hỗ trợ', en: 'Support' },
    'Bỏ qua': { vi: 'Bỏ qua', en: 'Skip' },
    'XIN CHÀO': { vi: 'XIN CHÀO', en: 'HELLO' },
    'Vâng, xem gợi ý ngay': { vi: 'Vâng, xem gợi ý ngay', en: 'Yes, show suggestions' },
    'Không, để tôi chọn lại': { vi: 'Không, để tôi chọn lại', en: 'No, let me choose again' },
    'Hôm nay mình đi mấy người?': { vi: 'Hôm nay mình đi mấy người?', en: 'How many people today?' },
    'Để chúng tôi chuẩn bị bàn chu đáo nhất': { vi: 'Để chúng tôi chuẩn bị bàn chu đáo nhất', en: 'So we can prepare the best table for you' },
    'Lưu ý:': { vi: 'Lưu ý:', en: 'Note:' },
    'Khám phá ngay': { vi: 'Khám phá ngay', en: 'Explore now' },
    'DỰA TRÊN YÊU CẦU:': { vi: 'DỰA TRÊN YÊU CẦU:', en: 'BASED ON REQUEST:' },
    'Tuyệt phẩm': { vi: 'Tuyệt phẩm', en: 'Masterpiece' },
    'Giỏ hàng của bạn': { vi: 'Giỏ hàng của bạn', en: 'Your Cart' },
    'Giỏ hàng đang trống': { vi: 'Giỏ hàng đang trống', en: 'Your cart is empty' },
    'Tổng cộng': { vi: 'Tổng cộng', en: 'Total' },
    'Quay lại': { vi: 'Quay lại', en: 'Back' },
    'Tới giỏ hàng': { vi: 'Tới giỏ hàng', en: 'To Cart' },
    'Gửi gọi món': { vi: 'Gửi gọi món', en: 'Send Order' },
    'Hẹn hò': { vi: 'Hẹn hò', en: 'Dating' },
    'Gia đình': { vi: 'Gia đình', en: 'Family' },
    'Tiệc tùng': { vi: 'Tiệc tùng', en: 'Party' },
    'Lựa chọn hoàn hảo': { vi: 'Lựa chọn hoàn hảo', en: 'Perfect Match' },
    'Lựa chọn kích cỡ': { vi: 'Lựa chọn kích cỡ', en: 'Size Selection' },
    'Bắt buộc': { vi: 'Bắt buộc', en: 'Required' },
    'Thêm Topping': { vi: 'Thêm Topping', en: 'Add Toppings' },
    'Ghi chú cho bếp': { vi: 'Ghi chú cho bếp', en: 'Note for Kitchen' },
    'Ví dụ: Ít cay, không hành...': { vi: 'Ví dụ: Ít cay, không hành...', en: 'E.g. Less spicy, no onions...' },
    'Xoá': { vi: 'Xoá', en: 'Remove' },
    'Cập nhật': { vi: 'Cập nhật', en: 'Update' },
    'Thêm vào giỏ': { vi: 'Thêm vào giỏ', en: 'Add to Cart' },
    'Thêm': { vi: 'Thêm', en: 'Add' },
    'để giảm': { vi: 'để giảm', en: 'to get' },
    'giảm 10%': { vi: 'giảm 10%', en: '10% off' },
    'Bạn đã nhận được ưu đãi giảm 10%!': { vi: 'Bạn đã nhận được ưu đãi giảm 10%!', en: 'You got 10% off!' },
    'Chỉnh sửa': { vi: 'Chỉnh sửa', en: 'Edit' },
    'Tạm tính': { vi: 'Tạm tính', en: 'Subtotal' },
    'Xem chi tiết bàn': { vi: 'Xem chi tiết bàn', en: 'View Table Details' },
    'Đăng nhập để nhận ưu đãi': { vi: 'Đăng nhập để nhận ưu đãi', en: 'Login for special offers' },
    'Vui lòng nhập số điện thoại để nhà hàng lưu thói quen ăn uống của bạn nhé.': { vi: 'Vui lòng nhập số điện thoại để nhà hàng lưu thói quen ăn uống của bạn nhé.', en: 'Please enter your phone number so we can remember your dining preferences.' },
    'Nhập số điện thoại...': { vi: 'Nhập số điện thoại...', en: 'Enter phone number...' },
    'Xác nhận': { vi: 'Xác nhận', en: 'Confirm' },
    'Giỏ hàng': { vi: 'Giỏ hàng', en: 'Cart' },
    'để được giảm': { vi: 'để được giảm', en: 'to get' },
    'Bạn đã được giảm giá 10% cho đơn hàng này!': { vi: 'Bạn đã được giảm giá 10% cho đơn hàng này!', en: 'You have been discounted 10% for this order!' },
    'Lấy thêm bát đũa': { vi: 'Lấy thêm bát đũa', en: 'Get more cutlery' },
    'Mang khăn giấy': { vi: 'Mang khăn giấy', en: 'Get napkins' },
    'Dọn bàn': { vi: 'Dọn bàn', en: 'Clean table' },
    'Gọi thanh toán': { vi: 'Gọi thanh toán', en: 'Call for payment' },
    'Yêu cầu khác': { vi: 'Yêu cầu khác', en: 'Other request' },
    'Phản hồi từ nhà hàng': { vi: 'Phản hồi từ nhà hàng', en: 'Restaurant feedback' },
    'Bạn': { vi: 'Bạn', en: 'You' },
    'Nhà hàng': { vi: 'Nhà hàng', en: 'Restaurant' },
    'Nhập yêu cầu khác...': { vi: 'Nhập yêu cầu khác...', en: 'Enter other request...' },
    'Gửi': { vi: 'Gửi', en: 'Send' },
    'Yêu cầu hỗ trợ': { vi: 'Yêu cầu hỗ trợ', en: 'Support request' },
    'người': { vi: 'người', en: 'people' },
    'Đang tải thông tin bàn...': { vi: 'Đang tải thông tin bàn...', en: 'Loading table info...' },
    'Đã gửi yêu cầu gọi món thành công!': { vi: 'Đã gửi yêu cầu gọi món thành công!', en: 'Order request sent successfully!' },
    'Gửi yêu cầu gọi món thất bại': { vi: 'Gửi yêu cầu gọi món thất bại', en: 'Order request failed' },
    'Đang tải...': { vi: 'Đang tải...', en: 'Loading...' },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('vi');

    useEffect(() => {
        const savedLang = localStorage.getItem('app_lang') as Language;
        if (savedLang && (savedLang === 'vi' || savedLang === 'en')) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app_lang', lang);
    };

    const t = (key: string): string => {
        if (!translations[key]) return key;
        return translations[key][language];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
