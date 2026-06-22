import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PdfUploader } from './components/PdfUploader';
import { PdfViewer } from './components/PdfViewer';
import { LinkModal } from './components/LinkModal';
import { LinkPanel } from './components/LinkPanel';
import { Toolbar } from './components/Toolbar';
import { ImageCompressor } from './components/ImageCompressor';
import { LinkRect, LinkType } from './types/link';
import { uploadPdf, exportPdf } from './utils/api';
import { normToExportCoords, PageDimensions } from './utils/coordinateMapper';

export default function App() {
  const [page, setPage] = useState<'pdf' | 'images'>('pdf');
  const [fileId, setFileId] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [links, setLinks] = useState<LinkRect[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pageDimensions, setPageDimensions] = useState<Record<number, PageDimensions>>({});

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingRect, setPendingRect] = useState<Omit<LinkRect, 'id' | 'url' | 'type' | 'label'> | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await uploadPdf(file);
      setFileId(result.fileId);
      setFileUrl(`http://localhost:3001${result.fileUrl}`);
      setFileName(file.name);
      setLinks([]);
      setCurrentPage(1);
      setSelectedLinkId(null);
      setPageDimensions({});
    } catch {
      alert('Upload failed. Make sure the server is running on port 3001.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePageLoaded = useCallback(
    (heightPts: number, widthPts: number) => {
      setPageDimensions((prev) => ({
        ...prev,
        [currentPage]: { height: heightPts, width: widthPts },
      }));
    },
    [currentPage]
  );

  const handleLinkDrawn = useCallback(
    (rect: Omit<LinkRect, 'id' | 'url' | 'type' | 'label'>) => {
      setPendingRect(rect);
      setEditingLinkId(null);
      setModalOpen(true);
    },
    []
  );

  const handleModalSave = (type: LinkType, url: string, label: string) => {
    if (editingLinkId) {
      setLinks((prev) =>
        prev.map((l) => (l.id === editingLinkId ? { ...l, type, url, label } : l))
      );
    } else if (pendingRect) {
      const newLink: LinkRect = {
        id: uuidv4(),
        type,
        url,
        label,
        ...pendingRect,
      };
      setLinks((prev) => [...prev, newLink]);
      setSelectedLinkId(newLink.id);
    }
    setModalOpen(false);
    setPendingRect(null);
    setEditingLinkId(null);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setPendingRect(null);
    setEditingLinkId(null);
  };

  const handleExport = async () => {
    if (!fileId) return;
    setIsExporting(true);
    try {
      const exportLinks = links
        .map((link) => {
          const dim = pageDimensions[link.page];
          if (!dim) return null;
          const converted = normToExportCoords(link, dim);
          return {
            page: link.page,
            x: converted.x,
            y: converted.y,
            width: converted.width,
            height: converted.height,
            url: link.url,
            type: link.type,
          };
        })
        .filter((l): l is NonNullable<typeof l> => l !== null);

      const blob = await exportPdf(fileId, exportLinks);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hyperlinked-${fileName}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed. Make sure the server is running on port 3001.');
    } finally {
      setIsExporting(false);
    }
  };

  const editingLink = editingLinkId ? links.find((l) => l.id === editingLinkId) : undefined;

  const handleChangePdf = () => {
    setFileId(null);
    setFileUrl(null);
    setFileName('');
    setLinks([]);
    setTotalPages(0);
    setSelectedLinkId(null);
    setPageDimensions({});
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">PDF Tools</h1>
            {page === 'pdf' && fileName && <p className="text-xs text-gray-400 truncate max-w-xs">{fileName}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Page tabs */}
          <nav className="flex bg-gray-100 rounded-xl p-0.5 gap-0.5">
            <button
              onClick={() => setPage('pdf')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                page === 'pdf' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              PDF Editor
            </button>
            <button
              onClick={() => setPage('images')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                page === 'images' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Image Compressor
            </button>
          </nav>

          {page === 'pdf' && fileId && (
            <button
              onClick={handleChangePdf}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Change PDF
            </button>
          )}
        </div>
      </header>

      {/* Main area */}
      {page === 'images' ? (
        <ImageCompressor />
      ) : !fileId ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg">
            <PdfUploader onUpload={handleUpload} isLoading={isUploading} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <Toolbar
            currentPage={currentPage}
            totalPages={totalPages}
            scale={scale}
            canExport={links.length > 0}
            isExporting={isExporting}
            onPageChange={(p) => setCurrentPage(Math.max(1, Math.min(p, totalPages)))}
            onZoomIn={() => setScale((s) => Math.min(+(s + 0.25).toFixed(2), 3))}
            onZoomOut={() => setScale((s) => Math.max(+(s - 0.25).toFixed(2), 0.5))}
            onFitScreen={() => setScale(1.0)}
            onExport={handleExport}
          />

          <div className="flex-1 flex min-h-0">
            {/* PDF viewer canvas area */}
            <div className="flex-1 overflow-auto bg-gray-200 p-6 flex justify-center">
              <PdfViewer
                fileUrl={fileUrl!}
                links={links}
                currentPage={currentPage}
                scale={scale}
                selectedLinkId={selectedLinkId}
                onPdfLoaded={setTotalPages}
                onPageLoaded={handlePageLoaded}
                onLinkDrawn={handleLinkDrawn}
                onLinkSelect={(id) => setSelectedLinkId(id || null)}
                onLinkUpdate={(id, changes) =>
                  setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...changes } : l)))
                }
              />
            </div>

            {/* Right panel */}
            <div className="w-72 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
              <LinkPanel
                links={links}
                selectedId={selectedLinkId}
                onSelect={(id) => setSelectedLinkId(id)}
                onEdit={(id) => {
                  setEditingLinkId(id);
                  setModalOpen(true);
                }}
                onDelete={(id) => {
                  setLinks((prev) => prev.filter((l) => l.id !== id));
                  if (selectedLinkId === id) setSelectedLinkId(null);
                }}
                onTest={(url) => {
                  if (url.startsWith('http://') || url.startsWith('https://')) {
                    window.open(url, '_blank', 'noopener,noreferrer');
                  } else {
                    // mailto: and tel: must be triggered via anchor click — window.open blocks them
                    const a = document.createElement('a');
                    a.href = url;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Link modal */}
      <LinkModal
        isOpen={modalOpen}
        initialType={editingLink?.type}
        initialUrl={editingLink?.url}
        initialLabel={editingLink?.label}
        onSave={handleModalSave}
        onClose={handleModalClose}
      />
    </div>
  );
}
