import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { DrawingLayer } from './DrawingLayer';
import { LinkRect } from '../types/link';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface CanvasSize {
  width: number;
  height: number;
}

interface Props {
  fileUrl: string;
  links: LinkRect[];
  currentPage: number;
  scale: number;
  selectedLinkId: string | null;
  onPdfLoaded: (totalPages: number) => void;
  onPageLoaded: (heightPts: number, widthPts: number) => void;
  onLinkDrawn: (rect: Omit<LinkRect, 'id' | 'url' | 'type' | 'label'>) => void;
  onLinkSelect: (id: string) => void;
  onLinkUpdate: (id: string, changes: Partial<LinkRect>) => void;
}

export const PdfViewer: React.FC<Props> = ({
  fileUrl,
  links,
  currentPage,
  scale,
  selectedLinkId,
  onPdfLoaded,
  onPageLoaded,
  onLinkDrawn,
  onLinkSelect,
  onLinkUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 0, height: 0 });
  const [isRendering, setIsRendering] = useState(false);

  // Load PDF document
  useEffect(() => {
    if (!fileUrl) return;

    setPdf(null);
    setCanvasSize({ width: 0, height: 0 });

    const task = pdfjsLib.getDocument(fileUrl);
    task.promise.then((loadedPdf) => {
      setPdf(loadedPdf);
      onPdfLoaded(loadedPdf.numPages);
    }).catch((err) => {
      console.error('Failed to load PDF:', err);
    });

    return () => {
      task.destroy();
    };
  }, [fileUrl]);

  // Render current page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    // Cancel in-progress render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    setIsRendering(true);

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const task = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;

        const naturalViewport = page.getViewport({ scale: 1 });
        onPageLoaded(naturalViewport.height, naturalViewport.width);
        setCanvasSize({ width: viewport.width, height: viewport.height });
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'RenderingCancelledException') {
          console.error('Render error:', err);
        }
      } finally {
        setIsRendering(false);
      }
    };

    renderPage();
  }, [pdf, currentPage, scale]);

  return (
    <div className="relative inline-block shadow-xl rounded-sm">
      {isRendering && canvasSize.width === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white rounded-sm z-10 min-w-[400px] min-h-[500px]">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-400">Rendering page…</p>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="block" />

      {canvasSize.width > 0 && (
        <DrawingLayer
          links={links}
          currentPage={currentPage}
          scale={scale}
          canvasWidth={canvasSize.width}
          canvasHeight={canvasSize.height}
          selectedId={selectedLinkId}
          onLinkDrawn={onLinkDrawn}
          onLinkSelect={onLinkSelect}
          onLinkUpdate={onLinkUpdate}
        />
      )}
    </div>
  );
};
