import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ENOX Boundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-enox-bg flex items-center justify-center p-6 text-slate-100">
          <div className="max-w-md w-full bg-enox-card border border-rose-800/80 rounded-xl p-8 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-700 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Workspace Exception Caught</h2>
            <p className="text-sm text-slate-400 mb-6">
              ENOX platform encountered an unexpected runtime state. Telemetry has logged the stack trace.
            </p>
            <div className="text-left bg-slate-950 p-3 rounded font-mono text-xs text-rose-300 border border-slate-800 mb-6 overflow-x-auto max-h-32">
              {this.state.error?.message || 'Unknown runtime exception'}
            </div>
            <Button
              variant="primary"
              onClick={this.handleReset}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Reload Platform
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
