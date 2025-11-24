import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';

export const Project = defineDocumentType(() => ({
  name: 'Project',
  filePathPattern: 'projects/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      required: true,
    },
    summary: {
      type: 'string',
      required: true,
    },
    year: {
      type: 'number',
      required: true,
    },
    tags: {
      type: 'json',
      required: false,
    },
    links: {
      type: 'json',
      required: false,
    },
    highlights: {
      type: 'json',
      required: false,
    },
    coverImage: {
      type: 'string',
      required: false,
    },
    image: {
      type: 'string',
      required: false,
    },
    video: {
      type: 'string',
      required: false,
    },
    featured: {
      type: 'boolean',
      default: false,
    },
    status: {
      type: 'enum',
      options: ['completed', 'in-progress', 'planning'],
      default: 'completed',
    },
    updatedAt: {
      type: 'date',
      required: false,
    },
    createdAt: {
      type: 'date',
      required: false,
    },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (project) => project._raw.sourceFileName.replace(/\.mdx$/, ''),
    },
    url: {
      type: 'string',
      resolve: (project) => `/projects/${project._raw.sourceFileName.replace(/\.mdx$/, '')}`,
    },
  },
}));

const rehypePrettyCodeOptions = {
  theme: {
    dark: 'github-dark',
    light: 'github-light',
  },
  keepBackground: false,
  onVisitLine(node: any) {
    if (node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }];
    }
  },
  onVisitHighlightedLine(node: any) {
    node.properties.className.push('highlighted');
  },
  onVisitHighlightedWord(node: any) {
    node.properties.className = ['highlighted-word'];
  },
};

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Project],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [[rehypePrettyCode as any, rehypePrettyCodeOptions]],
  },
});