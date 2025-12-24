"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export const description = "Shipment Traffic Diagnostics"

// Generate shipment data
const generateShipmentData = () => {
    const data = []
    const startDate = new Date("2024-10-01")
    const endDate = new Date("2024-12-31")

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0]
        const dayOfWeek = d.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        const baseShipments = isWeekend ? 15 : 45
        const baseDelivered = isWeekend ? 12 : 38

        data.push({
            date: dateStr,
            shipments: baseShipments + Math.floor(Math.random() * 25),
            delivered: baseDelivered + Math.floor(Math.random() * 18),
            exceptions: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0
        })
    }
    return data
}

const chartData = generateShipmentData()

const chartConfig = {
    shipments: {
        label: "Total Flow",
        color: "hsl(var(--chart-1))",
    },
    delivered: {
        label: "Successful Handovers",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export function ShipmentDiagnostics() {
    const isMobile = useIsMobile()
    const [timeRange, setTimeRange] = React.useState("90d")

    const filteredData = React.useMemo(() => {
        const referenceDate = new Date("2024-12-31")
        let daysToSubtract = 90
        if (timeRange === "30d") daysToSubtract = 30
        if (timeRange === "7d") daysToSubtract = 7

        const startDate = new Date(referenceDate)
        startDate.setDate(startDate.getDate() - daysToSubtract)

        return chartData.filter((item) => new Date(item.date) >= startDate)
    }, [timeRange])

    return (
        <Card className="glass-panel border-white/5 dark:border-white/5 bg-background/50 backdrop-blur-xl">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b border-white/5 py-5 sm:flex-row">
                <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle className="text-lg font-semibold neon-text-glow text-primary">Network Diagnostics</CardTitle>
                    <CardDescription className="text-muted-foreground/80">
                        Real-time traffic analysis
                    </CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                        className="w-[160px] rounded-lg sm:ml-auto"
                        aria-label="Select time range"
                    >
                        <SelectValue placeholder="Last 3 months" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="90d" className="rounded-lg">
                            Last 3 months
                        </SelectItem>
                        <SelectItem value="30d" className="rounded-lg">
                            Last 30 days
                        </SelectItem>
                        <SelectItem value="7d" className="rounded-lg">
                            Last 7 days
                        </SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[280px] w-full"
                >
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient id="fillShipments" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-shipments)"
                                    stopOpacity={0.4}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-shipments)"
                                    stopOpacity={0.0}
                                />
                            </linearGradient>
                            <linearGradient id="fillDelivered" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-delivered)"
                                    stopOpacity={0.4}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-delivered)"
                                    stopOpacity={0.0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--primary)/0.1)" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                        />
                        <ChartTooltip
                            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }}
                                    indicator="dot"
                                    className="glass-card border-white/10"
                                />
                            }
                        />
                        <Area
                            dataKey="shipments"
                            type="monotone"
                            fill="url(#fillShipments)"
                            stroke="var(--color-shipments)"
                            strokeWidth={2}
                            stackId="a"
                            animationDuration={1500}
                        />
                        <Area
                            dataKey="delivered"
                            type="monotone"
                            fill="url(#fillDelivered)"
                            stroke="var(--color-delivered)"
                            strokeWidth={2}
                            stackId="a"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
