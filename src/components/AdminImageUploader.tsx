import React, { useState, useRef, useEffect } from 'react';
import { Upload, Link2, Image as ImageIcon, X, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

export const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

export interface AdminImageUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  presets?: string[];
  placeholder?: string;
  helperText?: string;
}

export const AdminImageUploader: React.FC<AdminImageUploaderProps> = ({
  label = 'URL Gambar Utama',
  value,
  onChange,
  presets = ['/acer-nitro.png', '/acer-creator.png', '/powerpac.png', '/acer-portable.png'],
  placeholder = 'https://example.com/product-image.jpg atau /acer-nitro.png',
  helperText,
}) => {
  // Determine initial mode: if value starts with data: or /uploads/, prefer 'upload', otherwise 'url' if already a web url
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>(
    value && !value.startsWith('data:') && !value.startsWith('/uploads/') ? 'url' : 'upload'
  );
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [metaInfo, setMetaInfo] = useState<{
    filename?: string;
    format?: string;
    dimensions?: string;
    size?: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Extract metadata whenever value or preview changes
  const deriveMetaFromUrl = (url: string) => {
    if (!url) return {};
    let filename = 'Image';
    let format = 'IMAGE';

    if (url.startsWith('data:')) {
      const mimeMatch = url.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
      if (mimeMatch) {
        const mime = mimeMatch[1];
        if (mime === 'image/jpeg') format = 'JPEG';
        else if (mime === 'image/png') format = 'PNG';
        else if (mime === 'image/webp') format = 'WEBP';
        else if (mime === 'image/gif') format = 'GIF';
        else if (mime === 'image/svg+xml') format = 'SVG';
      }
      filename = `uploaded-file.${format.toLowerCase()}`;
    } else {
      try {
        const cleanUrl = url.split('?')[0].split('#')[0];
        const parts = cleanUrl.split('/');
        const rawName = parts[parts.length - 1] || 'image';
        filename = decodeURIComponent(rawName);

        const ext = '.' + filename.split('.').pop()?.toLowerCase();
        if (ext === '.jpg' || ext === '.jpeg') format = 'JPEG';
        else if (ext === '.png') format = 'PNG';
        else if (ext === '.webp') format = 'WEBP';
        else if (ext === '.gif') format = 'GIF';
        else if (ext === '.svg') format = 'SVG';
      } catch {
        filename = 'image';
      }
    }

    return { filename, format };
  };

  useEffect(() => {
    if (value) {
      const derived = deriveMetaFromUrl(value);
      setMetaInfo((prev) => ({
        ...prev,
        filename: prev.filename || derived.filename,
        format: prev.format || derived.format,
      }));
    } else {
      setMetaInfo({});
      setErrorMessage(null);
    }
  }, [value]);

  const validateFile = async (file: File): Promise<{ valid: boolean; error?: string; format?: string }> => {
    const fileName = file.name.toLowerCase();
    const ext = '.' + fileName.split('.').pop();
    const mimeType = file.type.toLowerCase();

    const isExtValid = SUPPORTED_EXTENSIONS.includes(ext);
    const isMimeValid = SUPPORTED_MIME_TYPES.includes(mimeType);

    if (!isExtValid && !isMimeValid) {
      return {
        valid: false,
        error: 'Unsupported image format. Please upload JPG, JPEG, PNG, WEBP, GIF, or SVG.',
      };
    }

    // Max 10MB limit
    const MAX_SIZE_MB = 10;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return {
        valid: false,
        error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is ${MAX_SIZE_MB}MB.`,
      };
    }

    // SVG Security check
    if (mimeType === 'image/svg+xml' || ext === '.svg') {
      try {
        const text = await file.text();
        if (/<script|javascript:|onload=|onerror=/i.test(text)) {
          return {
            valid: false,
            error: 'Security warning: SVG contains unsafe scripts or event handlers.',
          };
        }
      } catch {
        return { valid: false, error: 'Could not read SVG file safely.' };
      }
    }

    let format = 'IMAGE';
    if (ext === '.jpg' || ext === '.jpeg' || mimeType === 'image/jpeg') format = 'JPEG';
    else if (ext === '.png' || mimeType === 'image/png') format = 'PNG';
    else if (ext === '.webp' || mimeType === 'image/webp') format = 'WEBP';
    else if (ext === '.gif' || mimeType === 'image/gif') format = 'GIF';
    else if (ext === '.svg' || mimeType === 'image/svg+xml') format = 'SVG';

    return { valid: true, format };
  };

  const handleFileProcess = async (file: File) => {
    setErrorMessage(null);
    const validation = await validateFile(file);

    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file format.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const format = validation.format || 'IMAGE';
    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onerror = () => {
      setErrorMessage('Failed to read file from computer.');
      setIsUploading(false);
    };

    reader.onload = async () => {
      const dataUrl = reader.result as string;

      // Update meta immediately
      setMetaInfo({
        filename: file.name,
        format,
        size: sizeFormatted,
      });

      // Provide immediate preview to parent
      onChange(dataUrl);

      // Attempt server-side upload to create persistent /uploads/... path
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            fileData: dataUrl,
            mimeType: file.type || 'image/jpeg',
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.url) {
            onChange(json.url);
            setMetaInfo((prev) => ({
              ...prev,
              filename: json.filename || file.name,
            }));
          }
        }
      } catch (uploadErr) {
        console.warn('Backend upload skipped, preserved data URL:', uploadErr);
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    onChange('');
    setMetaInfo({});
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleChangeImage = () => {
    if (activeTab === 'upload') {
      fileInputRef.current?.click();
    } else {
      urlInputRef.current?.focus();
      urlInputRef.current?.select();
    }
  };

  return (
    <div className="space-y-3">
      {/* Label and Mode Toggle Tabs */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="block font-bold text-neutral-700 text-sm">
          {label}
        </label>

        {/* Tab Buttons */}
        <div className="flex items-center bg-[#F0EFEA] p-1 rounded-xl border border-[#E9E9E6]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setErrorMessage(null);
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('url');
              setErrorMessage(null);
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'url'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Use Image URL</span>
          </button>
        </div>
      </div>

      {/* Mode 1: UPLOAD IMAGE */}
      {activeTab === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {!value ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                isDragging
                  ? 'border-[#FF6B00] bg-orange-50/60 scale-[1.01]'
                  : 'border-[#E9E9E6] hover:border-[#FF6B00] bg-[#F7F6F2] hover:bg-orange-50/20'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E9E9E6] shadow-xs flex items-center justify-center text-neutral-600 group-hover:text-[#FF6B00]">
                {isUploading ? (
                  <RefreshCw className="w-6 h-6 text-[#FF6B00] animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 text-[#FF6B00]" />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-neutral-800">
                  {isDragging ? 'Drop file gambar di sini' : 'Klik untuk Upload atau Drag & Drop'}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Mendukung format: <span className="font-semibold text-neutral-700">JPG, JPEG, PNG, WEBP, GIF, SVG</span> (Maks. 10MB)
                </p>
              </div>

              <button
                type="button"
                className="mt-1 px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold rounded-xl border border-[#E9E9E6] shadow-xs cursor-pointer pointer-events-none"
              >
                Pilih Gambar Komputer
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Gambar tersimpan. Anda dapat mengganti atau menghapusnya pada preview di bawah.</span>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: IMAGE URL */}
      {activeTab === 'url' && (
        <div className="space-y-2">
          <div className="relative flex items-center">
            <input
              ref={urlInputRef}
              type="text"
              value={value || ''}
              onChange={(e) => {
                setErrorMessage(null);
                onChange(e.target.value);
              }}
              placeholder={placeholder}
              className="w-full p-2.5 pr-10 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-mono text-sm text-neutral-800 focus:outline-none focus:border-[#FF6B00] transition-colors"
            />
            {value && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute right-2.5 p-1 text-neutral-400 hover:text-rose-600 rounded-md transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Presets */}
          {presets && presets.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-neutral-400 font-medium">Preset cepat:</span>
              {presets.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => {
                    setErrorMessage(null);
                    onChange(preset);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all cursor-pointer ${
                    value === preset
                      ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                      : 'bg-white hover:bg-orange-50 text-neutral-700 border-[#E9E9E6] hover:border-orange-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Message Box */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* PREVIEW CONTAINER */}
      {value && (
        <div className="mt-3 rounded-2xl border border-[#E9E9E6] bg-white p-3 shadow-xs space-y-3">
          <div className="relative w-full h-48 sm:h-56 bg-[#F7F6F2] rounded-xl overflow-hidden border border-[#E9E9E6]/60 flex items-center justify-center p-2">
            <img
              src={value}
              alt="Product Preview"
              className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-200"
              onLoad={(e) => {
                const img = e.currentTarget;
                setMetaInfo((prev) => ({
                  ...prev,
                  dimensions: `${img.naturalWidth} × ${img.naturalHeight}`,
                }));
                setErrorMessage(null);
              }}
              onError={() => {
                setErrorMessage('Failed to load image preview. Please check URL or file format.');
              }}
            />
          </div>

          {/* Filename & Dimensions Info & Action Buttons */}
          <div className="flex items-center justify-between gap-3 flex-wrap pt-1 px-1">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-neutral-800 truncate" title={metaInfo.filename}>
                {metaInfo.filename || 'Product Image'}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium mt-0.5">
                <span className="uppercase font-bold text-[#FF6B00]">
                  {metaInfo.format || 'IMAGE'}
                </span>
                {metaInfo.dimensions && <span>• {metaInfo.dimensions}</span>}
                {metaInfo.size && <span>• {metaInfo.size}</span>}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleChangeImage}
                className="px-3 py-1.5 bg-[#F7F6F2] hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl border border-[#E9E9E6] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-neutral-600" />
                <span>Change Image</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <X className="w-3.5 h-3.5 text-rose-600" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {helperText && <p className="text-xs text-neutral-400 mt-1">{helperText}</p>}
    </div>
  );
};
