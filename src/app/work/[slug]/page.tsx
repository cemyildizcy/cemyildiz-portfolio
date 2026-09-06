import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/data/projects";

export function generateStaticParams(){return projects.map(({slug})=>({slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const project=getProject((await params).slug);return project?{title:`${project.title} | Proje`,description:project.short}:{}}
export default async function WorkPage({params}:{params:Promise<{slug:string}>}){const project=getProject((await params).slug);if(!project)notFound();return <main className="case"><Link className="back" href="/#work">Projelere dön</Link><header><p>{project.status}</p><h1>{project.title}</h1><p className="lede">{project.short}</p></header><section><h2>Problem</h2><p>{project.premise}</p></section><section><h2>Ortaya çıkan proje</h2><ul>{project.evidence.map(item=><li key={item}>{item}</li>)}</ul></section><section className="split"><div><h2>Ne yaptım?</h2><ul>{project.contribution.map(item=><li key={item}>{item}</li>)}</ul></div><div><h2>Yapay zekânın katkısı</h2><p>{project.aiRole}</p></div></section><section><h2>Ne öğrendim, sınırlar neler?</h2><p>{project.limits}</p></section>{project.links.length>0&&<nav className="case-links" aria-label="Proje bağlantıları">{project.links.map(item=><a key={item.href} href={item.href}>{item.label}</a>)}</nav>}</main>}
