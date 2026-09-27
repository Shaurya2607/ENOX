import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { authService } from '../../services/authService';
import { Button } from '../../components/ui/Button';
import { ENOXCore } from '../../components/ui/ENOXCore';
import { GithubIcon } from '../../components/common/Icons';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export const AuthPage = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('alex.vance@enox.dev');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [name, setName] = useState('Alex Vance');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { setUser } = useAppStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await authService.login({ email, password });
      setUser(res.user);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await authService.register({ name, email, password, confirmPassword });
      setUser(res.user);
      toast.success(`Account created! Welcome to ENOX, ${res.user.name}!`);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e?.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await authService.forgotPassword(email);
      setSuccessMessage(res.message);
      toast.success(res.message);
    } catch (err) {
      setError(err.message || 'Failed to send reset instructions.');
      toast.error(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authService.login({ email: `${provider}@enox.dev`, provider });
      setUser(res.user);
      toast.success(`Authenticated via ${provider}`);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-enox-bg flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Restrained developer background: subtle grid & floating code fragments */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2d4515_1px,transparent_1px),linear-gradient(to_bottom,#1f2d4515_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Floating subtle ambient code fragments */}
      <div className="absolute top-12 left-16 text-slate-800/60 font-mono text-xs hidden lg:block select-none pointer-events-none">
        <code>{'const enox = new AutonomousAgentCluster({ concurrency: 3 });'}</code>
        <br />
        <code>{'await enox.dispatch({ target: "incidentOrchestrator.ts" });'}</code>
      </div>
      <div className="absolute bottom-16 right-20 text-slate-800/60 font-mono text-xs hidden lg:block select-none pointer-events-none">
        <code>{'// Zero-Trust verification: FIPS 204 Kyber/Dilithium verified'}</code>
        <br />
        <code>{'export const status = "HEALTHY_99.999%";'}</code>
      </div>

      {/* Center Auth Card */}
      <div className="relative w-full max-w-md bg-enox-surface/90 border border-enox-border rounded-2xl shadow-2xl backdrop-blur-xl p-8 z-10 transition-all duration-200">
        {/* Brand / Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <ENOXCore status="thinking" size="md" showLabel={false} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            ENOX
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/60 font-mono font-medium">
              DEV PLATFORM
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous AI-Assisted Developer Productivity Platform
          </p>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.vance@enox.dev"
                  className="w-full bg-enox-bg border border-enox-border rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMessage(null);
                    setMode('forgot');
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-enox-bg border border-enox-border rounded-lg pl-9 pr-9 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Sign In to Workspace
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-enox-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-enox-surface px-2 text-slate-500 font-mono">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleSocialAuth('github')}
                icon={<GithubIcon className="w-3.5 h-3.5 text-white" />}
              >
                GitHub
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleSocialAuth('google')}
                icon={<ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
              >
                Google SSO
              </Button>
            </div>

            <p className="text-center text-xs text-slate-400 mt-5">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setMode('register');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition"
              >
                Create Account
              </button>
            </p>
          </form>
        )}

        {/* REGISTER MODE */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Vance"
                  className="w-full bg-enox-bg border border-enox-border rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.vance@enox.dev"
                  className="w-full bg-enox-bg border border-enox-border rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-enox-bg border border-enox-border rounded-lg pl-9 pr-9 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-enox-bg border border-enox-border rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Create Account
            </Button>

            <p className="text-center text-xs text-slate-400 mt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setMode('login');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition"
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* FORGOT PASSWORD MODE */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.vance@enox.dev"
                  className="w-full bg-enox-bg border border-enox-border rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                We will send an encrypted zero-trust reset challenge link to your email.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full"
            >
              Reset Password
            </Button>

            <p className="text-center text-xs text-slate-400 mt-4">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setMode('login');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition"
              >
                Back to Sign In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
