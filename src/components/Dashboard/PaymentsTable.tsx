"use client";

import { useEffect, useState } from "react";
import { config, databases } from "@/lib/appwrite";
import { Query, Models } from "appwrite";

interface Payment {
    $id: string;
    user_id: string;
    package_id: string;
    payment_transaction_id: string;
    started_at: string;
    ended_at: string;
    status: "Pending" | "Completed" | "Failed";
}

interface PaymentTransaction {
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

export default function PaymentsTable() {
    const [payments, setPayments] = useState<(Payment & { transaction?: PaymentTransaction })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await databases.listDocuments(
                    config.databaseId,
                    "68523e3e0010cbf7aa7a", // Payment collection ID
                    [Query.orderDesc("$createdAt")]
                );

                const paymentsWithTransactions = await Promise.all(
                    response.documents.map(async (doc: Models.Document) => {
                        const payment = doc as unknown as Payment;
                        if (payment.payment_transaction_id) {
                            const transactionDoc = await databases.getDocument(
                                config.databaseId,
                                "683ef8a40012b31c1ef3", // PaymentTransactions collection ID
                                payment.payment_transaction_id
                            );
                            return {
                                ...payment,
                                transaction: transactionDoc as unknown as PaymentTransaction
                            };
                        }
                        return payment;
                    })
                );

                setPayments(paymentsWithTransactions as (Payment & { transaction?: PaymentTransaction })[]);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching payments:", error);
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    if (loading) {
        return <div>Loading payments...</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ended At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gateway</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {payments.map((payment) => (
                        <tr key={payment.$id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.$id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.user_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.package_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${payment.status === "Completed" ? "bg-green-100 text-green-800" : 
                                    payment.status === "Failed" ? "bg-red-100 text-red-800" : 
                                    "bg-yellow-100 text-yellow-800"}`}>
                                    {payment.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(payment.started_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {payment.ended_at ? new Date(payment.ended_at).toLocaleDateString() : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {payment.transaction?.gateway || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {payment.transaction ? `${payment.transaction.amountIn.toLocaleString()} VND` : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {payment.transaction?.referenceNumber || "-"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 