import PackagesTable from "@/components/Dashboard/PackagesTable";

export default function PackagesPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-6">Packages Management</h1>
            <PackagesTable />
        </div>
    );
} 