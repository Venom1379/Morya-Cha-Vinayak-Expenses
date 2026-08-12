import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  FileJson
} from 'lucide-react';

export default function SettingsBackupModal({ isOpen, onClose, onExport, onImport, onReset }) {
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    setImportError('');
    setImportSuccess('');

    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setImportError('Please select a valid .json file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        onImport(parsed);
        setImportSuccess('Data backup restored successfully!');
      } catch (err) {
        setImportError(err.message || 'Invalid JSON backup file structure.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base sm:text-lg">Data Backup & Restore</h3>
              <p className="text-xs text-slate-400">Export or restore all tracker data in single JSON format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {importError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{importError}</p>
          </div>
        )}

        {importSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p>{importSuccess}</p>
          </div>
        )}

        {/* 1. Export Section */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Download className="w-4 h-4 text-amber-400" />
            Export Data Backup
          </h4>
          <p className="text-xs text-slate-400">
            Download all current members, payments, expenses, and settings as a JSON backup file.
          </p>
          <button
            onClick={onExport}
            className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <FileJson className="w-4 h-4" />
            Download JSON Backup File
          </button>
        </div>

        {/* 2. Import Section */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-sky-400" />
            Import / Restore JSON Backup
          </h4>
          <p className="text-xs text-slate-400">
            Upload a previously exported JSON backup file to restore tracker state.
          </p>
          <label className="w-full mt-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition">
            <Upload className="w-4 h-4 text-sky-400" />
            <span>Select JSON File to Restore</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* 3. Reset Section */}
        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
          <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" />
            Reset Data to Default Seed Data
          </h4>
          <p className="text-xs text-slate-400">
            Reset application data to initial sample Ganpati Utsav records.
          </p>
          {resetConfirmOpen ? (
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  onReset();
                  setResetConfirmOpen(false);
                  setImportSuccess('Data reset to default seed data successfully!');
                }}
                className="py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg"
              >
                Yes, Reset All Data
              </button>
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="py-1.5 px-3 bg-slate-800 text-slate-300 text-xs rounded-lg"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl cursor-pointer"
            >
              Reset to Sample Data
            </button>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-800 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-700 cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
