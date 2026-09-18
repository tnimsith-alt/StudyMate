import React, { useState, useRef, useMemo } from 'react';
import { 
  FolderOpen, Upload, FileText, Image as ImageIcon, File, 
  Trash2, Download, Eye, Plus, Search, Tag, Check, 
  AlertCircle, X, Copy, BookOpen, ArrowLeft
} from 'lucide-react';
import { Subject, SubjectFile } from '../types';

interface SubjectFilesViewProps {
  subjects: Subject[];
  files: SubjectFile[];
  onAddFile: (file: Omit<SubjectFile, 'id' | 'uploadedAt'>) => void;
  onDeleteFile: (fileId: string) => void;
  onBackToSyllabus?: () => void;
}

export function SubjectFilesView({
  subjects,
  files,
  onAddFile,
  onDeleteFile,
  onBackToSyllabus
}: SubjectFilesViewProps) {
  // Filters & State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals & Forms
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [previewFile, setPreviewFile] = useState<SubjectFile | null>(null);
  const [copiedNote, setCopiedNote] = useState<boolean>(false);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload Form State
  const [uploadSubjectId, setUploadSubjectId] = useState<string>(subjects[0]?.id || '');
  const [uploadCategory, setUploadCategory] = useState<SubjectFile['category']>('past_paper');
  const [uploadTags, setUploadTags] = useState<string>('');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [selectedRawFile, setSelectedRawFile] = useState<File | null>(null);

  // Note Form State
  const [noteSubjectId, setNoteSubjectId] = useState<string>(subjects[0]?.id || '');
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteCategory, setNoteCategory] = useState<SubjectFile['category']>('short_notes');
  const [noteContent, setNoteContent] = useState<string>('');
  const [noteTags, setNoteTags] = useState<string>('');

  // Format bytes to KB / MB
  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Process File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedRawFile(e.target.files[0]);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedRawFile(e.dataTransfer.files[0]);
      setIsUploadModalOpen(true);
    }
  };

  // Submit Uploaded File
  const handleSaveUploadedFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRawFile || !uploadSubjectId) return;

    // Check size limit for client storage (5MB soft max)
    if (selectedRawFile.size > 5 * 1024 * 1024) {
      alert("Please choose a file smaller than 5MB for browser local storage.");
      return;
    }

    const reader = new FileReader();

    const isText = selectedRawFile.type.includes('text') || selectedRawFile.name.endsWith('.txt') || selectedRawFile.name.endsWith('.md');

    if (isText) {
      reader.onload = () => {
        const textContent = reader.result as string;
        onAddFile({
          subjectId: uploadSubjectId,
          name: selectedRawFile.name,
          size: selectedRawFile.size,
          type: selectedRawFile.type || 'text/plain',
          category: uploadCategory,
          textContent: textContent,
          tags: uploadTags.split(',').map(t => t.trim()).filter(Boolean),
          description: uploadDescription.trim() || undefined
        });
        resetUploadForm();
      };
      reader.readAsText(selectedRawFile);
    } else {
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onAddFile({
          subjectId: uploadSubjectId,
          name: selectedRawFile.name,
          size: selectedRawFile.size,
          type: selectedRawFile.type || 'application/octet-stream',
          category: uploadCategory,
          dataUrl: dataUrl,
          tags: uploadTags.split(',').map(t => t.trim()).filter(Boolean),
          description: uploadDescription.trim() || undefined
        });
        resetUploadForm();
      };
      reader.readAsDataURL(selectedRawFile);
    }
  };

  // Submit Text Note
  const handleSaveQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim() || !noteSubjectId) return;

    const fileName = noteTitle.endsWith('.txt') || noteTitle.endsWith('.md') 
      ? noteTitle.trim() 
      : `${noteTitle.trim()}.txt`;

    onAddFile({
      subjectId: noteSubjectId,
      name: fileName,
      size: new Blob([noteContent]).size,
      type: 'text/plain',
      category: noteCategory,
      textContent: noteContent,
      tags: noteTags.split(',').map(t => t.trim()).filter(Boolean),
      description: 'Quick study note / formulas summary.'
    });

    setIsNoteModalOpen(false);
    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
  };

  const resetUploadForm = () => {
    setIsUploadModalOpen(false);
    setSelectedRawFile(null);
    setUploadTags('');
    setUploadDescription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download a file
  const handleDownloadFile = (f: SubjectFile) => {
    if (f.dataUrl) {
      const a = document.createElement('a');
      a.href = f.dataUrl;
      a.download = f.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (f.textContent) {
      const blob = new Blob([f.textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = f.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Filtered files list
  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      if (selectedSubjectId !== 'all' && f.subjectId !== selectedSubjectId) return false;
      if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesDesc = f.description?.toLowerCase().includes(q);
        const matchesTags = f.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesTags) return false;
      }
      return true;
    }).sort((a, b) => b.uploadedAt - a.uploadedAt);
  }, [files, selectedSubjectId, selectedCategory, searchQuery]);

  // Category label & color helper
  const getCategoryBadge = (cat: SubjectFile['category']) => {
    switch (cat) {
      case 'past_paper':
        return { label: 'Past Paper', color: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' };
      case 'short_notes':
        return { label: 'Short Notes', color: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' };
      case 'marking_scheme':
        return { label: 'Marking Scheme', color: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' };
      case 'formula_sheet':
        return { label: 'Formula Sheet', color: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' };
      case 'assignment':
        return { label: 'Assignment / Tute', color: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' };
      default:
        return { label: 'Document', color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' };
    }
  };

  // File Icon Helper
  const getFileIcon = (file: SubjectFile) => {
    if (file.type.includes('image')) {
      return <ImageIcon className="w-5 h-5 text-emerald-500" />;
    }
    if (file.textContent || file.type.includes('text')) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    return <File className="w-5 h-5 text-indigo-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Optional Top Back Breadcrumb when opened individually */}
      {onBackToSyllabus && (
        <div className="flex items-center justify-between pb-1">
          <button
            type="button"
            onClick={onBackToSyllabus}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Subjects & Syllabus</span>
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <FolderOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Subject Files & Study Materials
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Upload and organize your past papers, marking schemes, formulas, and short notes per subject.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setNoteSubjectId(selectedSubjectId !== 'all' ? selectedSubjectId : (subjects[0]?.id || ''));
              setIsNoteModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Create Note</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setUploadSubjectId(selectedSubjectId !== 'all' ? selectedSubjectId : (subjects[0]?.id || ''));
              setIsUploadModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Quick Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          setUploadSubjectId(selectedSubjectId !== 'all' ? selectedSubjectId : (subjects[0]?.id || ''));
          fileInputRef.current?.click();
        }}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 scale-[1.01]'
            : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850/60'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            handleFileChange(e);
            if (e.target.files && e.target.files[0]) {
              setIsUploadModalOpen(true);
            }
          }}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Drag & drop files here, or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
            </span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Supports past paper PDFs, images, notes, formula sheets & summaries (up to 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        {/* Top Controls: Subject Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setSelectedSubjectId('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 ${
                selectedSubjectId === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Subjects ({files.length})
            </button>
            {subjects.map(s => {
              const count = files.filter(f => f.subjectId === s.id).length;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    selectedSubjectId === s.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{s.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search files or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Category:</span>
          {[
            { id: 'all', label: 'All Files' },
            { id: 'past_paper', label: 'Past Papers' },
            { id: 'short_notes', label: 'Short Notes' },
            { id: 'marking_scheme', label: 'Marking Schemes' },
            { id: 'formula_sheet', label: 'Formula Sheets' },
            { id: 'assignment', label: 'Assignments' }
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map(file => {
          const subj = subjects.find(s => s.id === file.subjectId);
          const catInfo = getCategoryBadge(file.category);
          return (
            <div
              key={file.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-3 transition-all group"
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catInfo.color}`}>
                    {catInfo.label}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                    {subj?.name || 'Subject'}
                  </span>
                </div>

                {/* File Name & Icon */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                    {getFileIcon(file)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 
                      onClick={() => setPreviewFile(file)}
                      className="text-sm font-bold text-slate-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                      title={file.name}
                    >
                      {file.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Description / snippet */}
                {file.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {file.description}
                  </p>
                )}

                {/* Tags */}
                {file.tags && file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {file.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewFile(file)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDownloadFile(file)}
                    title="Download File"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete "${file.name}"?`)) {
                        onDeleteFile(file.id);
                      }
                    }}
                    title="Delete File"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFiles.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No files found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Upload past papers, formula sheets, or type a quick note for your selected subjects to keep all materials in one place.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Upload First File
            </button>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Upload Study File
              </h3>
              <button
                type="button"
                onClick={resetUploadForm}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUploadedFile} className="space-y-4">
              {/* File Selection Box */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Selected File *
                </label>
                {selectedRawFile ? (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <File className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{selectedRawFile.name}</span>
                      <span className="text-[10px] text-slate-400">({formatFileSize(selectedRawFile.size)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedRawFile(null)}
                      className="text-xs text-rose-500 hover:underline font-semibold"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300 cursor-pointer"
                    required
                  />
                )}
              </div>

              {/* Subject & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subject *
                  </label>
                  <select
                    value={uploadSubjectId}
                    onChange={(e) => setUploadSubjectId(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 outline-none"
                    required
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="past_paper">Past Paper</option>
                    <option value="short_notes">Short Notes</option>
                    <option value="marking_scheme">Marking Scheme</option>
                    <option value="formula_sheet">Formula Sheet</option>
                    <option value="assignment">Assignment / Tute</option>
                    <option value="other">Other Document</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2024 Past Paper, Mechanics, Essay"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Description / Remarks (Optional)
                </label>
                <textarea
                  placeholder="Short note about what this file covers..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={2}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={resetUploadForm}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedRawFile}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Upload & Save
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Quick Note Creator Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Create Quick Study Note / Formulas
              </h3>
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickNote} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physics - Doppler Effect Key Formulas"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subject *
                  </label>
                  <select
                    value={noteSubjectId}
                    onChange={(e) => setNoteSubjectId(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 outline-none"
                    required
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="short_notes">Short Notes</option>
                    <option value="formula_sheet">Formula Sheet</option>
                    <option value="past_paper">Past Paper Summary</option>
                    <option value="marking_scheme">Marking Scheme</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Note Content (Markdown or Plain Text) *
                </label>
                <textarea
                  placeholder="Type or paste your formulas, definitions, reaction steps..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={6}
                  className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 outline-none resize-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Waves, Sound, Doppler"
                  value={noteTags}
                  onChange={(e) => setNoteTags(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                {getFileIcon(previewFile)}
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {previewFile.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadFile(previewFile)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Preview */}
            <div className="flex-1 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-750">
              {previewFile.textContent ? (
                <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {previewFile.textContent}
                </pre>
              ) : previewFile.dataUrl && previewFile.type.includes('image') ? (
                <div className="flex items-center justify-center">
                  <img
                    src={previewFile.dataUrl}
                    alt={previewFile.name}
                    className="max-h-[60vh] object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="text-center py-10 space-y-3">
                  <File className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Binary document preview. You can download this file directly to your device.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDownloadFile(previewFile)}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Download ({formatFileSize(previewFile.size)})
                  </button>
                </div>
              )}
            </div>

            {/* Footer / Copy */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400">
                Uploaded on {new Date(previewFile.uploadedAt).toLocaleDateString()} • {formatFileSize(previewFile.size)}
              </span>

              {previewFile.textContent && (
                <button
                  type="button"
                  onClick={() => {
                    if (previewFile.textContent) {
                      navigator.clipboard.writeText(previewFile.textContent);
                      setCopiedNote(true);
                      setTimeout(() => setCopiedNote(false), 1500);
                    }
                  }}
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNote ? 'Copied!' : 'Copy Text'}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
