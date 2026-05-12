import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderLines = () => {
    const lines = content.split('\n');
    // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
    const elements: React.ReactElement[] = [];
    let inCodeBlock = false;
    let codeBlockContent = '';
    let listItems: string[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc pl-6 my-2 space-y-1">
                    {listItems.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
            );
            listItems = [];
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.trim().startsWith('```')) {
            flushList();
            if (inCodeBlock) {
                elements.push(
                    <pre key={`pre-${elements.length}`} className="bg-dark-input p-3 rounded-md overflow-x-auto my-2">
                        <code className="text-sm font-mono text-gray-300">{codeBlockContent.trim()}</code>
                    </pre>
                );
                codeBlockContent = '';
            }
            inCodeBlock = !inCodeBlock;
            continue;
        }

        if (inCodeBlock) {
            codeBlockContent += line + '\n';
            continue;
        }

        if (line.trim().startsWith('- ')) {
            listItems.push(line.trim().substring(2));
            if (i === lines.length - 1) { // if it's the last line, flush immediately
              flushList();
            }
            continue;
        } else {
            flushList();
        }

        if (line.trim() === '') {
            if (elements.length > 0 && elements[elements.length - 1].type !== 'div') {
               elements.push(<div key={`br-${i}`} className="h-4" />);
            }
        } else {
            const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g).filter(Boolean);
            const renderedLine = parts.map((part, idx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={idx}>{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                    return <code key={idx} className="bg-dark-input px-1 py-0.5 rounded text-sm font-mono text-brand-green">{part.slice(1, -1)}</code>;
                }
                return part;
            });
            elements.push(<p key={i}>{renderedLine}</p>);
        }
    }
    flushList(); 

    return elements;
  };

  return <div className="prose prose-invert max-w-none text-dark-text space-y-2">{renderLines()}</div>;
};

export default MarkdownRenderer;
