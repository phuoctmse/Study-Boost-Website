"use client";

import { useEffect, useState } from "react";
import { config, databases } from "@/lib/appwrite";
import { Query, Models } from "appwrite";

interface Transaction {
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
}

export default function TransactionsTable() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await databases.listDocuments(
                    config.databaseId,
                    "683ef8a40012b31c1ef3", // PaymentTransactions collection ID
                    [Query.orderDesc("transactionDate")]
                );

                setTransactions(response.documents.map((doc: Models.Document) => doc as unknown as Transaction));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching transactions:", error);
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    if (loading) {
        return <div>Loading transactions...</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gateway</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub Account</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount In</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Out</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accumulated</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                        <tr key={transaction.$id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.$id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.gateway}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(transaction.transactionDate).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.accountNumber}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.subAccount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {transaction.amountIn.toLocaleString()} VND
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {transaction.amountOut.toLocaleString()} VND
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {transaction.accumulated.toLocaleString()} VND
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.code}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.referenceNumber}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 