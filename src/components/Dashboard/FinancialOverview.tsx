"use client"

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFinancialData } from '@/hooks/useFinancialData';
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { databases, config } from "@/lib/appwrite";
import { Query, Models } from "appwrite";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ReferenceLine
} from 'recharts';

const timeRangeOptions = [
  { value: 7, label: "7 ngày" },
  { value: 30, label: "30 ngày" },
  { value: 90, label: "90 ngày" },
];

interface Feedback extends Models.Document {
  user_id: string;
  content: string;
  rate: number;
  username?: string;
}

interface User extends Models.Document {
  username: string;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= rating ? (
            <StarSolidIcon className="w-5 h-5 text-yellow-400" />
          ) : (
            <StarOutlineIcon className="w-5 h-5 text-gray-300" />
          )}
        </span>
      ))}
    </div>
  );
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

const formatGrowthRate = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export default function FinancialOverview() {
  const [selectedTimeRange, setSelectedTimeRange] = useState(7);
  const { data, loading, error } = useFinancialData(selectedTimeRange);
  const [recentFeedback, setRecentFeedback] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);

  useEffect(() => {
    const fetchRecentFeedback = async () => {
      try {
        setFeedbackLoading(true);
        const feedbackResponse = await databases.listDocuments(
          config.databaseId,
          config.collections.feedback,
          [
            Query.orderDesc("$createdAt"),
            Query.limit(5)
          ]
        );

        // Fetch usernames for each feedback
        const feedbackWithUsernames = await Promise.all(
          (feedbackResponse.documents as unknown as Feedback[]).map(async (feedback) => {
            try {
              const userResponse = await databases.getDocument<User>(
                config.databaseId,
                config.collections.users,
                feedback.user_id
              );
              return {
                ...feedback,
                username: userResponse.username
              };
            } catch (error) {
              console.error(`Error fetching user for feedback ${feedback.$id}:`, error);
              return {
                ...feedback,
                username: "Unknown User"
              };
            }
          })
        );

        setRecentFeedback(feedbackWithUsernames);
      } catch (error) {
        console.error("Error fetching recent feedback:", error);
      } finally {
        setFeedbackLoading(false);
      }
    };

    fetchRecentFeedback();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalTransactions = data.reduce((sum, item) => sum + item.transactions, 0);
  const totalReviews = data.reduce((sum, item) => sum + item.reviews, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tổng quan tài chính</h2>
        <Select
          value={selectedTimeRange.toString()}
          onValueChange={(value) => setSelectedTimeRange(Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn khoảng thời gian" />
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Tổng doanh thu</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalRevenue)}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Tổng giao dịch</h3>
          <p className="text-2xl font-bold text-blue-600">{totalTransactions}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Số đánh giá</h3>
          <p className="text-2xl font-bold text-purple-600">{totalReviews}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Revenue Growth Rate</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 50,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatGrowthRate}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Growth Rate']}
                />
                <ReferenceLine y={0} stroke="#666" />
                <Line
                  type="monotone"
                  dataKey="growthRate"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Transactions</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatNumber}
                />
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), 'Transactions']}
                />
                <Bar
                  dataKey="transactions"
                  fill="#82ca9d"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Biểu đồ doanh thu</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={data}
              margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                tickFormatter={(value) => {
                  return new Intl.NumberFormat('vi-VN', {
                    notation: 'compact',
                    compactDisplay: 'short',
                    style: 'currency',
                    currency: 'VND',
                    maximumFractionDigits: 1
                  }).format(value);
                }}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => `Ngày ${label}`}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Đánh giá gần đây</h3>
        {feedbackLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Đánh giá</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentFeedback.map((feedback) => (
                <TableRow key={feedback.$id}>
                  <TableCell>{feedback.username}</TableCell>
                  <TableCell>
                    <RatingStars rating={feedback.rate} />
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {feedback.content}
                  </TableCell>
                  <TableCell>
                    {new Date(feedback.$createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
} 