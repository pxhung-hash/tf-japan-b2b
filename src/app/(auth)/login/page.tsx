'use client'

import { useState } from 'react';
import { login, signup } from './actions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  // Quản lý trạng thái xem người dùng đang ở tab Login hay Register
  const [isLogin, setIsLogin] = useState(true);
  const [isPending, setIsPending] = useState(false);
  
  // Lấy các thông báo từ URL
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message');
  const successMessage = searchParams.get('success'); // Thông báo đăng ký thành công
  
  // Ưu tiên hiển thị thông báo thành công nếu có
  const displayMsg = errorMessage || successMessage;

  return (
    <div className="min-h-screen bg-white flex">
      {/* CỘT TRÁI: Branding */}
      <div className="hidden lg:flex w-1/2 bg-japan-indigo relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1565138146085-f112e4fbc875?q=80&w=1200')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-japan-indigo/50 to-japan-indigo"></div>
        
        <div className="relative z-10 p-16 max-w-lg">
          <Link href="/" className="flex items-center gap-3 mb-12 hover:opacity-80 transition">
            <div className="w-12 h-12 bg-japan-crimson rounded-sm flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-2xl">TF</span>
            </div>
            <span className="text-3xl font-black tracking-tighter text-white">JAPAN</span>
          </Link>

          <h2 className="text-4xl font-black text-white leading-tight mb-6">
            The Gateway to <br/> Premium Manufacturing.
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Join our exclusive network of global buyers. Gain direct access to verified Japanese SMEs, transparent pricing, and secure end-to-end trading.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-300 font-medium">
              <span className="w-5 h-5 rounded-full bg-japan-gold/20 text-japan-gold flex items-center justify-center text-xs">✓</span>
              Zero Language Barriers
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300 font-medium">
              <span className="w-5 h-5 rounded-full bg-japan-gold/20 text-japan-gold flex items-center justify-center text-xs">✓</span>
              Export & Legal Compliance
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300 font-medium">
              <span className="w-5 h-5 rounded-full bg-japan-gold/20 text-japan-gold flex items-center justify-center text-xs">✓</span>
              Dedicated Sales Negotiation
            </div>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: Form Đăng nhập / Đăng ký */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16">
        <div className="w-full max-w-md">
          
          {/* Logo hiện trên mobile */}
          <Link href="/" className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-japan-crimson rounded-sm flex items-center justify-center shadow-inner">
              <span className="text-white font-black text-xl">TF</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-japan-indigo">JAPAN</span>
          </Link>

          <div className="mb-10">
            <h1 className="text-3xl font-black text-japan-indigo mb-2">
              {isLogin ? 'Welcome Back' : 'Apply for Account'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isLogin 
                ? 'Enter your credentials to access your portal.' 
                : 'Submit your details to join our exclusive B2B network.'}
            </p>
          </div>

          {/* Hiển thị thông báo (Xanh cho thành công, Đỏ cho lỗi) */}
          {displayMsg && (
            <div className={`mb-6 p-4 rounded-sm text-sm font-bold border-l-4 ${successMessage ? 'bg-green-50 text-green-700 border-green-500' : 'bg-red-50 text-red-700 border-red-500'}`}>
              {displayMsg}
            </div>
          )}

          <form 
            action={async (formData) => {
              setIsPending(true);
              if (isLogin) {
                await login(formData);
              } else {
                await signup(formData);
              }
              setIsPending(false);
            }} 
            className="space-y-4"
          >
            {isLogin ? (
              /* ================== FORM ĐĂNG NHẬP ================== */
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2" htmlFor="email">
                    Work Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:border-japan-indigo focus:ring-1 focus:ring-japan-indigo outline-none transition bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:border-japan-indigo focus:ring-1 focus:ring-japan-indigo outline-none transition bg-gray-50 focus:bg-white"
                  />
                </div>
              </>
            ) : (
              /* ================== FORM ĐĂNG KÝ B2B (TIER 1) ================== */
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">First Name</label>
                    <input name="firstName" required className="w-full px-3 py-2.5 border border-gray-300 rounded-sm text-sm focus:border-japan-indigo outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Last Name</label>
                    <input name="lastName" required className="w-full px-3 py-2.5 border border-gray-300 rounded-sm text-sm focus:border-japan-indigo outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Work Email (Required)</label>
                  <input name="email" type="email" required placeholder="name@company.com" className="w-full px-3 py-2.5 border border-gray-300 rounded-sm text-sm focus:border-japan-indigo outline-none" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Company Name</label>
                  <input name="company" required className="w-full px-3 py-2.5 border border-gray-300 rounded-sm text-sm focus:border-japan-indigo outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Job Title / Position</label>
                    <input name="position" required placeholder="e.g. Sourcing Manager" className="w-full px-3 py-2.5 border border-gray-300 rounded-sm text-sm focus:border-japan-indigo outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Country</label>
                    <select name="country" required className="w-full px-3 py-2.5 border border-gray-300 rounded-sm text-sm focus:border-japan-indigo outline-none bg-white">
                      <option value="">Select...</option>
                      <option value="US">United States</option>
                      <option value="EU">European Union</option>
                      <option value="JP">Japan</option>
                      <option value="VN">Vietnam</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Set Password</label>
                  <input name="password" type="password" required className="w-full px-3 py-2.5 border border-gray-300 rounded-sm text-sm focus:border-japan-indigo outline-none" />
                </div>
              </>
            )}

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-japan-indigo text-white font-bold py-3.5 rounded-sm shadow-md hover:bg-opacity-90 transition disabled:bg-gray-400 mt-6"
            >
              {isPending ? 'Processing...' : (isLogin ? 'Sign In to Portal' : 'Access Buyer Portal')}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            {isLogin ? (
              <p>
                Don't have an account?{' '}
                <button onClick={() => setIsLogin(false)} className="text-japan-crimson font-bold hover:underline">
                  Apply here
                </button>
              </p>
            ) : (
              <p>
                Already a verified partner?{' '}
                <button onClick={() => setIsLogin(true)} className="text-japan-indigo font-bold hover:underline">
                  Sign in
                </button>
              </p>
            )}
          </div>
          
          <p className="mt-12 text-xs text-gray-400 text-center">
            By accessing this portal, you agree to ZENIX Japan's <br/> Terms of Service and Privacy Policy.
          </p>

        </div>
      </div>
    </div>
  );
}