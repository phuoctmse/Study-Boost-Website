import { useState, useEffect } from 'react';
import { databases, config } from '@/lib/appwrite';
import { Query, Models } from 'appwrite';
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { ArrowUpDown } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ColumnDef,
    SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

interface Feedback extends Models.Document {
    user_id: string
    content: string
    rate: number
    created_at: Date
}

function RatingStars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>
                    {star <= rating ? (
                        <StarSolidIcon className="w-5 h-5 text-yellow-400" />
                    ) : (
                        <StarOutlineIcon className="w-5 h-5 text-gray-300" />
                    )}
                </span>
            ))}
        </div>
    );
}

export default function FeedbackTable() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [data, setData] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    const columns: ColumnDef<Feedback>[] = [
        {
            accessorKey: "user_id",
            header: ({ column }) => {
                return (
                    <button
                        className="flex items-center"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        User ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                );
            },
        },
        {
            accessorKey: "content",
            header: ({ column }) => {
                return (
                    <button
                        className="flex items-center"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Content
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                );
            },
            cell: ({ row }) => (
                <div className="max-w-md truncate">
                    {row.getValue("content")}
                </div>
            ),
        },
        {
            accessorKey: "rate",
            header: ({ column }) => {
                return (
                    <button
                        className="flex items-center"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Rating
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                );
            },
            cell: ({ row }) => (
                <RatingStars rating={row.getValue("rate")} />
            ),
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => {
                return (
                    <button
                        className="flex items-center"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                );
            },
            cell: ({ row }) => (
                <div>
                    {new Date(row.getValue("created_at")).toLocaleDateString()}
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    });

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await databases.listDocuments(
                    config.databaseId,
                    config.collections.feedback,
                    [
                        Query.orderDesc('$createdAt'),
                    ]
                );
                setData(response.documents as Feedback[]);
            } catch (error) {
                console.error('Error fetching feedback:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                No feedback found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
} 