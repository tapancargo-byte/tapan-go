"use client";

import { ArrowRight } from "lucide-react";

export function AboutAppsStory() {
  return (
    <section className="flex flex-col md:flex-row items-center justify-center gap-10 max-md:px-4">
      <div className="relative shadow-2xl shadow-indigo-600/40 rounded-2xl overflow-hidden shrink-0">
        <img
          className="max-w-md w-full object-cover rounded-2xl"
          src="https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?auto=format&fit=crop&w=600&q=80"
          alt="Team collaborating on product design"
        />
        <div className="flex items-center gap-1 max-w-72 absolute bottom-8 left-8 bg-white p-4 rounded-xl shadow-md">
          <div className="flex -space-x-4 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80"
              alt="Team member avatar"
              className="size-9 rounded-full border-[3px] border-white hover:-translate-y-1 transition"
            />
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
              alt="Team member avatar"
              className="size-9 rounded-full border-[3px] border-white hover:-translate-y-1 transition"
            />
            <img
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80"
              alt="Team member avatar"
              className="size-9 rounded-full border-[3px] border-white hover:-translate-y-1 transition"
            />
            <div className="flex items-center justify-center text-xs text-white size-9 rounded-full border-[3px] border-white bg-indigo-600 hover:-translate-y-1 transition">
              50+
            </div>
          </div>
          <p className="text-sm font-medium text-slate-800">
            Join our developer community
          </p>
        </div>
      </div>

      <div className="text-sm text-slate-600 max-w-lg">
        <h2 className="text-xl uppercase font-semibold text-slate-700">
          What we do?
        </h2>
        <div className="w-24 h-[3px] rounded-full bg-gradient-to-r from-indigo-600 to-[#DDD9FF]" />
        <p className="mt-8 text-muted-foreground">
          PrebuiltUI helps you build faster by transforming your design vision into
          fully functional, production-ready UI components.
        </p>
        <p className="mt-4 text-muted-foreground">
          Whether you're launching a SaaS app, landing page, or dashboard, our
          collection of Tailwind CSS components is crafted to boost your
          development speed and improve user experience.
        </p>
        <p className="mt-4 text-muted-foreground">
          From UI design systems to automation-ready layouts, PrebuiltUI empowers
          you to build beautifully and scale effortlessly.
        </p>
        <button className="flex items-center gap-2 mt-8 hover:-translate-y-0.5 transition bg-gradient-to-r from-indigo-600 to-[#8A7DFF] py-3 px-8 rounded-full text-white">
          <span>Read more</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </section>
  );
}

export default AboutAppsStory;
