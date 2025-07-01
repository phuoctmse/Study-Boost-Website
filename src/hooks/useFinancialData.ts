"use client"

import { useEffect, useState } from 'react';
import { account, config, databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { format, parseISO } from 'date-fns';

interface FinancialData {
  date: string;
  revenue: number;
  transactions: number;
  reviews: number;
  growthRate: number;
  rawDate: Date;
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
        startDate.setHours(0, 0, 0, 0);
        
        // Format date to ISO string for Appwrite
        const startDateString = startDate.toISOString();

        // Fetch payments
        const payments = await databases.listDocuments(
          config.databaseId,
          config.collections.payments,
          [
            Query.greaterThan('$createdAt', startDateString),
            Query.orderAsc('$createdAt')
          ]
        );

        // Fetch feedbacks
        const feedbacks = await databases.listDocuments(
          config.databaseId,
          config.collections.feedback,
          [
            Query.greaterThan('$createdAt', startDateString),
            Query.orderAsc('$createdAt')
          ]
        );

        // Process data by date
        const dailyData = new Map<string, FinancialData>();

        // Process payments
        for (const payment of payments.documents) {
          const paymentDate = new Date(payment.$createdAt);
          const dateKey = format(paymentDate, 'yyyy-MM-dd');
          const formattedDate = format(paymentDate, 'dd/MM/yyyy');

          let existing = dailyData.get(dateKey);
          if (!existing) {
            existing = {
              date: formattedDate,
              revenue: 0,
              transactions: 0,
              reviews: 0,
              growthRate: 0,
              rawDate: paymentDate
            };
            dailyData.set(dateKey, existing);
          }

          // Get transaction details
          try {
            const transaction = await databases.getDocument(
              config.databaseId,
              config.collections.transactions,
              payment.payment_transaction_id
            );
            existing.revenue += transaction.amountIn || 0;
            existing.transactions += 1;
          } catch (error) {
            console.error(`Error fetching transaction for payment ${payment.$id}:`, error);
          }
        }

        // Process feedback
        for (const feedback of feedbacks.documents) {
          const feedbackDate = new Date(feedback.$createdAt);
          const dateKey = format(feedbackDate, 'yyyy-MM-dd');
          const formattedDate = format(feedbackDate, 'dd/MM/yyyy');

          let existing = dailyData.get(dateKey);
          if (!existing) {
            existing = {
              date: formattedDate,
              revenue: 0,
              transactions: 0,
              reviews: 0,
              growthRate: 0,
              rawDate: feedbackDate
            };
            dailyData.set(dateKey, existing);
          }
          existing.reviews += 1;
        }

        // Fill in missing dates with zero values
        for (let i = 0; i < timeRange; i++) {
          const currentDate = new Date();
          currentDate.setDate(currentDate.getDate() - i);
          currentDate.setHours(0, 0, 0, 0);
          
          const dateKey = format(currentDate, 'yyyy-MM-dd');
          const formattedDate = format(currentDate, 'dd/MM/yyyy');
          
          if (!dailyData.has(dateKey)) {
            dailyData.set(dateKey, {
              date: formattedDate,
              revenue: 0,
              transactions: 0,
              reviews: 0,
              growthRate: 0,
              rawDate: currentDate
            });
          }
        }

        // Convert map to array and sort by date
        const sortedData = Array.from(dailyData.values()).sort((a, b) => {
          return b.rawDate.getTime() - a.rawDate.getTime();
        });

        // Calculate growth rate
        for (let i = 1; i < sortedData.length; i++) {
          const previousRevenue = sortedData[i - 1].revenue;
          const currentRevenue = sortedData[i].revenue;
          
          if (previousRevenue === 0) {
            sortedData[i].growthRate = currentRevenue > 0 ? 100 : 0;
          } else {
            sortedData[i].growthRate = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
          }
        }

        setData(sortedData);
        setError(null);
      } catch (error) {
        console.error('Error fetching financial data:', error);
        setError('Error fetching financial data: ' + (error as Error).message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  return { data, loading, error };
}