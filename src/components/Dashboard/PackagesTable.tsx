"use client";

import { useEffect, useState } from "react";
import { config, databases } from "@/lib/appwrite";
import { Query, Models } from "appwrite";

interface Package {
    $id: string;
    name: string;
    description: string[];
    price: number;
    duration: number;
    created_at: Date;
    updated_at: Date;
}

export default function PackagesTable() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await databases.listDocuments(
                    config.databaseId,
                    config.collections.packages,
                    [Query.orderDesc("$createdAt")]
                );
                setPackages(response.documents.map((doc: Models.Document) => doc as unknown as Package));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching packages:", error);
                setLoading(false);
            }
        };

        fetchPackages();
    }, []);

    if (loading) {
        return <div>Loading packages...</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {packages.map((pkg) => (
                        <tr key={pkg.$id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {pkg.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                                <ul className="list-disc list-inside">
                                    {pkg.description.map((desc, index) => (
                                        <li key={index} className="mb-1">{desc}</li>
                                    ))}
                                </ul>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {pkg.price.toLocaleString()} VND
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {pkg.duration} days
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(pkg.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(pkg.updated_at).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 