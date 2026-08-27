"use client";

import { RichText } from "@shopify/hydrogen-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";


function isRichTextAst(data?: string): boolean {
  if (!data) return false;
  try {
    const parsed: unknown = JSON.parse(data);
    return Boolean(
      parsed &&
      typeof parsed === "object" &&
      "type" in parsed &&
      parsed.type === "root" &&
      "children" in parsed &&
      Array.isArray(parsed.children),
    );
  } catch {
    return false;
  }
}

function isHtml(data: string): boolean {
  return /<[a-z][\s\S]*>/i.test(data);
}

export function SpecRichText({ data, className }: { data: string; className?: string }) {
  if (!data) return null;
  if (isRichTextAst(data)) {
    return (
      <RichText
        data={data}
        as="div"
        className={className}
        components={{
          link: ({ node }) => (
            <Link
              href={node.url}
              className="text-palette-accent underline transition-opacity hover:opacity-80"
            >
              {node.children}
            </Link>
          ),
          list: ({ node }) => <ul className="my-1 list-disc space-y-1 pl-4">{node.children}</ul>,
          listItem: ({ node }) => <li className="leading-relaxed">{node.children}</li>,
          paragraph: ({ node }) => <p className="mb-2 leading-relaxed">{node.children}</p>,
          heading: ({ node }) => (
            <p className="mb-2 leading-relaxed">
              <strong className="font-medium text-black">{node.children}</strong>
            </p>
          ),
          text: ({ node }) => {
            let content: React.ReactNode = node.value;
            if (node.bold) content = <strong className="font-medium text-black">{content}</strong>;
            if (node.italic) content = <em className="italic">{content}</em>;
            return content;
          },
        }}
      />
    );
  }

  if (isHtml(data)) {
    return (
      <div
        className={cn(
          "whitespace-normal leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_strong]:font-medium [&_strong]:text-black",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: data }}
      />
    );
  }

  return <span className={className}>{data}</span>;
}

