'use client';

import { Eye } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ViewCounterProps {
  slug: string;
}

const namespace = 'cemyildiz-net-blog';
const dedupeHours = 24;

function storageKey(slug: string) {
  return `blog-viewed:${slug}`;
}

async function readCount(slug: string): Promise<number | null> {
  const response = await fetch(`https://api.counterapi.dev/v1/${namespace}/${slug}`, {
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { count?: number };
  return typeof data.count === 'number' ? data.count : null;
}

async function incrementCount(slug: string): Promise<number | null> {
  const response = await fetch(`https://api.counterapi.dev/v1/${namespace}/${slug}/up`, {
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { count?: number };
  return typeof data.count === 'number' ? data.count : null;
}

export function ViewCounter({ slug }: ViewCounterProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function syncCount() {
      const now = Date.now();
      const lastViewed = Number(localStorage.getItem(storageKey(slug)) || '0');
      const shouldIncrement = now - lastViewed > dedupeHours * 60 * 60 * 1000;
      const nextCount = shouldIncrement ? await incrementCount(slug) : await readCount(slug);

      if (!cancelled) {
        setCount(nextCount);
        if (shouldIncrement && nextCount !== null) {
          localStorage.setItem(storageKey(slug), String(now));
        }
      }
    }

    void syncCount();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <span className="inline-flex items-center gap-1.5" title="Tekil okuma sayısı, aynı cihazda 24 saatte bir kez artar">
      <Eye className="h-4 w-4" aria-hidden="true" />
      {count === null ? '—' : count.toLocaleString('tr-TR')} okuma
    </span>
  );
}
