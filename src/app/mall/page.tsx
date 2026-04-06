"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ReceiptText, Search, ChefHat, BellRing, GlassWater, Snowflake,
    Plus, Minus, ShoppingBag, ChevronRight, MapPin, User as UserIcon,
    Crown, Star, X, RotateCcw, CookingPot, Trash2, ClipboardList, Bell, ArrowLeft,
    HelpCircle, ChefHat as ChefHatIcon, CheckCircle2, Sparkles, UtensilsCrossed, Info, ChevronDown, Users,
    Heart
} from 'lucide-react';

import styles from './page.module.css';

import { ContextBanner, Order, SupportRequest } from '@/modules/customer/components/ContextBanner/ContextBanner';
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


// --- Mall Mock Data ---
const DEFAULT_IMAGE = '/food/default-food.jpg';

export const STORES = [
    { id: 's1', name: 'Highlands Coffee', icon: '☕' },
    { id: 's2', name: 'KFC', icon: '🍗' },
    { id: 's3', name: 'Phở 24', icon: '🍜' },
    { id: 's4', name: 'Lotteria', icon: '🍔' }
];

const MENU_ITEMS = [
    // Phở 24 (Appetizers & Mains)
    { id: 101, storeId: 's3', storeName: 'Phở 24', name: 'Salad Rau Mầm', price: 45000, cat: 'appetizer', img: '/food/salad-rong-nho.jpg', desc: 'Salad rau mầm tươi, sốt dầu dấm.' },
    { id: 103, storeId: 's3', storeName: 'Phở 24', name: 'Gỏi Cuốn Tôm Thịt', price: 65000, cat: 'appetizer', img: '/food/goi-cuon.jpg', desc: 'Tôm thịt tươi ngon, chấm tương đen.' },
    { id: 204, storeId: 's3', storeName: 'Phở 24', name: 'Phở Bò Đặc Biệt', price: 89000, cat: 'main', img: '/food/mi-y.jpg', desc: 'Phở bò tái nạm gầu gân bò viên, nước dùng thanh ngọt.' },
    { id: 205, storeId: 's3', storeName: 'Phở 24', name: 'Cơm Tấm Sườn Bì Trả', price: 79000, cat: 'main', img: '/food/com-rang.jpg', desc: 'Cơm tấm sườn nướng than hoa, chả trứng, bì.' },

    // KFC (Snacks, Mains, Combos)
    { id: 102, storeId: 's2', storeName: 'KFC', name: 'Khoai Tây Chiên (Vừa)', price: 35000, cat: 'appetizer', img: '/food/khoai-tay-chien.jpg', desc: 'Khoai tây chiên vàng giòn.' },
    { id: 401, storeId: 's2', storeName: 'KFC', name: 'Gà Giòn Cay (1 miếng)', price: 40000, cat: 'snack', img: '/food/ga-ran.jpg', desc: 'Lớp vỏ giòn rụm tẩm vị cay.' },
    { id: 201, storeId: 's2', storeName: 'KFC', name: 'Burger Zinger', price: 65000, cat: 'main', img: '/food/ba-chi-bo.jpg', desc: 'Burger phi lê gà rán cay, xà lách, sốt mayonaise.' },

    // Lotteria
    { id: 202, storeId: 's4', storeName: 'Lotteria', name: 'Burger Bulgogi', price: 55000, cat: 'main', img: '/food/suon-nuong.jpg', desc: 'Burger vị nướng Hàn Quốc.' },
    { id: 402, storeId: 's4', storeName: 'Lotteria', name: 'Gà H&S (1 miếng)', price: 42000, cat: 'snack', img: '/food/xuc-xich.jpg', desc: 'Gà rán phủ sốt chua cay.' },
    { id: 301, storeId: 's4', storeName: 'Lotteria', name: 'Phô Mai Quế (3 viên)', price: 35000, cat: 'side', img: '/food/nem-chua.jpg', desc: 'Phô mai chiên giòn rải đường bột quế.' },

    // Highlands Coffee (Drinks & Desserts)
    { id: 501, storeId: 's1', storeName: 'Highlands Coffee', name: 'Trà Sen Vàng', price: 55000, cat: 'drink', img: '/food/tra-dao.jpg', desc: 'Trà sen thanh mát, hạt sen bùi, kem béo.' },
    { id: 502, storeId: 's1', storeName: 'Highlands Coffee', name: 'Cafe Phin Sữa Đá', price: 35000, cat: 'drink', img: '/food/coca.jpg', desc: 'Cafe Robusta đậm vị, sữa đặc.' },
    { id: 503, storeId: 's1', storeName: 'Highlands Coffee', name: 'Freeze Trà Xanh', price: 65000, cat: 'drink', img: '/food/sinh-to-bo.jpg', desc: 'Đá xay matcha mát lạnh, thạch matcha trân châu.' },
    { id: 601, storeId: 's1', storeName: 'Highlands Coffee', name: 'Bánh Mousse Cacao', price: 35000, cat: 'dessert', img: '/food/tiramisu.jpg', desc: 'Bánh kem cacao mềm mịn.' },
];

const COMBOS = [
    {
        id: 701,
        storeId: 's2',
        storeName: 'KFC',
        name: 'Combo Nhóm 3 Người',
        desc: '3 Miếng Gà + 1 Burger + 1 Khoai + 3 Pepsi',
        price: 265000,
        originalPrice: 320000,
        save: 55000,
        img: '/food/combo-ga.jpg',
        people: 3
    },
    {
        id: 702,
        storeId: 's3',
        storeName: 'Phở 24',
        name: 'Combo Cặp Đôi Truyền Thống',
        desc: '2 Tô Phở + 1 Phần Gỏi Cuốn + 2 Trà Đá',
        price: 180000,
        originalPrice: 215000,
        save: 35000,
        img: '/food/combo-ban-than.jpg',
        people: 2
    },
    {
        id: 703,
        storeId: 's1',
        storeName: 'Highlands Coffee',
        name: 'Combo Chiều Phố Giao Cảm',
        desc: '2 Cafe Phin Sữa Đá + 2 Bánh Ngọt',
        price: 110000,
        originalPrice: 140000,
        save: 30000,
        img: '/food/combo-van-phong.jpg',
        people: 2
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


import { OnboardingGuide } from '@/modules/customer/components/Onboarding/OnboardingGuide';import { ServiceBellIcon } from '@/components/Icons/ServiceBellIcon';
 // Import new component



export default function MallOrderingPage() {
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
        const masterOrderId = `mall-${Date.now()}`;

        // Group cart items by storeId
        const newOrders: any[] = [];
        const storeGroups: Record<string, Record<number, number>> = {};

        Object.entries(cart).forEach(([id, qty]) => {
            const item = MENU_ITEMS.find(i => i.id === Number(id));
            if (item) {
                if (!storeGroups[item.storeId]) storeGroups[item.storeId] = {};
                storeGroups[item.storeId][Number(id)] = qty;
            }
        });

        Object.entries(storeGroups).forEach(([storeId, items]) => {
            const store = STORES.find(s => s.id === storeId);
            newOrders.push({
                id: `ord-${storeId}-${Date.now()}`,
                masterId: masterOrderId,
                storeId: storeId,
                storeName: store?.name || 'Cửa hàng',
                status: 'PENDING',
                items: items,
                timestamp: Date.now()
            });
        });

        setActiveOrders(prev => [...prev, ...newOrders]);
        setCart({});
        setShowCartModal(false);

        // Simulation Flow: PENDING (5s) -> CONFIRMED (5s) -> COOKING (5s) -> READY (5s) -> SERVED
        // Update all sub-orders of this master order over time
        const sequence = ['CONFIRMED', 'COOKING', 'READY', 'SERVED'];

        sequence.forEach((status, index) => {
            setTimeout(() => {
                setActiveOrders(prev => prev.map(o =>
                    o.masterId === masterOrderId ? { ...o, status, timestamp: Date.now() } : o
                ));
            }, (index + 1) * 5000);
        });
    };

    // Support Request States
    const SUPPORT_OPTIONS = [
        { id: 'cutlery', label: 'Lấy thêm bát đũa' },
        { id: 'napkin', label: 'Lấy giấy ăn' },
        { id: 'clean', label: 'Dọn bàn' },
        { id: 'payment', label: 'Yêu cầu thanh toán' },
    ];

    const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
    const [selectedSupportOptions, setSelectedSupportOptions] = useState<string[]>([]);
    const [otherRequestText, setOtherRequestText] = useState('');

    const toggleSupportOption = (optionId: string) => {
        setSelectedSupportOptions(prev => 
            prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
        );
    };

    const submitSupportRequest = () => {
        if (selectedSupportOptions.length === 0 && !otherRequestText.trim()) return;

        const reqId = `req-${Date.now()}`;
        const newReq: SupportRequest = {
            id: reqId,
            items: [...selectedSupportOptions],
            otherText: otherRequestText.trim(),
            status: 'PENDING',
            createdAt: Date.now()
        };

        setSupportRequests(prev => [...prev, newReq]);
        setSelectedSupportOptions([]);
        setOtherRequestText('');
        setShowSupportMenu(false);

        // Simulate Staff Confirmation after 5 seconds
        setTimeout(() => {
            setSupportRequests(prev => prev.map(req => {
                if (req.id === reqId) {
                    return { ...req, status: 'CONFIRMED', confirmedAt: Date.now() };
                }
                return req;
            }));

            // Auto-hide after 30 seconds from confirmation
            setTimeout(() => {
                setSupportRequests(prev => prev.filter(req => req.id !== reqId));
            }, 30000);
        }, 5000);
    };

    // Close menu and reset view
    const handleCloseSupportMenu = () => {
        setShowSupportMenu(false);
        setTimeout(() => {
            setSelectedSupportOptions([]);
            setOtherRequestText('');
        }, 300); // Reset after animation
    };

    // Check if any request is active (for FAB indicator)
    const hasActiveRequest = supportRequests.length > 0;

    // Cart Actions
    const addToCart = (id: number) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
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


    return (
        <div className={styles.container}>
            {/* 1. New Unified Header */}
            <header className={styles.header} ref={headerRef}>
                <div className={styles.headerTopRow}>
                    <button
                        className={styles.restaurantInfo}
                        onClick={() => setShowTableDetailModal(true)}
                        aria-label="Thông tin khu vực"
                    >
                        <div className={styles.logoWrapper}>
                            {/* Fallback Logo since generation failed */}
                            <div className={styles.fallbackLogo}>
                                <UtensilsCrossed size={20} color="white" />
                            </div>
                        </div>
                        <div className={styles.restaurantTextCol}>
                            <div className={styles.restaurantNameRow}>
                                <span className={styles.restaurantTitle}>Grand Mall Food Court</span>
                                <span className={styles.infoIcon} aria-hidden="true">ⓘ</span>
                            </div>
                            <div className={styles.tableTag}>Tầng 3</div>
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
                    supportRequests={supportRequests}
                />



                <MemberLobby
                    tableId="A-12"
                    members={TABLE_MEMBERS}
                />

                <PromotionStrip />
            </section>





            {/* NEW: Savings Combo Category Section */}
            <section className={styles.comboSection} id="cat-combo">
                <div className={styles.sectionHeader}>
                    <div className={styles.titleGroup}>
                        <h2 className={styles.sectionTitle}>Combo tiết kiệm</h2>
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

            {/* 3. Main Menu */}
            <div className={styles.menuSection}>
                {/* Menu List */}
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
                                                {/* Quantity Control Overlay (New Design) */}
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

                                                {/* Description instead of Likes */}
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

            {/* 4. Staff Support FAB & Active Requests Summary */}
            <div className={`${styles.supportWrapper} ${cartTotalCount > 0 && cartTotalPrice < PROMO_THRESHOLD ? styles.supportShift : ''}`}>
                {/* Show smart summary of active requests */}
                {hasActiveRequest && (
                    <div className={styles.chatBubble}>
                        {(() => {
                            const pendingCount = supportRequests.filter(r => r.status === 'PENDING').length;
                            const confirmedCount = supportRequests.filter(r => r.status === 'CONFIRMED').length;

                            if (pendingCount > 0) return `${pendingCount} yêu cầu đang chờ xác nhận`;
                            if (confirmedCount > 0) return `Nhân viên đang ra hỗ trợ`;
                            return 'Đang xử lý yêu cầu';
                        })()}
                    </div>
                )
                }

                <button
                    className={`${styles.staffFab} ${hasActiveRequest ? styles.active : ''}`}
                    onClick={() => setShowSupportMenu(true)}
                >
                    <ServiceBellIcon size={22} className={styles.staffIcon} />
                    <span className={styles.staffLabel}>Hỗ trợ</span>
                    {hasActiveRequest && (
                        <span className={styles.activeCount}>
                            {supportRequests.length}
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
                                <h3 className={styles.supportTitle}>
                                    Bạn cần hỗ trợ gì?
                                </h3>
                                <button className={styles.supportCloseBtn} onClick={handleCloseSupportMenu}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className={styles.supportGrid}>
                                {SUPPORT_OPTIONS.map((option) => {
                                    const isSelected = selectedSupportOptions.includes(option.id);
                                    return (
                                        <button
                                            key={option.id}
                                            className={`${styles.supportOption} ${isSelected ? styles.selected : ''}`}
                                            onClick={() => toggleSupportOption(option.id)}
                                            style={isSelected ? { borderColor: '#DF1B41', backgroundColor: '#FFF0F2', color: '#DF1B41' } : {}}
                                        >
                                            <span className={styles.optionLabel}>{option.label}</span>
                                            {isSelected && <CheckCircle2 size={16} className={styles.checkIcon} color="#DF1B41" />}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className={styles.otherInputContent} style={{ padding: '0 1rem', marginTop: '1rem' }}>
                                <p className={styles.otherInputNote} style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '0.5rem' }}>Yêu cầu khác (tuỳ chọn)</p>
                                <input
                                    type="text"
                                    className={styles.otherInput}
                                    value={otherRequestText}
                                    onChange={(e) => setOtherRequestText(e.target.value.slice(0, 50))}
                                    placeholder="VD: Thêm chanh, ớt..."
                                    maxLength={50}
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }}
                                />
                            </div>

                            <div className={styles.supportFooter} style={{ padding: '1rem', marginTop: '1rem' }}>
                                <button 
                                    className={styles.submitSupportBtn} 
                                    onClick={submitSupportRequest}
                                    disabled={selectedSupportOptions.length === 0 && !otherRequestText.trim()}
                                    style={{ 
                                        width: '100%', 
                                        padding: '12px', 
                                        background: (selectedSupportOptions.length === 0 && !otherRequestText.trim()) ? '#CBD5E1' : '#DF1B41', 
                                        color: '#fff', 
                                        borderRadius: '12px', 
                                        fontWeight: 'bold',
                                        transition: 'background 0.2s',
                                        cursor: (selectedSupportOptions.length === 0 && !otherRequestText.trim()) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Gửi yêu cầu {(selectedSupportOptions.length > 0 || otherRequestText.trim()) ? `(${(selectedSupportOptions.length + (otherRequestText.trim() ? 1 : 0))})` : ''}
                                </button>
                            </div>
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
                                            {(() => {
                                                // Group cart by store first
                                                const storeGroups: Record<string, { storeName: string, items: { id: number, qty: number, item: any }[] }> = {};
                                                Object.entries(cart).forEach(([idStr, qty]) => {
                                                    const id = Number(idStr);
                                                    const item = MENU_ITEMS.find(i => i.id === id);
                                                    if (item) {
                                                        if (!storeGroups[item.storeId]) {
                                                            storeGroups[item.storeId] = { storeName: item.storeName, items: [] };
                                                        }
                                                        storeGroups[item.storeId].items.push({ id, qty, item });
                                                    }
                                                });

                                                return Object.entries(storeGroups).map(([storeId, group]) => (
                                                    <div key={`store-group-${storeId}`} className="mb-4">
                                                        <div className="flex items-center gap-2 mb-2 px-1">
                                                            <ChefHat size={16} className="text-blue-500" />
                                                            <span className="font-bold text-sm text-slate-800">{group.storeName}</span>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {group.items.map(({ id, qty, item }) => (
                                                                <div key={`quick-${id}`} className={styles.itemRowContainer}>
                                                                    <img src={`${item.img}?w=120&h=120&fit=crop`} alt={item.name} className={styles.itemThumb} />

                                                                    <div className={styles.itemInfoCol}>
                                                                        <div className={styles.itemNameRef}>{item.name}</div>
                                                                        <button className={styles.itemEditBtn}>Chỉnh sửa</button>
                                                                    </div>

                                                                    <div className={styles.itemPriceCol}>
                                                                        <span className={styles.itemPriceRef}>{item.price.toLocaleString('vi-VN')}</span>
                                                                        <div className={styles.qtyCircleBadge}>
                                                                            <span>{qty}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
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
                                <h3>Khu ẩm thực Tầng 3</h3>
                                <span>Khách hàng • {displayOrders.length > 0 ? 'Đã gọi món' : 'Chưa gọi món'}</span>
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

                            {/* 4. CONFIRMED ITEMS (Dynamic List by Store) */}
                            {displayOrders.length > 0 && (
                                <div className={styles.groupSection}>
                                    <h5 className={styles.subGroupTitle}>Món đã gọi</h5>
                                    {(() => {
                                        // Group by masterId, then by order to display batches
                                        const masterGroups: Record<string, any[]> = {};
                                        displayOrders.forEach(order => {
                                            const key = order.masterId || `legacy-${order.id}`;
                                            if (!masterGroups[key]) masterGroups[key] = [];
                                            masterGroups[key].push(order);
                                        });

                                        return Object.values(masterGroups).map((ordersInMaster, mIdx) => (
                                            <div key={`master-${mIdx}`} className="mb-6 pb-4 border-b border-slate-100 last:border-0">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-md">
                                                        Đơn #{mIdx + 1}
                                                    </span>
                                                </div>

                                                {ordersInMaster.map((order, oIdx) => (
                                                    <div key={`ord-${order.id}`} className="mb-4">
                                                        <div className="flex items-center justify-between mb-2 px-1">
                                                            <div className="flex items-center gap-2">
                                                                <ChefHat size={14} className="text-blue-500" />
                                                                <span className="font-bold text-sm text-slate-800">{order.storeName || 'Cửa hàng'}</span>
                                                            </div>
                                                            <span className={`${styles.statusPill} ${styles[(order.status || 'CONFIRMED').toLowerCase()]}`}>
                                                                {order.status || 'CONFIRMED'}
                                                            </span>
                                                        </div>

                                                        {order.items ? (
                                                            Object.entries(order.items).map(([id, qty]) => {
                                                                const item = MENU_ITEMS.find(i => i.id === Number(id));
                                                                if (!item) return null;
                                                                return (
                                                                    <div key={`ord-item-${id}`} className={styles.orderCardItem}>
                                                                        <div className={styles.orderItemInfo}>
                                                                            <h4>{item.name}</h4>
                                                                            <div className={styles.orderItemMeta}>
                                                                                <span className={styles.qtyBadge}>x{qty as number}</span>
                                                                                <span className={styles.priceText}>{item.price.toLocaleString('vi-VN')}đ</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className={styles.orderCardItem}>
                                                                <div className={styles.orderItemInfo}>
                                                                    <h4>{order.name}</h4>
                                                                    <div className={styles.orderItemMeta}>
                                                                        <span className={styles.qtyBadge}>x{order.qty}</span>
                                                                        <span className={styles.priceText}>{(order.price || 0).toLocaleString('vi-VN')}đ</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ));
                                    })()}
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

            {/* NEW: Onboarding Guide Overlay */}
            <OnboardingGuide
                visible={showOnboarding}
                onDismiss={() => setShowOnboarding(false)}
                isShifted={cartTotalCount > 0 && cartTotalPrice < PROMO_THRESHOLD}
            />
        </div >
    );
}
