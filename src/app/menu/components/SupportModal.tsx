import React from 'react';
import { Utensils, Sparkles, CheckCircle2, Wallet, MoreHorizontal, Check, Clock, Users, BellRing } from 'lucide-react';

interface SupportModalProps {
  isStaffModalOpen: boolean;
  setIsStaffModalOpen: (open: boolean) => void;
  supportTab: 'request' | 'history';
  setSupportTab: (tab: 'request' | 'history') => void;
  selectedSupportOptions: string[];
  setSelectedSupportOptions: React.Dispatch<React.SetStateAction<string[]>>;
  customSupportText: string;
  setCustomSupportText: (text: string) => void;
  supportRequests: any[];
  t: (key: string) => string;
  resid: string;
  tableid: string;
  user: any;
  setToast: (toast: { message: string, submessage?: string }) => void;
  fetchLiveTableData: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isStaffModalOpen,
  setIsStaffModalOpen,
  supportTab,
  setSupportTab,
  selectedSupportOptions,
  setSelectedSupportOptions,
  customSupportText,
  setCustomSupportText,
  supportRequests,
  t,
  resid,
  tableid,
  user,
  setToast,
  fetchLiveTableData,
}) => {
  if (!isStaffModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => { setIsStaffModalOpen(false); setSelectedSupportOptions([]); setCustomSupportText(''); }} style={{ zIndex: 11000 }}>
      {/* Beautiful Bottom Sheet Drawer */}
      <div 
        className="absolute bottom-0 left-0 right-0 w-full max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-t-[32px] overflow-hidden flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.15)] transition-all transform duration-300 translate-y-0"
        onClick={e => e.stopPropagation()} 
        style={{ height: 'auto', maxHeight: '85vh', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Header Area */}
        <div className="pt-6 pb-2 px-6 bg-white dark:bg-slate-900 z-10 shrink-0">
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6" />
          
          {/* Segmented Control for Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl relative">
            {/* Sliding indicator */}
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-lg shadow-sm transition-transform duration-300`}
              style={{ transform: supportTab === 'request' ? 'translateX(0)' : 'translateX(100%)' }}
            />
            
            <button 
              onClick={() => setSupportTab('request')}
              className={`flex-1 py-3 text-[0.85rem] font-bold relative z-10 transition-colors duration-200 rounded-lg ${supportTab === 'request' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              {t('Gửi yêu cầu')}
            </button>
            <button 
              onClick={() => setSupportTab('history')}
              className={`flex-1 py-3 text-[0.85rem] font-bold relative z-10 transition-colors duration-200 rounded-lg flex items-center justify-center gap-1.5 ${supportTab === 'history' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              {t('Lịch sử')} 
              {supportRequests && supportRequests.length > 0 && (
                <span className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-1.5 py-0.5 rounded-md text-[0.7rem] leading-none">{supportRequests.length}</span>
              )}
            </button>
          </div>
        </div>
        
        {/* Scrollable Content Body */}
        <div className="overflow-y-auto px-6 pb-6 mt-2 shrink-0" style={{ scrollbarWidth: 'none' }}>
          <div className="transition-opacity duration-300">
            
            {/* --- REQUEST TAB --- */}
            {supportTab === 'request' && (
              <div className="flex flex-col gap-4 pt-1 animate-in fade-in duration-300">
                <p className="text-[0.85rem] text-slate-500 dark:text-slate-400 text-center font-medium">
                  {t('Quý khách có thể chọn nhiều yêu cầu cùng lúc')}
                </p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { id: 'cutlery', icon: <Utensils size={28} strokeWidth={1.5} />, label: t('Thêm bát đũa') },
                    { id: 'napkin', icon: <Sparkles size={28} strokeWidth={1.5} />, label: t('Khăn giấy') },
                    { id: 'clean', icon: <CheckCircle2 size={28} strokeWidth={1.5} />, label: t('Dọn bàn') },
                    { id: 'bill', icon: <Wallet size={28} strokeWidth={1.5} />, label: t('Thanh toán') },
                    { id: 'other', icon: <MoreHorizontal size={28} strokeWidth={1.5} />, label: t('Yêu cầu khác') },
                  ].map(action => {
                    const isSelected = selectedSupportOptions.includes(action.label);
                    const isOther = action.id === 'other';

                    let isDisabled = false;
                    let reqStatus = "";
                    
                    if (!isOther && supportRequests) {
                      const latestRelevantReq = supportRequests.find(r => r.text === action.label);
                      if (latestRelevantReq) {
                        const isCompleted = latestRelevantReq.status === 'Xong' || latestRelevantReq.status === 'Hoàn thành';
                        const reqTs = Number(latestRelevantReq.status_updated_at) || Number(latestRelevantReq.timestamp);
                        const elapsedMin = Math.floor((Date.now() - reqTs) / 60000);
                        if (!isCompleted) {
                          if (latestRelevantReq.status === 'Đã gửi') {
                            isDisabled = true;
                            reqStatus = "Đã gửi";
                          } else if (latestRelevantReq.status === 'Đã nhận' && elapsedMin < 5) {
                            isDisabled = true;
                            reqStatus = "Đang xử lý"; 
                          }
                        }
                      }
                    }

                    // Determine styles based on state
                    let cardClass = "relative flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl p-5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-[0.98]";
                    let iconColor = "text-slate-600 dark:text-slate-300";
                    let textColor = "text-slate-700 dark:text-slate-200";

                    if (isDisabled) {
                      cardClass = "relative flex flex-col items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl p-5 cursor-not-allowed transition-all duration-200 opacity-60 grayscale-[0.2]";
                      iconColor = "text-slate-400 dark:text-slate-500";
                      textColor = "text-slate-500 dark:text-slate-400";
                    } else if (isSelected) {
                      cardClass = "relative flex flex-col items-center justify-center gap-3 bg-red-50 dark:bg-red-500/10 border-2 border-red-500 rounded-2xl p-5 transition-all duration-200 active:scale-[0.98] shadow-[0_0_0_4px_rgba(239,68,68,0.1)] dark:shadow-none";
                      iconColor = "text-red-500";
                      textColor = "text-red-700 dark:text-red-400";
                    }

                    return (
                      <div key={action.id} className={isOther && isSelected ? "col-span-2" : ""}>
                        <button
                          className={`${cardClass} w-full`}
                          disabled={isDisabled}
                          onClick={() => {
                            setSelectedSupportOptions(prev => 
                              prev.includes(action.label) 
                                ? prev.filter(l => l !== action.label) 
                                : [...prev, action.label]
                            );
                          }}
                        >
                          {/* Selected Checkmark Badge (Top Right) */}
                          {isSelected && !isDisabled && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-0.5">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                          
                          {/* Overlay Status Badge (Top Right) */}
                          {isDisabled && reqStatus && (
                            <div className="absolute top-2 right-2 text-[0.6rem] font-bold text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30 px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                              <Clock size={10} strokeWidth={2.5}/>
                              {reqStatus}
                            </div>
                          )}
                          
                          {/* Icon */}
                          <div className={`${iconColor} transition-colors duration-200`}>
                            {action.icon}
                          </div>
                          
                          {/* Label */}
                          <div className="flex flex-col items-center gap-1.5">
                            <span className={`text-[0.9rem] font-bold ${textColor} transition-colors duration-200 tracking-tight`}>
                              {action.label}
                            </span>
                          </div>
                        </button>
                        
                        {/* Input for "Other" when selected */}
                        {isOther && isSelected && (
                          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <input 
                              type="text"
                              placeholder={t('Vui lòng nhập chi tiết yêu cầu...')}
                              value={customSupportText}
                              onChange={e => setCustomSupportText(e.target.value)}
                              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-[1.5px] border-slate-200 dark:border-slate-700 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:focus:ring-red-500/20 transition-all rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 shadow-sm"
                              autoFocus
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- HISTORY TAB --- */}
            {supportTab === 'history' && (
              <div className="pt-1 animate-in fade-in duration-300">
                {supportRequests && supportRequests.length > 0 ? (
                  <div className="flex flex-col gap-3 pb-4">
                    {supportRequests.map((req: any) => {
                      const reqTs = Number(req.status_updated_at) || Number(req.timestamp);
                      const elapsedMin = Math.floor((Date.now() - reqTs) / 60000);
                      const contentStr = (req.text || '').toLowerCase();
                      
                      let slaWarn = 3; let slaDanger = 5;
                      if (contentStr.includes('bát đũa') || contentStr.includes('khăn giấy')) { slaWarn = 2; slaDanger = 3; }
                      
                      const isCompleted = req.status === 'Xong' || req.status === 'Hoàn thành';
                      const isReceived = req.status === 'Đã nhận';
                      
                      let timeColor = "text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50";
                      let timeLabel = isCompleted ? '' : `${elapsedMin} ${t('phút')}`;
                      
                      if (!isCompleted) {
                        if (elapsedMin >= slaDanger) { timeColor = "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"; timeLabel = `${t('Trễ')} ${elapsedMin - slaDanger} ${t('phút')}`; }
                        else if (elapsedMin >= slaWarn) { timeColor = "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20"; }
                      }

                      // Status Styling
                      let statusBg = "bg-amber-50 dark:bg-amber-500/10";
                      let statusIconColor = "text-amber-500";
                      let statusIcon = <Clock size={20} strokeWidth={2} />;
                      
                      if (isCompleted) {
                        statusBg = "bg-green-50 dark:bg-green-500/10";
                        statusIconColor = "text-green-500 dark:text-green-400";
                        statusIcon = <CheckCircle2 size={20} strokeWidth={2} />;
                      } else if (isReceived) {
                        statusBg = "bg-blue-50 dark:bg-blue-500/10";
                        statusIconColor = "text-blue-500 dark:text-blue-400";
                        statusIcon = <Users size={20} strokeWidth={2} />;
                      }

                      return (
                        <div key={req.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${statusBg} ${statusIconColor}`}>
                              {statusIcon}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-[0.95rem] text-slate-800 dark:text-slate-100 leading-tight mb-0.5">{req.text}</span>
                              <span className="text-[0.75rem] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                {req.time} <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span> <span className={`${isCompleted ? 'text-green-600 dark:text-green-400' : (isReceived ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400')} font-semibold`}>{req.status || 'Đã gửi'}</span>
                              </span>
                            </div>
                          </div>
                          {!isCompleted && (
                            <div className={`text-[0.75rem] font-bold ${timeColor} px-2.5 py-1.5 rounded-lg border border-transparent`}>
                              {timeLabel}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-5 animate-pulse">
                      <Users size={32} strokeWidth={1.5} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="font-semibold text-[0.95rem] tracking-tight">{t('Chưa có yêu cầu hỗ trợ nào.')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Sticky Footer */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3 z-10 w-full shrink-0">
          <button 
            className="flex-1 max-w-[120px] py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold tracking-tight rounded-xl transition-colors"
            onClick={() => { setIsStaffModalOpen(false); setSelectedSupportOptions([]); setCustomSupportText(''); }}
          >
            {t('Đóng')}
          </button>
          
          {supportTab === 'request' && (
            <button 
              disabled={selectedSupportOptions.length === 0}
              className={`flex-[2] py-4 font-bold tracking-tight rounded-xl flex justify-center items-center gap-2 transition-all ${
                selectedSupportOptions.length > 0 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_20px_rgba(239,68,68,0.3)] active:scale-[0.98]' 
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
              onClick={async () => {
                if (selectedSupportOptions.length === 0) return;
                
                if (selectedSupportOptions.includes(t('Yêu cầu khác')) && !customSupportText.trim()) {
                  setToast({ message: t('Vui lòng nhập chi tiết'), submessage: t('Bạn chưa điền nội dung cho "Yêu cầu khác"') });
                  return;
                }

                await Promise.all(selectedSupportOptions.map(content => {
                  const finalContent = content === t('Yêu cầu khác') ? customSupportText.trim() : content;
                  return fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      resid, tableid, user_id: user?.id,
                      content: finalContent,
                      type: 'SUPPORT'
                    })
                  });
                }));
                
                setToast({ message: t('Đã gửi yêu cầu!'), submessage: t('Nhân viên sẽ có mặt ngay.') });
                setSelectedSupportOptions([]);
                setCustomSupportText('');
                setSupportTab('history');
                fetchLiveTableData();
              }}
            >
              <BellRing size={20} strokeWidth={2.5} /> 
              {selectedSupportOptions.length > 0 ? `${t('Gửi')} ${selectedSupportOptions.length} ${t('yêu cầu')}` : t('Gửi yêu cầu')}
            </button>
          )}
          {supportTab === 'history' && (
            <div className="flex-[2]" /> 
          )}
        </div>
      </div>
    </div>
  );
};
