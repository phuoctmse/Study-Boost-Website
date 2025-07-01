"use client"

import { useEffect, useState } from 'react';
import { account, config, databases } from '@/lib/appwrite';
import { Query, Models } from 'appwrite';
import { format } from 'date-fns';
import { formatDateForAppwrite, formatDisplayDate } from '@/lib/utils';

interface FinancialData {
  date: string;
  revenue: number;
  transactions: Models.Document[];  // Use Models.Document type
  reviews: Models.Document[];
  growthRate: number;
  rawDate: Date;
}

interface Payment extends Models.Document {
  status: string;
  payment_transaction_id: string;
}

export function useFinancialData(timeRange: number) {
  const [data, setData] = useState<FinancialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        const startDateStr = formatDateForAppwrite(startDate);
        const endDateStr = formatDateForAppwrite(endDate);

        // Initialize data array for each day
        const dateData: { [key: string]: FinancialData } = {};
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = formatDisplayDate(d);
          dateData[dateStr] = {
            date: dateStr,
            revenue: 0,
            transactions: [], // Initialize as empty array
            reviews: [],
            growthRate: 0,
            rawDate: new Date(d)
          };
        }

        // Fetch transactions
        const transactions = await databases.listDocuments(
          config.databaseId,
          config.collections.transactions,
          [
            Query.greaterThanEqual('$createdAt', startDateStr),
            Query.lessThanEqual('$createdAt', endDateStr)
          ]
        );

        // Fetch payments to check status
        const payments = await databases.listDocuments(
          config.databaseId,
          config.collections.payments,
          [
            Query.greaterThanEqual('$createdAt', startDateStr),
            Query.lessThanEqual('$createdAt', endDateStr)
          ]
        );

        // Create a map of payment_transaction_id to payment status
        const paymentStatusMap = new Map<string, string>();
        payments.documents.forEach((payment: any) => {
          paymentStatusMap.set(payment.payment_transaction_id, payment.status);
        });

        // Process transactions
        transactions.documents.forEach((transaction: any) => {
          const date = new Date(transaction.$createdAt);
          const dateStr = formatDisplayDate(date);
          
          if (dateData[dateStr]) {
            // Add transaction to the array
            dateData[dateStr].transactions.push({
              ...transaction,
              status: paymentStatusMap.get(transaction.$id) || 'Pending'
            });

            // Only add to revenue if payment status is Completed
            if (paymentStatusMap.get(transaction.$id) === 'Completed') {
              dateData[dateStr].revenue += transaction.amountIn || 0;
            }
          }
        });

        // Fetch reviews
        const reviews = await databases.listDocuments(
          config.databaseId,
          config.collections.feedback,
          [
            Query.greaterThanEqual('$createdAt', startDateStr),
            Query.lessThanEqual('$createdAt', endDateStr)
          ]
        );

        // Process reviews
        reviews.documents.forEach((review: any) => {
          const date = new Date(review.$createdAt);
          const dateStr = formatDisplayDate(date);
          if (dateData[dateStr]) {
            dateData[dateStr].reviews.push(review);
          }
        });

        // Calculate growth rates
        const sortedDates = Object.values(dateData).sort((a, b) => 
          a.rawDate.getTime() - b.rawDate.getTime()
        );

        for (let i = 1; i < sortedDates.length; i++) {
          const previousRevenue = sortedDates[i - 1].revenue;
          const currentRevenue = sortedDates[i].revenue;
          
          if (previousRevenue === 0) {
            sortedDates[i].growthRate = currentRevenue > 0 ? 100 : 0;
          } else {
            sortedDates[i].growthRate = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
          }
        }

        setData(sortedDates);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  return { data, loading, error };
}