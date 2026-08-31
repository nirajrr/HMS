import React, { useState } from 'react';
import { User, ActivityLog } from '../types';
import { 
  Shield, UserCheck, Key, Lock, Plus, Check, AlertCircle, 
  Eye, RefreshCw, UserPlus, Users, Terminal, CheckCircle2
} from 'lucide-react';

interface RbacUserManagementProps {
  users?: User[];
  currentUser?: User;
  onSwitchUser?: (user: User) => void;
  onAddUser?: (user: Omit<User, 'id' | 'createdAt'>) => void;
  onChangePassword?: (userId: string, newPass: string) => void;
}

export const RbacUserManagement: React.FC<RbacUserManagementProps> = ({
  users = [],
  currentUser = {
    id: 'usr_001',
    username: 'superadmin',
    fullName: 'Dr. Rajeshwar Sharma',
    role: 'SUPER_ADMIN',
    email: 'admin@hostel.edu.in',
    department: 'Central Administration',
    permissions: [
      'STUDENT_MANAGE', 'ROOM_MANAGE', 'FINANCE_VIEW', 'MAINTENANCE_APPROVE',
      'POLICE_COMPLIANCE_EXECUTE', 'ROLE_MANAGEMENT', 'ROOM_SWAP_APPROVE', 'MESS_COLLECT', 'ACTIVITY_LOG_VIEW'
    ],
    isActive: true,
    createdAt: '2025-01-01',
  },
  onSwitchUser,
  onAddUser,
  onChangePassword,
}) => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState<User | null>(null);

  // New User Form State
  const [newUserData, setNewUserData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'HEAD_CLERK' as User['role'],
    department: 'Hostel Administration',
    permissions: [
      'STUDENT_MANAGE', 'ROOM_MANAGE', 'MESS_COLLECT', 'ACTIVITY_LOG_VIEW'
    ],
    isActive: true,
  });

  // Password Form State
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const allAvailablePermissions = [
    { id: 'STUDENT_MANAGE', label: 'Student Records & Admissions', desc: 'Create, edit and manage resident profiles' },
    { id: 'ROOM_MANAGE', label: 'Room Allotment & Swapping', desc: 'Assign beds, execute Chain-of-Thought swaps, empty rooms' },
    { id: 'MESS_MANAGE', label: 'Mess Ledger & Adjustments', desc: 'Add/subtract diet charges and record adjustments' },
    { id: 'MESS_COLLECT', label: 'Mess Payment Collection', desc: 'Receive mess payments and issue official receipts' },
    { id: 'BANK_TREASURY_MANAGE', label: 'Multi-Bank Accounts & Treasury', desc: 'Link banks, monitor liquidity & automated reconciliations' },
    { id: 'MAINTENANCE_SUPERVISE', label: 'Facilities Maintenance Orders', desc: 'Issue repair requests and assign technicians' },
    { id: 'MAINTENANCE_HIGH_COST_APPROVE', label: 'High-Cost ($500+) Repairs Approval', desc: 'Cryptographic authorization for expensive repairs' },
    { id: 'POLICE_VERIFICATION_DISPATCH', label: 'Police Compliance & CCTNS Dispatch', desc: 'Generate statutory forms and send digital verification' },
    { id: 'USER_RBAC_ADMIN', label: 'User RBAC & Permission Delegation', desc: 'Create and configure staff access profiles' },
    { id: 'ACTIVITY_LOG_VIEW', label: 'Immutable Audit Trail Access', desc: 'Review real-time security events and transactions' },
  ];

  const handlePermissionToggle = (permId: string) => {
    if (newUserData.permissions.includes(permId)) {
      setNewUserData({
        ...newUserData,
        permissions: newUserData.permissions.filter((p) => p !== permId),
      });
    } else {
      setNewUserData({
        ...newUserData,
        permissions: [...newUserData.permissions, permId],
      });
    }
  };

  const handleRolePresetChange = (role: User['role']) => {
    let defaultPerms: string[] = [];
    if (role === 'SUPER_ADMIN') {
      defaultPerms = allAvailablePermissions.map(p => p.id);
    } else if (role === 'HEAD_CLERK') {
      defaultPerms = ['STUDENT_MANAGE', 'ROOM_MANAGE', 'MESS_COLLECT', 'ACTIVITY_LOG_VIEW', 'POLICE_VERIFICATION_DISPATCH'];
    } else if (role === 'MESS_ACCOUNTANT') {
      defaultPerms = ['MESS_MANAGE', 'MESS_COLLECT', 'ACTIVITY_LOG_VIEW'];
    } else if (role === 'HOSTEL_WARDEN') {
      defaultPerms = ['STUDENT_MANAGE', 'ROOM_MANAGE', 'MAINTENANCE_SUPERVISE', 'MAINTENANCE_HIGH_COST_APPROVE', 'POLICE_VERIFICATION_DISPATCH', 'ACTIVITY_LOG_VIEW'];
    } else if (role === 'STUDENT') {
      defaultPerms = ['ACTIVITY_LOG_VIEW'];
    }

    setNewUserData({
      ...newUserData,
      role,
      permissions: defaultPerms,
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.username || !newUserData.fullName) return;

    onAddUser({
      ...newUserData,
      lastLogin: 'Never',
    });

    setShowAddUserModal(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    if (!newPassInput || newPassInput.length < 6) {
      setPassError('New password must be at least 6 characters');
      return;
    }
    if (newPassInput !== confirmPassInput) {
      setPassError('New passwords do not match');
      return;
    }

    if (showPassModal) {
      onChangePassword(showPassModal.id, newPassInput);
      setPassSuccess(true);
      setTimeout(() => {
        setPassSuccess(false);
        setShowPassModal(null);
        setCurrentPassInput('');
        setNewPassInput('');
        setConfirmPassInput('');
      }, 1200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active User Switcher / Simulator Bar */}
      <div className="bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">{currentUser.fullName}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500 text-white shadow">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Active Session: @{currentUser.username} • {currentUser.email}
              </p>
            </div>
          </div>

          {/* Quick Role Tester Switcher */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold px-2">Simulate Role:</span>
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => onSwitchUser(u)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentUser.id === u.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {u.role.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Accounts Management Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Role-Based Access Control (RBAC) &amp; Staff Accounts
            </h3>
            <p className="text-xs text-slate-400">
              Assign least-privilege permissions, manage credentials, and audit security accounts
            </p>
          </div>

          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Provision Staff Account
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <div
              key={u.id}
              className={`bg-slate-950 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                currentUser.id === u.id ? 'border-indigo-500/50 shadow-indigo-500/10 shadow-lg' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{u.fullName}</h4>
                    <span className="text-xs text-slate-400 font-mono">@{u.username}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-indigo-400 border border-slate-700">
                    {u.role.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-400 space-y-1">
                  <div>Department: <strong className="text-slate-300">{u.department}</strong></div>
                  <div>Email: <strong className="text-slate-300">{u.email}</strong></div>
                  <div className="text-[11px] text-slate-500">Last login: {u.lastLogin || 'Recent'}</div>
                </div>

                {/* Granted Permissions preview */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
                    Granted Permissions ({u.permissions.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {u.permissions.slice(0, 3).map((p, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-mono">
                        {p}
                      </span>
                    ))}
                    {u.permissions.length > 3 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                        +{u.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setShowPassModal(u)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Change Password
                </button>

                {currentUser.id !== u.id && (
                  <button
                    onClick={() => onSwitchUser(u)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Switch to Role
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add User Account */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Provision Staff Account</h3>
                  <p className="text-xs text-slate-400">Configure credentials &amp; granular capability grants</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Username *</label>
                  <input
                    type="text"
                    value={newUserData.username}
                    onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                    placeholder="e.g. clerk_himalaya"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-100 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    value={newUserData.fullName}
                    onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                    placeholder="e.g. Suresh Varma"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    placeholder="staff@hostel-erp.edu"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Role Preset *</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => handleRolePresetChange(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="HEAD_CLERK">Head Clerk</option>
                    <option value="MESS_ACCOUNTANT">Mess Accountant</option>
                    <option value="HOSTEL_WARDEN">Hostel Warden</option>
                    <option value="SUPER_ADMIN">Super Administrator</option>
                    <option value="RECEPTIONIST">Receptionist / Front Desk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Granular Permissions &amp; Access Rights
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {allAvailablePermissions.map((perm) => {
                    const isChecked = newUserData.permissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`p-2 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-indigo-950/40 border-indigo-500/40 text-slate-100'
                            : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handlePermissionToggle(perm.id)}
                          className="mt-0.5 accent-indigo-600 rounded cursor-pointer"
                        />
                        <div>
                          <span className="font-semibold block text-slate-200">{perm.label}</span>
                          <span className="text-[10px] text-slate-500 leading-tight block">{perm.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20"
                >
                  Create &amp; Issue Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Change Password */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Change Account Password</h3>
                  <p className="text-xs text-slate-400">For @{showPassModal.username} ({showPassModal.fullName})</p>
                </div>
              </div>
              <button
                onClick={() => setShowPassModal(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {passSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Password updated successfully!
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
                {passError && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px]">
                    {passError}
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-medium mb-1">New Password *</label>
                  <input
                    type="password"
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    value={confirmPassInput}
                    onChange={(e) => setConfirmPassInput(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                    required
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassModal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-600/20"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
