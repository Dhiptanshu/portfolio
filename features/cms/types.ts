export interface BlockSettings {
  paddingTop?: string;
  paddingBottom?: string;
  animation?: 'fade' | 'slide' | 'none';
  delay?: number;
  themeOverride?: string; // slug of a theme to force on this block
}

export interface CmsBlock {
  id: string;
  page_id: string;
  parent_id: string | null;
  type: string;
  sort_order: number;
  is_visible: boolean;
  content: Record<string, any>;
  settings: BlockSettings;
  children?: CmsBlock[]; // For nested blocks
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  description: string;
  is_published: boolean;
}
