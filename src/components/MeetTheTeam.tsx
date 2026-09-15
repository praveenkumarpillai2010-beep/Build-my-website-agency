import React from 'react';
import { Instagram, ArrowUpRight } from 'lucide-react';
import { TEAM_MEMBERS } from '../data/agencyData';

export const MeetTheTeam: React.FC = () => {
  return (
    <section id="team" className="py-20 sm:py-24 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 blur-[100px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold mb-4">
            <Instagram className="w-3.5 h-3.5" />
            <span>Community & Connect</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mb-3">
            Meet the Team
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Follow the people behind Build My Website.
          </p>
        </div>

        {/* Social Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {TEAM_MEMBERS.map((member) => (
            <a
              key={member.id || member.name}
              href={member.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group rounded-3xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-pink-500/40 p-8 flex flex-col items-center text-center transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-pink-500/20 hover:-translate-y-2 cursor-pointer backdrop-blur-xl block text-decoration-none"
            >
              {/* Subtle ambient card glow on hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500/0 via-purple-500/0 to-amber-500/0 group-hover:from-pink-500/10 group-hover:via-purple-500/5 group-hover:to-amber-500/5 transition-colors duration-300 pointer-events-none -z-10" />

              {/* Instagram top badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-600/15 border border-pink-500/30 text-pink-400 text-xs font-semibold mb-6 group-hover:border-pink-500/50 transition-colors">
                <Instagram className="w-3.5 h-3.5 text-pink-400 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                <span>Instagram</span>
              </div>

              {/* Avatar / Profile Graphic */}
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px] shadow-lg shadow-pink-500/20 group-hover:scale-105 group-hover:shadow-pink-500/30 transition-all duration-300">
                  <div className="w-full h-full rounded-[14px] bg-[#0c101a] flex items-center justify-center">
                    <span className="font-display font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-tr from-pink-400 to-purple-200">
                      {member.name.replace(/[^a-zA-Z]/g, ' ').trim().split(/\s+/).slice(0, 2).map((n) => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md transform transition-transform duration-300 group-hover:scale-110">
                  <Instagram className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Name & Username */}
              <h3 className="text-xl font-bold text-white tracking-tight mb-1 group-hover:text-pink-100 transition-colors">
                {member.name}
              </h3>
              <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-pink-400 group-hover:text-pink-300 transition-colors mb-6">
                <Instagram className="w-3.5 h-3.5 transform transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 text-pink-400" />
                <span>{member.instagramHandle}</span>
              </div>

              {/* Action Button: [ Instagram ↗ ] */}
              <div className="w-full max-w-[200px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600/90 to-purple-600/90 group-hover:from-pink-500 group-hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-pink-500/20 group-hover:shadow-pink-500/35 transition-all duration-300 group-hover:scale-[1.03]">
                <Instagram className="w-3.5 h-3.5 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                <span>Instagram</span>
                <ArrowUpRight className="w-3.5 h-3.5 transform transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
