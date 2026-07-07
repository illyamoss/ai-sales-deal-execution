import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../markdown-styles.css';

interface Props {
  html: string; // The property is named html for backward compatibility with the database, but it contains Markdown
}

export default function ProposalTabRenderer({ html }: Props) {
  return (
    <div className="markdown-proposal" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {html}
      </ReactMarkdown>
    </div>
  );
}
