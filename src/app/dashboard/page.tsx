import { config, databases } from "@/lib/appwrite";
import { Query } from "appwrite";

async function getStats() {
    try {
        const [users, payments, transactions] = await Promise.all([
            databases.listDocuments(
                config.databaseId,
                config.collections.users,
                [Query.limit(1)]
            ),
            databases.listDocuments(
                config.databaseId,
                config.collections.payments,
                [Query.limit(1)]
            ),
            databases.listDocuments(
                config.databaseId,
                config.collections.transactions,
                [Query.limit(1)]
            )
        ]);

        return {
            totalUsers: users.total,
            totalPayments: payments.total,
            totalTransactions: transactions.total
        };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return {
            totalUsers: 0,
            totalPayments: 0,
            totalTransactions: 0
        };
    }
}

export default async function DashboardPage() {
    const stats = await getStats();

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, Admin!</h1>
                        <p className="text-gray-600">Here's what's happening with your application today.</p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">Total Payments</h3>
                        <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalPayments}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">Total Transactions</h3>
                        <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalTransactions}</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 