import UsersTable from "@/components/Dashboard/UsersTable";

export default function UsersPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-6">Users Management</h1>
            <UsersTable />
        </div>
    );
} 