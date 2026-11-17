import type { MetadataRoute } from "next";
import { projects, getProject } from "@/data/projects";
import { getAllPosts } from "@/lib/blog";
import { getPublications } from "@/lib/publications";
export default function sitemap():MetadataRoute.Sitemap {
  const base="https://cemyildiz.net";
  return [{url:base,priority:1},{url:`${base}/blog`,priority:.8},{url:`${base}/updates`,priority:.8},...projects.map(p=>({url:`${base}/work/${p.slug}`,priority:.8})),...getPublications().flatMap(p => [{url:`${base}/updates/${p.id}`,lastModified:new Date(p.date),priority:.7},...(p.type === "project" && !getProject(p.id) ? [{url:`${base}/work/${p.id}`,lastModified:new Date(p.date),priority:.8}] : [])]),...getAllPosts().map(p=>({url:`${base}/blog/${p.slug}`,lastModified:new Date(p.date),priority:.7}))];
}
