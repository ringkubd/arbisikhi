import React from 'react';
import {AlertTriangle, RefreshCw} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
  isQuotaError: boolean;
}

export class FirestoreErrorBoundary extends React.Component<
  {children: React.ReactNode},
  ErrorBoundaryState
> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = {
      hasError: false,
      message: '',
      isQuotaError: false,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const raw = error?.message || 'Unexpected cloud sync error';
    const isQuota = raw.toLowerCase().includes('quota exceeded');
    return {
      hasError: true,
      message: raw,
      isQuotaError: isQuota,
    };
  }

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const upgradeUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data?openUpgradeDialog=true`;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full rounded-3xl border border-slate-200 bg-white p-8 space-y-4">
          <div className="flex items-center gap-3 text-amber-700">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <h1 className="text-lg font-bold text-slate-900">
              {this.state.isQuotaError
                ? 'Daily Cloud Database Quota Reached'
                : 'Cloud Sync Error'}
            </h1>
          </div>

          {this.state.isQuotaError ? (
            <p className="text-sm text-slate-600 leading-relaxed">
              Your free daily Firestore quota has been reached and will automatically reset tomorrow. You can review Spark plan limits or upgrade your database in the{' '}
              <a
                href={upgradeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-semibold underline"
              >
                Firebase Console
              </a>
              .
            </p>
          ) : (
            <p className="text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 break-all">
              {this.state.message}
            </p>
          )}

          <button
            type="button"
            onClick={() => this.setState({hasError: false, message: '', isQuotaError: false})}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            Continue Learning Locally
          </button>
        </div>
      </div>
    );
  }
}
