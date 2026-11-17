import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Login = () => {
  const { operators, login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState<UserRole>('supervisor');
  const [usernameInput, setUsernameInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  const roleFilteredOperators = operators.filter((op) => op.role === selectedRole);

  const handleSignIn = (usernameToUse: string) => {
    setErrorMessage(null);
    if (!usernameToUse.trim()) {
      setErrorMessage('Please enter a username or select a preset user.');
      return;
    }
    const success = login(usernameToUse);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(`No user found matching "${usernameToUse}". Use a preset user.`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-muted p-4 text-content">
      <div className="w-full bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 border-b border-amber-200 dark:border-amber-800">
        <div className="px-3 py-1.5 text-xs font-medium text-center">
          SIMULATED DATA - Design prototype. No sensors connected. Read-only monitoring only.
        </div>
      </div>
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-sm">
            MG
          </div>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-content">MillGuard</h1>
          <p className="text-xs text-content-muted">Feed Mill Condition Monitoring</p>
          <div className="mt-1.5 inline-flex items-center rounded-full border border-primary-border bg-primary-soft px-2.5 py-0.5 text-[11px] font-medium text-primary-soft-foreground">
            Sample Data - Concept Demo
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-3">
            <label className="mb-1 block text-[11px] font-semibold uppercase text-content-muted">
              Role
            </label>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-muted p-1 border border-border">
              <button
                type="button"
                onClick={() => { setSelectedRole('supervisor'); setErrorMessage(null); }}
                className={`flex items-center justify-center gap-1.5 rounded py-1.5 text-xs font-medium ${
                  selectedRole === 'supervisor' ? 'bg-surface text-content shadow-xs' : 'text-content-muted'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                Supervisor
              </button>
              <button
                type="button"
                onClick={() => { setSelectedRole('administrator'); setErrorMessage(null); }}
                className={`flex items-center justify-center gap-1.5 rounded py-1.5 text-xs font-medium ${
                  selectedRole === 'administrator' ? 'bg-surface text-content shadow-xs' : 'text-content-muted'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin
              </button>
            </div>
          </div>

          <div className="mb-3 space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase text-content-muted">
              Preset Users
            </label>
            {roleFilteredOperators.map((operator) => (
              <button
                key={operator.id}
                type="button"
                onClick={() => handleSignIn(operator.username)}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-1.5 text-left text-xs transition hover:border-primary hover:bg-surface-hover"
              >
                <span className="font-medium text-content">{operator.name}</span>
                <span className="text-[11px] text-content-muted">@{operator.username}</span>
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignIn(usernameInput);
            }}
            className="space-y-2 border-t border-border pt-3"
          >
            <input
              id="login-username"
              type="text"
              value={usernameInput}
              onChange={(e) => {
                setUsernameInput(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Or enter username (e.g. jsmith)"
              className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-content placeholder:text-content-muted focus:border-primary focus:outline-none"
            />

            {errorMessage ? (
              <div className="flex items-center gap-1.5 rounded border border-status-critical/30 bg-status-critical/10 p-1.5 text-xs text-status-critical">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            <button
              type="submit"
              className="flex min-h-[36px] w-full items-center justify-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};