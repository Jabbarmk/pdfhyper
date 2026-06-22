export type LinkType = 'website' | 'email' | 'phone' | 'custom';

export interface LinkRect {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: LinkType;
  url: string;
  label?: string;
}

export interface ExportLink {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  url: string;
  type: string;
}
