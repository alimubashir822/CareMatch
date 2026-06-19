'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { LogOut, User as UserIcon, LayoutDashboard, Search, HeartPulse, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-teal-600 dark:text-teal-400">
            <HeartPulse className="text-teal-600 dark:text-teal-400 shrink-0" size={24} />
            <span>CareMatch</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/find-doctors" 
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1.5 transition duration-150"
            >
              <Search size={15} />
              Find Doctors
            </Link>
            <Link 
              href="/#how-it-works" 
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition duration-150"
            >
              How It Works
            </Link>
            <Link 
              href="/#pricing" 
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition duration-150"
            >
              Pricing
            </Link>
          </nav>
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-3">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href={`/dashboard/${user.role.toLowerCase()}`}
                    className="text-xs font-semibold px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/80 flex items-center gap-1.5 transition duration-150"
                  >
                    <LayoutDashboard size={14} />
                    <span className="hidden sm:inline">Portal</span>
                  </Link>

                  {/* User Profile Info */}
                  <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/25"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden lg:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-150 cursor-pointer"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2">
                    <Link
                      href="/login"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 px-3 py-2 transition duration-150"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="text-sm font-semibold px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/10 hover:shadow-teal-600/15 transition duration-150"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Hamburger menu button for small screens */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-4 py-3 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <Link 
            href="/find-doctors" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            <Search size={16} />
            Find Doctors
          </Link>
          <Link 
            href="/#how-it-works" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            How It Works
          </Link>
          <Link 
            href="/#pricing" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Pricing
          </Link>

          {!loading && !user && (
            <div className="pt-3 mt-3 border-t border-slate-150 dark:border-slate-800 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 block"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2 text-center text-xs font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 block"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
