// 블로그 포스트 타입 정의
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  coverImage?: string | null;
  content: string;
}

// 빌드 시 생성된 JSON 파일에서 포스트 데이터 가져오기
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const data = await import("@/data/posts.json");
    return data.default as BlogPost[];
  } catch {
    console.warn("posts.json not found. Run 'npm run fetch:notion' first.");
    return [];
  }
}

// 슬러그로 단일 포스트 가져오기
export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((post) => post.slug === slug) || null;
}
