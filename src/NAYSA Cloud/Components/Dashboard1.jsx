// DashboardWelcome.jsx
import React, { useMemo } from "react";

export default function Dashboard1({ user: propUser }) {
  // get user from props or localStorage
  const user = useMemo(() => {
    if (propUser) return propUser;
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  }, [propUser]);

  const name = user?.username || user?.userID || user?.userId || "User";

  return (
    <section className="relative mt-[50px] min-h-[65vh] flex items-center justify-center overflow-hidden px-6">
      {/* Ambient gradient background */}
      <div className="absolute inset-0 z-10">
        <div className="absolute inset-0" />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full  blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full  blur-3xl" />
      </div>

      {/* Glass card with modern accents */}
      <div className="group relative w-full max-w-3xl">
        {/* glow ring */}
        {/* <div className="pointer-events-none absolute -inset-[1px] rounded-[28px] bg-[conic-gradient(from_180deg_at_50%_50%,#38bdf8_0deg,#818cf8_120deg,#f472b6_240deg,#38bdf8_360deg)] opacity-30 blur-md transition-opacity duration-300 group-hover:opacity-50" /> */}
        <div className="relative rounded-[28px] border border-white/30 bg-white/70 backdrop-blur-xl shadow-2xl dark:bg-white/10">
          <div className="px-8 py-10 md:px-12 md:py-12 text-center flex flex-col items-center gap-6">
            {/* Welcome */}
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
              Welcome,{" "}
              <span className="bg-clip-text text-gray-800">
                {name}
              </span>
              !
            </h1>

            {/* Logo (bigger) */}
            <div className=" p-3 sm:p-4 bg-white/70 dark:bg-white/5 ring-1 ring-white/50 shadow-xl transition-transform duration-500 group-hover:scale-[1.02]">
              <img
                src="/NAYSA.jpg"
                alt="NAYSA Financials Cloud"
                className="w-90 md:w-100 lg:w-96 drop-shadow-xl select-none"
                draggable="false"
              />
            </div>

            {/* Divider */}
            <div className="h-px w-56 md:w-72 lg:w-80 bg-gradient-to-r from-transparent via-slate-300/70 to-transparent dark:via-white/20" />

            {/* Tagline */}
            <p className="max-w-2xl text-base md:text-lg text-slate-600 dark:text-slate-300">
              We make life easier through business applications
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
