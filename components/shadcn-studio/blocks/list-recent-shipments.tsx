import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ShipmentItem {
    id: string
    company: string
    reference: string
    status: 'In transit' | 'Pending' | 'Delivered'
    initials: string
}

const recentShipments: ShipmentItem[] = [
    {
        id: '1',
        company: 'Acme Industries',
        reference: 'SHP-IM-2412-001',
        status: 'In transit',
        initials: 'A',
    },
    {
        id: '2',
        company: 'Tech Solutions Pvt Ltd',
        reference: 'SHP-IM-2412-002',
        status: 'Pending',
        initials: 'T',
    },
    {
        id: '3',
        company: 'Global Trade Corp',
        reference: 'SHP-DEL-2412-003',
        status: 'Delivered',
        initials: 'G',
    },
    {
        id: '4',
        company: 'Northeast Exports',
        reference: 'SHP-NE-2412-004',
        status: 'In transit',
        initials: 'N',
    },
    {
        id: '5',
        company: 'Sunrise Logistics',
        reference: 'SHP-DEL-2412-005',
        status: 'Delivered',
        initials: 'S',
    },
    {
        id: '6',
        company: 'Manipur Handicrafts',
        reference: 'SHP-IM-2412-006',
        status: 'Pending',
        initials: 'M',
    },
]

export function RecentShipmentsList() {
    return (
        <Card className="col-span-full xl:col-span-1 h-full">
            <CardHeader>
                <CardTitle className="text-base font-medium">Recent Shipments</CardTitle>
                <CardDescription className="sr-only">List of recent shipment activities</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                {recentShipments.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-9 w-9 bg-muted/50 border border-border">
                                <AvatarFallback className="bg-transparent text-muted-foreground text-xs">{item.initials}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium leading-none">{item.company}</p>
                                <p className="text-xs text-muted-foreground">{item.reference}</p>
                            </div>
                        </div>
                        <Badge
                            variant="secondary"
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium 
                                ${item.status === 'In transit' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                                ${item.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' : ''}
                                ${item.status === 'Delivered' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : ''}
                            `}
                        >
                            {item.status}
                        </Badge>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
