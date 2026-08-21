import React from 'react'
import Hero from './Hero'
import Testimonial from './Testimonial'
import CTA from './CTA'
import Footer from '@/components/resuable/Footer'
import Navbar from '@/components/resuable/Navbar'

function Homepage() {
  return (
    <>
    <main>
        <Hero/>
        <Testimonial/>
        <CTA/>
    </main>
    </>
  )
}

export default Homepage