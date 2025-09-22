// Login.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FiUser, FiLock, FiEye, FiEyeOff, FiBriefcase } from "react-icons/fi";
import Swal from "sweetalert2";

const API_URL = import.meta?.env?.VITE_API_URL ?? "http://127.0.0.1:8000";

export default function Login({ onLogin, onSwitchToRegister, onForgot }) {
  const [form, setForm] = useState({
    company: "",
    userID: "",
    password: "",
    remember: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const pwdRef = useRef(null);

  // Load companies (API with graceful fallback)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setIsLoadingCompanies(true);
        const res = await fetch(`${API_URL}/api/companies`, { credentials: "include" });
        if (!res.ok) throw new Error();
        const list = await res.json();
        if (!alive) return;
        const opts = Array.isArray(list)
          ? list
          : list?.data ?? [];
        setCompanies(opts);
      } catch {
        // Fallback demo options (code + name or just a string)
        if (!alive) return;
        setCompanies([
          { id: "NAYSAPH", name: "NAYSA-SOLUTIONS INC." },
          { id: "NAYSASG", name: "NAYSA-SOLUTIONS" },
          { id: "NAYSATEST", name: "NAYSA" },
        ]);
      } finally {
        if (alive) setIsLoadingCompanies(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const handleCaps = (e) =>
    setCapsOn(e.getModifierState && e.getModifierState("CapsLock"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.userID.trim() || !form.password) return;
    setIsLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/api/login`, {
        userId: form.userID.trim(),      // backend expects `userId`
        password: form.password,
        company: form.company,           // send selected company (id/code)
      });

      if (data?.status === "success") {
        const normalizedUser = {
          userId:   data?.data?.userId   ?? form.userID.trim(),
          userID:   form.userID.trim(),
          username: data?.data?.username ?? form.userID.trim(),
          email:    data?.data?.email    ?? null,
          company:  data?.data?.company  ?? form.company,
        };

        localStorage.setItem("user", JSON.stringify(normalizedUser));
        onLogin?.(normalizedUser);

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Welcome back!",
          showConfirmButton: false,
          timer: 1800,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Login failed",
          text: data?.message || "Invalid credentials.",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Network error",
        text: err?.response?.data?.message || "Please try again.",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(to_bottom,#7392b7,#d8e1e9)]">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-indigo-300/30 to-sky-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-purple-500/25 to-fuchsia-400/25 blur-3xl" />
      </div>

      {/* Centered layout */}
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-start px-4 pt-10 md:pt-16 lg:pt-28">
        {/* Brand */}
        <div className="mb-4 md:mb-6 flex flex-col items-center text-center">
          <img src="/naysa_logo.png" alt="NAYSA Logo" className="w-50 drop-shadow-md md:w-44" />
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-blue-900 md:text-3xl">
            NAYSA Financials Cloud
          </h1>
        </div>

        {/* Auth card */}
        <div className="w-full max-w-md rounded-2xl border border-white/30 bg-white/30 p-6 shadow-xl backdrop-blur-md bg-[#7392b7]">
          <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-3">
            {/* Company (Dropdown) */}
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Company
              </span>
              <div className="relative">
                <FiBriefcase className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  required
                  disabled={isLoadingCompanies}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="" disabled>
                    {isLoadingCompanies ? "Loading companies..." : "Select company"}
                  </option>
                  {companies.map((c, idx) => {
                    const value = c?.id ?? c?.code ?? c?.value ?? c; // support various shapes
                    const label = c?.name ?? c?.label ?? c?.description ?? c;
                    return (
                      <option key={idx} value={value}>
                        {label}
                      </option>
                    );
                  })}
                </select>
                {/* simple chevron */}
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  ▾
                </span>
              </div>
            </label>

            {/* User ID */}
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                User ID
              </span>
              <div className="relative">
                <FiUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="userID"
                  autoComplete="username"
                  value={form.userID}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
                  placeholder="Enter your User ID"
                />
              </div>
            </label>

            {/* Password */}
            <label className="block">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </span>
                {capsOn && (
                  <span className="text-xs font-semibold text-white">Caps Lock is ON</span>
                )}
              </div>
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={pwdRef}
                  type={showPwd ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  onKeyUp={handleCaps}
                  onKeyDown={handleCaps}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white/90 py-3 pl-10 pr-12 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </label>

            {/* Extras */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={onForgot}
                className="text-sm font-medium text-sky-700 hover:text-sky-600"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                isLoading ||
                isLoadingCompanies ||
                !form.company ||
                !form.userID.trim() ||
                !form.password
              }
              className="group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-3 font-medium text-white shadow-lg shadow-sky-600/20 transition hover:from-sky-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0A12 12 0 002 12h2z" />
                </svg>
              ) : (
                <>Log In</>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              onClick={onSwitchToRegister}
              className="text-sm text-slate-700 hover:underline"
            >
              Don’t have an account?{" "}
              <span className="text-sky-700">Register</span>
            </button>
            <p className="mt-3 text-xs text-slate-500">
              © {new Date().getFullYear()} NAYSA. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
