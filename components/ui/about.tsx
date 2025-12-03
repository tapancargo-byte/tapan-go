"use client";

import TruckIcon from "@/components/icons/truck";
import MapPinIcon from "@/components/icons/map-pin";
import PackageIcon from "@/components/icons/package";
import ShieldIcon from "@/components/icons/shield";
import EmailIcon from "@/components/icons/email";
import AtomIcon from "@/components/icons/atom";
import { AnimatedCard } from "@/components/ui/animated-card";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Marquee } from "@/components/ui/marquee";
import { TextAnimate } from "@/components/ui/text-animate";

const aboutPillars = [
  {
    icon: TruckIcon,
    title: "Northeast–Delhi specialist",
    body:
      "15+ years moving air and surface cargo between Imphal and New Delhi.",
  },
  {
    icon: MapPinIcon,
    title: "Reliable network & schedules",
    body:
      "Line-haul and hub timings tuned for predictable transits even in peak season.",
  },
  {
    icon: PackageIcon,
    title: "Air + surface combinations",
    body: "Balanced options for time-critical moves and cost-sensitive cargo, lane by lane.",
  },
  {
    icon: ShieldIcon,
    title: "Operations built for exceptions",
    body:
      "Escalation playbooks, incident logging and recovery flows keep freight moving when plans change.",
  },
  {
    icon: EmailIcon,
    title: "Documents & compliance",
    body:
      "Support for GST, e-way bills and PODs so finance and compliance teams stay unblocked.",
  },
  {
    icon: AtomIcon,
    title: "Live visibility for teams",
    body:
      "Simple public tracking at /track and internal dashboards for ops, customer and partner teams.",
  },
];

export function AboutApps() {
  return (
    <section
      aria-labelledby="about-tapan-heading"
      className="py-10 lg:py-12"
    >
      <div className="mx-auto max-w-6xl px-0 lg:px-2">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)] items-start">
          {/* Left: Story & pillars */}
          <div>
            <h2
              id="about-tapan-heading"
              className="text-3xl font-semibold text-foreground md:text-4xl"
            >
              About Tapan Associate
            </h2>
            <TextAnimate
              as="p"
              by="word"
              animation="blurInUp"
              duration={0.6}
              className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base"
            >
              Cargo lanes, hubs and operations focused on keeping freight moving
              between Imphal and New Delhi.
            </TextAnimate>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {aboutPillars.map((pillar) => (
                <AnimatedCard
                  key={pillar.title}
                  className="relative h-full border-border/60 bg-background/90 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-pop text-primary">
                      <pillar.icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-foreground">
                        {pillar.title}
                      </h3>
                      <p className="text-[0.75rem] leading-relaxed text-muted-foreground">
                        {pillar.body}
                      </p>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>

          {/* Right: Magic-style ops snapshot */}
          <AnimatedCard className="relative overflow-hidden border-border/60 bg-pop/40 p-5 sm:p-6">
            <DotPattern
              glow
              cr={1.1}
              className="pointer-events-none absolute inset-0 text-border/50 opacity-70 [mask-image:radial-gradient(circle_at_center,_black,_transparent_70%)]"
            />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between text-[0.65rem] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                <span>Ops DNA · Imphal–Delhi lane</span>
                <span className="rounded-full border border-border/60 bg-background/80 px-2 py-0.5">
                  Imphal · New Delhi
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[0.75rem]">
                <div className="rounded-lg border border-border/60 bg-background/90 p-3">
                  <p className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    Years in lane
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">15+</p>
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">
                    Focused on Northeast–Delhi moves since 2010.
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/90 p-3">
                  <p className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    Core hubs
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">2</p>
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">
                    Imphal and New Delhi.
                  </p>
                </div>
              </div>

              <Marquee
                className="rounded-full border border-border/50 bg-background/90 px-3 py-2 [--duration:32s]"
                pauseOnHover
              >
                <div className="flex items-center gap-6 text-[0.7rem] text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Exception handling playbooks for missed departures.
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/80" />
                    Finance-ready documents: GST, e-way bills, PODs.
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    Live tracking at /track for customers and partners.
                  </span>
                </div>
              </Marquee>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </section>
  );
}

export default AboutApps;
