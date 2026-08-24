'use client'

import React from "react"
import Hero from "./Hero"
import Features from "./Features"
import MCPSection from "./MCPSection"
import DailyUseCases from "./DailyUseCases"
import Testimonial from "./Testimonial"
import CTA from "./CTA"
import Footer from "@/components/resuable/Footer"

export default function Homepage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f7f8f5] overflow-x-hidden w-full max-w-full">
      <main className="flex-1 w-full max-w-full">
        <Hero />
        <Features />
        <MCPSection />
        <DailyUseCases />
        <Testimonial />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}