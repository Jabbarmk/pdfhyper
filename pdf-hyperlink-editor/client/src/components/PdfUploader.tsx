import React, { useCallback, useState } from 'react';

interface Props {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export const PdfUploader: React.FC<Props> = ({ onUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type === 'application/pdf') {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-16 transition-all cursor-pointer ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30'
      }`}
    >
      <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center mb-5">
        <svg
          className="w-10 h-10 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {isDragging ? 'Drop your PDF here' : 'Upload a PDF'}
      </h3>
      <p className="text-gray-400 text-sm mb-6">Drag and drop or click to browse</p>
      <label
        className={`px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-blue-700 transition-colors ${
          isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
        }`}
      >
        {isLoading ? 'Uploading…' : 'Browse PDF'}
        <input
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
          disabled={isLoading}
        />
      </label>
      <p className="text-xs text-gray-400 mt-3">PDF files up to 50 MB</p>
    </div>
  );
};
