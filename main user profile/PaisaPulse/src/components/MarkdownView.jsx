import React from 'react';

/**
 * Lightweight, robust Markdown Renderer for AI Guardian Chat
 * Converts raw markdown (*, **, ###, lists, code) into crisp, beautiful typography
 */
export default function MarkdownView({ content = '', className = '' }) {
  if (!content) return null;

  // Split into lines
  const lines = content.split('\n');
  const elements = [];
  let currentList = null;
  let listType = null; // 'ul' | 'ol'

  const flushList = () => {
    if (currentList && currentList.length > 0) {
      if (listType === 'ol') {
        elements.push(
          <ol key={`ol_${elements.length}`} style={{ margin: '8px 0', paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {currentList.map((item, idx) => (
              <li key={idx} style={{ fontSize: '0.88rem', color: '#292524', lineHeight: 1.55 }}>
                {renderInline(item)}
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul_${elements.length}`} style={{ margin: '8px 0', paddingLeft: '20px', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {currentList.map((item, idx) => (
              <li key={idx} style={{ fontSize: '0.88rem', color: '#292524', lineHeight: 1.55 }}>
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
      }
      currentList = null;
      listType = null;
    }
  };

  lines.forEach((rawLine, lineIdx) => {
    const line = rawLine.trim();

    // Empty line
    if (!line) {
      flushList();
      elements.push(<div key={`sp_${lineIdx}`} style={{ height: '8px' }} />);
      return;
    }

    // Heading 3 or 4 (### or ####)
    if (line.startsWith('### ') || line.startsWith('#### ')) {
      flushList();
      const headingText = line.replace(/^#{3,4}\s+/, '');
      elements.push(
        <h4 
          key={`h3_${lineIdx}`} 
          style={{ 
            fontSize: '0.95rem', 
            fontWeight: 800, 
            color: '#1C1917', 
            marginTop: '12px', 
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {renderInline(headingText)}
        </h4>
      );
      return;
    }

    // Heading 2 or 1 (## or #)
    if (line.startsWith('# ') || line.startsWith('## ')) {
      flushList();
      const headingText = line.replace(/^#{1,2}\s+/, '');
      elements.push(
        <h3 
          key={`h2_${lineIdx}`} 
          style={{ 
            fontSize: '1.02rem', 
            fontWeight: 800, 
            color: '#1C1917', 
            marginTop: '14px', 
            marginBottom: '8px' 
          }}
        >
          {renderInline(headingText)}
        </h3>
      );
      return;
    }

    // Ordered list item (e.g. "1. ")
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      if (!currentList) currentList = [];
      currentList.push(olMatch[2]);
      return;
    }

    // Unordered list item (e.g. "* " or "- ")
    const ulMatch = line.match(/^[\*\-]\s+(.*)$/);
    if (ulMatch) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      if (!currentList) currentList = [];
      currentList.push(ulMatch[1]);
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p 
        key={`p_${lineIdx}`} 
        style={{ 
          fontSize: '0.88rem', 
          color: '#292524', 
          lineHeight: 1.6, 
          margin: '4px 0' 
        }}
      >
        {renderInline(line)}
      </p>
    );
  });

  flushList();

  return (
    <div className={`markdown-body ${className}`} style={{ fontFamily: 'inherit' }}>
      {elements}
    </div>
  );
}

/**
 * Parses inline formatting: **bold**, *italic*, `code`, and currency highlights
 */
function renderInline(text) {
  if (!text) return null;

  // Split by bold tokens: **bold text**
  const boldParts = text.split(/(\*\*[^*]+?\*\*)/g);

  return boldParts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong 
          key={idx} 
          style={{ 
            fontWeight: 800, 
            color: '#1C1917' 
          }}
        >
          {renderItalicAndCode(inner)}
        </strong>
      );
    }
    return renderItalicAndCode(part, idx);
  });
}

function renderItalicAndCode(text, baseKey = 0) {
  if (!text) return null;

  // Split by inline code: `code`
  const codeParts = text.split(/(`[^`]+?`)/g);

  return codeParts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code 
          key={`${baseKey}_code_${idx}`}
          style={{
            background: '#F5EFE6',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.82rem',
            fontFamily: 'monospace',
            color: '#EA580C'
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Split by italics: *italic* or _italic_
    const italicParts = part.split(/(\*[^*]+?\*)|(_[^_]+?_)/g);
    return italicParts.map((subPart, subIdx) => {
      if (!subPart) return null;
      if ((subPart.startsWith('*') && subPart.endsWith('*')) || (subPart.startsWith('_') && subPart.endsWith('_'))) {
        return (
          <em key={`${baseKey}_em_${subIdx}`} style={{ fontStyle: 'italic', color: '#44403C' }}>
            {subPart.slice(1, -1)}
          </em>
        );
      }
      return subPart;
    });
  });
}
