/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Line, ComposedChart } from "recharts";
import { getMonthlyRevenueExpenses } from "@/actions/payments";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface PaymentChartProps {
  userId: string;
}

interface ChartData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export function PaymentChart({ userId }: PaymentChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      const result = await getMonthlyRevenueExpenses(6);
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to load data");
      }
      
      setLoading(false);
    }

    fetchData();
  }, [userId]);

  // Calculate summary stats
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const avgRevenue = data.length > 0 ? totalRevenue / data.length : 0;
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const revenue = payload.find((p: any) => p.dataKey === 'revenue')?.value || 0;
      const expenses = payload.find((p: any) => p.dataKey === 'expenses')?.value || 0;
      const profit = revenue - expenses;
      
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 min-w-[180px]">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-muted-foreground">Revenue</span>
              </div>
              <span className="text-sm font-semibold text-emerald-600">
                ${revenue.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <span className="text-xs text-muted-foreground">Expenses</span>
              </div>
              <span className="text-sm font-semibold text-rose-600">
                ${expenses.toLocaleString()}
              </span>
            </div>
            <div className="pt-1.5 border-t">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-muted-foreground">Net</span>
                <span className={`text-sm font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ${profit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Revenue & Expenses
        </CardTitle>
        <CardDescription>
          Last 6 months performance
        </CardDescription>
        
        {/* Summary Stats - Improved styling */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          <div className="space-y-1 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Total Revenue</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              ${(totalRevenue / 1000).toFixed(1)}k
            </p>
          </div>
          <div className="space-y-1 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800">
            <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">Total Expenses</p>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
              ${(totalExpenses / 1000).toFixed(1)}k
            </p>
          </div>
          <div className={`space-y-1 p-3 rounded-lg border ${
            totalProfit >= 0 
              ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' 
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
          }`}>
            <p className={`text-xs font-medium ${
              totalProfit >= 0 
                ? 'text-blue-700 dark:text-blue-400' 
                : 'text-amber-700 dark:text-amber-400'
            }`}>
              Net Profit
            </p>
            <div className="flex items-center gap-1">
              <p className={`text-xl font-bold ${totalProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
                ${(Math.abs(totalProfit) / 1000).toFixed(1)}k
              </p>
              {totalProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No payment data available for the selected period</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="currentColor" 
                  className="text-muted/20"
                  vertical={false}
                />
                
                <XAxis 
                  dataKey="month" 
                  stroke="currentColor"
                  className="text-muted-foreground"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                
                <YAxis
                  stroke="currentColor"
                  className="text-muted-foreground"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Legend 
                  wrapperStyle={{ paddingTop: '16px' }}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-sm">{value}</span>
                  )}
                />
                
                {/* Bars with rounded corners */}
                <Bar 
                  dataKey="revenue" 
                  fill="#10b981" 
                  radius={[6, 6, 0, 0]} 
                  name="Revenue"
                  maxBarSize={50}
                />
                
                <Bar 
                  dataKey="expenses" 
                  fill="#ef4444" 
                  radius={[6, 6, 0, 0]} 
                  name="Expenses"
                  maxBarSize={50}
                />
                
                {/* Profit trend line */}
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Profit"
                />
              </ComposedChart>
            </ResponsiveContainer>
            
            {/* Bottom stats */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded">
                  <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Revenue</p>
                  <p className="text-sm font-semibold">${(avgRevenue / 1000).toFixed(1)}k/mo</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded">
                  <TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Profit Margin</p>
                  <p className="text-sm font-semibold">{profitMargin}%</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}