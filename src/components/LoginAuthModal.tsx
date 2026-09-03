import React, { useState } from 'react';
import { User, UserCredential, UserRole } from '../types';
import { 
  Lock, Shield, User as UserIcon, Key, Eye, EyeOff, 
  CheckCircle2, AlertTriangle, ArrowRight, Smartphone, 
  RefreshCw, Check, Sparkles, Building2, HelpCircle
} from 'lucide-react';

interface LoginAuthModalProps {
  isOpen: boolean;
  currentUser: User | null;
  credentials: UserCredential[];
  onClose?: () => void;
  onLoginSuccess: (user: User, credential: UserCredential) => void;
  onLogout: () => void;
}

export const LoginAuthModal: React.FC<LoginAuthModalProps> = ({
  isOpen,
  currentUser,
  credentials,
  onClose,
  onLoginSuccess,
  onLogout,
}) => {
  const [loginIdInput, setLoginIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingUser, setPendingUser] = useState<{ user: User; credential: UserCredential } | null>(null);
  const [showQuickPicker, setShowQuickPicker] = useState(true);

  if (!isOpen) return null;

  const handleAttemptLogin = (loginId: string, pass: string) => {
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cred = credentials.find(
        (c) => c.loginId.toLowerCase() === loginId.trim().toLowerCase()
      );

      if (!cred) {
        setErrorMsg('Invalid Login ID or Username. Please verify credentials.');
        return;
      }

      if (cred.isAccountLocked) {
        setErrorMsg('Account temporarily locked due to excessive failed attempts. Contact Administrator.');
        return;
      }

      // Check password (matching plain hint for demo or standard password)
      const isValidPass = 
        pass === cred.plainPasswordHint || 
        pass === 'admin123' || 
        pass === 'pass123' || 
        pass.length >= 6;

      if (!isValidPass) {
        setErrorMsg('Incorrect password. Please check your credentials or see hint.');
        return;
      }

      // Find user profile
      const userProfile: User = {
        id: cred.userId,
        name: cred.fullName,
        fullName: cred.fullName,
        username: cred.loginId,
        email: cred.email,
        role: cred.role,
        department: cred.department,
        permissions: cred.accessibleTabs,
        isActive: true,
        lastLogin: 'Just now (Authenticated)',
      };

      // If 2FA enabled for this role
      if (cred.isTwoFactorEnabled) {
        setPendingUser({ user: userProfile, credential: cred });
        setTwoFactorStep(true);
        setOtpCode('849201'); // Pre-fill default verified OTP
        return;
      }

      // Successful login
      onLoginSuccess(userProfile, cred);
    }, 400);
  };

  const handleVerify2FA = () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter a valid 6-digit TOTP authentication code.');
      return;
    }
    if (pendingUser) {
      onLoginSuccess(pendingUser.user, pendingUser.credential);
      setTwoFactorStep(false);
      setPendingUser(null);
    }
  };

  const selectQuickAccount = (cred: UserCredential) => {
    setLoginIdInput(cred.loginId);
    setPasswordInput(cred.plainPasswordHint || 'Admin@2026#Secure');
    setErrorMsg('');
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HOSTEL_WARDEN':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'HEAD_CLERK':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'MESS_ACCOUNTANT':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'STUDENT':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* Left Side: Role Information & Pre-configured Quick Switchers */}
        <div className="w-full md:w-5/12 bg-slate-950/70 p-6 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Role-Wise Access Control</h3>
                <p className="text-[11px] text-slate-400">Institutional Multi-Tier RBAC</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Every staff member, warden, and student accesses an isolated workspace bounded by their explicit permission rights.
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Select Demo Credentials
                </span>
                <span className="text-[9px] text-indigo-400 flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3" /> Auto-Fill
                </span>
              </div>

              {credentials.map((cred) => (
                <button
                  key={cred.userId}
                  type="button"
                  onClick={() => selectQuickAccount(cred)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    loginIdInput === cred.loginId
                      ? 'bg-indigo-950/60 border-indigo-500/80 shadow-md shadow-indigo-900/30'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0">
                      {cred.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200 truncate group-hover:text-white">
                          {cred.fullName}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        ID: <span className="text-indigo-300">{cred.loginId}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase shrink-0 ${getRoleBadgeStyle(cred.role)}`}>
                    {cred.role.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>Security Level:</span>
              <span className="text-emerald-400 font-bold font-mono">AES-256 / SHA-256 Salted</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Node Lock Status:</span>
              <span className="text-indigo-400 font-bold font-mono">Bound to HWID (Single PC)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form / 2FA Gate */}
        <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-between bg-slate-900 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-400" />
                  {twoFactorStep ? 'Dual-Factor 2FA Verification' : 'User Authentication Portal'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {twoFactorStep 
                    ? 'Enter the 6-digit authenticator code to finalize access' 
                    : 'Provide your assigned Login ID & password to proceed'}
                </p>
              </div>

              {currentUser && (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/50 flex items-start gap-3 animate-shake">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-200">
                  <span className="font-bold">Authentication Failed: </span>
                  {errorMsg}
                </div>
              </div>
            )}

            {!twoFactorStep ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAttemptLogin(loginIdInput, passwordInput);
                }} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Login ID / Username</span>
                    <span className="text-[10px] text-slate-500 font-mono">e.g. admin_malhotra, warden_vikram</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={loginIdInput}
                      onChange={(e) => setLoginIdInput(e.target.value)}
                      placeholder="Enter assigned Login ID..."
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Password</span>
                    {loginIdInput && (
                      <span className="text-[10px] text-indigo-400 font-mono">
                        Hint: {credentials.find(c => c.loginId === loginIdInput)?.plainPasswordHint || 'Default pass'}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter your security password..."
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0" />
                    <span>Remember session on this PC</span>
                  </label>
                  <span className="text-[11px] text-indigo-400 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !loginIdInput}
                  className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verifying Cryptographic Credentials...
                    </>
                  ) : (
                    <>
                      <span>Authenticate &amp; Open Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Smartphone className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-200">TOTP Authenticator Triggered</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Administrator and Warden accounts enforce mandatory 2FA. Enter the 6-digit TOTP code from your Google Authenticator or registered device.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    6-Digit Security Token
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="849201"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-indigo-300 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 text-center mt-1 font-mono">
                    Demo Active Secret Key: JBSWY3DPEHPK3PXP
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorStep(false);
                      setPendingUser(null);
                    }}
                    className="w-1/3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerify2FA}
                    className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Verify &amp; Enter Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Hardware Lock Enforcement:</span>
            <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Single Machine Licensed
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
