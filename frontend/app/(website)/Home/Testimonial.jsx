import { MessageSquareQuote, Star } from "lucide-react"

const testimonials = [
  {
    quote: "The clarification engine caught our ambiguous timeframe parameters before generating queries, preventing flawed analytics reports.",
    author: "Elena Rostova",
    role: "Head of Data Engineering, Synthetix",
    initials: "ER",
  },
  {
    quote: "Non-technical product managers can now query complex order metrics across users and order items without burdening the data team.",
    author: "Marcus Vance",
    role: "VP of Product, FinScale",
    initials: "MV",
  },
  {
    quote: "The schema parsing and table detection are pinpoint accurate. Having instant PostgreSQL syntax output with explanations is a game changer.",
    author: "Devon Chen",
    role: "Lead Analytics Architect, NovaDB",
    initials: "DC",
  },
]

function Testimonial() {
  return (
    <section id="testimonials" className="border-b border-[#e3e8e2] bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4ca873]">
            Engineered For Precision
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1f2d24] sm:text-4xl">
            Trusted for mission-critical queries.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#607166]">
            See how teams use our Text-to-SQL clarification system to convert natural language queries into verified PostgreSQL statements.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((item, idx) => (
            <article
              key={idx}
              className="flex flex-col justify-between rounded-2xl border border-[#e1e8e1] bg-[#f8fbf8] p-7 transition hover:border-[#71c897]/60 hover:shadow-md"
            >
              <div>
                <div className="flex items-center gap-1 text-[#d48a35]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="mt-6 text-sm leading-relaxed text-[#35483c]">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="mt-8 flex items-center gap-3 border-t border-[#e3ebe4] pt-5">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#1f2d24] font-mono text-xs font-bold text-[#71c897]">
                  {item.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1f2d24]">{item.author}</p>
                  <p className="text-xs text-[#708076]">{item.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonial