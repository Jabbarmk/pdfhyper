import React, { useState, useEffect } from 'react';
import { LinkType } from '../types/link';
import { formatLink, stripLinkPrefix } from '../utils/formatLink';

interface Props {
  isOpen: boolean;
  initialType?: LinkType;
  initialUrl?: string;
  initialLabel?: string;
  onSave: (type: LinkType, url: string, label: string) => void;
  onClose: () => void;
}

const PLACEHOLDERS: Record<LinkType, string> = {
  website: 'www.example.com',
  email: 'info@example.com',
  phone: '+971 54 569 9163',
  custom: 'https://custom-url.com',
};

const INPUT_LABELS: Record<LinkType, string> = {
  website: 'Website URL',
  email: 'Email Address',
  phone: 'Phone Number',
  custom: 'Custom URL',
};

export const LinkModal: React.FC<Props> = ({
  isOpen,
  initialType = 'website',
  initialUrl = '',
  initialLabel = '',
  onSave,
  onClose,
}) => {
  const [type, setType] = useState<LinkType>(initialType);
  const [rawInput, setRawInput] = useState('');
  const [label, setLabel] = useState(initialLabel);

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setRawInput(stripLinkPrefix(initialType, initialUrl));
      setLabel(initialLabel ?? '');
    }
  }, [isOpen, initialType, initialUrl, initialLabel]);

  const handleSave = () => {
    const formatted = formatLink(type, rawInput);
    onSave(type, formatted, label.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && rawInput.trim()) handleSave();
    if (e.key === 'Escape') onClose();
  };

  const preview = rawInput.trim() ? formatLink(type, rawInput) : '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onKeyDown={handleKeyDown}
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add Hyperlink</h2>
          <p className="text-sm text-gray-500">Configure the link for the selected area</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Link Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                const newType = e.target.value as LinkType;
                setType(newType);
                setRawInput(stripLinkPrefix(newType, rawInput));
              }}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="website">🌐 Website</option>
              <option value="email">✉️ Email</option>
              <option value="phone">📞 Phone</option>
              <option value="custom">🔗 Custom URL</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {INPUT_LABELS[type]}
            </label>
            <input
              type="text"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={PLACEHOLDERS[type]}
              autoFocus
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {preview && (
              <p className="mt-1.5 text-xs text-gray-500">
                Final URL:{' '}
                <span className="text-blue-600 font-mono break-all">{preview}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Label{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Company Website"
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!rawInput.trim()}
            className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Save Link
          </button>
        </div>
      </div>
    </div>
  );
};
