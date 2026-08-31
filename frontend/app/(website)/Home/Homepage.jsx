'use client'

import React from "react"
import Navbar from "@/components/resuable/Navbar"
import Hero from "./Hero"
import ProblemSection from "./ProblemSection"
import HowItWorks from "./HowItWorks"
import Features from "./Features"
import DailyUseCases from "./DailyUseCases"
import MCPSection from "./MCPSection"

import Testimonial from "./Testimonial"
import CTA from "./CTA"
import Footer from "@/components/resuable/Footer"
import DocsAiCopilot from "@/components/docs/DocsAiCopilot"

/**
 * Section rhythm (light → dark → light → slate → light → slate → light → dark):
 *   Hero            — white
 *   ProblemSection  — slate-900  (dark chapter break)
 *   HowItWorks      — white
 *   Features        — slate-50
 *   DailyUseCases   — white
 *   MCPSection      — slate-50
 *   Testimonial     — white
 *   CTA             — slate-900  (dark finale)
 *   Footer          — slate-50
 */
export default function Homepage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0f172a] overflow-x-hidden w-full max-w-full">

      {/* Sticky navbar — outside main so it overlays all sections */}
      <Navbar />

      <main className="flex-1 w-full max-w-full">
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <Features />
        <DailyUseCases />
        <MCPSection />
        <Testimonial />
        <CTA />
      </main>

      <Footer />

      {/* Floating QueryCraft Docs AI Copilot */}
      <DocsAiCopilot />
    </div>
  )
}