import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import PasswordInput from '../components/auth/PasswordInput';
import PasswordStrength from '../components/auth/PasswordStrength';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  useEffect(() => {
    document.title = 'Sign up | DocuMentor AI';
  }, []);

  const validateField = (field, value, allValues = {}) => {
    let error = '';
    const currentPass = allValues.password !== undefined ? allValues.password : password;

    if (field === 'name') {
      const trimmed = value.trim();
      if (!trimmed) {
        error = 'Full name is required.';
      } else if (trimmed.length < 2 || trimmed.length > 60) {
        error = 'Name must be between 2 and 60 characters.';
      }
    } else if (field === 'email') {
      const emailTrimmed = value.trim();
      if (!emailTrimmed) {
        error = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
        error = 'Please enter a valid email address.';
      }
    } else if (field === 'password') {
      if (!value) {
        error = 'Password is required.';
      } else if (value.length < 8 || value.length > 72) {
        error = 'Password must be between 8 and 72 characters.';
      } else if (!/[A-Za-z]/.test(value)) {
        error = 'Password must contain at least one letter.';
      } else if (!/\d/.test(value)) {
        error = 'Password must contain at least one number.';
      }
    } else if (field === 'confirmPassword') {
      if (!value) {
        error = 'Please confirm your password.';
      } else if (value !== currentPass) {
        error = 'Passwords do not match.';
      }
    }
    return error;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val =
      field === 'name'
        ? name
        : field === 'email'
        ? email
        : field === 'password'
        ? password
        : confirmPassword;
    const error = validateField(field, val, { password });
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const nameErr = validateField('name', name);
    const emailErr = validateField('email', email);
    const passErr = validateField('password', password);
    const confErr = validateField('confirmPassword', confirmPassword, { password });

    const newErrors = {
      name: nameErr,
      email: emailErr,
      password: passErr,
      confirmPassword: confErr,
    };
    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (nameErr) {
      nameInputRef.current?.focus();
      return;
    }
    if (emailErr) {
      emailInputRef.current?.focus();
      return;
    }
    if (passErr) {
      passwordInputRef.current?.focus();
      return;
    }
    if (confErr) {
      confirmPasswordInputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const result = await signup({ name, email, password });
      const firstName = result.user?.name ? result.user.name.split(' ')[0] : 'there';
      toast.success(`Welcome, ${firstName}!`);
      navigate('/', { replace: true });
    } catch (err) {
      const errorMsg = err.message || 'Failed to create account. Please try again.';
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
      title="Create your account"
      subtitle="Start chatting with your study material and generating revision aids."
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

        {/* Full Name */}
        <div>
          <label
            htmlFor="signup-name"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Full name
          </label>
          <input
            ref={nameInputRef}
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            autoFocus
            disabled={submitting}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (touched.name) {
                setErrors((prev) => ({ ...prev, name: validateField('name', e.target.value) }));
              }
            }}
            onBlur={() => handleBlur('name')}
            placeholder="Jane Doe"
            aria-invalid={Boolean(touched.name && errors.name)}
            aria-describedby={touched.name && errors.name ? 'signup-name-error' : undefined}
            className={`w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200 outline-none
              bg-white/70 dark:bg-white/5 border text-ink dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
              ${
                touched.name && errors.name
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-200 dark:border-white/10 focus:border-lilac-500 dark:focus:border-lilac-400 focus:ring-2 focus:ring-lilac-500/20'
              }
              disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          {touched.name && errors.name && (
            <p id="signup-name-error" className="mt-1 text-xs text-red-500 font-medium">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="signup-email"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Email address
          </label>
          <input
            ref={emailInputRef}
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            spellCheck="false"
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
            aria-describedby={touched.email && errors.email ? 'signup-email-error' : undefined}
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
            <p id="signup-email-error" className="mt-1 text-xs text-red-500 font-medium">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="signup-password"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Password
          </label>
          <PasswordInput
            ref={passwordInputRef}
            id="signup-password"
            name="password"
            autoComplete="new-password"
            disabled={submitting}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (touched.password) {
                setErrors((prev) => ({ ...prev, password: validateField('password', e.target.value) }));
              }
              if (touched.confirmPassword && confirmPassword) {
                setErrors((prev) => ({
                  ...prev,
                  confirmPassword: validateField('confirmPassword', confirmPassword, { password: e.target.value }),
                }));
              }
            }}
            onBlur={() => handleBlur('password')}
            placeholder="At least 8 characters with letters & numbers"
            error={touched.password && errors.password}
            aria-describedby={touched.password && errors.password ? 'signup-password-error' : undefined}
          />
          <PasswordStrength password={password} />
          {touched.password && errors.password && (
            <p id="signup-password-error" className="mt-1 text-xs text-red-500 font-medium">
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="signup-confirm-password"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Confirm password
          </label>
          <PasswordInput
            ref={confirmPasswordInputRef}
            id="signup-confirm-password"
            name="confirmPassword"
            autoComplete="new-password"
            disabled={submitting}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (touched.confirmPassword) {
                setErrors((prev) => ({
                  ...prev,
                  confirmPassword: validateField('confirmPassword', e.target.value, { password }),
                }));
              }
            }}
            onBlur={() => handleBlur('confirmPassword')}
            placeholder="Re-enter your password"
            error={touched.confirmPassword && errors.confirmPassword}
            aria-describedby={
              touched.confirmPassword && errors.confirmPassword ? 'signup-confirm-error' : undefined
            }
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <p id="signup-confirm-error" className="mt-1 text-xs text-red-500 font-medium">
              {errors.confirmPassword}
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
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Login Redirect Link */}
        <div className="text-center pt-3 text-xs text-slate-600 dark:text-slate-400">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="font-bold text-lilac-600 dark:text-lilac-400 hover:underline focus:outline-none"
          >
            Log in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
