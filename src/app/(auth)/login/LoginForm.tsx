'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { LoginSchema } from '@/schemas/auth.schema';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    console.log('handleSubmit called'); // ← add this
    console.log('form:', form); // ← and this

    // 1. client side validation
    const result = LoginSchema.safeParse(form);
    console.log('validation:', result); // ← and this

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // 2. call NextAuth signIn
    setLoading(true);
    setServerError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: form.email,
        password: form.password,
      });
      console.log('res:', JSON.stringify(res)); // ← add this

      if (res?.error) {
        setServerError('Invalid email or password');
        return;
      }

      // 3. redirect to home on success
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      console.log('callbackUrl:', callbackUrl); // ← add this
      window.location.replace(callbackUrl);

      // router.push(callbackUrl);
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='min-h-screen bg-[#F7F6F3] flex items-center justify-center px-4 py-12'>
      <div className='w-full max-w-sm'>
        {/* Logo / wordmark */}
        <div className='mb-10 text-center'>
          <span className='text-2xl font-bold tracking-tight text-[#1A1916]'>
            shop.
          </span>
          <p className='mt-2 text-sm text-[#8B8680]'>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className='bg-white rounded-3xl border border-[#EBEBEB] shadow-sm p-8'>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            noValidate
          >
            <div className='flex flex-col gap-5'>
              {/* Email */}
              <div className='flex flex-col gap-1.5'>
                <label
                  htmlFor='email'
                  className='text-xs font-semibold uppercase tracking-widest text-[#8B8680]'
                >
                  Email
                </label>
                <input
                  id='email'
                  type='email'
                  autoComplete='email'
                  placeholder='you@example.com'
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full rounded-xl border bg-[#F7F6F3] px-4 py-3 text-sm text-[#1A1916] placeholder-[#C9C5BF] outline-none transition-all focus:bg-white focus:ring-2 ${
                    errors.email
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
                      : 'border-[#E0DDD8] focus:border-[#1A1916] focus:ring-[#1A1916]/10'
                  }`}
                />
                {errors.email && (
                  <p className='text-xs text-red-500 mt-0.5'>{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className='flex flex-col gap-1.5'>
                <div className='flex items-center justify-between'>
                  <label
                    htmlFor='password'
                    className='text-xs font-semibold uppercase tracking-widest text-[#8B8680]'
                  >
                    Password
                  </label>
                  <span className='text-xs text-[#A09A93] cursor-default'>
                    Forgot password?
                  </span>
                </div>
                <div className='relative'>
                  <input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    autoComplete='current-password'
                    placeholder='••••••••'
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className={`w-full rounded-xl border bg-[#F7F6F3] px-4 py-3 pr-11 text-sm text-[#1A1916] placeholder-[#C9C5BF] outline-none transition-all focus:bg-white focus:ring-2 ${
                      errors.password
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
                        : 'border-[#E0DDD8] focus:border-[#1A1916] focus:ring-[#1A1916]/10'
                    }`}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword((v) => !v)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-[#A09A93] hover:text-[#1A1916] transition-colors p-1'
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      // Eye-off icon
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='18'
                        height='18'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94' />
                        <path d='M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19' />
                        <line x1='1' y1='1' x2='23' y2='23' />
                      </svg>
                    ) : (
                      // Eye icon
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='18'
                        height='18'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                        <circle cx='12' cy='12' r='3' />
                      </svg>
                    )}
                  </button>
                  {errors.password && (
                    <p className='text-xs text-red-500 mt-0.5'>
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              {serverError && (
                <p className='text-xs text-red-500 text-center'>
                  {serverError}
                </p>
              )}
              {/* Submit */}
              <button
                type='submit'
                disabled={loading}
                className='mt-1 w-full rounded-2xl bg-[#1A1916] py-3.5 text-sm font-semibold text-white tracking-wide transition-all hover:bg-[#2D2C2A] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100'
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>

        {/* Register link */}
        <p className='mt-6 text-center text-sm text-[#8B8680]'>
          Don&apos;t have an account?{' '}
          <Link
            href='/register'
            className='font-semibold text-[#1A1916] underline underline-offset-2 hover:opacity-70 transition-opacity'
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
