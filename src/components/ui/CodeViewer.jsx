import React from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

export const CodeViewer = ({
  value,
  language = 'typescript',
  readOnly = true,
  isDiff = false,
  originalValue = '',
  height = '420px',
  onChange,
  className,
}) => {
  const editorOptions = {
    theme: 'vs-dark',
    readOnly,
    fontSize: 13,
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    minimap: { enabled: true, maxColumn: 60 },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    renderLineHighlight: 'all',
    automaticLayout: true,
    padding: { top: 12, bottom: 12 },
    tabSize: 2,
  };

  const loadingFallback = (
    <div className="flex items-center justify-center h-full min-h-[200px] bg-slate-950 text-slate-400 gap-2 text-sm font-mono border border-enox-border rounded-md">
      <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
      <span>Loading Monaco Engine...</span>
    </div>
  );

  return (
    <div className={`h-full overflow-hidden rounded-md border border-enox-border bg-slate-950 ${className || ''}`}>
      {isDiff ? (
        <DiffEditor
          height={height}
          language={language}
          original={originalValue}
          modified={value}
          theme="vs-dark"
          loading={loadingFallback}
          options={{
            ...editorOptions,
            enableSplitViewResizing: true,
            renderSideBySide: true,
            readOnly: true,
          }}
        />
      ) : (
        <Editor
          height={height}
          language={language}
          value={value}
          theme="vs-dark"
          loading={loadingFallback}
          options={editorOptions}
          onChange={onChange}
        />
      )}
    </div>
  );
};
