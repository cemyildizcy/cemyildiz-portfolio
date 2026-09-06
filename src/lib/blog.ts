import fs from "node:fs";
import path from "node:path";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const matter = require("gray-matter");

const directory = path.join(process.cwd(), "content/blog");
export type BlogPost = { slug:string; title:string; date:string; description:string; tags:string[]; readTime:string; content:string };
function parse(file:string):BlogPost { const {data,content}=matter(fs.readFileSync(path.join(directory,file),"utf8")); return {slug:file.replace(/\.md$/, ""),title:data.title,date:data.date,description:data.description,tags:data.tags??[],readTime:data.readTime??"",content}; }
export function getAllPosts(){ return fs.readdirSync(directory).filter(f=>f.endsWith(".md")).map(parse).sort((a,b)=>b.date.localeCompare(a.date)); }
export function getPost(slug:string){ const file=`${slug}.md`; return fs.existsSync(path.join(directory,file))?parse(file):null; }
