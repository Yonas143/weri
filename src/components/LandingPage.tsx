import React from "react";
import { Radio, Sparkles, Zap, Database, TrendingUp, Shield, ArrowRight, Play } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-6">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-900/40">
              <Radio className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic">
              Radio<span className="text-orange-500">AI</span>
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-white/60 font-medium mb-4"
          >
            AI-Powered Broadcast Intelligence for Ethiopian Radio
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-white/40 max-w-2xl mx-auto mb-12"
          >
            Automatically record, transcribe, and analyze radio broadcasts in Amharic. 
            Track commercials, detect brands, and generate proof-of-play reports with AI.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            onClick={onGetStarted}
            className="group px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black text-lg uppercase tracking-wider transition-all shadow-2xl shadow-orange-900/40 hover:shadow-orange-900/60 flex items-center gap-3 mx-auto"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <div className="text-4xl font-black text-orange-500 mb-2">11+</div>
              <div className="text-sm text-white/40 uppercase tracking-wider">Radio Stations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-orange-500 mb-2">24/7</div>
              <div className="text-sm text-white/40 uppercase tracking-wider">Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-orange-500 mb-2">AI</div>
              <div className="text-sm text-white/40 uppercase tracking-wider">Powered</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              Intelligent Broadcast <span className="text-orange-500">Monitoring</span>
            </h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">
              Everything you need to track, analyze, and monetize radio advertising
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Radio,
                title: "Live Recording",
                description: "Automatically record from 11+ Ethiopian radio stations with scheduled monitoring",
                color: "orange"
              },
              {
                icon: Sparkles,
                title: "AI Analysis",
                description: "Gemini-powered transcription and commercial detection in Amharic and Amhinglish",
                color: "purple"
              },
              {
                icon: Database,
                title: "Smart Storage",
                description: "Cloud backup with Supabase, local archive, and intelligent file management",
                color: "blue"
              },
              {
                icon: TrendingUp,
                title: "Brand Tracking",
                description: "Identify brands, track campaigns, and calculate share of voice automatically",
                color: "green"
              },
              {
                icon: Zap,
                title: "Keyword Alerts",
                description: "Real-time triggers for specific keywords, brands, or topics in broadcasts",
                color: "yellow"
              },
              {
                icon: Shield,
                title: "Proof of Play",
                description: "Generate detailed reports for advertisers with timestamps and audio clips",
                color: "red"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white/[0.03] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.05] hover:border-white/20 transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl font-black mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-white/40 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-orange-500/10 to-purple-500/10 border border-orange-500/20 rounded-3xl p-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Ready to Transform Your <span className="text-orange-500">Radio Intelligence?</span>
            </h2>
            <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
              Join the future of broadcast monitoring with AI-powered insights
            </p>
            <button
              onClick={onGetStarted}
              className="group px-8 py-4 bg-white text-black hover:bg-orange-500 hover:text-white rounded-2xl font-black text-lg uppercase tracking-wider transition-all shadow-2xl flex items-center gap-3 mx-auto"
            >
              Start Free Trial
              <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-white/40">© 2026 RadioAI. All rights reserved.</span>
          </div>
          <div className="text-sm text-white/40">
            Powered by Gemini AI & Supabase
          </div>
        </div>
      </div>
    </div>
  );
}
