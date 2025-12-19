"use client"

import { BarChart3, Handshake, MessageSquare, FileText } from "lucide-react"

const placeholders = [
  {
    icon: BarChart3,
    title: "Advanced Analytics Dashboard",
    description: "Real-time insights and shipment analytics",
  },
  {
    icon: Handshake,
    title: "Partner Integrations",
    description: "Connect with your existing business tools",
  },
  {
    icon: MessageSquare,
    title: "Testimonials Carousel",
    description: "What our clients say about us",
  },
  {
    icon: FileText,
    title: "Case Studies",
    description: "Success stories and detailed analyses",
  },
]

export function PlaceholderSections() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white text-slate-500 text-sm font-medium mb-4 border border-dashed border-slate-300">
            Coming Soon
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Future Enhancements</h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Exciting features currently in development to enhance your experience.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {placeholders.map((item) => (
            <div
              key={item.title}
              className="relative bg-white/50 rounded-2xl p-6 border-2 border-dashed border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div className="absolute top-4 right-4 px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-semibold uppercase tracking-wide">
                🚧 To Be Implemented
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4 mt-2">
                <item.icon className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-700 mb-1">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
