import React from 'react';
import { LinkRect, LinkType } from '../types/link';

interface Props {
  links: LinkRect[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTest: (url: string) => void;
}

const TYPE_LABELS: Record<LinkType, string> = {
  website: 'Website',
  email: 'Email',
  phone: 'Phone',
  custom: 'Custom',
};

const TYPE_COLORS: Record<LinkType, string> = {
  website: 'bg-blue-100 text-blue-700',
  email: 'bg-emerald-100 text-emerald-700',
  phone: 'bg-purple-100 text-purple-700',
  custom: 'bg-orange-100 text-orange-700',
};

const TYPE_ICONS: Record<LinkType, string> = {
  website: '🌐',
  email: '✉️',
  phone: '📞',
  custom: '🔗',
};

export const LinkPanel: React.FC<Props> = ({
  links,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onTest,
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800">Links</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {links.length} {links.length === 1 ? 'link' : 'links'} created
        </p>
      </div>

      {links.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
            <svg
              className="w-7 h-7 text-blue-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">No links yet</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Draw rectangles over the PDF to create clickable hyperlink areas
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              onClick={() => onSelect(link.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedId === link.id
                  ? 'border-blue-400 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-base mt-0.5">{TYPE_ICONS[link.type]}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${TYPE_COLORS[link.type]}`}
                    >
                      {TYPE_LABELS[link.type]}
                    </span>
                    <span className="text-xs text-gray-400">p.{link.page}</span>
                  </div>
                  <p className="text-xs text-gray-700 truncate font-mono">{link.url}</p>
                  {link.label && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{link.label}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-1 mt-2.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTest(link.url);
                  }}
                  className="flex-1 text-xs text-blue-600 hover:text-blue-800 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Test
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(link.id);
                  }}
                  className="flex-1 text-xs text-gray-600 hover:text-gray-800 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(link.id);
                  }}
                  className="flex-1 text-xs text-red-500 hover:text-red-700 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
