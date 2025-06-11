import { Client, Account, Databases } from "appwrite";

const config = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DB_ID as string,
  collections: {
    users: process.env.NEXT_PUBLIC_APPWRITE_COL_USERS_ID as string,
  }
}

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string);

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases, config };