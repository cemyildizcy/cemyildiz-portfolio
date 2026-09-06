import Link from "next/link";
export function Navbar(){return <header className="site-header"><Link className="wordmark" href="/">CY<span>yapay zekâ projeleri</span></Link><nav aria-label="Ana gezinme"><Link href="/#work">Projeler</Link><Link href="/#now">Şu an</Link><Link href="/#about">Hakkımda / İletişim</Link></nav></header>}
