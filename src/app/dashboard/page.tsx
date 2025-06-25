import { config, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";

function RatingStars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>
                    {star <= rating ? (
                        <StarSolidIcon className="w-4 h-4 text-yellow-400" />
                    ) : (
                        <StarOutlineIcon className="w-4 h-4 text-gray-300" />
                    )}
                </span>
            ))}
        </div>
    );
}

async function getStats() {
    try {
        const [users, payments, transactions, feedback, recentFeedback] = await Promise.all([
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
            ),
            databases.listDocuments(
                config.databaseId,
                config.collections.feedback,
                [Query.limit(1)]
            ),
            databases.listDocuments(
                config.databaseId,
                config.collections.feedback,
                [
                    Query.orderDesc('$createdAt'),
                    Query.limit(5)
                ]
            )
        ]);

        // Fetch user details for each feedback
        const feedbackWithUserDetails = await Promise.all(
            recentFeedback.documents.map(async (feedback: any) => {
                try {
                    const userDoc = await databases.listDocuments(
                        config.databaseId,
                        config.collections.users,
                        [Query.equal('$id', feedback.user_id)]
                    );
                    const user = userDoc.documents[0];
                    return {
                        ...feedback,
                        username: user ? user.username : 'Unknown User'
                    };
                } catch (error) {
                    console.error(`Error fetching user details for feedback ${feedback.$id}:`, error);
                    return {
                        ...feedback,
                        username: 'Unknown User'
                    };
                }
            })
        );

        return {
            totalUsers: users.total,
            totalPayments: payments.total,
            totalTransactions: transactions.total,
            totalFeedback: feedback.total,
            recentFeedback: feedbackWithUserDetails
        };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return {
            totalUsers: 0,
            totalPayments: 0,
            totalTransactions: 0,
            totalFeedback: 0,
            recentFeedback: []
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">Total Feedback</h3>
                        <p className="text-3xl font-bold text-orange-600 mt-2">{stats.totalFeedback}</p>
                    </div>
                </div>

                {/* Recent Feedback */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-medium text-gray-900">Recent Feedback</h3>
                    </div>
                    <div className="divide-y">
                        {stats.recentFeedback.map((feedback: any) => (
                            <div key={feedback.$id} className="p-6">
                                <div className="flex items-start space-x-4">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {feedback.username} <span className="text-gray-500">({feedback.user_id})</span>
                                        </p>
                                        <div className="mt-1">
                                            <RatingStars rating={feedback.rate} />
                                        </div>
                                        <p className="mt-2 text-sm text-gray-700">
                                            {feedback.content}
                                        </p>
                                        <p className="mt-2 text-xs text-gray-500">
                                            {new Date(feedback.created_at).toLocaleDateString()} {new Date(feedback.created_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {stats.recentFeedback.length === 0 && (
                            <div className="p-6 text-center text-gray-500">
                                No feedback yet
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 