"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, Send, Building2, Globe } from "lucide-react"

const contactInfo = [
  {
    icon: MapPin,
    title: "Head Office",
    details: ["Tapan Associate Cargo", "Paona Bazaar, Imphal West", "Manipur 795001, India"],
  },
  {
    icon: Phone,
    title: "Phone",
    details: ["+91 385 244 5678", "+91 98560 12345"],
  },
  {
    icon: Mail,
    title: "Email",
    details: ["info@tapcargo.com", "support@tapcargo.com"],
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: ["Mon - Sat: 9:00 AM - 7:00 PM", "Sunday: 10:00 AM - 4:00 PM"],
  },
]

const offices = [
  { city: "Imphal", type: "Head Office", icon: Building2 },
  { city: "New Delhi", type: "Regional Hub", icon: Globe },
  { city: "Guwahati", type: "Distribution Center", icon: MapPin },
  { city: "Kolkata", type: "Regional Hub", icon: Globe },
]

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setSubmitted(true)
    setFormData({ name: "", email: "", phone: "", company: "", subject: "", message: "" })
    setTimeout(() => setSubmitted(false), 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium mb-4">
            Get In Touch
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Contact Us
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Have questions or need a custom logistics solution? Our team is ready to help 
            you with all your cargo needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Send us a Message</h3>
              
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-teal-100 rounded-full flex items-center justify-center">
                    <Send className="w-7 h-7 text-teal-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Message Sent!</h4>
                  <p className="text-sm text-slate-600">We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1.5 block">Full Name *</label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="h-12 rounded-xl border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1.5 block">Email *</label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@company.com"
                        required
                        className="h-12 rounded-xl border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1.5 block">Phone</label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="h-12 rounded-xl border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1.5 block">Company</label>
                      <Input
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Company Name"
                        className="h-12 rounded-xl border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1.5 block">Subject *</label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                      className="h-12 rounded-xl border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1.5 block">Message *</label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your logistics needs..."
                      required
                      rows={5}
                      className="rounded-xl border-slate-200 bg-white resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-base font-medium"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {contactInfo.map((info) => (
              <div key={info.title} className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <info.icon className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">{info.title}</h4>
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-sm text-slate-600">{detail}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Office Locations */}
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Our Locations</h4>
              <div className="grid grid-cols-2 gap-3">
                {offices.map((office) => (
                  <div
                    key={office.city}
                    className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <office.icon className="w-4 h-4 text-teal-600 mb-2" />
                    <p className="text-sm font-medium text-slate-900">{office.city}</p>
                    <p className="text-xs text-slate-500">{office.type}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
