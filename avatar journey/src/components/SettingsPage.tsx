import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Download, Upload, ShieldAlert, Edit3 } from 'lucide-react';
import { ApiConfig } from '../types';
import { setApiConfig, getApiConfig } from '../services/apiService';
import { exportAllData, importData } from '../services/storageService';

interface SettingsPageProps {
  resetAllData: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ resetAllData }) => {
  const [apiConfig, setApiConfigState] = useState<ApiConfig>(getApiConfig());
  const [isEditingKey, setIsEditingKey] = useState(false);

  useEffect(() => {
    setApiConfigState(getApiConfig());
  }, []);

  const handleSaveApiConfig = () => {
    setApiConfig(apiConfig);
    setIsEditingKey(false);
    alert('配置已同步。');
  };

  const handleResetData = () => {
    if (window.confirm('强制格式化所有本地数据？此操作不可逆。')) {
      resetAllData();
      window.location.reload();
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `avatar_journey_archive.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          if (window.confirm('检测到存档，是否覆盖当前时间轴？')) {
            await importData(content);
            window.location.reload();
          }
        } catch (error) {
          alert('数据解析失败。');
        }
      };
      reader.readAsText(file);
    }
  };

  const startEditing = () => {
    setIsEditingKey(true);
    setApiConfigState(prev => ({ ...prev, apiKey: '' })); // 清空以重新填写
  };

  return (
    <div className="page-container space-y-6 pb-20">
      <div className="card">
        <h3 className="card-title flex items-center gap-2">
          <Settings size={18} />
          系统协议 / PROTOCOL
        </h3>

        <div className="space-y-6 pt-2">
          <div>
            <label className="label-small">AI 供应商</label>
            <select
              value={apiConfig.provider}
              onChange={(e) => setApiConfigState(prev => ({ ...prev, provider: e.target.value as ApiConfig['provider'] }))}
              className="input-brutalist bg-white"
            >
              <option value="gemini">Google Gemini (Recommended)</option>
              <option value="doubao">字节跳动 豆包</option>
              <option value="claude">Anthropic Claude</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label-small">API Access Key</label>
              {!isEditingKey && apiConfig.apiKey && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="flex items-center gap-1 text-[10px] font-black uppercase underline opacity-40 hover:opacity-100"
                >
                  <Edit3 size={10} /> Edit / 重填
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                value={isEditingKey ? apiConfig.apiKey : (apiConfig.apiKey ? '********' : '')}
                onChange={(e) => isEditingKey && setApiConfigState(prev => ({ ...prev, apiKey: e.target.value }))}
                readOnly={!isEditingKey}
                onClick={() => !isEditingKey && startEditing()}
                className={`input-brutalist ${!isEditingKey ? 'cursor-pointer opacity-60' : ''}`}
                placeholder={isEditingKey ? "粘贴新的 API 密钥..." : "未配置密钥"}
              />
              {!isEditingKey && apiConfig.apiKey && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-green-600 uppercase">
                  Key Saved / 已安全存储
                </div>
              )}
            </div>
            <p className="mt-2 text-[9px] text-gray-400 leading-tight">
              * 为确保安全，密钥已进行脱敏处理且不可找回。如需更换，请点击重填。
            </p>
          </div>

          <button
            onClick={handleSaveApiConfig}
            className="btn-black py-4 text-xs tracking-widest disabled:opacity-50"
            disabled={isEditingKey && !apiConfig.apiKey}
          >
            更新状态并重连 / UPDATE & RECONNECT
          </button>
        </div>
      </div>

      <div className="card border-dashed">
        <h3 className="card-title flex items-center gap-2 mb-4">
          <RefreshCw size={18} />
          数据终端 / DATA TERMINAL
        </h3>

        <div className="grid grid-cols-2 gap-3 overflow-hidden">
          <button
            onClick={handleExportData}
            className="btn-brutalist flex flex-col items-center justify-center p-4 gap-2 min-h-[100px]"
          >
            <Download size={24} />
            <span className="text-[10px] font-black uppercase tracking-tighter">导出存档 (EXPORT)</span>
          </button>

          <label className="btn-brutalist flex flex-col items-center justify-center p-4 gap-2 cursor-pointer min-h-[100px]">
            <Upload size={24} />
            <span className="text-[10px] font-black uppercase tracking-tighter">注入存档 (IMPORT)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>

        <button
          onClick={handleResetData}
          className="w-full mt-6 py-4 flex items-center justify-center gap-2 border-4 border-black bg-white text-red-600 font-900 uppercase text-xs shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:bg-red-50"
        >
          <ShieldAlert size={16} />
          全数据格式化 (RESET ALL)
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;