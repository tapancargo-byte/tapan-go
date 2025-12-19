"use client"

import { Truck, Warehouse, BarChart3, Shield, Clock, Headphones } from "lucide-react"
import { cn } from "@/lib/utils"

const solutions = [
  {
    icon: Truck,
    title: "Fleet Management",
    description: "End-to-end visibility of your entire fleet with GPS tracking, route optimization, and driver management.",
    features: ["Real-time GPS tracking", "Route optimization", "Driver performance analytics"],
    color: "teal",
  },
  {
    icon: Warehouse,
    title: "Warehouse Solutions",
    description: "Streamline inventory management with automated stock tracking and intelligent storage systems.",
    features: ["Inventory automation", "Smart storage allocation", "Pick & pack optimization"],
    color: "slate",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description: "Data-driven insights to optimize operations, reduce costs, and improve delivery performance.",
    features: ["Custom dashboards", "Predictive analytics", "Cost optimization reports"],
    color: "teal",
  },
  {
    icon: Shield,
    title: "Secure Handling",
    description: "Temperature-controlled and high-security transport for sensitive and valuable cargo.",
    features: ["Cold chain logistics", "High-value cargo security", "Compliance documentation"],
    color: "slate",
  },
  {
    icon: Clock,
    title: "Same-Day Delivery",
    description: "Ultra-fast delivery network for time-critical shipments within metro areas.",
    features: ["4-hour delivery windows", "Priority handling", "Real-time notifications"],
    color: "teal",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "24/7 customer support with dedicated account managers for enterprise clients.",
    features: ["24/7 availability", "Dedicated account manager", "Priority escalation"],
    color: "slate",
  },
]

export function SolutionsSection() {
  return (
    <section id="solutions" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium mb-4">
            Industry Solutions
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Tailored Solutions for Every Need
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            From small businesses to large enterprises, our customizable logistics solutions 
            adapt to your unique requirements and scale with your growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((solution) => (
            <div
              key={solution.title}
              className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300"
            >
              <div
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-colors",
                  solution.color === "teal"
                    ? "bg-teal-50 text-teal-600 group-hover:bg-teal-100"
                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                )}
              >
                <solution.icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{solution.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">{solution.description}</p>
              
              <ul className="space-y-2">
                {solution.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-1 h-1 rounded-full bg-teal-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
