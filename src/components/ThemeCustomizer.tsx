import React, { useState, useEffect, useRef } from 'react';
import { 
  Palette, Check, RotateCcw, Copy, X, Sparkles, 
  CheckCircle2, ArrowRight, Sliders
} from 'lucide-react';
import { 
  THEME_COLOR_PRESETS, 
  DEFAULT_THEME_COLOR, 
  applyThemeColor, 
  getSavedThemeColor, 
  resetThemeColor, 
  sanitizeHex,
  adjustBrightness,
  getContrastingTextColor
} from '../utils/theme';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeColor: string;
  onThemeColorChange: (newHex: string) => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  isOpen,
  onClose,
  currentThemeColor,
  onThemeColorChange
}) => {
  const [customHexInput, setCustomHexInput] = useState<string>(currentThemeColor);
  const [copiedHex, setCopiedHex] = useState<boolean>(false);
  const [hexError, setHexError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync internal state with external color
  useEffect(() => {
    setCustomHexInput(currentThemeColor);
  }, [currentThemeColor]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectPreset = (hex: string) => {
    setHexError(null);
    setCustomHexInput(hex);
    applyThemeColor(hex, true);
    onThemeColorChange(hex);
  };

  const handleCustomPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setHexError(null);
    setCustomHexInput(newHex);
    applyThemeColor(newHex, true);
    onThemeColorChange(newHex);
  };

  const handleCustomTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomHexInput(val);
    const valid = sanitizeHex(val);
    if (valid) {
      setHexError(null);
      applyThemeColor(valid, true);
      onThemeColorChange(valid);
    }
  };

  const handleCustomTextBlur = () => {
    const valid = sanitizeHex(customHexInput);
    if (!valid) {
      setHexError('Please enter a valid hex color code (e.g. #2563EB)');
      setCustomHexInput(currentThemeColor);
    } else {
      setHexError(null);
      setCustomHexInput(valid);
    }
  };

  const handleReset = () => {
    setHexError(null);
    const defaultHex = resetThemeColor();
    setCustomHexInput(defaultHex);
    onThemeColorChange(defaultHex);
  };

  const handleCopyHex = () => {
    navigator.clipboard.writeText(currentThemeColor).then(() => {
      setCopiedHex(true);
      setTimeout(() => setCopiedHex(false), 1800);
    });
  };

  const isPresetActive = (hex: string) => {
    return currentThemeColor.toLowerCase() === hex.toLowerCase();
  };

  const activePreset = THEME_COLOR_PRESETS.find(p => p.hex.toLowerCase() === currentThemeColor.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Customizer Card */}
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-modal-title"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in-up z-10 my-auto"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs text-white"
              style={{ backgroundColor: currentThemeColor }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 id="theme-modal-title" className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Theme Color Customizer
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dynamic accent color • Instant CSS variable preview
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close theme customizer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
          
          {/* 1. Live Interactive UI Preview Strip */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" style={{ color: currentThemeColor }} />
                Instant Live Preview
              </span>
              <span className="font-mono text-[11px] font-bold" style={{ color: currentThemeColor }}>
                {activePreset ? activePreset.name : 'Custom Color'} ({currentThemeColor.toUpperCase()})
              </span>
            </div>

            {/* Preview Component Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Primary Action Button Preview */}
              <div 
                className="px-3 py-2 rounded-xl text-center text-xs font-bold shadow-xs select-none cursor-default transition-all"
                style={{ 
                  backgroundColor: currentThemeColor,
                  color: getContrastingTextColor(currentThemeColor)
                }}
              >
                Primary Button
              </div>

              {/* Tinted Badge Preview */}
              <div 
                className="px-3 py-2 rounded-xl text-center text-xs font-semibold select-none cursor-default border transition-all flex items-center justify-center gap-1"
                style={{ 
                  backgroundColor: `rgba(${adjustBrightness(currentThemeColor, 0)}, 0.1)`,
                  color: currentThemeColor,
                  borderColor: `rgba(${adjustBrightness(currentThemeColor, 0)}, 0.25)`
                }}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Active Badge</span>
              </div>

              {/* Mini Progress Bar Preview */}
              <div className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-center">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>Mastery</span>
                  <span style={{ color: currentThemeColor }}>82%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300" 
                    style={{ width: '82%', backgroundColor: currentThemeColor }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Preset Color Swatches */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Preset Color Swatches
              </span>
              <span className="text-[11px] text-slate-400">
                10 Curated Palettes
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {THEME_COLOR_PRESETS.map((preset) => {
                const active = isPresetActive(preset.hex);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.hex)}
                    title={`${preset.name} (${preset.hex})`}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-center sm:items-start group ${
                      active
                        ? 'border-slate-900 dark:border-white bg-slate-100/80 dark:bg-slate-800 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center shadow-xs transition-transform group-hover:scale-110"
                        style={{ backgroundColor: preset.hex }}
                      >
                        {active && (
                          <Check className="w-3.5 h-3.5" style={{ color: getContrastingTextColor(preset.hex) }} />
                        )}
                      </div>
                      {active && (
                        <span className="text-[10px] font-bold text-slate-900 dark:text-white hidden sm:inline">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate w-full text-center sm:text-left">
                      {preset.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 truncate w-full text-center sm:text-left">
                      {preset.hex.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Custom Color Picker & Hex Input */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Custom Color Picker
              </span>
              <span className="text-[11px] text-slate-400">
                Any 16.7M Hex Color
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Native Color Picker Swatch Button */}
              <div className="relative flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <label 
                  htmlFor="custom-theme-color-picker" 
                  className="relative w-10 h-10 rounded-xl cursor-pointer overflow-hidden shadow-xs border border-black/10 shrink-0 flex items-center justify-center transition-transform hover:scale-105"
                  style={{ backgroundColor: currentThemeColor }}
                  title="Click to open color picker"
                >
                  <input
                    id="custom-theme-color-picker"
                    type="color"
                    value={currentThemeColor}
                    onChange={handleCustomPickerChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Sliders className="w-4 h-4" style={{ color: getContrastingTextColor(currentThemeColor) }} />
                </label>
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                    Pick Spectrum
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Click swatch for color wheel
                  </span>
                </div>
              </div>

              {/* Hex Text Input */}
              <div className="flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customHexInput}
                    onChange={handleCustomTextChange}
                    onBlur={handleCustomTextBlur}
                    placeholder="#2563EB"
                    maxLength={7}
                    className="w-full text-xs font-mono font-bold py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                {/* Copy Hex Button */}
                <button
                  type="button"
                  onClick={handleCopyHex}
                  title="Copy Hex Code"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
                >
                  {copiedHex ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {hexError && (
              <p className="text-xs text-rose-500 font-medium">
                {hexError}
              </p>
            )}
          </div>

          {/* 4. LocalStorage Persistence Notice */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              Saved automatically to browser local storage
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Survives reloads
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            style={{ 
              backgroundColor: currentThemeColor,
              color: getContrastingTextColor(currentThemeColor)
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
