'use client';

import { useState } from 'react';
import Link from 'next/link';

function EyeIcon() {
  return (
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
  );
}

function EyeOffIcon() {
  return (
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
  );
}

interface PasswordInputProps {
  id: string;
  label: string;
  autoComplete: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

function PasswordInput({
  id,
  label,
  autoComplete,
  value,
  onChange,
  error,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className='flex flex-col gap-1.5'>
      <label
        htmlFor={id}
        className='text-xs font-semibold uppercase tracking-widest text-[#8B8680]'
      >
        {label}
      </label>
      <div className='relative'>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder='••••••••'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border bg-[#F7F6F3] px-4 py-3 pr-11 text-sm text-[#1A1916] placeholder-[#C9C5BF] outline-none transition-all focus:bg-white focus:ring-2 ${
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
              : 'border-[#E0DDD8] focus:border-[#1A1916] focus:ring-[#1A1916]/10'
          }`}
        />
        <button
          type='button'
          onClick={() => setShow((v) => !v)}
          className='absolute right-3 top-1/2 -translate-y-1/2 text-[#A09A93] hover:text-[#1A1916] transition-colors p-1'
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <p className='text-xs text-red-500 mt-0.5'>{error}</p>}
    </div>
  );
}

export default function RegisterForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <main className='min-h-screen bg-[#F7F6F3] flex items-center justify-center px-4 py-12'>
      <div className='w-full max-w-sm'>
        {/* Logo / wordmark */}
        <div className='mb-10 text-center'>
          <span className='text-2xl font-bold tracking-tight text-[#1A1916]'>
            shop.
          </span>
          <p className='mt-2 text-sm text-[#8B8680]'>Create your account</p>
        </div>

        {/* Card */}
        <div className='bg-white rounded-3xl border border-[#EBEBEB] shadow-sm p-8'>
          <form onSubmit={(e) => e.preventDefault()} noValidate>
            <div className='flex flex-col gap-5'>
              {/* Name */}
              <div className='flex flex-col gap-1.5'>
                <label
                  htmlFor='name'
                  className='text-xs font-semibold uppercase tracking-widest text-[#8B8680]'
                >
                  Name
                </label>
                <input
                  id='name'
                  type='text'
                  autoComplete='name'
                  placeholder='Jane Smith'
                  className='w-full rounded-xl border border-[#E0DDD8] bg-[#F7F6F3] px-4 py-3 text-sm text-[#1A1916] placeholder-[#C9C5BF] outline-none transition-all focus:border-[#1A1916] focus:bg-white focus:ring-2 focus:ring-[#1A1916]/10'
                />
              </div>

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
                  className='w-full rounded-xl border border-[#E0DDD8] bg-[#F7F6F3] px-4 py-3 text-sm text-[#1A1916] placeholder-[#C9C5BF] outline-none transition-all focus:border-[#1A1916] focus:bg-white focus:ring-2 focus:ring-[#1A1916]/10'
                />
              </div>

              {/* Password */}
              <PasswordInput
                id='password'
                label='Password'
                autoComplete='new-password'
                value={password}
                onChange={setPassword}
              />

              {/* Confirm Password */}
              <PasswordInput
                id='confirm-password'
                label='Confirm Password'
                autoComplete='new-password'
                value={confirmPassword}
                onChange={setConfirmPassword}
                error={passwordMismatch ? 'Passwords do not match' : undefined}
              />

              {/* Submit */}
              <button
                type='submit'
                disabled={passwordMismatch}
                className='mt-1 w-full rounded-2xl bg-[#1A1916] py-3.5 text-sm font-semibold text-white tracking-wide transition-all hover:bg-[#2D2C2A] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100'
              >
                Create account
              </button>
            </div>
          </form>
        </div>

        {/* Login link */}
        <p className='mt-6 text-center text-sm text-[#8B8680]'>
          Already have an account?{' '}
          <Link
            href='/login'
            className='font-semibold text-[#1A1916] underline underline-offset-2 hover:opacity-70 transition-opacity'
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
