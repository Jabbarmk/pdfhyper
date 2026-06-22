import { LinkType } from '../types/link';

export function formatLink(type: LinkType, value: string): string {
  const v = value.trim();
  switch (type) {
    case 'website':
      if (!v.startsWith('http://') && !v.startsWith('https://')) {
        return `https://${v}`;
      }
      return v;

    case 'email':
      if (!v.startsWith('mailto:')) {
        return `mailto:${v}`;
      }
      return v;

    case 'phone': {
      const cleaned = v.replace(/[\s\-\(\)]/g, '');
      if (!cleaned.startsWith('tel:')) {
        return `tel:${cleaned}`;
      }
      return cleaned;
    }

    case 'custom':
      return v;

    default:
      return v;
  }
}

export function stripLinkPrefix(type: LinkType, url: string): string {
  if (type === 'email' && url.startsWith('mailto:')) return url.slice(7);
  if (type === 'phone' && url.startsWith('tel:')) return url.slice(4);
  if (type === 'website' && url.startsWith('https://')) return url.slice(8);
  if (type === 'website' && url.startsWith('http://')) return url.slice(7);
  return url;
}
