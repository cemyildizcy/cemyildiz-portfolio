import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts,getPost } from "@/lib/blog";
export function generateStaticParams(){return getAllPosts().map(({slug})=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const post=getPost((await params).slug);return post?{title:`${post.title} | Cem Yıldız`,description:post.description}:{};}
function inline(s:string){return s.replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");}
function markdown(source:string){return source.split(/\n\n+/).map(block=>{if(block.startsWith("## "))return `<h2>${inline(block.slice(3))}</h2>`;if(block.startsWith("### "))return `<h3>${inline(block.slice(4))}</h3>`;if(block.startsWith("# "))return "";if(block.startsWith("```"))return `<pre><code>${block.replace(/^```\w*\n?|```$/g,"").replace(/&/g,"&amp;").replace(/</g,"&lt;")}</code></pre>`;if(block.split("\n").every(l=>l.startsWith("- ")))return `<ul>${block.split("\n").map(l=>`<li>${inline(l.slice(2))}</li>`).join("")}</ul>`;return `<p>${inline(block.replace(/\n/g," "))}</p>`;}).join("");}
export default async function Post({params}:{params:Promise<{slug:string}>}){const post=getPost((await params).slug);if(!post)notFound();return <main className="content-page article-page"><Link className="text-link" href="/blog">← Seçilmiş yazılar</Link><article><header><p>{post.readTime} okuma</p><h1>{post.title}</h1><p>{post.description}</p></header><div className="article-body" dangerouslySetInnerHTML={{__html:markdown(post.content)}} /></article></main>}
