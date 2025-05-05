import ReactMarkdown from "react-markdown";
import Highlight from "react-highlight";
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
          p: (props) => <p className="markdownParagraph" {...props} />,
          ul: (props) => <ul className="markdownList" {...props} />,
          ol: (props) => <ol className="markdownList" {...props} />,
          li: (props) => <li className="markdownListItem" {...props} />,
          a: (props) => <a className="markdownLink" {...props} />,
          h1: (props) => <h1 className="markdownHeading1" {...props} />,
          h2: (props) => <h2 className="markdownHeading2" {...props} />,
          h3: (props) => <h3 className="markdownHeading3" {...props} />,
          h4: (props) => <h4 className="markdownHeading4" {...props} />,
          h5: (props) => <h5 className="markdownHeading5" {...props} />,
          h6: (props) => <h6 className="markdownHeading6" {...props} />,
          code: ({ className, children, ...props }) => {
            const codeText = String(children).trim();
            const isMultiLine = codeText.includes("\n");

            if (isMultiLine) {
              return <Highlight>{codeText}</Highlight>;
            } else {
              return (
                <code className="markdownCode" {...props}>
                  {children}
                </code>
              );
            }
          },
          blockquote: (props) => (
            <blockquote className="markdownBlockquote" {...props} />
          ),
          hr: (props) => <hr className="markdownHr" {...props} />,
          table: (props) => <table className="markdownTable" {...props} />,
          th: (props) => <th className="markdownTableHeader" {...props} />,
          td: (props) => <td className="markdownTableCell" {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};
