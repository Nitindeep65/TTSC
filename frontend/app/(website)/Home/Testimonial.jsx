'use client'

import React from "react"
import { motion } from "framer-motion"
import { Quote, Star } from "lucide-react"

const TESTIMONIALS = [
  {
    quote: "QueryCraft caught a Cartesian join that would have scanned 24 million rows in production. The Cost Guard firewall paid for itself in the first 10 minutes.",
    name: "Alex Chen",
    role: "Senior Backend Engineer",
    company: "FinTech Startup · PostgreSQL + Supabase",
    initials: "AC",
    color: "bg-blue-600",
    stars: 5,
  },
  {
    quote: "I used to wait 2 days for the data team to write a query. Now I describe what I need in plain English and get verified SQL in seconds. Our analytics velocity is 10x.",
    name: "Priya Sharma",
    role: "Head of Product Analytics",
    company: "B2B SaaS · Neon + MongoDB Atlas",
    initials: "PS",
    color: "bg-violet-600",
    stars: 5,
  },
  {
    quote: "The clarification loop is brilliant. It asked me exactly the right question before generating the query — something no other AI tool has ever done.",
    name: "Marcus Williams",
    role: "Data Analyst",
    company: "E-commerce Platform · AWS RDS",
    initials: "MW",
    color: "bg-emerald-600",
    stars: 5,
  },
  {
    quote: "We plugged QueryCraft's MCP server into our Claude Desktop setup and now our entire engineering team can query production databases safely. The read-only enforcement is non-negotiable for us.",
    name: "Sofia Petrov",
    role: "Platform Engineer",
    company: "DevTools Company · PostgreSQL",
    initials: "SP",
    color: "bg-orange-500",
    stars: 5,
  },
]

export default function Testimonial() {
  return (
    <section
      className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-24 border-b border-slate-100"
      id="testimonials"
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center space-y-3 mb-14"
        >
          <p className="section-kicker justify-center">
            <Star className="size-3.5" />
            Developer Love
          </p>
          <h2 className="text-[#0f172a]">
            Trusted by the teams who{" "}
            <span className="gradient-text">can't afford hallucinations.</span>
          </h2>
        </motion.div>

        {/* Testimonial grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -3 }}
              className="hover-lift flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <Quote className="size-5 text-slate-200 mb-2 shrink-0" />
              <p className="text-[13px] text-slate-600 leading-relaxed flex-1">
                {t.quote}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${t.color} text-white text-xs font-bold`}>
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900 truncate">{t.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{t.role}</p>
                  <p className="text-[10px] font-mono text-emerald-600 truncate">{t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom social proof strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500"
        >
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">Used in production</span> by 50+ engineering teams
          </span>
          <span className="hidden sm:block w-px h-4 bg-slate-200" />
          <span className="flex items-center gap-2">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-700">4.9/5</span> developer satisfaction score
          </span>
          <span className="hidden sm:block w-px h-4 bg-slate-200" />
          <span className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Zero</span> schema hallucinations reported
          </span>
        </motion.div>

      </div>
    </section>
  )
}