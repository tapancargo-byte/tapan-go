"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Package, Truck, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const trackingSteps = [
  { id: 1, label: "Booked", icon: Package, status: "complete" },
  { id: 2, label: "Picked Up", icon: Package, status: "complete" },
  { id: 3, label: "In Transit", icon: Truck, status: "current" },
  { id: 4, label: "Delivered", icon: CheckCircle2, status: "pending" },
]

export function TrackingSection() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [showResult, setShowResult] = useState(false)

  const handleTrack = () => {
    if (trackingNumber.trim()) {
      setShowResult(true)
    }
  }

  return (
    <section id="tracking" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium mb-4">
            Real-Time Tracking
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Track Your Consignment</h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Enter your consignment number to get instant updates on your shipment status.
          </p>
        </div>

        {/* Tracking Input Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Enter Consignment Number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="pl-12 h-14 rounded-xl border-slate-200 bg-white text-base focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <Button
                onClick={handleTrack}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 h-14 text-base font-medium"
              >
                Track Now
              </Button>
            </div>

            {/* Result State */}
            {showResult && (
              <div className="mt-8 p-6 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-slate-500">Consignment</p>
                    <p className="text-lg font-semibold text-slate-900">{trackingNumber}</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">In Transit</span>
                  </div>
                </div>

                {/* Timeline UI */}
                <div className="relative">
                  <div className="flex items-center justify-between">
                    {trackingSteps.map((step, index) => (
                      <div key={step.id} className="flex flex-col items-center relative z-10">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                            step.status === "complete" && "bg-teal-500 text-white",
                            step.status === "current" && "bg-teal-100 text-teal-600 ring-4 ring-teal-100",
                            step.status === "pending" && "bg-slate-100 text-slate-400",
                          )}
                        >
                          <step.icon className="w-5 h-5" />
                        </div>
                        <span
                          className={cn(
                            "text-xs mt-2 font-medium",
                            step.status === "pending" ? "text-slate-400" : "text-slate-700",
                          )}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Progress Line */}
                  <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-200 -z-0">
                    <div className="h-full w-[60%] bg-teal-500 rounded-full" />
                  </div>
                </div>

                <p className="text-sm text-slate-500 text-center mt-6">
                  Estimated delivery: <span className="font-medium text-slate-700">Dec 18, 2025</span>
                </p>
              </div>
            )}

            {/* Placeholder State */}
            {!showResult && (
              <div className="mt-6 text-center text-sm text-slate-400">
                <p>Enter a consignment number to view tracking details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
