import TransactionsTable from "@/components/Dashboard/TransactionsTable";

export default function TransactionsPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-6">Transactions History</h1>
            <TransactionsTable />
        </div>
    );
} 