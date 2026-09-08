import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenType } from '../types';
import { FOUNDATION_IMAGES } from '../data/foundationData';
import { LeadershipSection } from '../components/LeadershipSection';

interface AboutScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onOpenDonate: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onNavigate, onOpenDonate }) => {
  const [activeMilestone, setActiveMilestone] = useState<number>(0);

  const milestones = [
    {
      year: '1941–1959',
      title: 'Roots in Rural Tenacity',
      description: 'Born to Georgia sharecroppers, Karl E. Peace learned the rigor of honest labor and overcame extreme financial deprivation, setting an unwavering standard for academic pursuit.',
      tag: 'Humble Beginnings',
    },
    {
      year: '1960–1976',
      title: 'Scholarship as Destiny Alterer',
      description: 'A life-changing academic scholarship enabled Dr. Peace to earn his Bachelor’s, Master’s, and ultimately a PhD in Biostatistics, proving that opportunity changes generational destinies.',
      tag: 'Educational Elevation',
    },
    {
      year: '1980–1999',
      title: 'Scientific Impact & Drug Approvals',
      description: 'Led research contributing to dozens of life-saving pharmaceutical approvals across cancer, cardiovascular, and neurological medicine, establishing Dr. Peace as an international scientific authority.',
      tag: 'Global Healthcare',
    },
    {
      year: '2000–Present',
      title: 'Philanthropic Endowments',
      description: 'Endowed the Jiann-Ping Hsu College of Public Health at Georgia Southern University and numerous international funds, educating thousands of students across the globe.',
      tag: 'Enduring Legacy',
    },
    {
      year: 'Today',
      title: 'The Nigerian Foundation Mandate',
      description: 'Extending this humanitarian torch to Nigeria, providing direct tuition assistance, book grants, executive mentorship, and community hygiene initiatives to empower youth.',
      tag: 'Living Mission',
    },
  ];

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 gap-12 sm:gap-16">
      {/* Hero Header */}
      <div className="flex flex-col gap-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 py-1 px-3.5 rounded-full liquid-glass-pill-active text-[#D97706] text-xs uppercase font-bold self-start border border-amber-200/60 shadow-xs">
          <span className="material-symbols-outlined text-[15px]">history_edu</span>
          <span>Our Legacy &amp; Purpose</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1E1B4B] leading-tight">
          Dedicated to Expanding Human Potential Across Nigeria
        </h1>
        <p className="text-base sm:text-lg text-[#4B485A] leading-relaxed">
          The Karl Peace Legacy Foundation was founded upon an uncompromising belief: that talent is distributed universally, but opportunity is not. We exist to close that gap for committed young Nigerians through education, mentorship, and public health.
        </p>
      </div>

      {/* Legacy & History Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 flex flex-col gap-4">
          <span className="text-xs uppercase tracking-wider text-[#D97706] font-bold">
            The Founder’s Ethos
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B4B]">
            Inspired by a Lifelong Commitment to Scientific &amp; Human Elevation
          </h2>
          <div className="text-sm sm:text-base text-[#4B485A] space-y-3 leading-relaxed">
            <p>
              Dr. Karl E. Peace’s life journey is one of the most compelling testaments to the transformative power of education. Born in poverty as the son of Georgia sharecroppers, he rose through rigorous academic tenacity to become an internationally renowned biostatistician, clinical scientist, author, and global humanitarian.
            </p>
            <p>
              Having experienced firsthand how a single scholarship can permanently alter the trajectory of a family line, Dr. Peace devoted his resources to establishing academic endowments and philanthropic funds that have educated thousands of students worldwide.
            </p>
            <p>
              The <strong>Karl Peace Legacy Foundation</strong> extends this living mandate specifically to Nigeria. By targeting tertiary scholars and community youth facing steep economic headwinds, the foundation honors this heritage by turning academic ambition into enduring civic leadership.
            </p>
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-white/80 bg-[#161338] aspect-[4/5] liquid-glass-card">
            <img
              src={FOUNDATION_IMAGES.mentorship}
              alt="Mentorship in action under Karl Peace Legacy Foundation"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#161338]/95 via-[#161338]/30 to-transparent flex items-end p-6">
              <div className="text-white">
                <span className="text-xs uppercase tracking-wider text-[#F59E0B] font-bold block mb-1">
                  Living Philosophy
                </span>
                <p className="font-serif text-base sm:text-lg italic text-[#FBF9F5] leading-snug">
                  &ldquo;Education is the only investment whose dividends compound perpetually across generations.&rdquo;
                </p>
                <span className="text-xs text-[#F5F3ED]/75 block mt-2">— Dr. Karl E. Peace</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Milestones Timeline */}
      <section className="liquid-glass-dock rounded-3xl p-6 sm:p-10 border border-white/80 shadow-md flex flex-col gap-6">
        <div className="flex flex-col gap-1 max-w-2xl">
          <span className="text-xs uppercase tracking-wider text-[#D97706] font-bold">
            Historical Trajectory
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B4B]">
            From Sharecropper Roots to Global Humanitarianism
          </h2>
          <p className="text-sm text-[#4B485A]">
            Select a milestone below to explore the turning points that inspired the founding of this organization.
          </p>
        </div>

        {/* Milestone Selection Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-black/5 pb-4">
          {milestones.map((m, idx) => {
            const isSelected = activeMilestone === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveMilestone(idx)}
                className={`relative py-2.5 px-3 rounded-2xl text-left transition-all select-none ${
                  isSelected
                    ? 'liquid-glass-card border border-amber-300 shadow-xs'
                    : 'hover:bg-white/40'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="active-milestone-marker"
                    className="absolute inset-0 rounded-2xl liquid-glass-pill-active -z-10"
                    transition={{ type: 'spring', damping: 26, stiffness: 350 }}
                  />
                )}
                <span className={`block font-mono text-xs font-bold ${isSelected ? 'text-[#D97706]' : 'text-[#6E6B7E]'}`}>
                  {m.year}
                </span>
                <span className="block text-xs font-semibold text-[#1E1B4B] truncate mt-0.5">
                  {m.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Milestone Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMilestone}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-6 rounded-2xl bg-white/80 backdrop-blur-xs border border-white/90 shadow-xs flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-100/80 text-[#904d00] text-xs font-bold font-mono">
                {milestones[activeMilestone].year}
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1E1B4B]">
                {milestones[activeMilestone].title}
              </h3>
            </div>
            <p className="text-sm sm:text-base text-[#4B485A] leading-relaxed">
              {milestones[activeMilestone].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Core Institutional Values */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1 max-w-2xl">
          <span className="text-xs uppercase tracking-wider text-[#D97706] font-bold">
            Guiding Principles
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B4B]">
            Our Four Foundational Values
          </h2>
          <p className="text-sm text-[#4B485A]">
            Every scholarship granted, mentor paired, and outreach conducted is governed by these steadfast commitments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-3xl liquid-glass-card card-hover-lift border border-white/80 shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl liquid-glass-amber-btn text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#1E1B4B]">
              Fiduciary Integrity
            </h3>
            <p className="text-xs sm:text-sm text-[#4B485A] leading-relaxed">
              Complete transparency in fund allocation. We ensure 100% of designated student tuition grants reach verified institutions without administrative deduction.
            </p>
          </div>

          <div className="p-6 rounded-3xl liquid-glass-card card-hover-lift border border-white/80 shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl liquid-glass-dark-btn text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">school</span>
            </div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#1E1B4B]">
              Academic Excellence
            </h3>
            <p className="text-xs sm:text-sm text-[#4B485A] leading-relaxed">
              We reward studious discipline and intellectual ambition, encouraging our scholars to set academic benchmarks in their respective faculties.
            </p>
          </div>

          <div className="p-6 rounded-3xl liquid-glass-card card-hover-lift border border-white/80 shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-[#0D9488] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">handshake</span>
            </div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#1E1B4B]">
              Communal Dignity
            </h3>
            <p className="text-xs sm:text-sm text-[#4B485A] leading-relaxed">
              We reject paternalistic charity. We partner with students and communities with mutual respect, cultivating self-reliance and civic responsibility.
            </p>
          </div>

          <div className="p-6 rounded-3xl liquid-glass-card card-hover-lift border border-white/80 shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-[#D97706] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">health_and_safety</span>
            </div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#1E1B4B]">
              Grassroots Impact
            </h3>
            <p className="text-xs sm:text-sm text-[#4B485A] leading-relaxed">
              Our interventions occur where the need is sharpest: lecture halls, secondary schools, local clinics, and underserved community environments.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership & Founders Section */}
      <LeadershipSection
        title="Our Dedicated Leadership Team"
        subtitle="Meet the passionate professionals and visionary founders guiding the Karl Peace Legacy Foundation's educational, mentorship, and public health missions in Nigeria."
        showFilters={true}
      />

      {/* Operational Presence in Nigeria */}
      <section className="p-8 sm:p-12 rounded-3xl liquid-glass-dark-btn text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
        <div className="flex flex-col gap-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 py-0.5 px-3 rounded-full bg-white/15 text-[#F59E0B] text-xs uppercase font-bold self-start backdrop-blur-xs">
            National Footprint
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Operational Presence: Abuja &amp; Lagos
          </h2>
          <p className="text-sm text-[#F5F3ED]/85 leading-relaxed">
            The Foundation coordinates its scholarship programs, mentor vetting, and university partnerships through its administrative secretariat in Abuja (FCT) alongside an outreach operations desk in Lagos State.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#F59E0B] text-[18px]">location_on</span>
              <span>Abuja Secretariat (Policy &amp; Fiduciary Governance)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#F59E0B] text-[18px]">location_on</span>
              <span>Lagos Operations Hub (Outreach &amp; Mentorship)</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('scholarships')}
            className="liquid-glass-amber-btn glass-refraction h-12 px-6 rounded-2xl text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Explore Scholarships</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenDonate}
            className="liquid-glass-light-btn h-12 px-6 rounded-2xl text-[#1E1B4B] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Partner With Us</span>
          </motion.button>
        </div>
      </section>
    </div>
  );
};
