import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './monacoSetup';

// Note: intentionally NOT using React.StrictMode here. StrictMode's
// double mount/unmount/remount in development conflicts with Monaco
// Editor's model lifecycle (@monaco-editor/react issue: "TextModel got
// disposed before DiffEditorWidget model got reset"). StrictMode has no
// effect on production builds anyway, so this only changes dev behavior.
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
