import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

const CodeBlock = SyntaxHighlighter as unknown as React.ComponentType<SyntaxHighlighterProps>;

interface Props {
  language: string;
  children: string;
}

const StyledCodeBlock = ({ language, children }: Props) => {
  return (
    <CodeBlock
      style={vscDarkPlus}
      language={language}
      PreTag="div"
      className="rounded-lg !my-6"
      customStyle={{
        fontFamily: "'D2Coding', monospace",
      }}
      codeTagProps={{
        style: {
          fontFamily: "'D2Coding', monospace",
        },
      }}
    >
      {children}
    </CodeBlock>
  );
};

export default StyledCodeBlock;
