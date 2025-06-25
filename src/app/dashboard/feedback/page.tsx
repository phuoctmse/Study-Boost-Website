"use client";

import FeedbackTable from "@/components/Dashboard/FeedbackTable";

export default function FeedbackPage() {
    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Feedback Management</h1>
                <p className="text-muted-foreground">
                    View and manage user feedback submissions
                </p>
            </div>
            <FeedbackTable />
        </div>
    );
} 