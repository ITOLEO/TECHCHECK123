import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TechCheck Application Uncaught Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetToHome = () => {
    try {
      window.location.href = '/';
    } catch {
      window.location.hash = '';
      window.location.reload();
    }
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F6F2] dark:bg-[#0E0F12] text-[#111111] dark:text-[#EDEDED] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-[#16171D] rounded-2xl p-6 sm:p-8 shadow-xl border border-[#E9E9E6] dark:border-[#272932] text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h1 className="text-xl font-black mb-2 text-[#111111] dark:text-white">
              Terjadi Kesalahan Tampilan
            </h1>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
              Halaman ini mengalami kendala teknis saat memuat konten. Jangan khawatir, Anda dapat memuat ulang atau kembali ke beranda.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-neutral-100 dark:bg-neutral-900 rounded-xl text-left text-xs font-mono text-neutral-600 dark:text-neutral-400 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Muat Ulang
              </button>

              <button
                type="button"
                onClick={this.handleResetToHome}
                className="flex-1 py-3 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
