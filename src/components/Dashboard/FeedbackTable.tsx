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
    user_id: string;
    content: string;
    rate: number;
    username?: string;
}

export default function FeedbackTable() {
    const [data, setData] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns: ColumnDef<Feedback>[] = [
        {
            id: "stt",
            header: "STT",
            cell: ({ row }) => {
                return (
                    <div className="text-center font-medium">
                        {row.index + 1}
                    </div>
                );
            },
            size: 60,
        },
        {
            accessorKey: "created_at",
            header: "Thời gian",
            cell: ({ row }) => {
                const date = new Date(row.original.$createdAt);
                return date.toLocaleString('vi-VN', { 
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            },
        },
        {
            accessorKey: "user_id",
            header: "Người dùng",
            cell: ({ row }) => row.original.username || row.original.user_id,
        },
        {
            accessorKey: "rate",
            header: ({ column }) => {
                return (
                    <div className="text-right">
                        <button
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="flex items-center gap-1"
                        >
                            Đánh giá
                            <ArrowUpDown className="h-4 w-4" />
                        </button>
                    </div>
                );
            },
            cell: ({ row }) => {
                const rating = row.original.rate;
                return (
                    <div className="text-left flex items-center justify-start">
                        {[...Array(5)].map((_, index) => (
                            index < rating ? (
                                <StarSolidIcon key={index} className="h-5 w-5 text-yellow-400" />
                            ) : (
                                <StarOutlineIcon key={index} className="h-5 w-5 text-gray-300" />
                            )
                        ))}
                    </div>
                );
            },
        },
        {
            accessorKey: "content",
            header: "Nội dung",
            cell: ({ row }) => row.original.content,
        },
    ];

    useEffect(() => {
        const fetchFeedbacks = () => {
            setLoading(true);
            databases.listDocuments(
                config.databaseId,
                config.collections.feedback,
                [Query.orderDesc('$createdAt')]
            )
            .then((response) => {
                const feedbacks = response.documents as Feedback[];
                
                // Fetch usernames for all feedbacks
                return Promise.all(
                    feedbacks.map(feedback => 
                        databases.getDocument(
                            config.databaseId,
                            config.collections.users,
                            feedback.user_id
                        )
                        .then(userDoc => ({
                            ...feedback,
                            username: userDoc.name || userDoc.email
                        }))
                        .catch(error => {
                            console.error('Error fetching user:', error);
                            return {
                                ...feedback,
                                username: feedback.user_id
                            };
                        })
                    )
                );
            })
            .then(feedbacksWithUsernames => {
                setData(feedbacksWithUsernames);
            })
            .catch(error => {
                console.error('Error fetching feedbacks:', error);
            })
            .finally(() => {
                setLoading(false);
            });
        };

        fetchFeedbacks();
    }, []);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getCoreRowModel: getCoreRowModel(),
        state: {
            sorting,
        },
    });

    if (loading) {
        return <div>Loading...</div>;
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
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                Không có dữ liệu.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
} 