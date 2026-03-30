import React from "react";
import styles from "../page.module.css";
import { useLanguage } from "@/context/LanguageContext";

export function MenuFooter() {
    const { t } = useLanguage();
    return (
        <footer className={styles.staticFooter}>
            <div className={styles.footerBrand}>
                <h3 className={styles.footerBrandName}>O2O Restaurant</h3>
                <p className={styles.footerSlogan}>{t('Mang hương vị đến gần bạn hơn')}</p>
            </div>
            <div className={styles.footerLinks}>
                <span>{t('Chính sách bảo mật')}</span>
                <span>•</span>
                <span>{t('Điều khoản dịch vụ')}</span>
                <span>•</span>
                <span>{t('Hỗ trợ')}</span>
            </div>
            <div className={styles.copyright}>
                © 2024 O2O Restaurant. All rights reserved.
            </div>
            <div className={styles.footerSpacer}></div>
        </footer>
    );
}
