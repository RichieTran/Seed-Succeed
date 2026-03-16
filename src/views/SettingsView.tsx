import { useState } from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '../context/HabitContext';
import type { UserSettings } from '../types';
import * as api from '../utils/api';

export function SettingsView() {
  const { settings, updateSettings, resetData } = useHabits();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      const state = await api.fetchFullState();
      const data = JSON.stringify(state, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seed-succeed-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setImportStatus('Export failed');
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          setImportStatus('Import not yet supported with SQLite backend');
          setTimeout(() => setImportStatus(null), 3000);
        } catch {
          setImportStatus('Invalid file format');
          setTimeout(() => setImportStatus(null), 3000);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    resetData();
    setShowResetConfirm(false);
  };

  const themes: { value: UserSettings['theme']; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ];

  return (
    <div className="flex-1 bg-gray-50/50">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-800">Settings</h2>

        {/* Theme */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Theme</h3>
          <div className="flex gap-2">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => updateSettings({ theme: t.value })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                  settings.theme === t.value
                    ? 'bg-green-100 text-green-700 ring-1 ring-green-300'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data management */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Data</h3>

          <button
            onClick={handleExport}
            className="w-full py-2.5 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium text-left flex items-center gap-2 transition-colors"
          >
            <span>📤</span> Export Data
          </button>

          <button
            onClick={handleImport}
            className="w-full py-2.5 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium text-left flex items-center gap-2 transition-colors"
          >
            <span>📥</span> Import Data
          </button>

          {importStatus && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-green-600 px-1"
            >
              {importStatus}
            </motion.p>
          )}

          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2.5 px-4 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium text-left flex items-center gap-2 transition-colors"
          >
            <span>🗑️</span> Reset All Data
          </button>
        </div>

        {/* About */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">About</h3>
          <p className="text-sm text-gray-500">
            Seed & Succeed is a habit tracker where each habit grows its own plant.
            Build consistency, watch your garden flourish, and maintain streaks for
            bonus growth!
          </p>
          <p className="text-xs text-gray-300 mt-3">Version 1.0.0 — SQLite Backend</p>
        </div>
      </div>

      {/* Reset confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-7 mx-4 max-w-sm w-full"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-3">Reset all data?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete all your habits, plants, and progress. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium"
              >
                Reset Everything
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
