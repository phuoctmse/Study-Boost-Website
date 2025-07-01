import { config, databases } from "@/lib/appwrite";
import { IPricing } from "@/types";
import { Query } from "appwrite";

interface IPackage {
    name: string;
    price: number;
    duration: number
    description: string[];
}

const packages = await databases.listDocuments(config.databaseId, config.collections.packages, [Query.orderAsc('$createdAt')]);
console.log(packages)

export const tiers = packages.documents.map((pkg: any) => {
    if (pkg.name === 'Dài Hạn') {
        return {
            name: pkg.name,
            price: 'Liên Hệ',
            duration: pkg.duration,
            features: pkg.description,
        }
    }
    else {
        return {
            name: pkg.name,
            price: pkg.price,
            duration: pkg.duration,
            features: pkg.description,
        }
    }
})
// export const tiers: IPricing[] = [
//     {
//         name: 'Miễn Phí',
//         price: 0,
//         features: [
//             'Basic cloud integration',
//             'Up to 5 team members',
//             '20GB storage',
//             'Email support',
//         ],
//     },
//     {
//         name: 'Học Sinh',
//         price: 20000,
//         features: [
//             'Advanced cloud integration',
//             'Up to 20 team members',
//             '100GB storage',
//             'Priority email & phone support',
//             'Advanced analytics',
//         ],
//     },
//     {
//         name: 'Dài Hạn',
//         price: 'Liên Hệ',
//         features: [
//             'Full cloud integration',
//             'Unlimited team members',
//             'Unlimited storage',
//             '24/7 dedicated support',
//             'Custom solutions',
//             'On-site training',
//         ],
//     },
// ]