import React from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `https://lotto.gon.ai.kr${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="breadcrumb" className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
        <ol className="flex items-center gap-1 flex-wrap">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="mx-1" style={{ color: 'var(--text-tertiary)' }}>/</span>}
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium" style={{ color: 'var(--text)' }}>{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumb;
