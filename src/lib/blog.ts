import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const matter = require('gray-matter');

const postsDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  readTime: string;
  content: string;
  coverEmoji: string;
}

function getExcerpt(data: Record<string, unknown>): string {
  const excerpt = typeof data.excerpt === 'string' ? data.excerpt : '';
  const description = typeof data.description === 'string' ? data.description : '';
  return excerpt || description;
}

function parsePost(fileName: string): BlogPost {
  const slug = fileName.replace(/\.md$/, '');
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: typeof data.title === 'string' ? data.title : '',
    date: typeof data.date === 'string' ? data.date : '',
    excerpt: getExcerpt(data),
    tags: Array.isArray(data.tags) ? data.tags : [],
    readTime: typeof data.readTime === 'string' ? data.readTime : '5 dk',
    content,
    coverEmoji: typeof data.coverEmoji === 'string' ? data.coverEmoji : '📝',
  };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) return [];

  const fileNames = fs.readdirSync(postsDirectory).filter((fileName) => fileName.endsWith('.md'));
  const posts = fileNames.map(parsePost);

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  return parsePost(`${slug}.md`);
}
