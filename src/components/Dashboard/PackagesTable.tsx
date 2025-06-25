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
    DialogFooter,
} from "@/components/ui/dialog";
import {
    ColumnDef,
    SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Plus, Pencil, Trash } from "lucide-react";
import { databases } from "@/lib/appwrite";
import { config } from "@/lib/appwrite";
import { Query } from "appwrite";
import { cn } from "@/lib/utils";

type Package = {
    $id: string;
    name: string;
    description: string[];
    price: number;
    duration: number;
    created_at: Date;
    updated_at: Date;
};

export default function PackagesTable() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [data, setData] = useState<Package[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: [""],
        price: 0,
        duration: 30,
    });

    const handleCreate = () => {
        setFormData({
            name: "",
            description: [""],
            price: 0,
            duration: 30,
        });
        setIsCreateDialogOpen(true);
    };

    const handleEdit = (pkg: Package) => {
        setSelectedPackage(pkg);
        setFormData({
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            duration: pkg.duration,
        });
        setIsEditDialogOpen(true);
    };

    const handleDelete = (pkg: Package) => {
        setSelectedPackage(pkg);
        setIsDeleteDialogOpen(true);
    };

    const columns: ColumnDef<Package>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <button
                        className="flex items-center"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                );
            },
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => {
                const description = row.getValue("description") as string[];
                return (
                    <ul className="list-disc list-inside">
                        {description.map((item, index) => (
                            <li key={index} className="text-sm text-gray-600">{item}</li>
                        ))}
                    </ul>
                );
            },
        },
        {
            accessorKey: "price",
            header: ({ column }) => {
                return (
                    <button
                        className="flex items-center"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Price
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                );
            },
            cell: ({ row }) => {
                const price = row.getValue("price") as number;
                return new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                }).format(price);
            },
        },
        {
            accessorKey: "duration",
            header: ({ column }) => {
                return (
                    <button
                        className="flex items-center"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Duration (days)
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                );
            },
            cell: ({ row }) => {
                const duration = row.getValue("duration") as number;
                return `${duration} days`;
            },
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => {
                return (
                    <button
                        className="flex items-center"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Created At
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                );
            },
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at"));
                return date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                });
            },
        },
        {
            accessorKey: "updated_at",
            header: ({ column }) => {
                return (
                    <button
                        className="flex items-center"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Updated At
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                );
            },
            cell: ({ row }) => {
                const date = new Date(row.getValue("updated_at"));
                return date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                });
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const pkg = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(pkg);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <Pencil className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(pkg);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <Trash className="h-4 w-4 text-red-600" />
                        </button>
                    </div>
                );
            },
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

    const fetchPackages = async () => {
        try {
            const response = await databases.listDocuments(
                config.databaseId,
                config.collections.packages
            );
            setData(response.documents as unknown as Package[]);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching packages:", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleCreateSubmit = async () => {
        try {
            await databases.createDocument(
                config.databaseId,
                config.collections.packages,
                "unique()",
                {
                    name: formData.name,
                    description: formData.description,
                    price: formData.price,
                    duration: formData.duration,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            );
            await fetchPackages(); // Refresh the list
            setIsCreateDialogOpen(false);
        } catch (error) {
            console.error("Error creating package:", error);
        }
    };

    const handleEditSubmit = async () => {
        try {
            if (!selectedPackage) return;
            await databases.updateDocument(
                config.databaseId,
                config.collections.packages,
                selectedPackage.$id,
                {
                    name: formData.name,
                    description: formData.description,
                    price: formData.price,
                    duration: formData.duration,
                    updated_at: new Date(),
                }
            );
            await fetchPackages(); // Refresh the list
            setIsEditDialogOpen(false);
        } catch (error) {
            console.error("Error updating package:", error);
        }
    };

    const handleDeleteSubmit = async () => {
        try {
            if (!selectedPackage) return;
            await databases.deleteDocument(
                config.databaseId,
                config.collections.packages,
                selectedPackage.$id
            );
            await fetchPackages(); // Refresh the list
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error("Error deleting package:", error);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className="rounded-md border">
                <div className="flex items-center justify-between p-4">
                    <h2 className="text-xl font-semibold">Packages</h2>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Package
                    </button>
                </div>
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
                                    No packages found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Package</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="rounded-md border px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Description</label>
                            {formData.description.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => {
                                            const newDescription = [...formData.description];
                                            newDescription[index] = e.target.value;
                                            setFormData({ ...formData, description: newDescription });
                                        }}
                                        className="flex-1 rounded-md border px-3 py-2 text-sm"
                                    />
                                    <button
                                        onClick={() => {
                                            const newDescription = formData.description.filter((_, i) => i !== index);
                                            setFormData({ ...formData, description: newDescription });
                                        }}
                                        className="rounded-md bg-red-100 px-2 py-1 text-sm text-red-600 hover:bg-red-200"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    setFormData({
                                        ...formData,
                                        description: [...formData.description, ""],
                                    });
                                }}
                                className="mt-2 rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200"
                            >
                                Add Description Item
                            </button>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="price" className="text-sm font-medium">
                                Price (USD)
                            </label>
                            <input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) =>
                                    setFormData({ ...formData, price: parseFloat(e.target.value) })
                                }
                                className="rounded-md border px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="duration" className="text-sm font-medium">
                                Duration (days)
                            </label>
                            <input
                                id="duration"
                                type="number"
                                min="1"
                                value={formData.duration}
                                onChange={(e) =>
                                    setFormData({ ...formData, duration: parseInt(e.target.value) })
                                }
                                className="rounded-md border px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <button
                            onClick={() => setIsCreateDialogOpen(false)}
                            className="inline-flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateSubmit}
                            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Create
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Package</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="edit-name" className="text-sm font-medium">
                                Name
                            </label>
                            <input
                                id="edit-name"
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="rounded-md border px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Description</label>
                            {formData.description.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => {
                                            const newDescription = [...formData.description];
                                            newDescription[index] = e.target.value;
                                            setFormData({ ...formData, description: newDescription });
                                        }}
                                        className="flex-1 rounded-md border px-3 py-2 text-sm"
                                    />
                                    <button
                                        onClick={() => {
                                            const newDescription = formData.description.filter((_, i) => i !== index);
                                            setFormData({ ...formData, description: newDescription });
                                        }}
                                        className="rounded-md bg-red-100 px-2 py-1 text-sm text-red-600 hover:bg-red-200"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    setFormData({
                                        ...formData,
                                        description: [...formData.description, ""],
                                    });
                                }}
                                className="mt-2 rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200"
                            >
                                Add Description Item
                            </button>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="edit-price" className="text-sm font-medium">
                                Price (USD)
                            </label>
                            <input
                                id="edit-price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) =>
                                    setFormData({ ...formData, price: parseFloat(e.target.value) })
                                }
                                className="rounded-md border px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="edit-duration" className="text-sm font-medium">
                                Duration (days)
                            </label>
                            <input
                                id="edit-duration"
                                type="number"
                                min="1"
                                value={formData.duration}
                                onChange={(e) =>
                                    setFormData({ ...formData, duration: parseInt(e.target.value) })
                                }
                                className="rounded-md border px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <button
                            onClick={() => setIsEditDialogOpen(false)}
                            className="inline-flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleEditSubmit}
                            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Package</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Are you sure you want to delete this package? This action cannot be undone.</p>
                    </div>
                    <DialogFooter>
                        <button
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="inline-flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteSubmit}
                            className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
} 