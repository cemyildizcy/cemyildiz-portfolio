import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts,getPost } from "@/lib/blog";
import { renderMarkdown } from "@/lib/markdown";
export function generateStaticParams(){return getAllPosts().map(({slug})=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const post=getPost((await params).slug);return post?{title:`${post.title} | Cem Yıldız`,description:post.description}:{};}
export default async function Post({params}:{params:Promise<{slug:string}>}){const post=getPost((await params).slug);if(!post)notFound();return <main className="content-page article-page"><Link className="text-link" href="/blog">← Seçilmiş yazılar</Link><article><header><p>{post.readTime} okuma</p><h1>{post.title}</h1><p>{post.description}</p></header><div className="article-body" dangerouslySetInnerHTML={{__html:renderMarkdown(post.content)}} /></article></main>}
