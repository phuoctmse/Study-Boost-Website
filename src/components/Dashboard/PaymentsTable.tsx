"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ColumnDef,
    SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { databases } from "@/lib/appwrite";
import { config } from "@/lib/appwrite";
import { Query, Models } from "appwrite";
import { cn } from "@/lib/utils";

type Payment = {
    $id: string;
    user_id: string;
    package_id: string;
    payment_transaction_id: string;
    started_at: string;
    ended_at: string;
    status: "active" | "expired" | "cancelled";
    created_at: string;
    username?: string;
    packageName?: string;
};

type PaymentTransaction = {
    $id: string;
    gateway: string;
    transactionDate: string;
    accountNumber: string;
    subAccount: string;
    amountIn: number;
    amountOut: number;
    accumulated: number;
    code: string;
    transactionContent: string;
    referenceNumber: string;
    body: string;
    sepay_id: string;
};

const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: "username",
        header: ({ column }) => {
            return (
                <button
                    className="flex items-center"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Username
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
            );
        },
        cell: ({ row }) => (
            <div className="font-medium text-gray-900">
                {row.getValue("username") || row.getValue("user_id")}
            </div>
        ),
    },
    {
        accessorKey: "packageName",
        header: ({ column }) => {
            return (
                <button
                    className="flex items-center"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Package
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
            );
        },
        cell: ({ row }) => (
            <div className="text-gray-600">
                {row.getValue("packageName") || "Unknown Package"}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <button
                    className="flex items-center"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
            );
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <div
                    className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        {
                            "bg-green-100 text-green-800": status === "Completed",
                            "bg-yellow-100 text-yellow-800": status === "Pending",
                            "bg-red-100 text-red-800": status === "Cancelled",
                        }
                    )}
                >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
            );
        },
    },
    {
        accessorKey: "started_at",
        header: ({ column }) => {
            return (
                <button
                    className="flex items-center"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Start Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
            );
        },
        cell: ({ row }) => (
            <div className="text-gray-600">
                {new Date(row.getValue("started_at")).toLocaleDateString()}
            </div>
        ),
    },
    {
        accessorKey: "ended_at",
        header: ({ column }) => {
            return (
                <button
                    className="flex items-center"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    End Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
            );
        },
        cell: ({ row }) => (
            <div className="text-gray-600">
                {new Date(row.getValue("ended_at")).toLocaleDateString()}
            </div>
        ),
    },
];

export default function PaymentsTable() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [data, setData] = useState<Payment[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [transactionDetails, setTransactionDetails] = useState<PaymentTransaction | null>(null);
    const [loading, setLoading] = useState(true);

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
        const fetchPayments = async () => {
            try {
                const response = await databases.listDocuments(
                    config.databaseId,
                    config.collections.payments,
                    [Query.orderDesc("$createdAt")]
                );
                
                const paymentsWithDetails = await Promise.all(
                    response.documents.map(async (payment) => {
                        try {
                            const [userResponse, packageResponse] = await Promise.all([
                                databases.getDocument(
                                    config.databaseId,
                                    config.collections.users,
                                    payment.user_id
                                ),
                                databases.getDocument(
                                    config.databaseId,
                                    config.collections.packages,
                                    payment.package_id
                                )
                            ]);

                            return {
                                ...payment,
                                username: userResponse.username,
                                packageName: packageResponse.name,
                            } as unknown as Payment;
                        } catch (error) {
                            console.error(`Error fetching details for payment ${payment.$id}:`, error);
                            return {
                                ...payment,
                                username: "Unknown User",
                                packageName: "Unknown Package",
                            } as unknown as Payment;
                        }
                    })
                );
                
                setData(paymentsWithDetails);
            } catch (error) {
                console.error("Error fetching payments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const handleRowClick = async (payment: Payment) => {
        setSelectedPayment(payment);
        try {
            const response = await databases.getDocument(
                config.databaseId,
                config.collections.transactions,
                payment.payment_transaction_id
            );
            setTransactionDetails(response as unknown as PaymentTransaction);
        } catch (error) {
            console.error("Error fetching transaction details:", error);
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    if (data.length === 0) {
        return <div className="text-center py-4">No payments found</div>;
    }

    return (
        <>
            <div className="rounded-md border shadow-sm">
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
                        {table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                onClick={() => handleRowClick(row.original)}
                                className="cursor-pointer hover:bg-gray-50"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Payment Transaction Details</DialogTitle>
                    </DialogHeader>
                    {transactionDetails && selectedPayment && (
                        <div className="grid gap-4 py-4">
                            {/* User and Payment Info */}
                            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Username</p>
                                    <p className="text-sm text-gray-900 font-medium">{selectedPayment.username || "Unknown User"}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Payment Status</p>
                                    <div
                                        className={cn(
                                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                            {
                                                "bg-green-100 text-green-800": selectedPayment.status === "active",
                                                "bg-yellow-100 text-yellow-800": selectedPayment.status === "expired",
                                                "bg-red-100 text-red-800": selectedPayment.status === "cancelled",
                                            }
                                        )}
                                    >
                                        {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Transaction Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Gateway</p>
                                    <p className="text-sm text-gray-900">{transactionDetails.gateway}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Transaction Date</p>
                                    <p className="text-sm text-gray-900">
                                        {new Date(transactionDetails.transactionDate).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Account Number</p>
                                    <p className="text-sm text-gray-900">{transactionDetails.accountNumber}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Sub Account</p>
                                    <p className="text-sm text-gray-900">{transactionDetails.subAccount}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Amount In</p>
                                    <p className="text-sm text-gray-900">{transactionDetails.amountIn.toLocaleString()} VND</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Amount Out</p>
                                    <p className="text-sm text-gray-900">{transactionDetails.amountOut.toLocaleString()} VND</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Accumulated</p>
                                    <p className="text-sm text-gray-900">{transactionDetails.accumulated.toLocaleString()} VND</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Transaction Code</p>
                                    <p className="text-sm text-gray-900">{transactionDetails.code}</p>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Transaction Content</p>
                                    <p className="text-sm text-gray-900">{transactionDetails.transactionContent}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Reference Number</p>
                                    <p className="text-sm text-gray-900">{transactionDetails.referenceNumber}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Sepay ID</p>
                                    <p className="text-sm text-gray-900">{transactionDetails.sepay_id}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
} 