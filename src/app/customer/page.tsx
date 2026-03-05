"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ReceiptText, Search, ChefHat, BellRing, GlassWater, Snowflake,
    Plus, Minus, ShoppingBag, ChevronRight, MapPin, User as UserIcon,
    Crown, Star, X, RotateCcw, CookingPot, Trash2, ClipboardList, Bell, ArrowLeft,
    HelpCircle, ChefHat as ChefHatIcon, CheckCircle2, Sparkles, UtensilsCrossed, Info, ChevronDown, Users,
    Heart, Palette, Zap
} from 'lucide-react';

import styles from './page.module.css';

import { ContextBanner, Order } from '@/modules/customer/components/ContextBanner/ContextBanner';
import { MemberLobby } from '@/modules/customer/components/MemberLobby/MemberLobby';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

import { PromotionStrip } from '@/modules/customer/components/PromotionStrip/PromotionStrip';


// Mock Categories
const CATEGORIES = [
    { id: 'combo', label: 'Combo tiết kiệm' },
    { id: 'veg', label: 'Chay' },
    { id: 'appetizer', label: 'Khai vị' },
    { id: 'main', label: 'Món chính' },
    { id: 'side', label: 'Ăn kèm' },
    { id: 'snack', label: 'Ăn chơi' },
    { id: 'drink', label: 'Đồ uống' },
    { id: 'dessert', label: 'Tráng miệng' },
];


// Mock Menu Items
const DEFAULT_IMAGE = '/food/default-food.jpg';

const MENU_ITEMS = [
    // Khai vị
    { id: 101, name: 'Salad Rong Nho', price: 89000, cat: 'appetizer', img: '/food/salad-rong-nho.jpg', desc: 'Rong nho biển tươi giòn, sốt mè rang béo ngậy.' },
    { id: 102, name: 'Khoai Tây Chiên', price: 45000, cat: 'appetizer', img: '/food/khoai-tay-chien.jpg', desc: 'Khoai tây chiên giòn rụm, lắc phô mai thơm lừng.' },
    { id: 103, name: 'Gỏi Cuốn Tôm Thịt', price: 65000, cat: 'appetizer', img: '/food/goi-cuon.jpg', desc: 'Tôm thịt tươi ngon, chấm mắm nêm đậm đà.' },
    { id: 104, name: 'Súp Bí Đỏ Kem Tươi', price: 55000, cat: 'appetizer', img: '/food/sup-bi-do.jpg', desc: 'Súp bí đỏ sánh mịn, kem tươi béo ngậy.' },

    // Món chính
    { id: 201, name: 'Sườn Nướng Tảng BBQ', price: 259000, cat: 'main', img: '/food/suon-nuong.jpg', desc: 'Sườn heo nướng sốt BBQ đậm đà, mềm mọng.' },
    { id: 202, name: 'Ba Chỉ Bò Mỹ Cuộn', price: 129000, cat: 'main', img: '/food/ba-chi-bo.jpg', desc: 'Ba chỉ bò Mỹ cuộn nấm kim châm, nướng than hoa.' },
    { id: 203, name: 'Cơm Rang Hải Sản', price: 115000, cat: 'main', img: '/food/com-rang.jpg', desc: 'Cơm rang giòn hạt, hải sản tôm mực tươi ngon.' },
    { id: 204, name: 'Mì Ý Sốt Kem Nấm', price: 99000, cat: 'main', img: '/food/mi-y.jpg', desc: 'Mì Ý dai ngon, sốt kem nấm truffle thượng hạng.' },
    { id: 205, name: 'Bò Beefsteak Sốt Tiêu', price: 189000, cat: 'main', img: '/food/beefsteak.jpg', desc: 'Thăn ngoại bò Úc, sốt tiêu đen cay nồng.' },

    // Ăn kèm
    { id: 301, name: 'Kim Chi Hàn Quốc', price: 15000, cat: 'side', img: '/food/kim-chi.jpg', desc: 'Kim chi cải thảo muối cay chuẩn vị Hàn.' },
    { id: 302, name: 'Cơm Trắng', price: 10000, cat: 'side', img: '/food/com-trang.jpg', desc: 'Cơm gạo tám thơm dẻo.' },
    { id: 303, name: 'Bánh Mì Bơ Tỏi', price: 25000, cat: 'side', img: '/food/banh-mi-bo-toi.jpg', desc: 'Bánh mì nướng bơ tỏi giòn tan.' },

    // Ăn chơi
    { id: 401, name: 'Gà Rán Giòn', price: 79000, cat: 'snack', img: '/food/ga-ran.jpg', desc: 'Đùi gà tẩm bột chiên giòn, da giòn thịt mềm.' },
    { id: 402, name: 'Xúc Xích Nướng', price: 49000, cat: 'snack', img: '/food/xuc-xich.jpg', desc: 'Xúc xích Đức nướng than, chấm mù tạt vàng.' },
    { id: 403, name: 'Nem Chua Rán', price: 39000, cat: 'snack', img: '/food/nem-chua.jpg', desc: 'Nem chua rán phố cổ, ăn kèm tương ớt.' },

    // Đồ uống
    { id: 501, name: 'Trà Đào Cam Sả', price: 45000, cat: 'drink', img: '/food/tra-dao.jpg', desc: 'Trà đào thanh mát, hương sả thơm lừng.' },
    { id: 502, name: 'Coca Cola Tươi', price: 15000, cat: 'drink', img: '/food/coca.jpg', desc: 'Coca Cola tươi mát lạnh, giải khát sảng khoái.' },
    { id: 503, name: 'Sinh Tố Bơ', price: 55000, cat: 'drink', img: '/food/sinh-to-bo.jpg', desc: 'Bơ sáp dẻo quánh, sữa đặc ngọt ngào.' },

    // Tráng miệng
    { id: 601, name: 'Bánh Tiramisu', price: 69000, cat: 'dessert', img: '/food/tiramisu.jpg', desc: 'Bánh Tiramisu mềm mịn, vị cafe cacao nồng nàn.' },
    { id: 602, name: 'Kem Dâu Tây', price: 35000, cat: 'dessert', img: '/food/kem-dau.jpg', desc: 'Kem dâu tây chua ngọt, mát lạnh.' },
];

const COMBOS = [
    {
        id: 701,
        name: 'Combo Tiết Kiệm: Cơm Gà BBQ + Trà Đào',
        desc: 'Cơm gà nướng mềm tan kèm trà đào cam sả thanh mát.',
        price: 285000,
        originalPrice: 304000,
        save: 19000,
        img: '/food/combo-ga.jpg',
        people: 2
    },
    {
        id: 702,
        name: 'Combo Gia Đình 4-6 Người',
        desc: 'Đầy đủ các món ăn kèm, khai vị và 4 lon Coca.',
        price: 520000,
        originalPrice: 580000,
        save: 60000,
        img: '/food/combo-family.jpg',
        people: 4
    },
    {
        id: 703,
        name: 'Combo Văn Phòng: Mì Ý + Coca',
        desc: 'Bữa trưa nhanh gọn, giàu dinh dưỡng cho dân công sở.',
        price: 105000,
        originalPrice: 114000,
        save: 9000,
        img: '/food/combo-van-phong.jpg',
        people: 2
    },
    {
        id: 704,
        name: 'Combo Đại Tiệc 8-10 Người',
        desc: 'Đầy đủ các món từ khai vị đến tráng miệng, kèm rượu vang.',
        price: 1850000,
        originalPrice: 2100000,
        save: 250000,
        img: '/food/combo-tiec.jpg',
        people: 8
    },
    {
        id: 705,
        name: 'Combo Bạn Thân 2 Người',
        desc: 'Phù hợp cho các cặp đôi hoặc bạn thân đi 2 người.',
        price: 345000,
        originalPrice: 400000,
        save: 55000,
        img: '/food/combo-ban-than.jpg',
        people: 2
    },
    {
        id: 706,
        name: 'Combo Liên Hoan 4-6 Người',
        desc: 'Set hải sản tổng hợp và bia lạnh cho nhóm bạn.',
        price: 890000,
        originalPrice: 990000,
        save: 100000,
        img: '/food/combo-lien-hoan.jpg',
        people: 4
    }
];



// Status Priority for Banner (Smallest = Highest Priority)
const STATUS_PRIORITY: Record<string, number> = {
    'READY': 1,
    'PENDING': 2,
    'COOKING': 3,
    'CONFIRMED': 4,
    'SERVED': 5,
    'IDLE': 99
};

const PROMO_THRESHOLD = 200000;
const PROMO_REWARD = 'giảm 10%';



import { TABLE_MEMBERS, MEMBER_ORDERS } from '@/data/mock-table';


import { OnboardingGuide } from '@/modules/customer/components/Onboarding/OnboardingGuide'; // Import new component



export default function StorefrontPreview() {
    // Dynamic Render Setup
    const [blocks, setBlocks] = useState<any[]>([]);

    useEffect(() => {
        const fetchBlocks = () => {
            const data = localStorage.getItem('preview_storefront_config');
            if (data) {
                try {
                    setBlocks(JSON.parse(data));
                } catch (e) { }
            }
        };

        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'STOREFRONT_CONFIG_UPDATE') {
                setBlocks(event.data.config);
            }
        };

        fetchBlocks();
        window.addEventListener('storage', fetchBlocks);
        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('storage', fetchBlocks);
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    // Onboarding State
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        // Show onboarding on load (simulate 'reload' guide)
        // In real app, check localStorage to show only once
        const timer = setTimeout(() => setShowOnboarding(true), 1000); // Small delay for entrance
        return () => clearTimeout(timer);
    }, []);

    const [activeTab, setActiveTab] = useState('main');
    const [cart, setCart] = useState<Record<number, number>>({});
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showSupportMenu, setShowSupportMenu] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const [showTableDetailModal, setShowTableDetailModal] = useState(false);
    const [suggestionPopup, setSuggestionPopup] = useState<{
        triggerItem: any;
        suggestions: any[];
        autoAdd: boolean;
    } | null>(null);

    // User Info State
    const [showUserModal, setShowUserModal] = useState(false);
    const [userProfile, setUserProfile] = useState({
        name: 'Minh Tuyền',
        phone: '0901234567',
        email: 'minhtuyen@gmail.com'
    });

    // Combo Filter State
    const [selectedPeopleCount, setSelectedPeopleCount] = useState<number | null>(null);

    const handleSaveProfile = () => {
        setShowUserModal(false);
    };

    // Social & Voting State
    const [votes, setVotes] = useState<Record<number, number>>({ 201: 3, 204: 5, 501: 2 }); // Mock initial votes
    const [likedItems, setLikedItems] = useState<Record<number, boolean>>({});


    const handleVote = (id: number) => {
        setLikedItems(prev => {
            const isLiked = !prev[id];
            // Simulate socket update for votes
            setVotes(v => ({ ...v, [id]: (v[id] || 0) + (isLiked ? 1 : -1) }));
            return { ...prev, [id]: isLiked };
        });
    };



    // --- UI State ---
    const { isLoggedIn, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();


    // --- Dynamic Order State Management ---
    const [activeOrders, setActiveOrders] = useState<any[]>([]);

    // --- Table Modal Logic ---
    const [selectedMemberId, setSelectedMemberId] = useState<'me' | 'all' | string>('me');

    // Helper: Get orders to display based on selection
    const getDisplayOrders = () => {
        if (selectedMemberId === 'me') {
            return activeOrders; // Current user's orders
        }
        if (selectedMemberId === 'all') {
            // Aggregate ALL confirmed orders from everyone
            const otherOrders = Object.values(MEMBER_ORDERS).flat();
            return [...activeOrders, ...otherOrders];
        }
        // Specific member
        return MEMBER_ORDERS[selectedMemberId] || [];
    };

    const displayOrders = getDisplayOrders();

    const getSelectedMemberName = () => {
        if (selectedMemberId === 'me') return 'Tôi';
        if (selectedMemberId === 'all') return 'Cả bàn';
        const mem = TABLE_MEMBERS.find(m => m.id === selectedMemberId);
        return mem ? mem.name : 'Khách';
    };

    // Unified Header State
    const [showCategoryBar, setShowCategoryBar] = useState(false);
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    const headerRef = React.useRef<HTMLElement>(null);

    // Scroll Logic: Show Category Bar only when scrolled
    useEffect(() => {
        const handleScroll = () => {
            const threshold = 100; // Show after scrolling 100px (past banner)
            setShowCategoryBar(window.scrollY > threshold);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handlePlaceOrder = () => {
        const orderId = `ord-${Date.now()}`;
        const newOrder = {
            id: orderId,
            status: 'PENDING',
            items: { ...cart }, // Store the current cart items
            timestamp: Date.now()
        };

        setActiveOrders(prev => [...prev, newOrder]);
        setCart({});
        setShowCartModal(false);

        // Simulation Flow: PENDING (5s) -> CONFIRMED (5s) -> COOKING (5s) -> READY (5s) -> SERVED
        const sequence = ['CONFIRMED', 'COOKING', 'READY', 'SERVED'];

        sequence.forEach((status, index) => {
            setTimeout(() => {
                setActiveOrders(prev => prev.map(o =>
                    o.id === orderId ? { ...o, status, timestamp: Date.now() } : o
                ));
            }, (index + 1) * 5000);
        });
    };

    // Support Request States - Per Option Status Tracking
    // Status: IDLE → SENDING → PENDING → IN_PROGRESS → IDLE
    type SupportStatus = 'IDLE' | 'SENDING' | 'PENDING' | 'IN_PROGRESS';

    const SUPPORT_OPTIONS = [
        { id: 'cutlery', label: 'Lấy thêm bát đũa' },
        { id: 'napkin', label: 'Lấy giấy ăn' },
        { id: 'clean', label: 'Dọn bàn' },
        { id: 'payment', label: 'Yêu cầu thanh toán' },
        { id: 'other', label: 'Khác' },
    ];

    const [supportStatuses, setSupportStatuses] = useState<Record<string, SupportStatus>>({});

    // State for support menu view switching
    const [supportView, setSupportView] = useState<'OPTIONS' | 'INPUT_OTHER'>('OPTIONS');
    const [otherRequestText, setOtherRequestText] = useState('');
    const [lastOtherText, setLastOtherText] = useState(''); // Store the last submitted text

    const handleSupportRequest = (optionId: string) => {
        // Prevent if not IDLE
        if (supportStatuses[optionId] && supportStatuses[optionId] !== 'IDLE') return;

        // Special handling for "Khác" - switch view inside menu
        if (optionId === 'other') {
            setSupportView('INPUT_OTHER');
            return;
        }

        setShowSupportMenu(false);

        // 1. Set to SENDING
        setSupportStatuses(prev => ({ ...prev, [optionId]: 'SENDING' }));

        // Simulate API call (1.5s)
        setTimeout(() => {
            // 2. Set to PENDING (Đang chờ - Request sent, waiting for staff)
            setSupportStatuses(prev => ({ ...prev, [optionId]: 'PENDING' }));

            // Simulate Staff Confirmation after 5 seconds
            setTimeout(() => {
                // 3. Set to IN_PROGRESS (Đang nhận - Staff received)
                setSupportStatuses(prev => ({ ...prev, [optionId]: 'IN_PROGRESS' }));

                // Simulate Completion after another 10 seconds
                setTimeout(() => {
                    // 4. Back to IDLE
                    setSupportStatuses(prev => ({ ...prev, [optionId]: 'IDLE' }));
                    // Clear lastOtherText when completed
                    if (optionId === 'other') setLastOtherText('');
                }, 10000);

            }, 5000);

        }, 1500);
    };

    // Handle submit for "Khác" with custom text
    const handleSubmitOtherRequest = () => {
        if (!otherRequestText.trim()) return;

        setLastOtherText(otherRequestText.trim());
        handleCloseSupportMenu();
        setOtherRequestText('');

        // 1. Set to SENDING
        setSupportStatuses(prev => ({ ...prev, 'other': 'SENDING' }));

        // Same flow as other requests
        setTimeout(() => {
            setSupportStatuses(prev => ({ ...prev, 'other': 'PENDING' }));
            setTimeout(() => {
                setSupportStatuses(prev => ({ ...prev, 'other': 'IN_PROGRESS' }));
                setTimeout(() => {
                    setSupportStatuses(prev => ({ ...prev, 'other': 'IDLE' }));
                    setLastOtherText('');
                }, 10000);
            }, 5000);
        }, 1500);
    };

    // Close menu and reset view
    const handleCloseSupportMenu = () => {
        setShowSupportMenu(false);
        setTimeout(() => setSupportView('OPTIONS'), 300); // Reset after animation
    };

    const getStatusText = (status: SupportStatus) => {
        switch (status) {
            case 'SENDING': return 'Đang gửi...';
            case 'PENDING': return 'Đang chờ';
            case 'IN_PROGRESS': return 'Đang nhận';
            default: return '';
        }
    };

    // Check if any request is active (for FAB indicator)
    const hasActiveRequest = Object.values(supportStatuses).some(s => s !== 'IDLE' && s !== undefined);

    // Cart Actions
    const addToCart = (id: number) => {
        setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

        // Smart Suggestions Logic
        const suggestionBlock = blocks.find(b => b.type === 'smart-suggestions');
        if (suggestionBlock && suggestionBlock.config?.triggerItemId == id) {
            const triggerItem = MENU_ITEMS.find(i => i.id === Number(id));
            // In a real app, suggestions would come from block.config.suggestedItemIds
            // Here we mock based on the admin UI choices
            const suggestedItems = [
                MENU_ITEMS.find(i => i.id === 501), // Trà Đào
                MENU_ITEMS.find(i => i.id === 502)  // Coca
            ].filter(Boolean);

            if (suggestedItems.length > 0) {
                setSuggestionPopup({
                    triggerItem,
                    suggestions: suggestedItems,
                    autoAdd: suggestionBlock.config.autoAdd || false
                });
            }
        }
    };
    const removeFromCart = (id: number) => {
        setCart(prev => {
            const newCount = (prev[id] || 0) - 1;
            if (newCount <= 0) { const { [id]: _, ...rest } = prev; return rest; }
            return { ...prev, [id]: newCount };
        });
    };

    const cartTotalCount = Object.values(cart).reduce((a, b) => a + b, 0);
    const cartTotalPrice = Object.entries(cart).reduce((acc, [id, qty]) => {
        const item = MENU_ITEMS.find(i => i.id === Number(id));
        return acc + (item ? item.price * qty : 0);

    }, 0);

    const handleQuickAdd = (name: string, price: number) => {
        // Mock add to cart logic for flash sale items (simplified)
        // In real app, would find ID by name or pass ID
        alert(`Đã thêm ${name} vào giỏ!`);
    };






    const scrollToCategory = (id: string) => {
        setActiveTab(id);
        const element = document.getElementById(`cat-${id}`);
        if (element) {
            const headerOffset = 140;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    const renderModule = (block: any) => {
        switch (block.type) {
            case 'hero-banner':
                return <PromotionStrip />;
            case 'group-ordering':
                if (block.config?.isEnabled === false) return null;
                return (
                    <div className="mb-4">
                        <MemberLobby tableId="A-12" members={TABLE_MEMBERS} />
                    </div>
                );
            case 'guided-discovery':
                const questions = block.config?.questions || [];
                const firstQuestion = questions[0] || { text: "Bạn đang muốn tìm món gì?", options: [{ label: 'Ăn một mình' }, { label: 'Đi cùng gia đình' }] };

                return (
                    <div className="mx-4 p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800/50 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles size={60} />
                        </div>

                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{block.title || 'Trợ Lý Khám Phá Món Ngon'}</h3>
                                <p className="text-xs text-slate-500 font-medium">Được đề xuất bởi AI</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-700 mb-4 relative z-10">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{firstQuestion.text}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 relative z-10">
                            {firstQuestion.options.map((opt: any, idx: number) => (
                                <button key={idx} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 transition-colors">
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'bill-discount-progress':
                const target = block.config?.targetBillLimit || 500000;
                const discount = block.config?.discountAmount || 50000;
                const progress = Math.min((cartTotalPrice / target) * 100, 100);
                const remaining = Math.max(target - cartTotalPrice, 0);

                return (
                    <div className="mx-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-900/50 p-4 rounded-xl">
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <h4 className="font-bold text-orange-800 dark:text-orange-400 text-sm mb-0.5">{block.title || 'Thưởng Hóa Đơn'}</h4>
                                <p className="text-xs text-orange-600 dark:text-orange-300">
                                    {remaining > 0 ? `Thêm ${remaining.toLocaleString('vi-VN')}đ để được giảm ngay ${discount.toLocaleString('vi-VN')}đ` : `Tuyệt vời! Bạn đã nhận được mã giảm ${discount.toLocaleString('vi-VN')}đ!`}
                                </p>
                            </div>
                            <div className="w-9 h-9 shrink-0 rounded-full bg-orange-100 dark:bg-orange-900 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-orange-600 dark:text-orange-300 shadow-sm">
                                <Crown size={18} />
                            </div>
                        </div>
                        <div className="w-full bg-orange-200 dark:bg-orange-900/50 rounded-full h-2 overflow-hidden">
                            <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                );
            case 'flash-sales':
                const flashItems = MENU_ITEMS.slice(1, 3); // Mock some items
                return (
                    <section className={styles.comboSection} id={`cat-flash-${block.id}`}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.titleGroup}>
                                <h2 className={styles.sectionTitle}>{block.title || 'Flash Sale'}</h2>
                                <span className="bg-red-500 text-white text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm"><Zap size={10} fill="currentColor" /> Đang Vắn Số</span>
                            </div>
                            <div className="flex items-center gap-1 font-mono">
                                <span className="bg-slate-900 dark:bg-black text-white px-1.5 py-0.5 rounded text-xs">01</span>:
                                <span className="bg-slate-900 dark:bg-black text-white px-1.5 py-0.5 rounded text-xs">15</span>:
                                <span className="bg-slate-900 dark:bg-black text-white px-1.5 py-0.5 rounded text-xs">30</span>
                            </div>
                        </div>

                        <div className={styles.menuItemGrid} style={{ padding: '0 16px' }}>
                            {flashItems.map(item => (
                                <div key={item.id} className={styles.menuItemCard}>
                                    <div className={styles.itemImgWrapper}>
                                        <img src={`${item.img}?w=300&h=300&fit=crop`} alt={item.name} className={styles.itemImg} onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }} />
                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">-20%</div>

                                        {!cart[item.id] ? (
                                            <button className={styles.quickAddBtn} onClick={() => addToCart(item.id)}><Plus size={18} /></button>
                                        ) : (
                                            <div className={styles.qtyControlOverlay}>
                                                <button className={styles.qtyBtnOverlay} onClick={() => removeFromCart(item.id)}><Minus size={16} /></button>
                                                <span className={styles.qtyValueOverlay}>{cart[item.id]}</span>
                                                <button className={styles.qtyBtnOverlay} onClick={() => addToCart(item.id)}><Plus size={16} /></button>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <div className={styles.itemHeader}>
                                            <div className={styles.itemNameMain}>{item.name}</div>
                                        </div>
                                        <p className={styles.itemDesc}>{item.desc}</p>
                                        <div className={styles.itemFooter}>
                                            <div className="flex items-baseline gap-2">
                                                <div className="text-red-500 font-bold text-sm">{(item.price * 0.8).toLocaleString('vi-VN')}đ</div>
                                                <div className="text-slate-400 line-through text-xs font-medium">{item.price.toLocaleString('vi-VN')}đ</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case 'collection-grid':
                return (
                    <section className={styles.comboSection} id="cat-combo">
                        <div className={styles.sectionHeader}>
                            <div className={styles.titleGroup}>
                                <h2 className={styles.sectionTitle}>{block.title || 'Combo tiết kiệm'}</h2>
                                <span className={styles.titleBadge}>HOT</span>
                            </div>
                        </div>

                        {/* Filter Options */}
                        <div className={styles.filterRow}>
                            {[
                                { label: 'Tất cả', value: null },
                                { label: '2 người', value: 2 },
                                { label: '4 - 6 người', value: 4 },
                                { label: '8 - 10 người', value: 8 }
                            ].map(opt => (
                                <button
                                    key={opt.label}
                                    className={`${styles.filterBtn} ${selectedPeopleCount === opt.value ? styles.active : ''}`}
                                    onClick={() => setSelectedPeopleCount(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        <div className={styles.comboScroll}>
                            {[...COMBOS].sort((a, b) => {
                                if (selectedPeopleCount === null) return 0;
                                if (a.people === selectedPeopleCount && b.people !== selectedPeopleCount) return -1;
                                if (a.people !== selectedPeopleCount && b.people === selectedPeopleCount) return 1;
                                return 0;
                            }).map(combo => (
                                <div key={combo.id} className={`${styles.comboCard} ${selectedPeopleCount && combo.people !== selectedPeopleCount ? styles.dimmed : ''}`}>
                                    <div className={styles.comboImgWrapper}>
                                        <img src={combo.img} alt={combo.name} className={styles.comboImg} />
                                        <div className={styles.saveBadge}>Tiết kiệm {combo.save.toLocaleString('vi-VN')}đ</div>
                                        <div className={styles.peopleBadge}>{combo.people}{combo.people === 2 ? '' : '-' + (combo.people + 2)} người</div>
                                    </div>
                                    <div className={styles.comboInfo}>
                                        <h3 className={styles.comboName}>{combo.name}</h3>
                                        <p className={styles.comboDesc}>{combo.desc}</p>
                                        <div className={styles.comboPriceRow}>
                                            <div className={styles.priceGroup}>
                                                <span className={styles.comboPrice}>{combo.price.toLocaleString('vi-VN')}đ</span>
                                                <span className={styles.comboOriginal}>{combo.originalPrice.toLocaleString('vi-VN')}đ</span>
                                            </div>
                                            <button className={styles.addComboBtn} onClick={() => addToCart(combo.id)}>
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case 'menu-grid':
                return (
                    <div className={styles.menuSection}>
                        <div className={styles.menuList}>
                            {CATEGORIES.map(cat => {
                                const items = MENU_ITEMS.filter(i => i.cat === cat.id);
                                if (items.length === 0) return null;

                                return (
                                    <div key={cat.id} id={`cat-${cat.id}`} className={styles.categorySection}>
                                        <div className={styles.categoryHeader}>
                                            <h3 className={styles.categoryGroupTitle}>{cat.label}</h3>
                                            <span className={styles.categoryCount}>{items.length} món</span>
                                        </div>
                                        <div className={styles.menuItemGrid}>
                                            {items.map(item => (
                                                <div key={item.id} className={styles.menuItemCard}>
                                                    <div className={styles.itemImgWrapper}>
                                                        <img
                                                            src={`${item.img}?w=300&h=300&fit=crop`}
                                                            alt={item.name}
                                                            className={styles.itemImg}
                                                            onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }}
                                                        />
                                                        {!cart[item.id] ? (
                                                            <button className={styles.quickAddBtn} onClick={() => addToCart(item.id)}>
                                                                <Plus size={18} />
                                                            </button>
                                                        ) : (
                                                            <div className={styles.qtyControlOverlay}>
                                                                <button className={styles.qtyBtnOverlay} onClick={() => removeFromCart(item.id)}>
                                                                    <Minus size={16} />
                                                                </button>
                                                                <span className={styles.qtyValueOverlay}>{cart[item.id]}</span>
                                                                <button className={styles.qtyBtnOverlay} onClick={() => addToCart(item.id)}>
                                                                    <Plus size={16} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className={styles.itemInfo}>
                                                        <div className={styles.itemHeader}>
                                                            <div className={styles.itemNameMain}>{item.name}</div>
                                                        </div>
                                                        <p className={styles.itemDesc}>{item.desc}</p>
                                                        <div className={styles.itemFooter}>
                                                            <div className={styles.itemPriceMain}>{item.price.toLocaleString('vi-VN')}đ</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            default:
                // Fallback for missing module implementation
                return (
                    <div className="mx-4 p-4 text-center rounded-xl font-medium text-slate-400 border border-dashed border-slate-300 bg-slate-100">
                        {block.title} Layout Missing
                    </div>
                );
        }
    };

    return (
        <div className={styles.container}>
            {/* 1. New Unified Header */}
            <header className={styles.header} ref={headerRef}>
                <div className={styles.headerTopRow}>
                    <button
                        className={styles.restaurantInfo}
                        onClick={() => setShowTableDetailModal(true)}
                        aria-label="Thông tin nhà hàng"
                    >
                        <div className={styles.logoWrapper}>
                            {/* Fallback Logo since generation failed */}
                            <div className={styles.fallbackLogo}>
                                <UtensilsCrossed size={20} color="white" />
                            </div>
                        </div>
                        <div className={styles.restaurantTextCol}>
                            <div className={styles.restaurantNameRow}>
                                <span className={styles.restaurantTitle}>Biển Đông</span>
                                <span className={styles.infoIcon} aria-hidden="true">ⓘ</span>
                            </div>
                            <div className={styles.tableTag}>Bàn A-12</div>
                        </div>
                    </button>
                    {/* ... User Info remains same ... */}
                    {/* User Info from AuthContext */}
                    <button
                        className={styles.userInfo}
                        onClick={() => {
                            const fullPath = typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : pathname;
                            router.push(`/account?from=${encodeURIComponent(fullPath)}`);
                        }}
                        aria-label="Thông tin cá nhân"
                    >
                        {isLoggedIn && user ? (
                            <>
                                <div className={styles.avatarWrapper}>
                                    <img
                                        src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"}
                                        className={styles.userAvatar}
                                        alt="User Avatar"
                                        width={40}
                                        height={40}
                                    />
                                    {user.tier !== 'Khách' && <div className={styles.rankBadge}>👑</div>}
                                </div>
                                <div className={styles.userInfoColLocal}>
                                    {user.tier === 'Khách' ? (
                                        <span className={styles.guestLabelLocal}>Guest</span>
                                    ) : (
                                        <div className={styles.userPoints}>
                                            {user.points?.toLocaleString()} P
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className={styles.loginWrapper}>
                                <div className={styles.loginIconCircle}>
                                    <UserIcon size={20} color="#4B5563" />
                                </div>
                                <span className={styles.loginText}>Đăng nhập</span>
                            </div>
                        )}
                    </button>
                </div>

                {/* 2. Hidden Category Row (Appears on Scroll) */}
                <div className={`${styles.headerCategoryRow} ${showCategoryBar ? styles.visible : ''}`}>
                    <div className={styles.barLeftContent}>
                        <button
                            className={styles.catDropdown}
                            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                        >
                            Dành cho bạn <ChevronDown size={14} />
                        </button>
                    </div>

                    <div className={styles.catRightContent}>
                        <button className={styles.catSearchBtn}>
                            <Search size={18} />
                        </button>
                    </div>

                    {/* Dropdown Menu inside Header Scope */}
                    {showCategoryMenu && (
                        <>
                            <div
                                className={styles.dropdownBackdrop}
                                onClick={() => setShowCategoryMenu(false)}
                            />
                            <div className={styles.categoryDropdownMenu}>
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`${styles.dropdownItem} ${activeTab === cat.id ? styles.active : ''}`}
                                        onClick={() => {
                                            scrollToCategory(cat.id);
                                            setShowCategoryMenu(false);
                                        }}
                                    >
                                        {cat.label}
                                        {activeTab === cat.id && <CheckCircle2 size={16} />}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </header>

            {/* Info Modal */}
            {showInfoModal && (
                <div className={styles.infoModal} onClick={() => setShowInfoModal(false)}>
                    <div className={styles.infoCard} onClick={e => e.stopPropagation()}>
                        <div className={styles.infoTitle}>Nhà Hàng Biển Đông</div>

                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Địa chỉ</span>
                            <span className={styles.infoValue}>123 Nguyễn Văn Linh, Q.7, TP.HCM</span>
                        </div>

                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Wifi Password</span>
                            <span className={styles.infoValue}>biendong1234</span>
                        </div>

                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Hotline</span>
                            <span className={styles.infoValue}>1900 123 456</span>
                        </div>

                        <button className={styles.closeInfoBtn} onClick={() => setShowInfoModal(false)}>
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {/* User Profile Modal */}
            {showUserModal && (
                <div className={styles.modalOverlay} onClick={() => setShowUserModal(false)}>
                    <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Thông tin khách hàng</h3>
                            <button className={styles.closeBtn} onClick={() => setShowUserModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.profileSummary}>
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                                className={styles.largeAvatar}
                                alt="User Avatar"
                            />
                            <div className={styles.profileStats}>
                                <div className={styles.rankBadgeLarge}>Gold Member</div>
                                <div className={styles.pointsLarge}>1,250 điểm</div>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Họ và tên</label>
                            <input
                                type="text"
                                className={styles.formInput}
                                value={userProfile.name}
                                onChange={e => setUserProfile({ ...userProfile, name: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Số điện thoại</label>
                            <input
                                type="tel"
                                className={styles.formInput}
                                value={userProfile.phone}
                                onChange={e => setUserProfile({ ...userProfile, phone: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Email</label>
                            <input
                                type="email"
                                className={styles.formInput}
                                value={userProfile.email}
                                onChange={e => setUserProfile({ ...userProfile, email: e.target.value })}
                            />
                        </div>

                        <button className={styles.saveBtn} onClick={handleSaveProfile}>
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            )}

            {/* 2. Smart Context Banner & Member Lobby */}
            <section className={styles.statusWidgetSection}>
                <ContextBanner
                    model="A"
                    tableId="A-12"
                    activeOrders={activeOrders}
                    supportStatuses={supportStatuses}
                />
            </section>





            {/* NEW: Savings Combo Category Section */}
            {/* DYNAMIC MODULES RENDERER */}
            <div className="flex flex-col gap-6" style={{ paddingBottom: '20px' }}>
                {blocks.length > 0 ? (
                    blocks.map((block) => (
                        <div key={block.id + '_preview'} className="w-full">
                            {renderModule(block)}
                        </div>
                    ))
                ) : (
                    <div className="mx-4 mt-8 p-10 text-center rounded-xl text-slate-500 border-2 border-dashed border-slate-300 bg-white shadow-sm flex flex-col items-center justify-center">
                        <Palette size={40} className="mb-3 text-slate-300" />
                        <h3 className="font-bold text-lg mb-1">Chưa có module nào</h3>
                        <p className="text-sm">Hãy vào Storefront Builder để cấu hình và thêm module nhé.</p>
                    </div>
                )}
            </div>

            {/* 4. Staff Support FAB & Active Requests Summary */}
            <div className={`${styles.supportWrapper} ${cartTotalCount > 0 && cartTotalPrice < PROMO_THRESHOLD ? styles.supportShift : ''}`}>
                {/* Show smart summary of active requests */}
                {hasActiveRequest && (
                    <div className={styles.chatBubble}>
                        {(() => {
                            const activeRequests = Object.entries(supportStatuses)
                                .filter(([, status]) => status && status !== 'IDLE');

                            // Count by status
                            const pendingCount = activeRequests.filter(([, s]) => s === 'PENDING').length;
                            const inProgressCount = activeRequests.filter(([, s]) => s === 'IN_PROGRESS').length;
                            const sendingCount = activeRequests.filter(([, s]) => s === 'SENDING').length;

                            // If only 1 request, show specific name
                            if (activeRequests.length === 1) {
                                const [id, status] = activeRequests[0];
                                const option = SUPPORT_OPTIONS.find(o => o.id === id);
                                const label = (id === 'other' && lastOtherText) ? lastOtherText : option?.label;

                                if (status === 'SENDING') return `Đang gửi "${label}"...`;
                                if (status === 'PENDING') return `"${label}" đang chờ xác nhận`;
                                if (status === 'IN_PROGRESS') return `"${label}" đã được nhận`;
                            }

                            // Multiple requests - show summary
                            const parts = [];
                            if (inProgressCount > 0) {
                                parts.push(`${inProgressCount} yêu cầu đã nhận`);
                            }
                            if (pendingCount > 0) {
                                parts.push(`${pendingCount} yêu cầu đang chờ`);
                            }
                            if (sendingCount > 0) {
                                parts.push(`${sendingCount} đang gửi`);
                            }

                            return parts.join(', ');
                        })()}
                    </div>
                )
                }

                <button
                    className={`${styles.staffFab} ${hasActiveRequest ? styles.active : ''}`}
                    onClick={() => setShowSupportMenu(true)}
                >
                    <div className={styles.staffIconWrapper}>
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Staff"
                            alt="Staff"
                            className={styles.staffAvatar}
                        />
                        <div className={styles.onlineBadge} />
                    </div>
                    <span className={styles.staffLabel}>Hỗ trợ</span>
                    {hasActiveRequest && (
                        <span className={styles.activeCount}>
                            {Object.values(supportStatuses).filter(s => s && s !== 'IDLE').length}
                        </span>
                    )}
                </button>
            </div >

            {/* Support Menu Overlay */}
            {
                showSupportMenu && (
                    <div className={styles.supportOverlay} onClick={handleCloseSupportMenu}>
                        <div className={styles.supportMenu} onClick={e => e.stopPropagation()}>
                            <div className={styles.supportHeader}>
                                {supportView === 'INPUT_OTHER' && (
                                    <button className={styles.backBtn} onClick={() => setSupportView('OPTIONS')}>
                                        <ArrowLeft size={20} />
                                    </button>
                                )}
                                <h3 className={styles.supportTitle}>
                                    {supportView === 'OPTIONS' ? 'Bạn cần hỗ trợ gì?' : 'Yêu cầu khác'}
                                </h3>
                                <button className={styles.supportCloseBtn} onClick={handleCloseSupportMenu}>
                                    <X size={20} />
                                </button>
                            </div>

                            {supportView === 'OPTIONS' ? (
                                <div className={styles.supportGrid}>
                                    {SUPPORT_OPTIONS.map((option) => {
                                        const status = supportStatuses[option.id] || 'IDLE';
                                        const isIdle = status === 'IDLE';

                                        // Determine class based on status
                                        let statusClass = '';
                                        if (status === 'SENDING') statusClass = styles.sending;
                                        if (status === 'PENDING') statusClass = styles.pending;
                                        if (status === 'IN_PROGRESS') statusClass = styles.inProgress;

                                        // Special label for "Khác" when has custom text
                                        const displayLabel = option.id === 'other' && lastOtherText
                                            ? `Khác: "${lastOtherText}"`
                                            : option.label;

                                        return (
                                            <button
                                                key={option.id}
                                                className={`${styles.supportOption} ${statusClass}`}
                                                onClick={() => handleSupportRequest(option.id)}
                                                disabled={!isIdle}
                                            >
                                                <span className={styles.optionLabel}>{displayLabel}</span>
                                                {!isIdle && (
                                                    <span className={styles.optionStatus}>
                                                        {getStatusText(status)}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className={styles.otherInputContent}>
                                    <p className={styles.otherInputNote}>Nhập nội dung yêu cầu (tối đa 20 ký tự)</p>
                                    <input
                                        type="text"
                                        className={styles.otherInput}
                                        value={otherRequestText}
                                        onChange={(e) => setOtherRequestText(e.target.value.slice(0, 20))}
                                        placeholder="VD: Thêm nước mắm..."
                                        maxLength={20}
                                        autoFocus
                                    />
                                    <div className={styles.otherInputFooter}>
                                        <span className={styles.charCount}>{otherRequestText.length}/20</span>
                                        <button
                                            className={styles.otherSubmitBtn}
                                            onClick={handleSubmitOtherRequest}
                                            disabled={!otherRequestText.trim()}
                                        >
                                            Gửi yêu cầu
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* 5. Floating Cart Summary (Only if cart has items) */}
            {
                cartTotalCount > 0 && (
                    <div className={styles.floatingCartContainer}>
                        {/* Upsell Message */}
                        {cartTotalPrice < PROMO_THRESHOLD && (
                            <div className={styles.upsellMessage}>
                                <span>
                                    Thêm <b className={styles.highlight}>{(PROMO_THRESHOLD - cartTotalPrice).toLocaleString('vi-VN')}đ</b> để được giảm <b className={styles.highlight}>{PROMO_REWARD}</b>!
                                </span>

                            </div>
                        )}

                        {/* Main Primary Button */}
                        <button className={styles.primaryCartBtn} onClick={() => setShowCartModal(true)}>
                            <div className={styles.cartBtnContent}>
                                <span className={styles.cartBtnLeft}>Giỏ hàng • {cartTotalCount} món</span>
                                <span className={styles.cartBtnRight}>{cartTotalPrice.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </button>
                    </div>
                )
            }

            {/* QUICK CART (Bottom Sheet) */}
            {
                showCartModal && (
                    <div className={styles.bottomSheetOverlay} onClick={() => setShowCartModal(false)}>
                        <div className={styles.bottomSheet} onClick={e => e.stopPropagation()}>
                            <div className={styles.sheetHeader}>
                                <h3>Giỏ hàng của bạn <span className={styles.sheetCount}>({cartTotalCount})</span></h3>
                                <button className={styles.sheetCloseBtn} onClick={() => setShowCartModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className={styles.sheetBody}>
                                {cartTotalCount > 0 ? (
                                    <>
                                        {/* Upsell in Cart */}
                                        {cartTotalPrice < PROMO_THRESHOLD && (
                                            <div className={styles.cartUpsell}>
                                                <div className={styles.upsellIcon}>🎁</div>
                                                <span>Thêm <b>{(PROMO_THRESHOLD - cartTotalPrice).toLocaleString('vi-VN')}đ</b> để giảm <b>{PROMO_REWARD}</b></span>
                                            </div>
                                        )}

                                        <div className={styles.sheetItemList}>
                                            {Object.entries(cart).map(([id, qty]) => {
                                                const item = MENU_ITEMS.find(i => i.id === Number(id));
                                                if (!item) return null;
                                                return (
                                                    <div key={`quick-${id}`} className={styles.itemRowContainer}>
                                                        <img src={`${item.img}?w=120&h=120&fit=crop`} alt={item.name} className={styles.itemThumb} />

                                                        <div className={styles.itemInfoCol}>
                                                            <div className={styles.itemNameRef}>{item.name}</div>
                                                            {/* Mock addons for visual match */}
                                                            {/* <div className={styles.itemAddons}>Trà Quất, Lavie</div> */}
                                                            <button className={styles.itemEditBtn}>Chỉnh sửa</button>
                                                        </div>

                                                        <div className={styles.itemPriceCol}>
                                                            <span className={styles.itemPriceRef}>{item.price.toLocaleString('vi-VN')}</span>
                                                            {/* Mock original price */}
                                                            {/* <span className={styles.itemOriginalPrice}>{(item.price * 1.2).toLocaleString('vi-VN')}</span> */}

                                                            <div className={styles.qtyCircleBadge}>
                                                                <span>{qty}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                ) : (
                                    <div className={styles.emptySheet}>
                                        <ShoppingBag size={40} color="#CBD5E1" />
                                        <p>Giỏ hàng đang trống</p>
                                    </div>
                                )}
                            </div>

                            <div className={styles.sheetFooter}>
                                <div className={styles.sheetTotalRow}>
                                    <span>Tạm tính</span>
                                    <b>{cartTotalPrice.toLocaleString('vi-VN')}đ</b>
                                </div>
                                <div className={styles.sheetActions}>
                                    <button
                                        className={styles.viewTableBtn}
                                        onClick={() => {
                                            setShowTableDetailModal(true);
                                        }}
                                    >
                                        <span>Xem chi tiết</span>
                                        <span>bàn</span>
                                    </button>
                                    <button
                                        className={styles.sheetPlaceOrderBtn}
                                        onClick={() => {
                                            handlePlaceOrder();
                                            setShowCartModal(false);
                                        }}
                                        disabled={cartTotalCount === 0}
                                    >
                                        Gửi gọi món <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Social Notification Toast */}



            {/* FULL TABLE DETAILS MODAL (Header Trigger) */}
            {
                showTableDetailModal && (
                    <div className={styles.modalFullOverlay}>
                        {/* Header */}
                        <div className={styles.orderHeader}>
                            <button className={styles.backBtn} onClick={() => setShowTableDetailModal(false)}>
                                <ArrowLeft size={24} />
                            </button>
                            <div className={styles.headerTitleCol}>
                                <h3>Chi tiết bàn A-12</h3>
                                <span>4 người • {displayOrders.length > 0 ? 'Đã gọi món' : 'Chưa gọi món'}</span>
                            </div>
                        </div>

                        <div className={styles.orderBody}>
                            {/* 1. Member List Filter */}
                            <div className={styles.memberListScroll}>
                                {/* Option: All Table */}
                                <div
                                    className={`${styles.memberItem} ${selectedMemberId === 'all' ? styles.active : ''}`}
                                    onClick={() => setSelectedMemberId('all')}
                                >
                                    <div className={`${styles.memberAvatarWrapper} ${styles.allWrapper}`}>
                                        <Users size={20} color="#64748B" />
                                    </div>
                                    <span className={styles.memberName}>Cả bàn</span>
                                </div>

                                {/* Option: Me */}
                                <div
                                    className={`${styles.memberItem} ${selectedMemberId === 'me' ? styles.active : ''}`}
                                    onClick={() => setSelectedMemberId('me')}
                                >
                                    <div className={styles.memberAvatarWrapper}>
                                        <img
                                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                                            alt="Tôi"
                                            className={styles.memberAvatar}
                                        />
                                        <div className={styles.activeDot} />
                                    </div>
                                    <span className={styles.memberName}>Tôi</span>
                                </div>

                                {/* Separator */}
                                <div className={styles.memberSeparator} />

                                {/* Other Members */}
                                {TABLE_MEMBERS.filter(m => m.id !== 'm1').map(mem => (
                                    <div
                                        key={mem.id}
                                        className={`${styles.memberItem} ${selectedMemberId === mem.id ? styles.active : ''}`}
                                        onClick={() => setSelectedMemberId(mem.id)}
                                    >
                                        <div className={styles.memberAvatarWrapper}>
                                            <img src={mem.avatar} alt={mem.name} className={styles.memberAvatar} />
                                        </div>
                                        <span className={styles.memberName}>{mem.name}</span>
                                    </div>
                                ))}
                            </div>

                            {/* 2. Content Header */}
                            <div className={styles.userSectionHeader}>
                                <div className={styles.userNameBlock}>
                                    <h1>{getSelectedMemberName()}</h1>
                                    {/* Only show 'Ordering' status for Me when cart has items */}
                                    {selectedMemberId === 'me' && cartTotalCount > 0 && <span className={styles.statusTextOrange}>Đang chọn món</span>}
                                </div>
                                <span className={styles.totalItemBadge}>
                                    {displayOrders.reduce((acc, o) => acc + (o.qty || Object.values(o.items || {}).reduce((s: any, q: any) => s + Number(q), 0)), 0)} món
                                </span>
                            </div>

                            {/* 3. DRAFT ITEMS (Only for 'Me') */}
                            {selectedMemberId === 'me' && cartTotalCount > 0 && (
                                <div className={styles.groupSection}>
                                    <h5 className={styles.subGroupTitle}>Món đang chọn (Chưa gửi)</h5>
                                    {Object.entries(cart).map(([id, qty]) => {
                                        const item = MENU_ITEMS.find(i => i.id === Number(id));
                                        if (!item) return null;
                                        return (
                                            <div key={`draft-${id}`} className={styles.itemRowContainer}>
                                                <img src={`${item.img}?w=120&h=120&fit=crop`} alt={item.name} className={styles.itemThumb} />

                                                <div className={styles.itemInfoCol}>
                                                    <div className={styles.itemNameRef}>{item.name}</div>
                                                    <button className={styles.itemEditBtn}>Chỉnh sửa</button>
                                                </div>

                                                <div className={styles.itemPriceCol}>
                                                    <span className={styles.itemPriceRef}>{item.price.toLocaleString('vi-VN')}</span>
                                                    <div className={styles.qtyCircleBadge}>
                                                        <span>{qty as number}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <button className={styles.sendDraftBtn} onClick={() => {
                                        handlePlaceOrder();
                                        setShowTableDetailModal(false); // Optional: close or stay
                                    }}>
                                        Gửi yêu cầu
                                    </button>
                                </div>
                            )}

                            {/* 4. CONFIRMED ITEMS (Dynamic List) */}
                            {displayOrders.length > 0 && (
                                <div className={styles.groupSection}>
                                    <h5 className={styles.subGroupTitle}>Món đã gọi</h5>
                                    {selectedMemberId === 'all'
                                        ? // Simple list for 'All' (aggregated)
                                        displayOrders.map((order, idx) => (
                                            <div key={`all-ord-${idx}`} className={styles.orderCardItem}>
                                                <div className={styles.orderItemInfo}>
                                                    <h4>{order.name || (MENU_ITEMS.find(i => i.id === Number(Object.keys(order.items || {})[0]))?.name)}</h4>
                                                    <div className={styles.orderItemMeta}>
                                                        <span className={styles.qtyBadge}>x{order.qty || Object.values(order.items || {})[0]}</span>
                                                        <span className={styles.priceText}>{(order.price || 0).toLocaleString('vi-VN')}đ</span>
                                                    </div>
                                                </div>
                                                <div className={styles.orderItemStatus}>
                                                    <span className={`${styles.statusPill} ${styles[(order.status || 'CONFIRMED').toLowerCase()]}`}>
                                                        {order.status || 'CONFIRMED'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                        : // Complex list for Me/Specific (grouped)
                                        displayOrders.map(order =>
                                            // Handle both structure types (My Orders vs Mock Orders)
                                            order.items ? (
                                                Object.entries(order.items).map(([id, qty]) => {
                                                    const item = MENU_ITEMS.find(i => i.id === Number(id));
                                                    if (!item) return null;
                                                    return (
                                                        <div key={`ord-${order.id}-${id}`} className={styles.orderCardItem}>
                                                            <div className={styles.orderItemInfo}>
                                                                <h4>{item.name}</h4>
                                                                <div className={styles.orderItemMeta}>
                                                                    <span className={styles.qtyBadge}>x{qty as number}</span>
                                                                    <span className={styles.priceText}>{item.price.toLocaleString('vi-VN')}đ</span>
                                                                </div>
                                                            </div>
                                                            <div className={styles.orderItemStatus}>
                                                                <span className={`${styles.statusPill} ${styles[order.status.toLowerCase()]}`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div key={`mem-ord-${order.id}`} className={styles.orderCardItem}>
                                                    <div className={styles.orderItemInfo}>
                                                        <h4>{order.name}</h4>
                                                        <div className={styles.orderItemMeta}>
                                                            <span className={styles.qtyBadge}>x{order.qty}</span>
                                                            <span className={styles.priceText}>{order.price.toLocaleString('vi-VN')}đ</span>
                                                        </div>
                                                    </div>
                                                    <div className={styles.orderItemStatus}>
                                                        <span className={`${styles.statusPill} ${styles[order.status.toLowerCase()]}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        )
                                    }
                                </div>
                            )}

                            {cartTotalCount === 0 && activeOrders.length === 0 && (
                                <div className={styles.emptyState}>
                                    <ShoppingBag size={48} color="#CBD5E1" />
                                    <p>Bạn chưa chọn món nào</p>
                                </div>
                            )}

                        </div>

                        {/* Footer */}
                        <div className={styles.orderFooter}>
                            <div className={styles.totalRow}>
                                <span>Tổng cộng</span>
                                <span className={styles.totalPrice}>{(cartTotalPrice + activeOrders.reduce((acc, o) => {
                                    return acc + Object.entries(o.items || {}).reduce((sum: any, [id, qty]: any) => {
                                        const p = MENU_ITEMS.find(i => i.id == Number(id))?.price || 0;
                                        return sum + p * Number(qty);
                                    }, 0);
                                }, 0)).toLocaleString('vi-VN')}đ</span>
                            </div>
                            <button
                                className="btn-footer-primary"
                                style={{ marginTop: '1rem' }}
                                onClick={() => setShowCartModal(true)}
                            >
                                Xem giỏ hàng & Thanh toán
                            </button>
                        </div>
                    </div>
                )
            }

            {/* NEW: Smart Suggestions Popup */}
            {suggestionPopup && (
                <div className={styles.suggestionOverlay} onClick={() => setSuggestionPopup(null)}>
                    <div className={styles.suggestionPopup} onClick={e => e.stopPropagation()}>
                        <div className={styles.suggestionHeader}>
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200">
                                <Sparkles size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Món này ngon hơn khi ăn kèm</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">Gợi ý dựa trên đơn hàng {suggestionPopup.triggerItem?.name}</p>
                        </div>
                        <div className={styles.suggestionBody}>
                            <div className="space-y-3">
                                {suggestionPopup.suggestions.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        <img src={item.img} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                                            <p className="text-xs text-blue-600 font-bold">{item.price.toLocaleString('vi-VN')}đ</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                addToCart(item.id);
                                                if (suggestionPopup.autoAdd) setSuggestionPopup(null);
                                            }}
                                            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex flex-col gap-2">
                                <button
                                    onClick={() => {
                                        suggestionPopup.suggestions.forEach(item => addToCart(item.id));
                                        setSuggestionPopup(null);
                                    }}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 active:scale-95 transition-transform"
                                >
                                    Thêm tất cả gợi ý
                                </button>
                                <button
                                    onClick={() => setSuggestionPopup(null)}
                                    className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600"
                                >
                                    Bỏ qua
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW: Onboarding Guide Overlay */}
            <OnboardingGuide
                visible={showOnboarding}
                onDismiss={() => setShowOnboarding(false)}
                isShifted={cartTotalCount > 0 && cartTotalPrice < PROMO_THRESHOLD}
            />
        </div>
    );
}
