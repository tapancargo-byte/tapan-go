"use client"

import { Target, Eye, Award, Heart } from "lucide-react"

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "Delivering excellence in every shipment, every time.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description: "Complete visibility into your supply chain operations.",
  },
  {
    icon: Award,
    title: "Quality First",
    description: "Uncompromising standards in handling and delivery.",
  },
  {
    icon: Heart,
    title: "Customer Focus",
    description: "Your success is our primary measure of achievement.",
  },
]

const milestones = [
  { year: "2010", event: "Founded in Imphal with a vision to transform logistics" },
  { year: "2015", event: "Expanded operations to cover all Northeast states" },
  { year: "2018", event: "Launched real-time tracking and digital documentation" },
  { year: "2021", event: "Introduced AI-powered route optimization" },
  { year: "2024", event: "Serving 50+ countries with enterprise solutions" },
]

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white text-slate-600 text-sm font-medium mb-4 border border-slate-200">
            About TAC
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Trusted Partner in Logistics
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            For over 15 years, Tapan Associate Cargo has been at the forefront of 
            logistics innovation, connecting businesses across the globe with reliable, 
            technology-driven cargo solutions.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Story */}
          <div className="bg-white rounded-2xl p-8 border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Story</h3>
            <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
              <p>
                What started as a small cargo operation in Imphal has grown into one of 
                the region&apos;s most trusted logistics partners. Our founder&apos;s vision was 
                simple: make shipping reliable, transparent, and accessible.
              </p>
              <p>
                Today, we handle thousands of shipments daily, from critical medical supplies 
                to enterprise bulk cargo. Our investment in technology—from AI-powered 
                tracking to automated warehousing—ensures every package reaches its 
                destination safely and on time.
              </p>
              <p>
                We&apos;re not just moving cargo; we&apos;re building connections that power 
                businesses and communities across the globe.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl p-8 border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Our Journey</h3>
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-bold">
                      {milestone.year.slice(2)}
                    </div>
                    {index < milestones.length - 1 && (
                      <div className="w-px h-full bg-slate-200 my-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className="text-xs font-semibold text-teal-600 mb-1">{milestone.year}</p>
                    <p className="text-sm text-slate-700">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-10">Our Values</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-base font-semibold text-slate-900 mb-1">{value.title}</h4>
                <p className="text-sm text-slate-500">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Band */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: "10K+", label: "Shipments Monthly" },
            { value: "98.5%", label: "On-Time Delivery" },
            { value: "500+", label: "Enterprise Clients" },
            { value: "4.9/5", label: "Customer Rating" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-6 text-center border border-slate-100">
              <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
