import { type FC, memo, useState } from "react";
import Highlight from "react-highlight";
import { PiCopyBold, PiCheckBold, PiPlayBold, PiSpinnerBold } from "react-icons/pi";
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
  const [executing, setExecuting] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  
  // Try to determine language from className (e.g. language-python)
  const languageMatch = /language-(\w+)/.exec(className || "");
  const language = languageMatch ? languageMatch[1] : null;
  const isExecutable = language === "python" || language === "javascript" || language === "js" || language === "py";

  const handleExecute = () => {
    if (!isExecutable) return;
    setExecuting(true);
    setOutput(null);

    chrome.runtime.sendMessage(
      {
        type: "execute_code",
        payload: {
          language,
          code: codeText,
        },
      },
      (response) => {
        setExecuting(false);
        if (response && response.error) {
          setOutput(`Error: ${response.error}`);
        } else if (response && response.output !== undefined) {
          setOutput(response.output || "Execution completed (no output).");
        } else {
          setOutput("Execution failed: Unknown error.");
        }
      }
    );
  };

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
        <div style={{ position: "absolute", top: "8px", right: "8px", display: "flex", gap: "8px", zIndex: 10 }}>
          {isExecutable && (
            <button 
              onClick={handleExecute}
              aria-label="Run code"
              disabled={executing}
              style={{
                background: "var(--promptly-primary)",
                border: "none",
                borderRadius: "4px",
                color: "var(--promptly-on-primary)",
                cursor: executing ? "not-allowed" : "pointer",
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                fontSize: "12px",
                fontWeight: "bold"
              }}
            >
              {executing ? <PiSpinnerBold className="spin" /> : <PiPlayBold />}
              {executing ? "Running..." : "Run"}
            </button>
          )}
          <button 
            onClick={handleCopy}
            aria-label="Copy code"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              borderRadius: "4px",
              color: copied ? "#4ade80" : "#a1a1aa",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {copied ? <PiCheckBold /> : <PiCopyBold />}
          </button>
        </div>
        <Highlight className={`markdownCodeBlock ${className || ""}`}>{codeText}</Highlight>
        
        {output !== null && (
          <div style={{
            marginTop: "8px",
            background: "var(--promptly-bg-tertiary)",
            color: "var(--promptly-text-primary)",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "13px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            borderLeft: "4px solid var(--promptly-primary)",
            maxHeight: "200px",
            overflowY: "auto"
          }}>
            <div style={{ fontSize: "11px", color: "var(--promptly-text-muted)", marginBottom: "4px", textTransform: "uppercase", fontWeight: "bold" }}>Output</div>
            {output}
          </div>
        )}
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
