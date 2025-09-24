// src/NAYSA Cloud/Authentication/Login.jsx
import React, { useState, useRef } from "react";
import axios from "axios";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import Swal from "sweetalert2";
import { useAuth } from "./AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta?.env?.VITE_API_URL ?? "http://127.0.0.1:8000";

export default function Login({ onSwitchToRegister, onForgot }) {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ USER_CODE: "", PASSWORD: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const pwdRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };
  const handleCaps = (e) =>
    setCapsOn(e.getModifierState && e.getModifierState("CapsLock"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.USER_CODE.trim() || !form.PASSWORD) return;
    setIsLoading(true);

    try {
      // no credentials/cookies here – just read JSON response
      const { data } = await axios.post(`${API_URL}/api/login`, {
        USER_CODE: form.USER_CODE.trim(),
        PASSWORD: form.PASSWORD,
      });

      if (data?.status !== "success") {
        throw new Error(data?.message || "Login failed.");
      }

      const d = data?.data || {};
      const normalized = {
        USER_CODE: d.USER_CODE ?? form.USER_CODE.trim(),
        USER_NAME: d.USER_NAME ?? d.username ?? form.USER_CODE.trim(),
      };

      // put user in context
      setUser(normalized);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `Welcome back, ${normalized.USER_NAME}!`,
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
      });

      // go to dashboard
      navigate("/", { replace: true });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login failed",
        text: err?.response?.data?.message || err?.message || "Please try again.",
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

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-start px-4 pt-6 md:pt-10 lg:pt-12 pb-24">
        <div className="mb-3 md:mb-4 flex flex-col items-center text-center">
          <img src="/naysa_logo.png" alt="NAYSA Logo" className="w-40 md:w-44 drop-shadow-md" />
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-blue-900 md:text-3xl">
            NAYSA Financials Cloud
          </h1>
        </div>

        <div className="w-full max-w-md rounded-2xl border border-white/40 bg-white/40 dark:bg-white/10 p-6 shadow-xl backdrop-blur-md">
          <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-3">
            {/* USER_CODE */}
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">User ID</span>
              <div className="relative">
                <FiUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="USER_CODE"
                  autoComplete="username"
                  value={form.USER_CODE}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
                  placeholder="Enter your user ID"
                />
              </div>
            </label>

            {/* PASSWORD */}
            <label className="block">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Password</span>
                {capsOn && <span className="text-xs font-semibold text-white">Caps Lock is ON</span>}
              </div>
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={pwdRef}
                  type={showPwd ? "text" : "password"}
                  name="PASSWORD"
                  autoComplete="current-password"
                  value={form.PASSWORD}
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

            <div className="flex justify-end pt-1">
              <button type="button" onClick={onForgot} className="text-sm font-medium text-sky-700 hover:text-sky-600">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !form.USER_CODE.trim() || !form.PASSWORD}
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

          <div className="mt-6 text-center">
            <button onClick={onSwitchToRegister} className="text-sm text-slate-700 hover:underline">
              Don’t have an account? <span className="text-sky-700">Register</span>
            </button>
            <p className="mt-3 text-xs text-slate-500">© {new Date().getFullYear()} NAYSA. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
