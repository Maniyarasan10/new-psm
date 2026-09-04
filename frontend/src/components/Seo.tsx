import { useEffect } from 'react';

const SITE_URL = 'https://problemsolvingmind.com';

const DEFAULT_IMAGE = '/logo.webp';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
}

export default function Seo({ title, description, path = '/', image = DEFAULT_IMAGE, type = 'website' }: SeoProps) {
  useEffect(() => {
    document.title = title;

    const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;
    const canonical = `${SITE_URL}${path === '/' ? '/' : path}`;

    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', 'Problem Solving Mind');
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:image:alt', title);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', imageUrl);

    upsertCanonical(canonical);
    upsertLink('sitemap', `${SITE_URL}/sitemap.xml`);
    upsertLink('robots', `${SITE_URL}/robots.txt`);
  }, [title, description, path, image, type]);

  return null;
}
