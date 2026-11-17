import { useState } from 'react';
import { Users, UserPlus, Shield, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const UserManagement = () => {
  const { operators, addOperator } = useApp();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('supervisor');
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!name.trim() || !username.trim()) {
      setErrorMessage('Please provide both full name and username.');
      return;
    }

    if (operators.some((o) => o.username.toLowerCase() === username.trim().toLowerCase())) {
      setErrorMessage('An operator with this username already exists.');
      return;
    }

    addOperator({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      role,
    });

    setName('');
    setUsername('');
    setRole('supervisor');
    setSuccessMessage(true);
    setTimeout(() => setSuccessMessage(false), 2500);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-5">
      <div>
        <h3 className="text-base font-semibold text-content flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          User Management (Administrator)
        </h3>
        <p className="mt-0.5 text-xs text-content-muted">
          Authorize maintenance engineers and supervisors for control room access.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-lg bg-status-normal/10 border border-status-normal/30 px-3 py-1.5 text-xs font-semibold text-status-normal flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" />
          New operator account created and authorized.
        </div>
      )}

      {/* Operator List */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-content-muted block">
          Authorized Accounts ({operators.length})
        </span>
        <div className="divide-y divide-border rounded-lg border border-border bg-surface">
          {operators.map((op) => (
            <div key={op.id} className="flex items-center justify-between p-3 text-xs">
              <div>
                <span className="font-semibold text-content block text-sm">{op.name}</span>
                <span className="text-content-muted">@{op.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider text-[10px] ${
                    op.role === 'administrator'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-surface-muted text-content-muted border border-border'
                  }`}
                >
                  <Shield className="h-3 w-3" />
                  {op.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add User Form */}
      <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-surface-muted/30 p-4 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-content flex items-center gap-1.5">
          <UserPlus className="h-4 w-4 text-primary" />
          Add Authorized Operator
        </span>

        {errorMessage && (
          <p className="text-xs font-semibold text-status-critical">{errorMessage}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-content-muted mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. David Miller"
              className="w-full min-h-[38px] rounded-lg border border-border bg-surface px-3 text-xs text-content placeholder:text-content-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-muted mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. dmiller"
              className="w-full min-h-[38px] rounded-lg border border-border bg-surface px-3 text-xs text-content placeholder:text-content-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-muted mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full min-h-[38px] rounded-lg border border-border bg-surface px-3 text-xs text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="supervisor">Supervisor</option>
              <option value="administrator">Administrator</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
};