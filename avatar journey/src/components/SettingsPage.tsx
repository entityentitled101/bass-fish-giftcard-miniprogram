import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Download, Upload, ShieldAlert } from 'lucide-react';
import { ApiConfig } from '../types';
import { setApiConfig, getApiConfig } from '../services/apiService';
import { exportAllData, importData } from '../services/storageService';

interface SettingsPageProps {
  resetAllData: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ resetAllData }) => {
  const [apiConfig, setApiConfigState] = useState<ApiConfig>(getApiConfig());
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    setApiConfigState(getApiConfig());
  }, []);

  const handleSaveApiConfig = () => {
    setApiConfig(apiConfig);
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
              <option value="doubao">豆包 (Recommended)</option>
              <option value="claude">Claude API</option>
              <option value="zhipu">智谱 GLM</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label-small">API Access Key</label>
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-[10px] font-black uppercase underline opacity-40 hover:opacity-100"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiConfig.apiKey}
              onChange={(e) => setApiConfigState(prev => ({ ...prev, apiKey: e.target.value }))}
              className="input-brutalist"
              placeholder="输入密钥以激活系统"
            />
          </div>

          <button
            onClick={handleSaveApiConfig}
            className="btn-black py-4 text-xs tracking-widest"
          >
            更新核心配置 / UPDATE CONFIG
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