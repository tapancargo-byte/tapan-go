import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	// Enable TypeScript error checking for production safety
	typescript: {
		ignoreBuildErrors: false,
	},
	// Enable image optimization for better performance
	images: {
		unoptimized: false,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "api.dicebear.com",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
		],
		formats: ["image/webp", "image/avif"],
	},
	experimental: {
		// Optimize package imports for faster builds
		optimizePackageImports: [
			"lucide-react",
			"date-fns",
			"@radix-ui/react-dialog",
			"@radix-ui/react-popover",
			"@radix-ui/react-select",
			"@radix-ui/react-dropdown-menu",
			"react-hook-form",
			"framer-motion",
			"motion/react",
		],
	},
	// Add security headers for production
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "Referrer-Policy",
						value: "origin-when-cross-origin",
					},
				],
			},
		];
	},
	// Suppress Sentry warnings for require-in-the-middle
	webpack: (config) => {
		config.ignoreWarnings = [
			{ module: /node_modules\/require-in-the-middle/ },
			{
				message:
					/Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
			},
		];
		return config;
	},
};

const sentryOptions = {
	// For all available options, see:
	// https://www.npmjs.com/package/@sentry/webpack-plugin#options

	org: "tapan-associate",

	project: "javascript-nextjs",

	// Only print logs for uploading source maps in CI
	silent: !process.env.CI,

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

	// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	// This can increase your server load as well as your hosting bill.
	// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
	// side errors will fail.
	tunnelRoute: "/monitoring",

	// Do not tree-shake Sentry logger statements so Sentry.logger calls remain available
	disableLogger: false,

	// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
	// See the following for more information:
	// https://docs.sentry.io/product/crons/
	// https://vercel.com/docs/cron-jobs
	automaticVercelMonitors: true,
};

export default process.env.NODE_ENV === "development"
	? nextConfig
	: withSentryConfig(nextConfig, sentryOptions);
