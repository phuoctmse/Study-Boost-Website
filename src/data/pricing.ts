import { IPricing } from "@/types";

export const tiers: IPricing[] = [
    {
        name: 'Miễn Phí',
        price: 0,
        features: [
            'Basic cloud integration',
            'Up to 5 team members',
            '20GB storage',
            'Email support',
        ],
    },
    {
        name: 'Học Sinh',
        price: 20000,
        features: [
            'Advanced cloud integration',
            'Up to 20 team members',
            '100GB storage',
            'Priority email & phone support',
            'Advanced analytics',
        ],
    },
    {
        name: 'Dài Hạn',
        price: 'Liên Hệ',
        features: [
            'Full cloud integration',
            'Unlimited team members',
            'Unlimited storage',
            '24/7 dedicated support',
            'Custom solutions',
            'On-site training',
        ],
    },
]