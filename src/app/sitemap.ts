import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'
import { projectCaseStudies } from '@/data/projectHelpers'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://cemyildiz.net'
  
  const routes = [
    '',
    '/about',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  const blogs = getAllPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const projects = projectCaseStudies.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...routes, ...blogs, ...projects]
}