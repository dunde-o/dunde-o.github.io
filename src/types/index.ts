export interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  series?: string | null;
  coverImage?: string | null;
  description?: string | null;
  content: string;
}
