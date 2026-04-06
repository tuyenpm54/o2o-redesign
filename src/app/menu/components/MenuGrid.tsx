import React from 'react';
import { Sparkles } from "lucide-react";
import styles from "../page.module.css";
import { MenuCard } from "./MenuCard";

interface MenuGridProps {
    filteredCategories: string[];
    displayMenuItems: any[];
    pairingRecommendedItems: any[];
    searchQuery: string;
    theme: any;
    t: (key: string) => string;
    language: string;
    categoryRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
    getConfirmedQty: (name: string) => number;
    getDraftingUser: (id: number) => any;
    getItemQuantity: (id: number) => number;
    getPairingMessage: (item: any) => string | null;
    setSelectedItem: (item: any) => void;
    addToTotal: (item: any) => void;
    removeFromTotal: (item: any) => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
    filteredCategories,
    displayMenuItems,
    pairingRecommendedItems,
    searchQuery,
    theme,
    t,
    language,
    categoryRefs,
    getConfirmedQty,
    getDraftingUser,
    getItemQuantity,
    getPairingMessage,
    setSelectedItem,
    addToTotal,
    removeFromTotal,
}) => {
    const categoriesToRender = filteredCategories.filter(
        c => c !== "Combo tiết kiệm" && 
             c !== "Combo Nhóm Ngon Nhất" && 
             c !== "Món bạn từng gọi" && 
             c !== "Siêu phẩm bán chạy" &&
             c !== "Món bán chạy"
    );

    return (
        <>
            {categoriesToRender.map((cat: string) => (
                <section 
                    key={cat} 
                    id={`category-${cat}`} 
                    className={styles.menuGridSection}
                    ref={(el) => {
                        if (categoryRefs.current) {
                            categoryRefs.current[cat] = el;
                        }
                    }}
                    data-category={cat}
                >
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            {cat === "Hoàn hảo cho bữa tiệc" && <Sparkles size={20} className="text-amber-500" />}
                            {cat}
                        </h2>
                    </div>
                    <div className={styles.menuGrid}>
                        {(cat === "Hoàn hảo cho bữa tiệc" 
                            ? pairingRecommendedItems 
                            : displayMenuItems.filter(i => i.category === cat))
                            .filter(item => {
                                if (!searchQuery.trim()) return true;
                                const q = searchQuery.toLowerCase();
                                return item.name.toLowerCase().includes(q) || 
                                       (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(q)));
                            })
                            .map((item: any) => (
                                <MenuCard
                                    key={item.id}
                                    item={item}
                                    theme={theme}
                                    t={t}
                                    language={language}
                                    confirmedQty={getConfirmedQty(item.name)}
                                    draftingUser={getDraftingUser(item.id)}
                                    itemQuantity={getItemQuantity(item.id)}
                                    pairingMessage={getPairingMessage(item) || ""}
                                    onSelect={setSelectedItem}
                                    onAdd={addToTotal}
                                    onRemove={removeFromTotal}
                                />
                            ))}
                    </div>
                </section>
            ))}
        </>
    );
};
