'use client';

import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

// Bu ID'leri kendi LinkedIn gönderilerinden alabilirsin
// LinkedIn postunda sağ üstten "Gönderiyi yerleştir" (Embed this post) deyip URL içindeki activity ID'yi kopyalayabilirsin
const linkedinPosts = [
  "7175893321523456789", // Placeholder ID 1
  "7172893321523456789", // Placeholder ID 2
  "7171893321523456789"  // Placeholder ID 3
];

export const LinkedinSection = () => {
  return (
    <section id="paylasimlar" className="py-24 relative bg-[var(--surface)]/30">
      <div className="container mx-auto px-6 max-w-6xl">
        <SectionHeading title="LinkedIn" subtitle="Son paylaşımlarım ve yazılarım." />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          {linkedinPosts.map((postId, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <div className="bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-lg h-[400px] w-full flex items-center justify-center">
                {/* LinkedIn Embed Iframe */}
                <div className="text-center p-6 text-[var(--text-secondary)]">
                  <p className="text-sm mb-4">Gönderi yüklenemezse veya ad-blocker engellerse linke tıklayın:</p>
                  <a href={`https://www.linkedin.com/feed/update/urn:li:activity:${postId}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline text-sm font-medium">
                    LinkedIn'de Görüntüle
                  </a>
                </div>
                {/* Gerçek kullanımda üstteki div yerine aşağıdaki iframe aktif edilecek: */}
                {/* 
                <iframe 
                  src={`https://www.linkedin.com/embed/feed/update/urn:li:share:${postId}`} 
                  height="100%" 
                  width="100%" 
                  frameBorder="0" 
                  allowFullScreen 
                  title="Embedded post"
                  className="bg-white"
                ></iframe>
                */}
              </div>
            </ScrollReveal>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a 
            href="https://www.linkedin.com/in/cemyildizcy/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors"
          >
            Tüm Paylaşımlarımı Gör
          </a>
        </div>
      </div>
    </section>
  );
};