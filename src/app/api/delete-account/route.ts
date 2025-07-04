import { NextResponse } from "next/server";
import { Client, Functions,Account } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string);

const functions = new Functions(client);

export async function POST(request: Request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // Execute Appwrite function for account deletion
        const execution = await functions.createExecution(
            process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_ID!, // Your account deletion function ID
            JSON.stringify({ userId }),
            false
        );

        if (execution.status === 'completed') {
            return NextResponse.json(
                { message: "Account deletion request processed successfully" },
                { status: 200 }
            );
        } else {
            throw new Error("Function execution failed");
        }

    } catch (error) {
        console.error("Account deletion error:", error);
        return NextResponse.json(
            { error: "Failed to process account deletion request" },
            { status: 500 }
        );
    }
} 