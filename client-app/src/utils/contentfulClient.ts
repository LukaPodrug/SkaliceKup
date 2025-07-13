import { createClient } from 'contentful';

const CONTENTFUL_SPACE_ID = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;
const CONTENTFUL_ENVIRONMENT = import.meta.env.VITE_CONTENTFUL_ENVIRONMENT || 'master';
const CONTENTFUL_LOCALE = import.meta.env.VITE_CONTENTFUL_LOCALE || 'hr-HR';

const CONTENT_TYPE = import.meta.env.VITE_CONTENTFUL_CONTENT_TYPE || 'article';
const TITLE_FIELD = import.meta.env.VITE_CONTENTFUL_TITLE_FIELD || 'title';
const CONTENT_FIELD = import.meta.env.VITE_CONTENTFUL_CONTENT_FIELD || 'content';
const IMAGE_FIELD = import.meta.env.VITE_CONTENTFUL_IMAGE_FIELD || 'images';
const FEATURED_IMAGE_FIELD = import.meta.env.VITE_CONTENTFUL_FEATURED_IMAGE_FIELD || 'feturedImage';
const DOCUMENTS_FIELD = import.meta.env.VITE_CONTENTFUL_DOCUMENTS_FIELD || 'documents';

export interface ContentfulArticle {
  id: string;
  title: string;
  content: string;
  featuredImage?: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  images?: Array<{
    url: string;
    alt: string;
    width: number;
    height: number;
  }>;
  documents?: Array<{
    url: string;
    title: string;
    size: number;
  }>;
  publishedAt: string;
  updatedAt: string;
}

export interface ContentfulResponse {
  data?: ContentfulArticle[];
  error?: string;
}

class ContentfulClient {
  private client: any;

  constructor() {
    if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
      console.error('Contentful credentials not found in environment variables');
      return;
    }

    this.client = createClient({
      space: CONTENTFUL_SPACE_ID,
      accessToken: CONTENTFUL_ACCESS_TOKEN,
      environment: CONTENTFUL_ENVIRONMENT,
    });
  }

  private extractImageData(imagesField: any): Array<{ url: string; alt: string; width: number; height: number }> {
    if (!imagesField || !Array.isArray(imagesField)) return [];
    
    return imagesField.map((image: any) => ({
      url: image.fields?.file?.url ? `https:${image.fields.file.url}` : '',
      alt: image.fields?.description || image.fields?.title || '',
      width: image.fields?.file?.details?.image?.width || 0,
      height: image.fields?.file?.details?.image?.height || 0,
    }));
  }

  private extractFeaturedImageData(featuredImageField: any): { url: string; alt: string; width: number; height: number } | undefined {
    if (!featuredImageField) return undefined;
    
    return {
      url: featuredImageField.fields?.file?.url ? `https:${featuredImageField.fields.file.url}` : '',
      alt: featuredImageField.fields?.description || featuredImageField.fields?.title || '',
      width: featuredImageField.fields?.file?.details?.image?.width || 0,
      height: featuredImageField.fields?.file?.details?.image?.height || 0,
    };
  }

  private extractDocumentData(documentsField: any): Array<{ url: string; title: string; size: number }> {
    if (!documentsField || !Array.isArray(documentsField)) return [];
    
    return documentsField.map((doc: any) => ({
      url: doc.fields?.file?.url ? `https:${doc.fields.file.url}` : '',
      title: doc.fields?.title || doc.fields?.description || '',
      size: doc.fields?.file?.details?.size || 0,
    }));
  }

  private extractContent(contentField: any): string {
    if (!contentField) return '';
    
    // If it's already a string, return it
    if (typeof contentField === 'string') {
      return contentField;
    }
    
    // If it's rich text (has content array), extract plain text
    if (contentField.content && Array.isArray(contentField.content)) {
      const extractedText = contentField.content
        .map((node: any) => {
          if (node.content && Array.isArray(node.content)) {
            return node.content.map((textNode: any) => textNode.value || '').join('');
          }
          return node.value || '';
        })
        .join(' ');
      return extractedText;
    }
    
    // If it's an object with a value property
    if (contentField.value) {
      return contentField.value;
    }
    
    // Fallback: try to stringify the object
    try {
      const fallbackText = JSON.stringify(contentField);
      return fallbackText;
    } catch {
      return '';
    }
  }

  async getArticles(limit: number = 10, skip: number = 0): Promise<ContentfulResponse> {
    try {
      if (!this.client) {
        return { error: 'Contentful client not initialized' };
      }

      const response = await this.client.getEntries({
        content_type: CONTENT_TYPE,
        limit,
        skip,
        order: '-sys.createdAt',
      });

      const articles: ContentfulArticle[] = response.items.map((item: any) => ({
        id: item.sys.id,
        title: item.fields[TITLE_FIELD] || '',
        content: this.extractContent(item.fields[CONTENT_FIELD]),
        featuredImage: this.extractFeaturedImageData(item.fields[FEATURED_IMAGE_FIELD]),
        images: this.extractImageData(item.fields[IMAGE_FIELD]),
        documents: this.extractDocumentData(item.fields[DOCUMENTS_FIELD]),
        publishedAt: item.sys.createdAt,
        updatedAt: item.sys.updatedAt,
      }));

      return { data: articles };
    } catch (error) {
      console.error('Error fetching articles from Contentful:', error);
      return { error: 'Failed to fetch articles' };
    }
  }

  async getArticle(id: string): Promise<ContentfulResponse> {
    try {
      if (!this.client) {
        return { error: 'Contentful client not initialized' };
      }

      const response = await this.client.getEntry(id);

      const article: ContentfulArticle = {
        id: response.sys.id,
        title: response.fields[TITLE_FIELD] || '',
        content: this.extractContent(response.fields[CONTENT_FIELD]),
        featuredImage: this.extractFeaturedImageData(response.fields[FEATURED_IMAGE_FIELD]),
        images: this.extractImageData(response.fields[IMAGE_FIELD]),
        documents: this.extractDocumentData(response.fields[DOCUMENTS_FIELD]),
        publishedAt: response.sys.createdAt,
        updatedAt: response.sys.updatedAt,
      };

      return { data: [article] };
    } catch (error) {
      console.error('Error fetching article from Contentful:', error);
      return { error: 'Failed to fetch article' };
    }
  }

  async getArticlesByTag(tag: string, limit: number = 10): Promise<ContentfulResponse> {
    try {
      if (!this.client) {
        return { error: 'Contentful client not initialized' };
      }

      const response = await this.client.getEntries({
        content_type: CONTENT_TYPE,
        limit,
        'metadata.tags.sys.id[in]': tag,
        order: '-sys.createdAt',
      });

      const articles: ContentfulArticle[] = response.items.map((item: any) => ({
        id: item.sys.id,
        title: item.fields[TITLE_FIELD] || '',
        content: this.extractContent(item.fields[CONTENT_FIELD]),
        featuredImage: this.extractFeaturedImageData(item.fields[FEATURED_IMAGE_FIELD]),
        images: this.extractImageData(item.fields[IMAGE_FIELD]),
        documents: this.extractDocumentData(item.fields[DOCUMENTS_FIELD]),
        publishedAt: item.sys.createdAt,
        updatedAt: item.sys.updatedAt,
      }));

      return { data: articles };
    } catch (error) {
      console.error('Error fetching articles by tag from Contentful:', error);
      return { error: 'Failed to fetch articles by tag' };
    }
  }
}

export const contentfulClient = new ContentfulClient(); 