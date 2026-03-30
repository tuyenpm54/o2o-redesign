import { useState, useRef, useEffect } from 'react';
import { MenuItem, CartSelection, ServiceRequest } from '@/types/models';

/**
 * useMenuUI Hook
 * Encapsulates all transient UI-only states for the Menu page.
 * Responsibilities include managing modals, search queries, active categories, 
 * edit items states, wizard toggles, and global status toasts.
 * 
 * @returns {Object} Object containing getters and setters for all UI states.
 */
export function useMenuUI() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [activeRoundIndex, setActiveRoundIndex] = useState(-1);
  const [selectedPeopleCount, setSelectedPeopleCount] = useState<number | null>(null);
  const [activeServiceRequests, setActiveServiceRequests] = useState<ServiceRequest[]>([]);
  
  // Modals & Drawers
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isPaidModalOpen, setIsPaidModalOpen] = useState(false);
  const [isTableClosed, setIsTableClosed] = useState(false);
  const [isWizardShown, setIsWizardShown] = useState(false);
  
  // Wizard States
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [form, setForm] = useState<{ groupSize: string; preferences: string[]; cravingMood: string }>({ groupSize: "", preferences: [], cravingMood: "" });
  
  // Toasts
  const [toast, setToast] = useState<{ message: string; submessage?: string } | null>(null);
  const [statusToastMsg, setStatusToastMsg] = useState("");
  const [isStatusToastOpen, setIsStatusToastOpen] = useState(false);
  
  // Item Edit State
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [editInitialSelections, setEditInitialSelections] = useState<CartSelection | null>(null);
  const [editCurrentQty, setEditCurrentQty] = useState<number>(0);
  
  // Support Modal States
  const [supportTab, setSupportTab] = useState<'request' | 'history'>('request');
  const [selectedSupportOptions, setSelectedSupportOptions] = useState<string[]>([]);
  const [customSupportText, setCustomSupportText] = useState('');

  // UI Headers & Scroll
  const [showCategoryBar, setShowCategoryBar] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(true);

  // Error State
  const [errorHeader, setErrorHeader] = useState<string | null>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setShowCategoryBar(currentScrollY > 10);
          if (currentScrollY > 120) {
            setIsHeaderHidden(false); 
          } else {
            setIsHeaderHidden(true);  
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    searchQuery, setSearchQuery,
    activeCategory, setActiveCategory,
    activeRoundIndex, setActiveRoundIndex,
    selectedPeopleCount, setSelectedPeopleCount,
    activeServiceRequests, setActiveServiceRequests,
    isStaffModalOpen, setIsStaffModalOpen,
    isPaidModalOpen, setIsPaidModalOpen,
    isTableClosed, setIsTableClosed,
    isWizardShown, setIsWizardShown,
    onboardingStep, setOnboardingStep,
    form, setForm,
    toast, setToast,
    statusToastMsg, setStatusToastMsg,
    isStatusToastOpen, setIsStatusToastOpen,
    selectedItem, setSelectedItem,
    editInitialSelections, setEditInitialSelections,
    editCurrentQty, setEditCurrentQty,
    supportTab, setSupportTab,
    selectedSupportOptions, setSelectedSupportOptions,
    customSupportText, setCustomSupportText,
    showCategoryBar, setShowCategoryBar,
    isHeaderHidden, setIsHeaderHidden,
    errorHeader, setErrorHeader
  };
}
