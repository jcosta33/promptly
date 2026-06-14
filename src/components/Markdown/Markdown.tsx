import { type FC, memo, useState } from "react";
import Highlight from "react-highlight";
import { PiCopyBold, PiCheckBold } from "react-icons/pi";
import ReactMarkdown from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

export type MarkdownProps = {
  children?: string;
  className?: string;
};

// Define schema allowing class names on code and pre for highlight.js
const customSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), "className"],
    pre: [...(defaultSchema.attributes?.pre || []), "className"],
    span: [...(defaultSchema.attributes?.span || []), "className"],
  },
};


const CodeBlock = ({ className, children, ...props }: any) => {
  const codeText = String(children).trim();
  const isMultiLine = codeText.includes("\n");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => {return setCopied(false)}, 2000);
    } catch (e) {
      console.error("Clipboard copy failed:", e);
    }
  };

  if (isMultiLine) {
    return (
      <div style={{ position: "relative" }}>
        <button 
          onClick={handleCopy}
          aria-label="Copy code"
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "none",
            borderRadius: "4px",
            color: copied ? "#4ade80" : "#a1a1aa",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10
          }}
        >
          {copied ? <PiCheckBold /> : <PiCopyBold />}
        </button>
        <Highlight className="markdownCodeBlock">{codeText}</Highlight>
      </div>
    );
  } else {
    return <code className="markdownCode" {...props}>{children}</code>;
  }
};

const markdownComponents = {
  p: (props: any) => {return <p className="markdownParagraph" {...props} />},
  ul: (props: any) => {return <ul className="markdownList" {...props} />},
  ol: (props: any) => {return <ol className="markdownList" {...props} />},
  li: (props: any) => {return <li className="markdownListItem" {...props} />},
  a: (props: any) => {return <a className="markdownLink" {...props} />},
  h1: (props: any) => {return <h1 className="markdownHeading1" {...props} />},
  h2: (props: any) => {return <h2 className="markdownHeading2" {...props} />},
  h3: (props: any) => {return <h3 className="markdownHeading3" {...props} />},
  h4: (props: any) => {return <h4 className="markdownHeading4" {...props} />},
  h5: (props: any) => {return <h5 className="markdownHeading5" {...props} />},
  h6: (props: any) => {return <h6 className="markdownHeading6" {...props} />},
  code: CodeBlock,
  blockquote: (props: any) => {return <blockquote className="markdownBlockquote" {...props} />},
  hr: (props: any) => {return <hr className="markdownHr" {...props} />},
  table: (props: any) => {return <table className="markdownTable" {...props} />},
  th: (props: any) => {return <th className="markdownTableHeader" {...props} />},
  td: (props: any) => {return <td className="markdownTableCell" {...props} />},
};

export const Markdown: FC<MarkdownProps> = memo(function MarkdownInner({ children, className }) {
  if (!children) {
    return null;
  }

  return (
    <div className={className}>
      <ReactMarkdown
        rehypePlugins={[[rehypeSanitize, customSchema]]}
        components={markdownComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
});
