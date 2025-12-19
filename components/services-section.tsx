"use client"

import { Package, Globe, Zap, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

const services = [
  {
    icon: Package,
    title: "Domestic Cargo",
    description: "Reliable nationwide delivery with real-time tracking and secure handling.",
    color: "teal",
  },
  {
    icon: Globe,
    title: "International Freight",
    description: "Global logistics solutions with customs clearance and documentation support.",
    color: "slate",
  },
  {
    icon: Zap,
    title: "Express Delivery",
    description: "Time-critical shipments with guaranteed same-day and next-day delivery options.",
    color: "teal",
  },
  {
    icon: Building2,
    title: "Enterprise Logistics",
    description: "Tailored supply chain solutions for large-scale business operations.",
    color: "slate",
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white text-slate-600 text-sm font-medium mb-4 border border-slate-200">
            What We Offer
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Services</h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Comprehensive logistics solutions designed to meet your every shipping need.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-colors",
                  service.color === "teal"
                    ? "bg-teal-50 text-teal-600 group-hover:bg-teal-100"
                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200",
                )}
              >
                <service.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{service.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
