// Wires @monaco-editor/react up to the LOCAL monaco-editor package instead of
// letting it fetch the editor engine from cdn.jsdelivr.net at runtime.
//
// Why this matters: by default @monaco-editor/loader always pulls Monaco's
// core JS/CSS/workers from a CDN, even though `monaco-editor` already sits in
// node_modules. If that CDN request is blocked or unreachable (offline,
// corporate proxy, ad-blocker), the editor silently never initializes and you
// get a blank pane with no error and no code. Importing directly from the
// installed package removes that network dependency entirely.
//
// Import this file once, before any <Editor /> is rendered (CodeViewer.jsx
// does this at module load time).

import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

// NOTE: no "esm/vs/" prefix here — monaco-editor's package.json "exports"
// map already prepends that automatically for any subpath import.
import editorWorker from 'monaco-editor/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
  getWorker(_moduleId, label) {
    if (label === 'json') return new jsonWorker();
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker();
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker();
    if (label === 'typescript' || label === 'javascript') return new tsWorker();
    return new editorWorker();
  },
};

// Tell @monaco-editor/react to use this local instance instead of the CDN.
loader.config({ monaco });
