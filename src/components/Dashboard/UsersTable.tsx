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
import { Query } from "appwrite";
import { cn } from "@/lib/utils";

type User = {
  id: string;
  username: string;
  email: string;
  subscription_plan: string;
  created_at: Date;
  updated_at: Date;
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "username",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center font-semibold text-blue-600 hover:text-blue-800"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          UserName
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium text-gray-900">{row.getValue("username")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center font-semibold text-blue-600 hover:text-blue-800"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => (
      <div className="text-gray-600">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "subscription_plan",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center font-semibold text-blue-600 hover:text-blue-800"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Subscription Plan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => {
      const plan = row.getValue("subscription_plan") as string;
      return (
        <div className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          plan === "Dài Hạn" && "bg-purple-100 text-purple-800",
          plan === "Students" && "bg-blue-100 text-blue-800",
          plan === "Free" && "bg-gray-100 text-gray-800"
        )}>
          {plan.charAt(0).toUpperCase() + plan.slice(1)}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center font-semibold text-blue-600 hover:text-blue-800"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("created_at") as Date;
      return (
        <div className="text-gray-600">
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center font-semibold text-blue-600 hover:text-blue-800"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("updated_at") as Date;
      return (
        <div className="text-gray-600">
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
];

export default function UsersTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [data, setData] = useState<User[]>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await databases.listDocuments(
          config.databaseId,
          config.collections.users,
          [Query.orderDesc("$createdAt"), Query.limit(100)]
        );
        setData(response.documents.map(doc => ({
          id: doc.$id,
          username: doc.username,
          email: doc.email,
          subscription_plan: doc.subscription_plan,
          created_at: new Date(doc.created_at),
          updated_at: new Date(doc.updated_at)
        })));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="rounded-lg border bg-white shadow">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-gray-50 hover:bg-gray-50">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="py-4">
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
                className="hover:bg-gray-50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell 
                colSpan={columns.length} 
                className="h-24 text-center text-gray-500"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 