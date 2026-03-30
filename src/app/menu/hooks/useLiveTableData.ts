"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface TableMember {
  id: string;
  name: string;
  confirmedOrders?: Array<{ name: string; qty: number; [key: string]: any }>;
  [key: string]: any;
}

interface UseLiveTableDataReturn {
  tableMembers: TableMember[];
  setTableMembers: (members: TableMember[]) => void;
  tableOrders: any[];
  isCheckoutRequested: boolean;
  setIsCheckoutRequested: (val: boolean) => void;
  sittingSince: string | null;
  setSittingSince: (val: string | null) => void;
  isPaidModalOpen: boolean;
  setIsPaidModalOpen: (val: boolean) => void;
  isTableClosed: boolean;
  setIsTableClosed: (val: boolean) => void;
  supportRequests: any[];
  setSupportRequests: (val: any[]) => void;
  notifications: any[];
  setNotifications: (val: any[]) => void;
  fetchLiveTableData: (force?: boolean) => Promise<void>;
}

export function useLiveTableData(
  resid: string | null,
  tableid: string | null,
  userId: string | undefined,
  setToast: (toast: { message: string; submessage: string } | null) => void
): UseLiveTableDataReturn {
  const [tableMembers, setTableMembers] = useState<TableMember[]>([]);
  const [tableOrders, setTableOrders] = useState<any[]>([]);
  const [isCheckoutRequested, setIsCheckoutRequested] = useState(false);
  const [sittingSince, setSittingSince] = useState<string | null>(null);
  const [isPaidModalOpen, setIsPaidModalOpen] = useState(false);
  const [isTableClosed, setIsTableClosed] = useState(false);
  const [supportRequests, setSupportRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const membersRef = useRef<TableMember[]>([]);
  const seenMemberIds = useRef(new Set<string>());

  const localVersionRef = useRef<number>(0);

  const fetchLiveTableData = useCallback(async (force = false) => {
    if (!resid || !tableid) return;
    try {
      // 1. Check version first using lightweight sync API
      if (!force) {
          const syncRes = await fetch(
             `/api/restaurants/${resid}/sync?tableid=${tableid}&t=${Date.now()}`,
             { cache: 'no-store' }
          );
          if (syncRes.ok) {
              const { version } = await syncRes.json();
              // If version hasn't changed since our last load, skip the heavy fetch!
              if (typeof version === 'number' && version <= localVersionRef.current) {
                  return; 
              }
              // It changed (or it's the first time), record it
              if (typeof version === 'number') localVersionRef.current = version;
          }
      }

      // 2. Heavy Fetch only if forced or version changed
      const liveRes = await fetch(
        `/api/restaurants/${resid}/live?tableid=${tableid}&t=${Date.now()}`,
        { cache: 'no-store' }
      );
      if (!liveRes.ok) return;
      
      const liveData = await liveRes.json();
      if (liveData && !liveData.error) {
        // If we didn't force and we missed the sync version, update localVersion
        if (!localVersionRef.current) localVersionRef.current = Date.now();

        const newMembers = liveData.members || [];
        // Find members we haven't seen before AND haven't notified about yet
        const trulyNewMembers = newMembers.filter((m: any) =>
          m.id !== userId && !seenMemberIds.current.has(m.id)
        );
        if (trulyNewMembers.length > 0) {
          // Mark all current members as seen
          newMembers.forEach((m: any) => seenMemberIds.current.add(m.id));
          if (membersRef.current.length > 0) {
            // Only show toast if we had previous members (not on first load)
            const lastNew = trulyNewMembers[trulyNewMembers.length - 1];
            setToast({ message: `${lastNew.name} vừa tham gia bàn`, submessage: "Cùng nhau gọi món nhé!" });
            setTimeout(() => setToast(null), 3000);
          } else {
            // First load — just mark all as seen, no toast
            newMembers.forEach((m: any) => seenMemberIds.current.add(m.id));
          }
        }
        setTableMembers(newMembers);
        membersRef.current = newMembers;
        // Store table-level orders (all orders for the active session)
        if (liveData.tableOrders) {
          setTableOrders(liveData.tableOrders);
        }
        if (liveData.hasOwnProperty('isCheckoutRequested')) {
          setIsCheckoutRequested(liveData.isCheckoutRequested);
        }
        if (liveData.sittingSince) {
          setSittingSince(liveData.sittingSince);
        }
        if (liveData.isPaid && !isPaidModalOpen) {
          setIsPaidModalOpen(true);
        }
        if (liveData.isTableClosed && !isTableClosed) {
          setIsTableClosed(true);
        }
        if (liveData.supportRequests) {
          setSupportRequests(liveData.supportRequests);
        }
        if (liveData.notifications) {
          setNotifications(liveData.notifications);
        }
      }
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        // Silent network error
      } else {
        console.warn("Live data poll failed:", err);
      }
    }
  }, [resid, tableid, userId, isPaidModalOpen, setToast]);

  return {
    tableMembers,
    setTableMembers,
    tableOrders,
    isCheckoutRequested,
    setIsCheckoutRequested,
    sittingSince,
    setSittingSince,
    isPaidModalOpen,
    setIsPaidModalOpen,
    isTableClosed,
    setIsTableClosed,
    supportRequests,
    setSupportRequests,
    notifications,
    setNotifications,
    fetchLiveTableData,
  };
}
