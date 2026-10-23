import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import PasswordInput from '../components/auth/PasswordInput';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  useEffect(() => {
    document.title = 'Log in | DocuMentor AI';
  }, []);

  const validateField = (field, value) => {
    let error = '';
    if (field === 'email') {
      const emailTrimmed = value.trim();
      if (!emailTrimmed) {
        error = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
        error = 'Please enter a valid email address.';
      }
    } else if (field === 'password') {
      if (!value) {
        error = 'Password is required.';
      }
    }
    return error;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, field === 'email' ? email : password);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const emailErr = validateField('email', email);
    const passwordErr = validateField('password', password);

    const newErrors = { email: emailErr, password: passwordErr };
    setErrors(newErrors);
    setTouched({ email: true, password: true });

    if (emailErr) {
      emailInputRef.current?.focus();
      return;
    }
    if (passwordErr) {
      passwordInputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const result = await login({ email, password });
      const firstName = result.user?.name ? result.user.name.split(' ')[0] : 'there';
      toast.success(`Welcome back, ${firstName}!`);
      navigate('/', { replace: true });
    } catch (err) {
      const errorMsg = err.message || 'Invalid email or password';
      setServerError(errorMsg);
      if (err.isNetwork) {
        toast.error('Network error. Unable to reach server.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue accessing your private study notes and chats."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Inline Server Error Alert */}
        {serverError && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs leading-relaxed"
          >
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Email Field */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Email address
          </label>
          <input
            ref={emailInputRef}
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            spellCheck="false"
            autoFocus
            disabled={submitting}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched.email) {
                setErrors((prev) => ({ ...prev, email: validateField('email', e.target.value) }));
              }
            }}
            onBlur={() => handleBlur('email')}
            placeholder="student@university.edu"
            aria-invalid={Boolean(touched.email && errors.email)}
            aria-describedby={touched.email && errors.email ? 'login-email-error' : undefined}
            className={`w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200 outline-none
              bg-white/70 dark:bg-white/5 border text-ink dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
              ${
                touched.email && errors.email
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-200 dark:border-white/10 focus:border-lilac-500 dark:focus:border-lilac-400 focus:ring-2 focus:ring-lilac-500/20'
              }
              disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          {touched.email && errors.email && (
            <p id="login-email-error" className="mt-1 text-xs text-red-500 font-medium">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Password
            </label>
          </div>
          <PasswordInput
            ref={passwordInputRef}
            id="login-password"
            name="password"
            autoComplete="current-password"
            disabled={submitting}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (touched.password) {
                setErrors((prev) => ({ ...prev, password: validateField('password', e.target.value) }));
              }
            }}
            onBlur={() => handleBlur('password')}
            placeholder="••••••••"
            error={touched.password && errors.password}
            aria-describedby={touched.password && errors.password ? 'login-password-error' : undefined}
          />
          {touched.password && errors.password && (
            <p id="login-password-error" className="mt-1 text-xs text-red-500 font-medium">
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-ink dark:bg-white text-white dark:text-ink font-semibold text-sm shadow-md hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-lilac-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Logging in...</span>
            </>
          ) : (
            <>
              <span>Log in</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Signup Redirect Link */}
        <div className="text-center pt-3 text-xs text-slate-600 dark:text-slate-400">
          <span>New here? </span>
          <Link
            to="/signup"
            className="font-bold text-lilac-600 dark:text-lilac-400 hover:underline focus:outline-none"
          >
            Create an account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
