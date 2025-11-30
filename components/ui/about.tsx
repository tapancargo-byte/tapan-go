"use client";

import { Plane, Route, Split, AlertTriangle, FileText, Radar } from "lucide-react";

export function AboutApps() {
  return (
    <section
      aria-labelledby="about-tapan-heading"
      className="py-10 lg:py-12"
    >
      <h2
        id="about-tapan-heading"
        className="text-3xl font-semibold text-center mx-auto text-foreground"
      >
        About Tapan Go
      </h2>
      <p className="text-sm text-muted-foreground text-center mt-2 max-w-lg mx-auto">
        Cargo lanes, hubs and operations focused on keeping freight moving
        between Northeast India and New Delhi.
      </p>
      <div className="relative max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 px-8 md:px-0 pt-16">
        <div className="size-[520px] -top-80 left-1/2 -translate-x-1/2 rounded-full absolute blur-[300px] -z-10 bg-[#FBFFE1]" />

        <div>
          <div className="size-10 p-2 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center text-indigo-700">
            <Plane className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="mt-5 space-y-2">
            <h3 className="text-base font-medium text-foreground">
              Northeast–Delhi specialist
            </h3>
            <p className="text-sm text-muted-foreground">
              15+ years moving air and surface cargo between Imphal, Guwahati,
              Siliguri and New Delhi.
            </p>
          </div>
        </div>

        <div>
          <div className="size-10 p-2 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center text-indigo-700">
            <Route className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="mt-5 space-y-2">
            <h3 className="text-base font-medium text-foreground">
              Reliable network & schedules
            </h3>
            <p className="text-sm text-muted-foreground">
              Line-haul and hub timings tuned for predictable transits even in
              peak season.
            </p>
          </div>
        </div>

        <div>
          <div className="size-10 p-2 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center text-indigo-700">
            <Split className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="mt-5 space-y-2">
            <h3 className="text-base font-medium text-foreground">
              Air + surface combinations
            </h3>
            <p className="text-sm text-muted-foreground">
              Balanced options for time-critical moves and cost-sensitive
              cargo, lane by lane.
            </p>
          </div>
        </div>

        <div>
          <div className="size-10 p-2 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center text-indigo-700">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="mt-5 space-y-2">
            <h3 className="text-base font-medium text-foreground">
              Operations built for exceptions
            </h3>
            <p className="text-sm text-muted-foreground">
              Escalation playbooks, incident logging and recovery flows keep
              freight moving when plans change.
            </p>
          </div>
        </div>

        <div>
          <div className="size-10 p-2 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center text-indigo-700">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="mt-5 space-y-2">
            <h3 className="text-base font-medium text-foreground">
              Documents & compliance
            </h3>
            <p className="text-sm text-muted-foreground">
              Support for GST, e-way bills and PODs so finance and compliance
              teams stay unblocked.
            </p>
          </div>
        </div>

        <div>
          <div className="size-10 p-2 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center text-indigo-700">
            <Radar className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="mt-5 space-y-2">
            <h3 className="text-base font-medium text-foreground">
              Live visibility for teams
            </h3>
            <p className="text-sm text-muted-foreground">
              Simple public tracking at /track and internal dashboards for ops,
              customer and partner teams.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutApps;
