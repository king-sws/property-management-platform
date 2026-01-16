/* eslint-disable @typescript-eslint/no-explicit-any */
// components/reports/reports-client.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  BarChart3, 
  DollarSign, 
  FileText, 
  Home, 
  TrendingUp, 
  Calendar as CalendarIcon,
  Download,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  generateFinancialReport,
  generateOccupancyReport,
  generateMaintenanceReport,
  generateRentRollReport,
  generatePaymentHistoryReport,
  saveFinancialReport,
} from "@/actions/reports";
import { toast } from "sonner";
import { FinancialReportView } from "./financial-report-view";
import { OccupancyReportView } from "./occupancy-report-view";
import { MaintenanceReportView } from "./maintenance-report-view";
import { RentRollView } from "./rent-roll-view";
import { PaymentHistoryView } from "./payment-history-view";

const reportTypes = [
  {
    id: "financial",
    title: "Financial Report",
    description: "Income, expenses, and profitability",
    icon: DollarSign,
  },
  {
    id: "occupancy",
    title: "Occupancy Report",
    description: "Unit vacancy and occupancy rates",
    icon: Home,
  },
  {
    id: "maintenance",
    title: "Maintenance Report",
    description: "Repair tickets and costs",
    icon: BarChart3,
  },
  {
    id: "rent-roll",
    title: "Rent Roll",
    description: "Current tenant and rent summary",
    icon: FileText,
  },
  {
    id: "payment-history",
    title: "Payment History",
    description: "Payment transactions and trends",
    icon: TrendingUp,
  },
];

type DateRange = {
  from: Date;
  to: Date;
};

export function ReportsClient() {
  const [activeReport, setActiveReport] = useState("financial");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      let result;
      
      switch (activeReport) {
        case "financial":
          result = await generateFinancialReport(dateRange.from, dateRange.to);
          break;
        case "occupancy":
          result = await generateOccupancyReport(dateRange.to);
          break;
        case "maintenance":
          result = await generateMaintenanceReport(dateRange.from, dateRange.to);
          break;
        case "rent-roll":
          result = await generateRentRollReport(dateRange.to);
          break;
        case "payment-history":
          result = await generatePaymentHistoryReport(dateRange.from, dateRange.to);
          break;
        default:
          throw new Error("Invalid report type");
      }

      if (result.success) {
        setReportData(result.data);
        toast.success("Report generated successfully");
      } else {
        toast.error(result.error || "Failed to generate report");
      }
    } catch (error) {
      console.error("Generate report error:", error);
      toast.error("An error occurred while generating the report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!reportData) return;

    try {
      const result = await saveFinancialReport(
        activeReport,
        dateRange.from,
        dateRange.to,
        reportData
      );

      if (result.success) {
        toast.success("Report saved successfully");
      } else {
        toast.error(result.error || "Failed to save report");
      }
    } catch (error) {
      console.error("Save report error:", error);
      toast.error("An error occurred while saving the report");
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;

    // Simple CSV export logic
    const csvContent = generateCSV(activeReport, reportData);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeReport}-${format(dateRange.from, "yyyy-MM-dd")}-${format(dateRange.to, "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              activeReport === report.id && "ring-2 ring-primary"
            )}
            onClick={() => setActiveReport(report.id)}
          >
            <CardHeader className="pb-3">
              <report.icon className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-base">{report.title}</CardTitle>
              <CardDescription className="text-xs">{report.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Date Range Selector & Generate Button */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>
            Select a date range and generate your report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, "PPP") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, "PPP") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleGenerateReport} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Report
              </Button>

              {reportData && (
                <>
                  <Button variant="outline" onClick={handleExportCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button variant="outline" onClick={handleSaveReport}>
                    Save Report
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Display */}
      {reportData && (
        <div className="space-y-6">
          {activeReport === "financial" && <FinancialReportView data={reportData} />}
          {activeReport === "occupancy" && <OccupancyReportView data={reportData} />}
          {activeReport === "maintenance" && <MaintenanceReportView data={reportData} />}
          {activeReport === "rent-roll" && <RentRollView data={reportData} />}
          {activeReport === "payment-history" && <PaymentHistoryView data={reportData} />}
        </div>
      )}
    </div>
  );
}

// Helper function to generate CSV content
function generateCSV(reportType: string, data: any): string {
  let csv = "";

  switch (reportType) {
    case "financial":
      csv = "Category,Amount\n";
      csv += `Total Income,${data.summary.totalIncome}\n`;
      csv += `Total Expenses,${data.summary.totalExpenses}\n`;
      csv += `Net Income,${data.summary.netIncome}\n\n`;
      csv += "Income By Type\n";
      Object.entries(data.incomeByType).forEach(([type, amount]) => {
        csv += `${type},${amount}\n`;
      });
      break;

    case "occupancy":
      csv = "Property,Total Units,Occupied,Vacant,Occupancy Rate\n";
      data.properties.forEach((p: any) => {
        csv += `${p.propertyName},${p.totalUnits},${p.occupiedUnits},${p.vacantUnits},${p.occupancyRate}%\n`;
      });
      break;

    case "maintenance":
      csv = "Status,Count\n";
      Object.entries(data.byStatus).forEach(([status, count]) => {
        csv += `${status},${count}\n`;
      });
      break;

    case "rent-roll":
      csv = "Property,Unit,Tenant,Monthly Rent,Start Date,End Date\n";
      data.rentRoll.forEach((r: any) => {
        csv += `${r.propertyName},${r.unitNumber},${r.tenantName},${r.monthlyRent},${format(new Date(r.leaseStartDate), "yyyy-MM-dd")},${r.leaseEndDate ? format(new Date(r.leaseEndDate), "yyyy-MM-dd") : "N/A"}\n`;
      });
      break;

    case "payment-history":
      csv = "Date,Tenant,Property,Unit,Type,Amount,Status\n";
      data.payments.forEach((p: any) => {
        csv += `${format(new Date(p.date), "yyyy-MM-dd")},${p.tenantName},${p.propertyName},${p.unitNumber},${p.type},${p.amount},${p.status}\n`;
      });
      break;
  }

  return csv;
}