'use client';

import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';

interface FooterLink {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
  label: string;
  links: FooterLink[];
}

const footerLinks: FooterSection[] = [
  {
    label: 'Network',
    links: [
      { title: 'Services overview', href: '#services' },
      { title: 'Northeast–Delhi lanes', href: '#network' },
    ],
  },
  {
    label: 'Tools',
    links: [
      { title: 'Public tracking', href: '/track' },
      { title: 'Ops login', href: '/login' },
    ],
  },
  {
    label: 'Company',
    links: [
      { title: 'About Tapan Go', href: '#about' },
      { title: 'Support', href: '#support' },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center rounded-t-4xl border border-border/60 bg-pop/10 px-6 py-12 lg:py-16">
      <div className="bg-foreground/20 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur" />

      <div className="grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
        <AnimatedContainer className="space-y-4">
          <div className="relative h-6 w-auto">
            <Image
              src="/assets/tapan-go-logo.png"
              alt="Tapan Go - Cargo Network"
              width={96}
              height={32}
              className="h-6 w-auto object-contain drop-shadow-sm"
              priority
            />
          </div>
          <p className="text-muted-foreground mt-8 text-sm md:mt-0">
            © {year} Tapan Go · Internal cargo operations between Imphal, Guwahati,
            Siliguri and New Delhi.
          </p>
        </AnimatedContainer>

        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-3 xl:col-span-2 xl:mt-0">
          {footerLinks.map((section, index) => (
            <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
              <div className="mb-10 md:mb-0">
                <h3 className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">
                  {section.label}
                </h3>
                <ul className="text-muted-foreground mt-3 space-y-1 text-xs">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <a
                        href={link.href}
                        className="hover:text-foreground inline-flex items-center transition-colors duration-200"
                      >
                        {link.icon && <link.icon className="me-1 size-3" />}
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </footer>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>['className'];
  children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return children;
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
