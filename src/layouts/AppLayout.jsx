import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/shell/Sidebar';
import { Topbar } from '../components/shell/Topbar';
import { CommandPalette } from '../components/shell/CommandPalette';
import { Toaster } from 'sonner';

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-enox-bg text-slate-100 font-sans antialiased">
      {/* Toast notifications */}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#111827',
            border: '1px solid #1f2d45',
            color: '#e2e8f0',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />

      {/* Global Command Palette */}
      <CommandPalette />

      {/* Persistent Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
