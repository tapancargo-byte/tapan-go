"use client";

import "@/components/kibo-ui/typography";
import { DotPattern } from "@/components/ui/dot-pattern";
import Image from "next/image";

const TypographyExample = () => (
  <div className="relative flex size-full items-center justify-center overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
    <DotPattern glow className="opacity-40" />
    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background via-background/70 to-transparent" />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/70 to-transparent" />

    <div className="relative z-10 grid w-full max-w-6xl gap-8 rounded-2xl border border-border/60 bg-card/80 p-6 shadow-md backdrop-blur-md md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:p-8">
      <div className="typography mx-auto max-w-3xl">
        <h1>Styling the Web: A Modern CSS Journey</h1>

        <p>
          CSS has come a long way since its inception. From simple layout tweaks
          to complex responsive designs, it&apos;s become an essential tool for
          crafting delightful web experiences. In this article, we&apos;ll explore
          various HTML elements commonly styled with modern CSS utility systems
          like <code>tailwindcss</code> and component libraries.
        </p>

        <h2>Introduction</h2>
        <p>
          Web design today is more accessible than ever. Thanks to utility-first
          frameworks and component-based architectures, developers can build
          beautiful UIs with less effort.
        </p>

        <h3>Key Benefits of Utility CSS</h3>
        <ul>
          <li>Faster development</li>
          <li>Consistent design system</li>
          <li>Better collaboration between dev and design</li>
        </ul>

        <h3>What You Need</h3>
        <ol>
          <li>Basic HTML/CSS knowledge</li>
          <li>Code editor (e.g., VS Code)</li>
          <li>Modern browser for testing</li>
        </ol>

        <h2>Checklist</h2>
        <ul>
          <li>
            <input checked disabled type="checkbox" /> <p>Install Tailwind CSS</p>
          </li>
          <li>
            <input disabled type="checkbox" /> <p>Configure PostCSS</p>
          </li>
          <li>
            <input disabled type="checkbox" /> <p>Create base components</p>
          </li>
        </ul>

        <h2>Sample Image</h2>
        <p>
          Here&apos;s a sample image to test image styling. Make sure it scales well on
          all screen sizes.
        </p>
        <center>
          <Image
            alt="Sample placeholder"
            height={400}
            src="https://placehold.co/600x400"
            unoptimized
            width={600}
          />
        </center>

        <h2>Code Example</h2>
        <pre>
          <code>{`/* Tailwind example */
.button {
  @apply px-4 py-2 bg-blue-600 text-white rounded;
}`}</code>
        </pre>

        <h2>Blockquote</h2>
        <blockquote>
          "Design is not just what it looks like and feels like. Design is how it
          works." — Steve Jobs
        </blockquote>

        <h2>Table Example</h2>
        <table>
          <thead>
            <tr>
              <th>Framework</th>
              <th>Type</th>
              <th>Stars</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tailwind CSS</td>
              <td>Utility-First</td>
              <td>70k+</td>
            </tr>
            <tr>
              <td>Bootstrap</td>
              <td>Component-Based</td>
              <td>160k+</td>
            </tr>
            <tr>
              <td>Bulma</td>
              <td>Utility/Component Hybrid</td>
              <td>45k+</td>
            </tr>
          </tbody>
        </table>

        <h2>Inline Elements</h2>
        <p>
          You can <strong>bold</strong> text, <em>italicize</em> it,
          <u>underline</u> it, or even add <a href="https://example.com">links</a>.
          Here&apos;s some <code>inline code</code> too.
        </p>

        <h2>Definition List</h2>
        <dl>
          <dt>CSS</dt>
          <dd>Cascading Style Sheets</dd>
          <dt>HTML</dt>
          <dd>HyperText Markup Language</dd>
          <dt>JS</dt>
          <dd>JavaScript</dd>
        </dl>

        <h2>Details and Summary</h2>
        <details>
          <summary>Click to expand additional info</summary>
          <p>
            Utility CSS simplifies the process of managing and scaling CSS in
            large projects.
          </p>
        </details>

        <h2>Superscript & Subscript</h2>
        <p>
          E = mc<sup>2</sup> is Einstein&apos;s mass-energy equivalence. Water is H
          <sub>2</sub>O.
        </p>

        <h2>Conclusion</h2>
        <p>
          Whether you&apos;re using Tailwind, vanilla CSS, or any other system, a
          solid understanding of how HTML elements behave is key to great
          styling. Test extensively to ensure consistent, accessible results
          across devices.
        </p>
      </div>

      <aside className="hidden h-full flex-col justify-between border-l border-border/60 pl-6 text-sm text-muted-foreground md:flex">
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
            Typography system
          </p>
          <p className="mb-4">
            This demo shows how the global <code>.typography</code> class styles
            real-world content blocks using your OKLCH-powered design tokens.
          </p>
          <ul className="space-y-1">
            <li>• Headings (h1–h3)</li>
            <li>• Lists, tables, and inline code</li>
            <li>• Blockquotes and callouts</li>
            <li>• Details / summary &amp; definition lists</li>
          </ul>
        </div>

        <div className="mt-6 rounded-lg border border-border/40 bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">Usage</p>
          <p>
            Import <code>"@/components/kibo-ui/typography"</code> once at the top of
            any client component and wrap rich text in a
            <code> &lt;div className="typography"&gt;</code> container.
          </p>
        </div>
      </aside>
    </div>
  </div>
);

export default TypographyExample;
