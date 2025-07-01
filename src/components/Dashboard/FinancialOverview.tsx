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
import { formatDateForAppwrite, formatDisplayDate } from '@/lib/utils';
import { format } from 'date-fns';

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
  transactions: Models.Document[];
  reviews: Models.Document[];
  growthRate: number;
  rawDate: Date;
}

interface SelectedDayDetails {
  date: string;
  data: DayData;
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
  const [selectedDayDetails, setSelectedDayDetails] = useState<SelectedDayDetails | null>(null);
  const [selectedView, setSelectedView] = useState<'transactions' | 'reviews'>('transactions');

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
  const totalTransactions = data.reduce((sum, item) => sum + (item.transactions?.length || 0), 0);
  const totalReviews = data.reduce((sum, item) => sum + (item.reviews?.length || 0), 0);

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
      // Get user details for each review
      const reviewsWithUsernames = await Promise.all(
        dayData.reviews.map(async (review) => {
          try {
            const userDoc = await databases.getDocument(
              config.databaseId,
              config.collections.users,
              review.user_id
            );
            return {
              ...review,
              username: userDoc.username || userDoc.email
            };
          } catch (error) {
            console.error('Error fetching user:', error);
            return {
              ...review,
              username: review.user_id
            };
          }
        })
      );

      setSelectedDayDetails({
        date,
        data: {
          ...dayData,
          reviews: reviewsWithUsernames
        }
      });
    } catch (error) {
      console.error('Error fetching day details:', error);
    }
  };

  const renderDayDetails = () => {
    if (!selectedDayDetails) return null;
    const { date, data } = selectedDayDetails;

    return (
      <Dialog open={!!selectedDayDetails} onOpenChange={() => setSelectedDayDetails(null)}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle>Chi tiết ngày {date}</DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-center space-x-4 mb-4">
            <button
              className={`px-4 py-2 rounded-lg ${
                selectedView === 'transactions' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
              onClick={() => setSelectedView('transactions')}
            >
              Giao dịch
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                selectedView === 'reviews' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
              onClick={() => setSelectedView('reviews')}
            >
              Đánh giá
            </button>
          </div>

          {selectedView === 'transactions' ? (
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Cổng thanh toán</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transactions.map((transaction) => (
                    <TableRow key={transaction.$id}>
                      <TableCell>
                        {format(new Date(transaction.$createdAt), 'HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(transaction.amountIn)}
                      </TableCell>
                      <TableCell>{transaction.gateway}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status === 'Completed' ? 'Hoàn thành' : 
                           transaction.status === 'Pending' ? 'Đang xử lý' : 'Thất bại'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Đánh giá</TableHead>
                    <TableHead>Nội dung</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedDayDetails?.data.reviews.map((review: any) => (
                    <TableRow key={review.$id}>
                      <TableCell>
                        {format(new Date(review.$createdAt), 'HH:mm:ss')}
                      </TableCell>
                      <TableCell>{review.username || review.user_id}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, index) => (
                            index < review.rate ? (
                              <StarSolidIcon key={index} className="h-4 w-4 text-yellow-400" />
                            ) : (
                              <StarOutlineIcon key={index} className="h-4 w-4 text-gray-300" />
                            )
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{review.content}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  const renderDetailDialog = () => {
    if (!dialogContent) return null;

    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {dialogContent.title}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-white rounded-lg">
            <div className="max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Ngày</TableHead>
                    <TableHead className="text-right font-semibold">
                      {dialogContent.type === 'revenue' && 'Doanh thu'}
                      {dialogContent.type === 'transactions' && 'Số giao dịch'}
                      {dialogContent.type === 'reviews' && 'Số đánh giá'}
                    </TableHead>
                    {dialogContent.type === 'revenue' && (
                      <TableHead className="text-right font-semibold">Tăng trưởng</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dialogContent.data.map((item: DayData) => (
                    <TableRow 
                      key={item.date}
                      className="cursor-pointer transition-colors hover:bg-blue-50"
                      onClick={() => handleDayClick(item.date, item)}
                    >
                      <TableCell className="font-medium">
                        {item.date}
                      </TableCell>
                      <TableCell className="text-right">
                        {dialogContent.type === 'revenue' && formatCurrency(item.revenue)}
                        {dialogContent.type === 'transactions' && item.transactions.length}
                        {dialogContent.type === 'reviews' && item.reviews.length}
                      </TableCell>
                      {dialogContent.type === 'revenue' && (
                        <TableCell className="text-right">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            item.growthRate >= 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {formatGrowthRate(item.growthRate)}
                          </span>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
          <h3 className="text-lg font-semibold mb-2">Tổng doanh thu (Hoàn thành)</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-sm text-gray-500 mt-1">*Chỉ tính các giao dịch đã hoàn thành</p>
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
                data={data.map(item => ({
                  date: item.date,
                  transactions: item.transactions?.length || 0
                }))}
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
                  formatter={(value: number) => [formatNumber(value), 'Số giao dịch']}
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