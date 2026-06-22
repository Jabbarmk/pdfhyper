import React, { useState, useCallback, useRef } from 'react';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

type Status = 'idle' | 'compressing' | 'done' | 'error';

function fmt(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ImageCompressor() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const clearZip = useCallback(() => {
    if (zipUrl) { URL.revokeObjectURL(zipUrl); setZipUrl(null); }
  }, [zipUrl]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const accepted = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (accepted.length === 0) return;
    const next: ImageFile[] = accepted.map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...next]);
    setStatus('idle');
    clearZip();
  }, [clearZip]);

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
    setStatus('idle');
    clearZip();
  };

  const clearAll = () => {
    images.forEach(i => URL.revokeObjectURL(i.preview));
    clearZip();
    setImages([]);
    setStatus('idle');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleCompress = async () => {
    if (images.length === 0) return;
    setStatus('compressing');
    clearZip();

    const formData = new FormData();
    for (const img of images) formData.append('images', img.file);

    try {
      const res = await fetch('http://localhost:3001/api/compress', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Server error');

      const orig = parseInt(res.headers.get('X-Original-Size') ?? '0', 10);
      const comp = parseInt(res.headers.get('X-Compressed-Size') ?? '0', 10);
      setOriginalSize(orig || images.reduce((s, i) => s + i.file.size, 0));
      setCompressedSize(comp || 0);

      const blob = await res.blob();
      setZipUrl(URL.createObjectURL(blob));
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!zipUrl) return;
    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = 'compressed-images.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reduction = originalSize > 0 ? Math.max(0, Math.round((1 - compressedSize / originalSize) * 100)) : 0;
  const totalOriginal = images.reduce((s, i) => s + i.file.size, 0);

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 bg-white hover:border-green-400 hover:bg-green-50/40'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
          />
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-700 mb-1">Drop images here or click to browse</p>
          <p className="text-sm text-gray-400">JPEG · PNG · WebP · AVIF · GIF — multiple files supported</p>
        </div>

        {/* Image list */}
        {images.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-700">
                {images.length} image{images.length !== 1 ? 's' : ''} · {fmt(totalOriginal)}
              </span>
              <button
                onClick={clearAll}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {images.map(img => (
                <div key={img.id} className="flex items-center gap-3 px-5 py-3">
                  <img
                    src={img.preview}
                    alt={img.file.name}
                    className="w-12 h-12 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{img.file.name}</p>
                    <p className="text-xs text-gray-400">
                      {fmt(img.file.size)} · {img.file.type.split('/')[1]?.toUpperCase() ?? 'IMAGE'}
                    </p>
                  </div>
                  <button
                    onClick={() => removeImage(img.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {images.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={handleCompress}
              disabled={status === 'compressing'}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {status === 'compressing' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Compressing…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Compress All
                </>
              )}
            </button>

            {status === 'done' && zipUrl && (
              <button
                onClick={handleDownload}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download All (.zip)
              </button>
            )}
          </div>
        )}

        {/* Compression result */}
        {status === 'done' && originalSize > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-800">Compression complete</p>
              <p className="text-xs text-green-600 mt-1">
                {fmt(originalSize)} → {fmt(compressedSize)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-700">-{reduction}%</p>
              <p className="text-xs text-green-500">size reduced</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-medium text-red-700">
              Compression failed. Make sure the server is running on port 3001.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
