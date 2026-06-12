import Highlight from "react-highlight";
import ReactMarkdown from "react-markdown";

import "highlight.js/styles/github-dark.css";
import "./Markdown.css";
import type { FC } from "react"; // Import FC

export type MarkdownProps = {
  children?: string;
  className?: string;
};

export const Markdown: FC<MarkdownProps> = ({ children, className }) => {
  if (!children) {
    return null;
  }

  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          p: (props) => {
            return <p className="markdownParagraph" {...props} />;
          },
          ul: (props) => {
            return <ul className="markdownList" {...props} />;
          },
          ol: (props) => {
            return <ol className="markdownList" {...props} />;
          },
          li: (props) => {
            return <li className="markdownListItem" {...props} />;
          },
          a: (props) => {
            return <a className="markdownLink" {...props} />;
          },
          h1: (props) => {
            return <h1 className="markdownHeading1" {...props} />;
          },
          h2: (props) => {
            return <h2 className="markdownHeading2" {...props} />;
          },
          h3: (props) => {
            return <h3 className="markdownHeading3" {...props} />;
          },
          h4: (props) => {
            return <h4 className="markdownHeading4" {...props} />;
          },
          h5: (props) => {
            return <h5 className="markdownHeading5" {...props} />;
          },
          h6: (props) => {
            return <h6 className="markdownHeading6" {...props} />;
          },
          code: ({ className, children, ...props }) => {
            const codeText = String(children).trim();
            const isMultiLine = codeText.includes("\n");

            if (isMultiLine) {
              return (
                <Highlight className="markdownCodeBlock">{codeText}</Highlight>
              );
            } else {
              return (
                <code className="markdownCode" {...props}>
                  {children}
                </code>
              );
            }
          },
          blockquote: (props) => {
            return <blockquote className="markdownBlockquote" {...props} />;
          },
          hr: (props) => {
            return <hr className="markdownHr" {...props} />;
          },
          table: (props) => {
            return <table className="markdownTable" {...props} />;
          },
          th: (props) => {
            return <th className="markdownTableHeader" {...props} />;
          },
          td: (props) => {
            return <td className="markdownTableCell" {...props} />;
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};
