"use client";

import { useState } from "react";
import { siteDetails } from "@/data/siteDetails";
import Container from "@/components/Container";
import { Card } from "@/components/ui/card";

export default function AccountDeletion() {
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit deletion request");
      }
      
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <main className="min-h-screen py-12 bg-gray-50">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            Account Deletion Request - {siteDetails.siteName}
          </h1>
          
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">How to Delete Your Account</h2>
            <div className="space-y-4">
              <p>
                To request deletion of your {siteDetails.siteName} account and associated data, please follow these steps:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Enter your User ID in the form below</li>
                <li>Submit the deletion request</li>
                <li>You will receive a confirmation email</li>
                <li>Your account will be permanently deleted within 30 days</li>
              </ol>
            </div>
          </Card>

          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Data Deletion Information</h2>
            <div className="space-y-4">
              <h3 className="font-medium">Data that will be deleted:</h3>
              <ul className="list-disc pl-6">
                <li>Account profile information</li>
                <li>Study history and statistics</li>
                <li>Saved preferences and settings</li>
                <li>All user-generated content</li>
              </ul>

              <h3 className="font-medium">Data retention:</h3>
              <ul className="list-disc pl-6">
                <li>Deletion requests are processed within 30 days</li>
                <li>Backup data may be retained for up to 90 days</li>
                <li>Some data may be retained for legal compliance</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                  User ID
                </label>
                <input
                  type="text"
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {status === "loading" ? "Processing..." : "Request Account Deletion"}
              </button>

              {status === "success" && (
                <p className="text-green-600 text-center">
                  Your account deletion request has been submitted successfully.
                </p>
              )}
              
              {status === "error" && (
                <p className="text-red-600 text-center">
                  {error}
                </p>
              )}
            </form>
          </Card>
        </div>
      </Container>
    </main>
  );
} 