import Link from "next/link";
export function Navbar(){return <header className="site-header"><Link className="wordmark" href="/">CY<span>kanıt defteri</span></Link><nav aria-label="Ana gezinme"><Link href="/#work">Çalışmalar</Link><Link href="/#now">Öğrenme / Şimdi</Link><Link href="/#about">Hakkımda / İletişim</Link></nav></header>}
