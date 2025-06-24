import PaymentsTable from "@/components/Dashboard/PaymentsTable";

export default function PaymentsPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-6">Payments Management</h1>
            <PaymentsTable />
        </div>
    );
} 