import React, { useState, useEffect, useRef } from 'react';
import { 
  Palette, Check, RotateCcw, Copy, X, Sparkles, 
  CheckCircle2, Sliders, Layout, Sun, Moon
} from 'lucide-react';
import { 
  THEME_COLOR_PRESETS, 
  THEME_BACKGROUND_PRESETS,
  DEFAULT_THEME_COLOR, 
  applyThemeColor, 
  applyBackgroundColor,
  resetThemeColor,
  resetBackgroundColor,
  sanitizeHex,
  adjustBrightness,
  getContrastingTextColor,
  isColorDark
} from '../utils/theme';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeColor: string;
  onThemeColorChange: (newHex: string) => void;
  currentBgColor: string | null;
  onBgColorChange: (newBgHex: string | null) => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  isOpen,
  onClose,
  currentThemeColor,
  onThemeColorChange,
  currentBgColor,
  onBgColorChange
}) => {
  // Active sub-tab: 'accent' | 'background'
  const [activeTab, setActiveTab] = useState<'accent' | 'background'>('accent');

  // Accent state
  const [customHexInput, setCustomHexInput] = useState<string>(currentThemeColor);
  const [copiedHex, setCopiedHex] = useState<boolean>(false);
  const [hexError, setHexError] = useState<string | null>(null);

  // Background state
  const [customBgInput, setCustomBgInput] = useState<string>(currentBgColor || '#f8fafc');
  const [copiedBgHex, setCopiedBgHex] = useState<boolean>(false);
  const [bgHexError, setBgHexError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Sync internal state with external color props
  useEffect(() => {
    setCustomHexInput(currentThemeColor);
  }, [currentThemeColor]);

  useEffect(() => {
    if (currentBgColor) {
      setCustomBgInput(currentBgColor);
    }
  }, [currentBgColor]);

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

  // EARLY RETURN MUST BE AFTER ALL HOOKS
  if (!isOpen) return null;

  // --- Accent handlers ---
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

  const handleResetAccent = () => {
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

  // --- Background handlers ---
  const handleSelectBgPreset = (hex: string) => {
    setBgHexError(null);
    setCustomBgInput(hex);
    applyBackgroundColor(hex, true);
    onBgColorChange(hex);
  };

  const handleCustomBgPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setBgHexError(null);
    setCustomBgInput(newHex);
    applyBackgroundColor(newHex, true);
    onBgColorChange(newHex);
  };

  const handleCustomBgTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomBgInput(val);
    const valid = sanitizeHex(val);
    if (valid) {
      setBgHexError(null);
      applyBackgroundColor(valid, true);
      onBgColorChange(valid);
    }
  };

  const handleCustomBgTextBlur = () => {
    const valid = sanitizeHex(customBgInput);
    if (!valid) {
      setBgHexError('Please enter a valid hex background color (e.g. #F8FAFC)');
      if (currentBgColor) setCustomBgInput(currentBgColor);
    } else {
      setBgHexError(null);
      setCustomBgInput(valid);
    }
  };

  const handleResetBackground = () => {
    setBgHexError(null);
    resetBackgroundColor();
    setCustomBgInput('#f8fafc');
    onBgColorChange(null);
  };

  const handleCopyBgHex = () => {
    const toCopy = currentBgColor || customBgInput;
    navigator.clipboard.writeText(toCopy).then(() => {
      setCopiedBgHex(true);
      setTimeout(() => setCopiedBgHex(false), 1800);
    });
  };

  const handleResetAll = () => {
    handleResetAccent();
    handleResetBackground();
  };

  const isPresetActive = (hex: string) => {
    return currentThemeColor.toLowerCase() === hex.toLowerCase();
  };

  const isBgPresetActive = (hex: string) => {
    if (!currentBgColor) return false;
    return currentBgColor.toLowerCase() === hex.toLowerCase();
  };

  const activePreset = THEME_COLOR_PRESETS.find(p => p.hex.toLowerCase() === currentThemeColor.toLowerCase());
  const activeBgPreset = currentBgColor ? THEME_BACKGROUND_PRESETS.find(p => p.hex.toLowerCase() === currentBgColor.toLowerCase()) : null;

  // Effective preview background:
  const effectivePreviewBg = currentBgColor || (document.documentElement.classList.contains('dark') ? '#020617' : '#f8fafc');
  const isEffectiveBgDark = isColorDark(effectivePreviewBg);

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
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs text-white transition-colors"
              style={{ backgroundColor: currentThemeColor }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 id="theme-modal-title" className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Theme Color Customizer
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Accent buttons & background canvas customization
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

        {/* Tab Switcher: Accent Color vs Background Color */}
        <div className="px-5 sm:px-6 pt-3 pb-0">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('accent')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'accent'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Palette className="w-4 h-4" style={{ color: currentThemeColor }} />
              <span>Primary Accent</span>
              <span 
                className="w-2 h-2 rounded-full border border-black/10" 
                style={{ backgroundColor: currentThemeColor }} 
              />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('background')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'background'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Layout className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Background Canvas</span>
              <span 
                className="w-2 h-2 rounded-full border border-black/10" 
                style={{ backgroundColor: effectivePreviewBg }} 
              />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar">
          
          {/* 1. Live Interactive UI Preview Strip (Adapts to BOTH chosen accent & background) */}
          <div 
            className="p-4 rounded-2xl border transition-all duration-200 space-y-3"
            style={{ 
              backgroundColor: effectivePreviewBg,
              borderColor: isEffectiveBgDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
            }}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5" style={{ color: isEffectiveBgDark ? '#f8fafc' : '#0f172a' }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: currentThemeColor }} />
                <span>Live Workspace Preview</span>
              </span>
              <div className="flex items-center gap-2">
                <span 
                  className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border"
                  style={{ 
                    backgroundColor: isEffectiveBgDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    color: isEffectiveBgDark ? '#e2e8f0' : '#475569',
                    borderColor: isEffectiveBgDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'
                  }}
                >
                  {isEffectiveBgDark ? 'Dark Surface' : 'Light Surface'}
                </span>
              </div>
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
                  backgroundColor: `rgba(${adjustBrightness(currentThemeColor, 0)}, 0.12)`,
                  color: currentThemeColor,
                  borderColor: `rgba(${adjustBrightness(currentThemeColor, 0)}, 0.3)`
                }}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Active Badge</span>
              </div>

              {/* Mini Card Preview */}
              <div 
                className="col-span-2 sm:col-span-1 p-2 rounded-xl border flex flex-col justify-center"
                style={{
                  backgroundColor: isEffectiveBgDark ? 'rgba(255,255,255,0.07)' : '#ffffff',
                  borderColor: isEffectiveBgDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'
                }}
              >
                <div className="flex justify-between text-[10px] font-bold mb-1" style={{ color: isEffectiveBgDark ? '#94a3b8' : '#64748b' }}>
                  <span>Study Goal</span>
                  <span style={{ color: currentThemeColor }}>85%</span>
                </div>
                <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300" 
                    style={{ width: '85%', backgroundColor: currentThemeColor }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: ACCENT COLOR CUSTOMIZER */}
          {activeTab === 'accent' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Preset Color Swatches */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Preset Accent Swatches
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {activePreset ? activePreset.name : 'Custom Hex'}
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
                            ? 'border-slate-900 dark:border-white bg-slate-100/80 dark:bg-slate-800 shadow-xs'
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

              {/* Custom Color Picker & Hex Input */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Custom Accent Spectrum
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Any 16.7M Color
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Native Color Picker Swatch Button */}
                  <div className="relative flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <label 
                      htmlFor="custom-theme-color-picker" 
                      className="relative w-10 h-10 rounded-xl cursor-pointer overflow-hidden shadow-xs border border-black/10 shrink-0 flex items-center justify-center transition-transform hover:scale-105"
                      style={{ backgroundColor: currentThemeColor }}
                      title="Click to open accent color spectrum"
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
                        Color Spectrum
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Tap swatch for palette wheel
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
            </div>
          )}

          {/* TAB 2: BACKGROUND CANVAS CUSTOMIZER */}
          {activeTab === 'background' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Presets: Light & Dark Canvases */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    Study Canvas Presets
                  </span>
                  {currentBgColor ? (
                    <button
                      type="button"
                      onClick={handleResetBackground}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Reset to Default
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> System Default
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {THEME_BACKGROUND_PRESETS.map((preset) => {
                    const active = isBgPresetActive(preset.hex);
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectBgPreset(preset.hex)}
                        title={`${preset.name} - ${preset.description}`}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-center sm:items-start group ${
                          active
                            ? 'border-slate-900 dark:border-white bg-slate-100/90 dark:bg-slate-800 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center border shadow-xs transition-transform group-hover:scale-110"
                            style={{ 
                              backgroundColor: preset.hex,
                              borderColor: preset.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'
                            }}
                          >
                            {active && (
                              <Check className="w-3.5 h-3.5" style={{ color: preset.isDark ? '#ffffff' : '#0f172a' }} />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {preset.isDark ? '🌙' : '☀️'}
                          </span>
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

              {/* Custom Background Spectrum Picker */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Custom Background Spectrum
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Any Canvas Shade
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Native Color Picker Swatch Button */}
                  <div className="relative flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <label 
                      htmlFor="custom-bg-color-picker" 
                      className="relative w-10 h-10 rounded-xl cursor-pointer overflow-hidden shadow-xs border border-black/15 shrink-0 flex items-center justify-center transition-transform hover:scale-105"
                      style={{ backgroundColor: customBgInput }}
                      title="Click to open background spectrum"
                    >
                      <input
                        id="custom-bg-color-picker"
                        type="color"
                        value={customBgInput.length === 7 ? customBgInput : '#f8fafc'}
                        onChange={handleCustomBgPickerChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Sliders className="w-4 h-4" style={{ color: getContrastingTextColor(customBgInput) }} />
                    </label>
                    <div className="min-w-0 pr-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                        Canvas Spectrum
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Tap swatch for color wheel
                      </span>
                    </div>
                  </div>

                  {/* Hex Text Input */}
                  <div className="flex-1 flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={customBgInput}
                        onChange={handleCustomBgTextChange}
                        onBlur={handleCustomBgTextBlur}
                        placeholder="#F8FAFC"
                        maxLength={7}
                        className="w-full text-xs font-mono font-bold py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyBgHex}
                      title="Copy Background Hex"
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedBgHex ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {bgHexError && (
                  <p className="text-xs text-rose-500 font-medium">
                    {bgHexError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* LocalStorage Persistence Notice */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              Applied instantly and saved to your device
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Auto-saved
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition-opacity hover:opacity-90 cursor-pointer"
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
