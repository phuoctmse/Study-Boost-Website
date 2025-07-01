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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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

interface DayData {
  date: string;
  revenue: number;
  transactions: number;
  reviews: number;
  growthRate: number;
  rawDate: Date;
}

interface DialogContent {
  title: string;
  data: DayData[];
  type: 'revenue' | 'transactions' | 'reviews';
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<DialogContent | null>(null);
  const [selectedDayDetails, setSelectedDayDetails] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

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
    return <div className="p-4">Loading financial data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalTransactions = data.reduce((sum, item) => sum + item.transactions, 0);
  const totalReviews = data.reduce((sum, item) => sum + item.reviews, 0);

  const handleCardClick = (type: 'revenue' | 'transactions' | 'reviews') => {
    let title = '';
    switch (type) {
      case 'revenue':
        title = 'Chi tiết doanh thu';
        break;
      case 'transactions':
        title = 'Chi tiết giao dịch';
        break;
      case 'reviews':
        title = 'Chi tiết đánh giá';
        break;
    }
    setDialogContent({
      title,
      data: data,
      type
    });
    setDialogOpen(true);
  };

  const handleDayClick = async (date: string, dayData: DayData) => {
    try {
      // Parse the date from the table format (DD/MM/YYYY)
      const [day, month, year] = date.split('/').map(Number);
      
      // Create start and end of day in UTC
      const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

      // Get transactions for the day
      const transactions = await databases.listDocuments(
        config.databaseId,
        config.collections.transactions,
        [
          Query.greaterThanEqual('$createdAt', startOfDay.toISOString()),
          Query.lessThanEqual('$createdAt', endOfDay.toISOString()),
          Query.orderDesc('$createdAt')
        ]
      );

      // Get reviews for the day
      const reviews = await databases.listDocuments(
        config.databaseId,
        config.collections.feedback,
        [
          Query.greaterThanEqual('$createdAt', startOfDay.toISOString()),
          Query.lessThanEqual('$createdAt', endOfDay.toISOString()),
          Query.orderDesc('$createdAt')
        ]
      );

      // Get user details for each review
      const reviewsWithUserDetails = await Promise.all(
        reviews.documents.map(async (review: any) => {
          try {
            const user = await databases.getDocument(
              config.databaseId,
              config.collections.users,
              review.user_id
            );
            return {
              ...review,
              username: user.username
            };
          } catch (error) {
            console.error(`Error fetching user for review ${review.$id}:`, error);
            return {
              ...review,
              username: 'Unknown User'
            };
          }
        })
      );

      setSelectedDayDetails({
        date: date,
        data: {
          ...dayData,
          detailedTransactions: transactions.documents,
          detailedReviews: reviewsWithUserDetails
        }
      });
      setDetailDialogOpen(true);
    } catch (error) {
      console.error('Error fetching day details:', error);
    }
  };

  const renderDayDetails = () => {
    if (!selectedDayDetails) return null;
    const { date, data } = selectedDayDetails;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h4 className="text-sm font-medium text-gray-500">Doanh thu</h4>
            <p className="text-xl font-bold text-green-600">{formatCurrency(data.revenue)}</p>
            {data.growthRate !== undefined && (
              <p className={`text-sm ${data.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatGrowthRate(data.growthRate)} so với ngày trước
              </p>
            )}
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-gray-500">Số giao dịch</h4>
            <p className="text-xl font-bold text-blue-600">{data.transactions}</p>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-medium text-gray-500">Đánh giá</h4>
            <p className="text-xl font-bold text-purple-600">{data.reviews}</p>
          </Card>
        </div>

        {data.detailedTransactions?.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-3">Chi tiết giao dịch</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.detailedTransactions.map((transaction: any) => (
                  <TableRow key={transaction.$id}>
                    <TableCell>
                      {new Date(transaction.$createdAt).toLocaleTimeString('vi-VN')}
                    </TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {data.detailedReviews?.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-3">Chi tiết đánh giá</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Đánh giá</TableHead>
                  <TableHead>Nội dung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.detailedReviews.map((review: any) => (
                  <TableRow key={review.$id}>
                    <TableCell>
                      {new Date(review.$createdAt).toLocaleTimeString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <RatingStars rating={review.rate} />
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {review.content}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    );
  };

  const renderDetailTable = () => {
    if (!dialogContent) return null;

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ngày</TableHead>
            <TableHead className="text-right">
              {dialogContent.type === 'revenue' && 'Doanh thu'}
              {dialogContent.type === 'transactions' && 'Số giao dịch'}
              {dialogContent.type === 'reviews' && 'Số đánh giá'}
            </TableHead>
            {dialogContent.type === 'revenue' && (
              <TableHead className="text-right">Tăng trưởng</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {dialogContent.data.map((item: DayData) => (
            <TableRow 
              key={item.date}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleDayClick(item.date, item)}
            >
              <TableCell>
                {item.date}
              </TableCell>
              <TableCell className="text-right">
                {dialogContent.type === 'revenue' && formatCurrency(item.revenue)}
                {dialogContent.type === 'transactions' && item.transactions}
                {dialogContent.type === 'reviews' && item.reviews}
              </TableCell>
              {dialogContent.type === 'revenue' && (
                <TableCell className="text-right">
                  <span className={item.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatGrowthRate(item.growthRate)}
                  </span>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderDetailDialog = () => {
    if (!dialogContent) return null;

    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {renderDetailTable()}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-8">
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
        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('revenue')}
        >
          <h3 className="text-lg font-semibold mb-2">Tổng doanh thu</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalRevenue)}
          </p>
        </Card>
        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('transactions')}
        >
          <h3 className="text-lg font-semibold mb-2">Tổng giao dịch</h3>
          <p className="text-2xl font-bold text-blue-600">{totalTransactions}</p>
        </Card>
        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick('reviews')}
        >
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

      {/* Render the day details dialog */}
      {renderDayDetails()}
      
      {/* Render the summary dialog */}
      {renderDetailDialog()}
    </div>
  );
} 