import React from "react"
import Hero from "./Hero"
import Testimonial from "./Testimonial"
import CTA from "./CTA"

function Homepage() {
  return (
    <main className="flex-1">
      <Hero />
      <Testimonial />
      <CTA />
    </main>
  )
}

export default Homepage