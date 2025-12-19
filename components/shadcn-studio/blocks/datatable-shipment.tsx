'use client'

import React from 'react'
import {
    ColumnDef,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    flexRender,
    SortingState,
    ColumnFiltersState
} from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoreHorizontal, PlusIcon, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'

export type Shipment = {
    id: string
    reference: string
    customer: string
    origin: string
    destination: string
    status: 'In Transit' | 'Pending' | 'Delivered' | 'Cancelled'
    weight: string
}

const data: Shipment[] = [
    {
        id: '1',
        reference: 'SHP-IMF-2412-001',
        customer: 'Acme Industries',
        origin: 'Imphal',
        destination: 'New Delhi',
        status: 'In Transit',
        weight: '45.5 kg'
    },
    {
        id: '2',
        reference: 'SHP-IMF-2412-002',
        customer: 'Tech Solutions Pvt Ltd',
        origin: 'Imphal',
        destination: 'Mumbai',
        status: 'Pending',
        weight: '23 kg'
    },
    {
        id: '3',
        reference: 'SHP-DEL-2412-003',
        customer: 'Global Trade Corp',
        origin: 'New Delhi',
        destination: 'Kolkata',
        status: 'Delivered',
        weight: '78.2 kg'
    },
    {
        id: '4',
        reference: 'SHP-IMF-2412-004',
        customer: 'Northeast Exports',
        origin: 'Imphal',
        destination: 'Chennai',
        status: 'In Transit',
        weight: '34.8 kg'
    },
    {
        id: '5',
        reference: 'SHP-DEL-2412-005',
        customer: 'Sunrise Logistics',
        origin: 'New Delhi',
        destination: 'Bangalore',
        status: 'Delivered',
        weight: '56.3 kg'
    },
    {
        id: '6',
        reference: 'SHP-IMF-2412-006',
        customer: 'Manipur Handicrafts',
        origin: 'Imphal',
        destination: 'Hyderabad',
        status: 'Pending',
        weight: '12.5 kg'
    },
    {
        id: '7',
        reference: 'SHP-IMF-2412-007',
        customer: 'Eastern Traders',
        origin: 'Imphal',
        destination: 'Pune',
        status: 'In Transit',
        weight: '89 kg'
    },
    {
        id: '8',
        reference: 'SHP-DEL-2412-008',
        customer: 'Metro Supplies',
        origin: 'New Delhi',
        destination: 'Ahmedabad',
        status: 'Delivered',
        weight: '41.7 kg'
    },
    {
        id: '9',
        reference: 'SHP-IMF-2412-009',
        customer: 'Hill View Enterprises',
        origin: 'Imphal',
        destination: 'Jaipur',
        status: 'Cancelled',
        weight: '28.4 kg'
    },
    {
        id: '10',
        reference: 'SHP-IMF-2412-010',
        customer: 'Seven Sisters Trading',
        origin: 'Imphal',
        destination: 'Lucknow',
        status: 'Pending',
        weight: '63.2 kg'
    }
]

export const columns: ColumnDef<Shipment>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label='Select row'
            />
        ),
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'reference',
        header: 'Reference',
        cell: ({ row }) => <div className='font-medium'>{row.getValue('reference')}</div>
    },
    {
        accessorKey: 'customer',
        header: 'Customer',
        cell: ({ row }) => <div className='text-sm'>{row.getValue('customer')}</div>
    },
    {
        accessorKey: 'origin',
        header: 'Origin',
        cell: ({ row }) => <div className='text-sm text-muted-foreground'>{row.getValue('origin')}</div>
    },
    {
        accessorKey: 'destination',
        header: 'Destination',
        cell: ({ row }) => <div className='text-sm text-muted-foreground'>{row.getValue('destination')}</div>
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            return (
                <Badge
                    variant='secondary'
                    className={`
            rounded-full px-2 py-0.5 text-xs font-medium border
            ${status === 'In Transit' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50' : ''}
            ${status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50' : ''}
            ${status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50' : ''}
            ${status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50' : ''}
          `}
                >
                    <div className={`mr-1.5 h-1.5 w-1.5 rounded-full 
                 ${status === 'In Transit' ? 'bg-blue-500' : ''}
                 ${status === 'Pending' ? 'bg-orange-500' : ''}
                 ${status === 'Delivered' ? 'bg-green-500' : ''}
                 ${status === 'Cancelled' ? 'bg-red-500' : ''}
            `} />
                    {status}
                </Badge>
            )
        }
    },
    {
        accessorKey: 'weight',
        header: ({ column }) => {
            return (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        className="h-8 text-xs font-medium hover:bg-transparent"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Weight
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => <div className='text-right font-medium'>{row.getValue('weight')}</div>,
        sortingFn: (rowA, rowB) => {
            const a = parseFloat(rowA.getValue('weight') as string) || 0
            const b = parseFloat(rowB.getValue('weight') as string) || 0
            return a - b
        }
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                            <span className='sr-only'>Open menu</span>
                            <MoreHorizontal className='h-4 w-4' />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>
                            Copy shipment ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View customer</DropdownMenuItem>
                        <DropdownMenuItem>View shipment details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]

export function ShipmentDataTable() {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            rowSelection
        }
    })

    return (
        <div className='w-full'>
            <div className='flex items-center justify-between py-4'>
                <Input
                    placeholder='Filter by reference...'
                    value={(table.getColumn('reference')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                        table.getColumn('reference')?.setFilterValue(event.target.value)
                    }
                    className='max-w-sm'
                />
                <div className="flex items-center gap-2">
                    <Button variant='outline' size="sm" className='ml-auto'>
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Columns
                    </Button>
                    <Button size="sm" className='ml-auto'>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Shipment
                    </Button>
                </div>
            </div>
            <div className='rounded-md border bg-card'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className='h-24 text-center'>
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-between space-x-2 py-4 px-4 text-xs text-muted-foreground border-t">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
