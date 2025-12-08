import React, { useState, useEffect } from 'react';
import { Download, Plus, Trash2, X, Building2, User, FileText, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';

export default function App() {
  // --- 初期データ定義 ---
  const stores = [
    '糸我', '貴志川', '紀三井寺', '和歌山北インター', '東和歌山',
    '和佐', 'かつらぎ', '御所', '天理', '熊野',
    'りんくう泉南', '池田', '倉吉', '岡南', '坂出',
    '徳島石井', '小松島'
  ];
  
  const items = [
    { name: '両替', isInvoice: false },
    { name: 'エラー', isInvoice: false },
    { name: 'プリカエラー', isInvoice: false },
    { name: 'プリカ空転', isInvoice: false },
    { name: '消耗品', isInvoice: true },
    { name: 'ゴミ・浄化槽', isInvoice: true },
    { name: '租税公課', isInvoice: false },
    { name: 'その他', isInvoice: false }
  ];

  const personalItems = [
    '宿泊費', 'ガソリン代', 'フェリー代', '電車代', '高速代', '駐車料', 'レンタカー',
    '消耗品', '洗車代', '交際費', '通信費', '租税公課', '県証紙', 'その他'
  ];

  // --- State管理 ---
  const [activeTab, setActiveTab] = useState('store');

  // データリスト (LocalStorageから読み込み)
  const [entries, setEntries] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('expense_entries_v2');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [personalEntries, setPersonalEntries] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('personal_entries_v2');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // UI状態管理
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isPersonalItemModalOpen, setIsPersonalItemModalOpen] = useState(false);
  
  // 入力フォーム用State
  const [currentStore, setCurrentStore] = useState('');
  const [currentItem, setCurrentItem] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [currentMemo, setCurrentMemo] = useState('');
  const [currentOther, setCurrentOther] = useState('');

  // 個人用入力フォームState
  const [pItem, setPItem] = useState('');
  const [pAmount, setPAmount] = useState('');
  const [pMemo, setPMemo] = useState('');
  const [pOther, setPOther] = useState('');

  const [notification, setNotification] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // --- 副作用 (データ保存) ---
  useEffect(() => {
    localStorage.setItem('expense_entries_v2', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('personal_entries_v2', JSON.stringify(personalEntries));
  }, [personalEntries]);

  // --- ヘルパー関数 ---
  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // CSV用にテキストを安全にする（改行削除、カンマエスケープ）
  const sanitizeForCsv = (text) => {
    if (!text) return '';
    // 改行をスペースに置換し、ダブルクォートをエスケープ
    const noNewLines = String(text).replace(/[\r\n]+/g, ' ');
    return `"${noNewLines.replace(/"/g, '""')}"`;
  };

  // --- 店舗用関数 ---
  const addEntry = () => {
    if (!currentStore || !currentItem || !currentAmount) {
      showNotification('店舗、項目、金額は必須です', 'error');
      return;
    }
    if (currentItem === 'その他' && !currentOther) {
      showNotification('その他の内容を入力してください', 'error');
      return;
    }

    const itemInfo = items.find(i => i.name === currentItem);
    
    // 修正: メモは純粋にメモ欄の内容だけにする（重複防止）
    const memoText = currentMemo; 

    const newEntry = {
      id: Date.now(),
      store: currentStore,
      item: currentItem,
      amount: parseInt(currentAmount),
      memo: memoText,
      isInvoice: itemInfo ? itemInfo.isInvoice : false,
      // その他ならその内容、それ以外なら項目名をセット
      displayItem: currentItem === 'その他' ? currentOther : currentItem,
      createdAt: new Date().toISOString()
    };

    setEntries([newEntry, ...entries]);
    
    // 入力リセット
    // 店舗名は連続入力のために残すか、誤入力防止で消すか。
    // ここでは安全のためリセットしますが、必要なら setCurrentStore('') を削除してください。
    setCurrentStore(''); 
    setCurrentItem('');
    setCurrentAmount('');
    setCurrentMemo('');
    setCurrentOther('');
    showNotification('リストに追加しました');
  };

  // --- 個人用関数 ---
  const addPersonalEntry = () => {
    if (!pItem || !pAmount) {
      showNotification('項目、金額は必須です', 'error');
      return;
    }
    if (pItem === 'その他' && !pOther) {
      showNotification('その他の内容を入力してください', 'error');
      return;
    }

    // 修正: メモは純粋にメモ欄の内容だけにする
    const memoText = pMemo;

    const newEntry = {
      id: Date.now(),
      item: pItem,
      amount: parseInt(pAmount),
      memo: memoText,
      displayItem: pItem === 'その他' ? pOther : pItem,
      createdAt: new Date().toISOString()
    };

    setPersonalEntries([newEntry, ...personalEntries]);
    
    setPItem('');
    setPAmount('');
    setPMemo('');
    setPOther('');
    showNotification('リストに追加しました');
  };

  const deleteEntry = (id) => setEntries(entries.filter(e => e.id !== id));
  const deletePersonalEntry = (id) => setPersonalEntries(personalEntries.filter(e => e.id !== id));

  const clearAllData = () => {
    setEntries([]);
    setPersonalEntries([]);
    setShowDeleteConfirm(false);
    showNotification('全データを削除しました', 'info');
  };

  // ファイル名をスマートに生成する
  const generateFileName = () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    
    // 店舗データの集計（どの店舗が多いか）
    if (entries.length > 0) {
      const storeCounts = {};
      entries.forEach(e => {
        storeCounts[e.store] = (storeCounts[e.store] || 0) + 1;
      });
      // 最も多い店舗名を取得
      const mainStore = Object.keys(storeCounts).reduce((a, b) => storeCounts[a] > storeCounts[b] ? a : b);
      const otherCount = entries.length - storeCounts[mainStore];
      
      const suffix = otherCount > 0 ? `_他${otherCount}件` : '';
      const personalSuffix = personalEntries.length > 0 ? `_個人${personalEntries.length}件` : '';
      
      return `経費_${mainStore}${suffix}${personalSuffix}_${dateStr}.csv`;
    } 
    
    if (personalEntries.length > 0) {
      return `経費_個人分のみ_${personalEntries.length}件_${dateStr}.csv`;
    }

    return `経費データ_${dateStr}.csv`;
  };

  const exportToExcel = () => {
    if (entries.length === 0 && personalEntries.length === 0) {
      showNotification('データがありません', 'error');
      return;
    }

    const csvRows = [];
    // ヘッダー（GASやExcelで集計しやすいようにシンプルに）
    csvRows.push(['種別', '店舗_項目', '詳細', '金額', 'メモ', 'インボイス判定', '登録日時'].join(','));
    
    // 店舗データ
    entries.forEach(entry => {
      csvRows.push([
        '店舗出金',
        sanitizeForCsv(entry.store),
        sanitizeForCsv(entry.displayItem),
        entry.amount,
        sanitizeForCsv(entry.memo),
        entry.isInvoice ? 'インボイス' : '',
        entry.createdAt
      ].join(','));
    });

    // 個人データ
    personalEntries.forEach(entry => {
      csvRows.push([
        '個人経費',
        '西村（個人）',
        sanitizeForCsv(entry.displayItem),
        entry.amount,
        sanitizeForCsv(entry.memo),
        '',
        entry.createdAt
      ].join(','));
    });

    const filename = generateFileName();
    const csvContent = '\uFEFF' + csvRows.join('\n'); // BOM付与
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(`「${filename}」を出力しました`);
  };

  // 合計計算
  const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const personalTotal = personalEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const grandTotal = totalAmount + personalTotal;

  // 選択用モーダルコンポーネント
  const SelectionModal = ({ isOpen, onClose, title, options, onSelect, currentSelected }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col shadow-2xl">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
            <h3 className="font-bold text-lg text-slate-700">{title}</h3>
            <button onClick={onClose} className="p-2 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors">
              <X size={20} className="text-slate-600" />
            </button>
          </div>
          <div className="overflow-y-auto p-4 grid grid-cols-2 gap-3">
            {options.map((opt) => {
              const label = typeof opt === 'string' ? opt : opt.name;
              const isSelected = currentSelected === label;
              return (
                <button
                  key={label}
                  onClick={() => { onSelect(opt); onClose(); }}
                  className={`p-4 rounded-xl text-left font-bold text-sm transition-all shadow-sm border-2 ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200' 
                      : 'bg-white border-slate-100 text-slate-700 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {label}
                  {typeof opt !== 'string' && opt.isInvoice && (
                    <span className="block text-[10px] mt-1 opacity-80 font-normal">📄 インボイス</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-24 font-sans text-slate-800 safe-area-inset-bottom">
      {/* 通知 */}
      {notification && (
        <div className={`fixed top-4 left-4 right-4 z-[60] px-4 py-3 rounded-xl shadow-2xl text-white font-bold text-center animate-slide-down ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-slate-800'
        }`}>
          {notification.msg}
        </div>
      )}

      {/* ヘッダー */}
      <header className="bg-slate-800 text-white pt-4 pb-4 px-4 sticky top-0 z-10 shadow-md">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2 text-blue-100">
              <FileText size={20} />
              経費管理
            </h1>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">合計金額</div>
            <div className="text-xl font-bold text-yellow-400 leading-none">¥{grandTotal.toLocaleString()}</div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        
        {/* タブ切り替え */}
        <div className="flex bg-white rounded-xl shadow-sm p-1 mb-6">
          <button
            onClick={() => setActiveTab('store')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'store' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'
            }`}
          >
            <Building2 size={20} />
            店舗出金
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'personal' ? 'bg-purple-600 text-white shadow' : 'text-slate-400'
            }`}
          >
            <User size={20} />
            個人経費
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm flex flex-col items-center justify-center gap-1 transition-all relative ${
              activeTab === 'list' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400'
            }`}
          >
            <Download size={20} />
            確認・出力
            {(entries.length + personalEntries.length) > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>

        {/* 店舗入力 */}
        {activeTab === 'store' && (
          <div className="bg-white rounded-2xl shadow-sm p-5 animate-fade-in space-y-6">
            
            {/* 店舗選択ボタン */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">どこの店舗ですか？</label>
              <button
                onClick={() => setIsStoreModalOpen(true)}
                className={`w-full p-4 rounded-xl border-2 text-left flex justify-between items-center transition-all ${
                  currentStore 
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold text-lg' 
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                {currentStore || '店舗を選択する'}
                <ChevronRight size={20} className={currentStore ? 'text-blue-500' : 'text-slate-300'} />
              </button>
            </div>

            {/* 項目選択ボタン */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">出金内容は？</label>
              <button
                onClick={() => setIsItemModalOpen(true)}
                className={`w-full p-4 rounded-xl border-2 text-left flex justify-between items-center transition-all ${
                  currentItem 
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold text-lg' 
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                <span>
                  {currentItem || '項目を選択する'}
                  {items.find(i => i.name === currentItem)?.isInvoice && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-200 align-middle">
                      インボイス
                    </span>
                  )}
                </span>
                <ChevronRight size={20} className={currentItem ? 'text-blue-500' : 'text-slate-300'} />
              </button>
            </div>

            {/* その他詳細入力 */}
            {currentItem === 'その他' && (
              <div className="animate-slide-down bg-blue-50 p-4 rounded-xl border border-blue-100">
                <label className="text-xs font-bold text-blue-600 mb-1 block">具体的な内容 (必須)</label>
                <input
                  type="text"
                  value={currentOther}
                  onChange={(e) => setCurrentOther(e.target.value)}
                  className="w-full p-3 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-blue-900 placeholder-blue-200"
                  placeholder="例：備品購入"
                />
              </div>
            )}

            {/* 金額入力 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">金額</label>
              <div className="relative">
                <input
                  type="tel"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full p-4 pl-8 text-2xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-0 outline-none transition-colors"
                  placeholder="0"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">¥</span>
              </div>
            </div>

            {/* メモ */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">メモ (任意)</label>
              <input
                type="text"
                value={currentMemo}
                onChange={(e) => setCurrentMemo(e.target.value)}
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none"
                placeholder="詳細などあれば"
              />
            </div>

            {/* 追加ボタン */}
            <button
              onClick={addEntry}
              className="w-8 bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl font-bold shadow-lg shadow-slate-300 flex items-center justify-center gap-2 active:scale-95 transition-transform mt-4"
            >
              <Plus size={24} />
              リストに追加する
            </button>
          </div>
        )}

        {/* 個人経費入力 */}
        {activeTab === 'personal' && (
          <div className="bg-white rounded-2xl shadow-sm p-5 animate-fade-in space-y-6">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">項目は？</label>
              <button
                onClick={() => setIsPersonalItemModalOpen(true)}
                className={`w-full p-4 rounded-xl border-2 text-left flex justify-between items-center transition-all ${
                  pItem 
                    ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold text-lg' 
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                {pItem || '項目を選択する'}
                <ChevronRight size={20} className={pItem ? 'text-purple-500' : 'text-slate-300'} />
              </button>
            </div>

            {pItem === 'その他' && (
              <div className="animate-slide-down bg-purple-50 p-4 rounded-xl border border-purple-100">
                <label className="text-xs font-bold text-purple-600 mb-1 block">具体的な内容 (必須)</label>
                <input
                  type="text"
                  value={pOther}
                  onChange={(e) => setPOther(e.target.value)}
                  className="w-full p-3 bg-white border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-purple-900 placeholder-purple-200"
                  placeholder="例：タクシー代"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">金額</label>
              <div className="relative">
                <input
                  type="tel"
                  value={pAmount}
                  onChange={(e) => setPAmount(e.target.value)}
                  className="w-full p-4 pl-8 text-2xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:bg-white focus:ring-0 outline-none transition-colors"
                  placeholder="0"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">¥</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">メモ (任意)</label>
              <input
                type="text"
                value={pMemo}
                onChange={(e) => setPMemo(e.target.value)}
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:bg-white outline-none"
                placeholder="ホテル名など"
              />
            </div>

            <button
              onClick={addPersonalEntry}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl font-bold shadow-lg shadow-slate-300 flex items-center justify-center gap-2 active:scale-95 transition-transform mt-4"
            >
              <Plus size={24} />
              リストに追加する
            </button>
          </div>
        )}

        {/* リスト確認・出力 */}
        {activeTab === 'list' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">登録済みリスト</h3>
                <span className="text-xs text-slate-400">{entries.length + personalEntries.length}件</span>
              </div>

              <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
                {entries.length === 0 && personalEntries.length === 0 && (
                  <div className="p-8 text-center flex flex-col items-center justify-center text-slate-300">
                    <AlertCircle size={48} className="mb-2 opacity-20" />
                    <p>データはありません</p>
                  </div>
                )}

                {entries.map((entry) => (
                  <div key={entry.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Building2 size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-bold text-slate-800 truncate mr-2">{entry.store}</span>
                        <span className="font-bold text-slate-800 shrink-0">¥{entry.amount.toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-slate-500 truncate">
                        {entry.displayItem}
                        {entry.memo && <span className="text-slate-400 ml-1">({entry.memo})</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteEntry(entry.id)}
                      className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                {personalEntries.map((entry) => (
                  <div key={entry.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors bg-purple-50/20">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                      <User size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-bold text-slate-800 truncate mr-2">{entry.displayItem}</span>
                        <span className="font-bold text-slate-800 shrink-0">¥{entry.amount.toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-slate-500 truncate">
                        西村（個人）
                        {entry.memo && <span className="text-slate-400 ml-1">({entry.memo})</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => deletePersonalEntry(entry.id)}
                      className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={exportToExcel}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-bold shadow-lg shadow-emerald-200 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <Download size={24} />
                <div className="text-left">
                  <div className="text-sm opacity-80 leading-none">CSVファイルを</div>
                  <div className="text-lg leading-none">ダウンロードする</div>
                </div>
              </button>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full text-slate-400 p-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <Trash2 size={16} />
                  全データを削除してリセット
                </button>
              ) : (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 animate-fade-in text-center">
                  <p className="font-bold text-red-600 mb-3 text-sm">全て削除してよろしいですか？</p>
                  <div className="flex gap-2">
                    <button onClick={clearAllData} className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold text-sm">はい</button>
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-white text-slate-600 py-2 rounded-lg font-bold text-sm border">キャンセル</button>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-xs text-center text-slate-400 px-4">
              ※出力ファイル名は自動で「{generateFileName()}」のようになります。<br/>
              ※CSVはGoogleドライブの「出金伝票フォルダ」にアップロードしてください。
            </p>
          </div>
        )}

      </main>

      {/* モーダル群 */}
      <SelectionModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        title="店舗を選択"
        options={stores}
        onSelect={setCurrentStore}
        currentSelected={currentStore}
      />
      <SelectionModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title="項目を選択"
        options={items}
        onSelect={(item) => {
          setCurrentItem(item.name);
          // その他以外を選んだら詳細はクリア
          if (item.name !== 'その他') setCurrentOther('');
        }}
        currentSelected={currentItem}
      />
      <SelectionModal
        isOpen={isPersonalItemModalOpen}
        onClose={() => setIsPersonalItemModalOpen(false)}
        title="個人経費項目を選択"
        options={personalItems}
        onSelect={(item) => {
          setPItem(item);
          if (item !== 'その他') setPOther('');
        }}
        currentSelected={pItem}
      />

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; height: 0; }
          to { opacity: 1; height: auto; }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-slide-down { animation: slide-down 0.2s ease-out; }
        .safe-area-inset-bottom { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </div>
  );
}
