'use client';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import type { PluggableList } from 'react-markdown';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const remarkPlugins: PluggableList = [remarkGfm as any];
  const rehypePlugins: PluggableList = [rehypeRaw as any];

  return (
    <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="mt-2 scroll-m-20 text-4xl font-bold tracking-tight" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="mt-12 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="mt-8 scroll-m-20 text-xl font-semibold tracking-tight" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="mt-8 scroll-m-20 text-lg font-semibold tracking-tight" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="font-medium text-primary underline underline-offset-4" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="[&>p]:mt-0" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="mt-6 border-l-2 border-primary pl-6 italic" {...props} />
          ),
          img: ({ node, ...props }) => (
            <img className="rounded-md shadow-lg my-4" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="mb-4 mt-6 overflow-x-auto rounded-lg border bg-muted px-4 py-4" {...props} />
          ),
          code: ({ node, inline, ...props }: any) => {
            if (inline) {
              return (
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm" {...props} />
              );
            }
            return <code className="font-mono text-sm" {...props} />;
          },
          table: ({ node, ...props }) => (
            <div className="my-6 w-full overflow-y-auto">
              <table className="w-full" {...props} />
            </div>
          ),
          tr: ({ node, ...props }) => (
            <tr className="m-0 border-t p-0 even:bg-muted" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border px-4 py-2 text-left font-bold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border px-4 py-2 text-left" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
