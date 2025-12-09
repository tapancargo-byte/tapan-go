"use client"

import NextTopLoader from "nextjs-toploader"

export default function TopLoader() {
  return (
    <NextTopLoader
      color="hsl(var(--primary))"
      initialPosition={0.18}
      crawlSpeed={150}
      height={3}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={350}
    />
  )
}
