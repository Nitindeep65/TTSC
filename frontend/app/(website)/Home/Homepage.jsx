'use client'

import React from "react"
import Hero from "./Hero"
import HowItWorks from "./HowItWorks"
import ProblemSection from "./ProblemSection"
import Features from "./Features"
import MCPSection from "./MCPSection"
import DailyUseCases from "./DailyUseCases"
import V3Roadmap from "./V3Roadmap"
import Testimonial from "./Testimonial"
import CTA from "./CTA"
import Footer from "@/components/resuable/Footer"

export default function Homepage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f7f8f5] overflow-x-hidden w-full max-w-full">
      <main className="flex-1 w-full max-w-full">
        <Hero />
        <HowItWorks />
        <ProblemSection />
        <Features />
        <MCPSection />
        <DailyUseCases />
        <V3Roadmap />
        <Testimonial />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}