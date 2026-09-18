import React, { useState } from 'react';
import { X, Download, Upload, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { exportStudyData, importStudyData } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
  onResetDefaults: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
  onResetDefaults
}) => {
  const [importText, setImportText] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    const json = exportStudyData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studymate_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMsg({ type: 'success', text: 'Backup downloaded successfully!' });
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setStatusMsg({ type: 'error', text: 'Please paste valid JSON data.' });
      return;
    }

    const success = importStudyData(importText.trim());
    if (success) {
      setStatusMsg({ type: 'success', text: 'Study data restored successfully!' });
      setTimeout(() => {
        onDataRestored();
        onClose();
      }, 1000);
    } else {
      setStatusMsg({ type: 'error', text: 'Invalid JSON format. Please check your data.' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportText(content);
        const success = importStudyData(content);
        if (success) {
          setStatusMsg({ type: 'success', text: 'File imported and data restored!' });
          setTimeout(() => {
            onDataRestored();
            onClose();
          }, 1000);
        } else {
          setStatusMsg({ type: 'error', text: 'Could not parse JSON file.' });
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            💾 Local Data & Backup
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            All your subjects, subtopics, progress percentages, and study tasks are saved directly into your browser's persistent storage. You can download a backup copy or restore from an earlier backup anytime.
          </p>

          {/* Export button */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                Export Backup
              </span>
              <span className="text-xs text-slate-400">
                Download your study data as a JSON file
              </span>
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>

          {/* Import File */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">
              Import or Restore Backup
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          {/* Reset to defaults */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-400">Need to start fresh?</span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all subjects and tasks to default A/L syllabus? This will overwrite existing data.')) {
                  onResetDefaults();
                  onClose();
                }
              }}
              className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset to default subjects</span>
            </button>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
              }`}
            >
              {statusMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
