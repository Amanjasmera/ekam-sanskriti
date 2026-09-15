import { MetadataRoute } from 'next';
import monuments from '@/data/monuments.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ekam-sanskriti.app';

  // Dynamic monument routes
  const monumentUrls = monuments.map((monument) => ({
    url: `${baseUrl}/monument/${monument.slug}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/map`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/food`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/festivals`,
      lastModified: new Date(),
    },
    ...monumentUrls,
  ];
}
