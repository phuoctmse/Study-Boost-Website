// "use client";

// import { useState, useEffect } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   ColumnDef,
//   SortingState,
//   flexRender,
//   getCoreRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import { ArrowUpDown } from "lucide-react";
// import { databases } from "@/lib/appwrite";
// import { config } from "@/lib/appwrite";
// import { Query } from "appwrite";
// import { cn } from "@/lib/utils";

// interface Transaction {
//     $id: string;
//     gateway: string;
//     transactionDate: string;
//     accountNumber: string;
//     subAccount: string;
//     amountIn: number;
//     amountOut: number;
//     accumulated: number;
//     code: string;
//     transactionContent: string;
//     referenceNumber: string;
//     body: string;
//     sepay_id: string;
// }

// const columns: ColumnDef<Transaction>[] = [
//   {
//     accessorKey: "user_id",
//     header: ({ column }) => {
//       return (
//         <button
//           className="flex items-center font-semibold text-blue-600 hover:text-blue-800"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           User ID
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </button>
//       );
//     },
//     cell: ({ row }) => (
//       <div className="font-medium text-gray-900">{row.getValue("user_id")}</div>
//     ),
//   },
//   {
//     accessorKey: "type",
//     header: ({ column }) => {
//       return (
//         <button
//           className="flex items-center font-semibold text-blue-600 hover:text-blue-800"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Type
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </button>
//       );
//     },
//     cell: ({ row }) => {
//       const type = row.getValue("type") as string;
//       return (
//         <div
//           className={cn(
//             "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
//             type === "credit" && "bg-green-100 text-green-800",
//             type === "debit" && "bg-red-100 text-red-800"
//           )}
//         >
//           {type.charAt(0).toUpperCase() + type.slice(1)}
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "amount",
//     header: ({ column }) => {
//       return (
//         <button
//           className="flex items-center font-semibold text-blue-600 hover:text-blue-800"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Amount
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </button>
//       );
//     },
//     cell: ({ row }) => {
//       const amount = row.getValue<number>("amount");
//       const type = row.getValue("type") as string;
//       return (
//         <div className={cn(
//           "font-medium",
//           type === "credit" ? "text-green-600" : "text-red-600"
//         )}>
//           {type === "credit" ? "+" : "-"}${amount.toLocaleString()}
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "status",
//     header: ({ column }) => {
//       return (
//         <button
//           className="flex items-center font-semibold text-blue-600 hover:text-blue-800"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Status
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </button>
//       );
//     },
//     cell: ({ row }) => {
//       const status = row.getValue("status") as string;
//       return (
//         <div
//           className={cn(
//             "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
//             status === "completed" && "bg-green-100 text-green-800",
//             status === "pending" && "bg-yellow-100 text-yellow-800",
//             status === "failed" && "bg-red-100 text-red-800"
//           )}
//         >
//           {status.charAt(0).toUpperCase() + status.slice(1)}
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "description",
//     header: ({ column }) => {
//       return (
//         <button
//           className="flex items-center font-semibold text-blue-600 hover:text-blue-800"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Description
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </button>
//       );
//     },
//     cell: ({ row }) => (
//       <div className="text-gray-600 max-w-xs truncate">
//         {row.getValue("description")}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "created_at",
//     header: ({ column }) => {
//       return (
//         <button
//           className="flex items-center font-semibold text-blue-600 hover:text-blue-800"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Date
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </button>
//       );
//     },
//     cell: ({ row }) => (
//       <div className="text-gray-600">
//         {new Date(row.getValue("created_at")).toLocaleDateString()}
//       </div>
//     ),
//   },
// ];

// export default function TransactionsTable() {
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [data, setData] = useState<Transaction[]>([]);

//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     onSortingChange: setSorting,
//     state: {
//       sorting,
//     },
//   });

//   useEffect(() => {
//     const fetchTransactions = async () => {
//       try {
//         const response = await databases.listDocuments(
//           config.databaseId,
//           config.collections.transactions,
//           [Query.orderDesc("$createdAt"), Query.limit(100)]
//         );
//         setData(response.documents.map(doc => ({
//           id: doc.$id,
//           user_id: doc.user_id,
//           type: doc.type,
//           amount: doc.amount,
//           status: doc.status,
//           description: doc.description,
//           created_at: doc.$createdAt
//         })));
//       } catch (error) {
//         console.error("Error fetching transactions:", error);
//       }
//     };

//     fetchTransactions();
//   }, []);

//   return (
//     <div className="rounded-lg border bg-white shadow">
//       <Table>
//         <TableHeader>
//           {table.getHeaderGroups().map((headerGroup) => (
//             <TableRow key={headerGroup.id} className="bg-gray-50 hover:bg-gray-50">
//               {headerGroup.headers.map((header) => (
//                 <TableHead key={header.id} className="py-4">
//                   {header.isPlaceholder
//                     ? null
//                     : flexRender(
//                         header.column.columnDef.header,
//                         header.getContext()
//                       )}
//                 </TableHead>
//               ))}
//             </TableRow>
//           ))}
//         </TableHeader>
//         <TableBody>
//           {table.getRowModel().rows?.length ? (
//             table.getRowModel().rows.map((row) => (
//               <TableRow
//                 key={row.id}
//                 data-state={row.getIsSelected() && "selected"}
//                 className="hover:bg-gray-50 transition-colors"
//               >
//                 {row.getVisibleCells().map((cell) => (
//                   <TableCell key={cell.id} className="py-3">
//                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             ))
//           ) : (
//             <TableRow>
//               <TableCell 
//                 colSpan={columns.length} 
//                 className="h-24 text-center text-gray-500"
//               >
//                 No transactions found.
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   );
// } 