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
  Loader2,
  Save
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
    title: "Financial",
    description: "Income & expenses",
    icon: DollarSign,
  },
  {
    id: "occupancy",
    title: "Occupancy",
    description: "Vacancy rates",
    icon: Home,
  },
  {
    id: "maintenance",
    title: "Maintenance",
    description: "Repair tickets",
    icon: BarChart3,
  },
  {
    id: "rent-roll",
    title: "Rent Roll",
    description: "Tenant summary",
    icon: FileText,
  },
  {
    id: "payment-history",
    title: "Payments",
    description: "Transaction history",
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
    <div className="space-y-4">
      {/* Report Type Selection - Compact Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]",
              activeReport === report.id && "ring-2 ring-primary shadow-md"
            )}
            onClick={() => setActiveReport(report.id)}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <report.icon className="h-5 w-5 text-primary flex-shrink-0" />
                <CardTitle className="text-sm font-semibold leading-tight">
                  {report.title}
                </CardTitle>
              </div>
              <CardDescription className="text-xs line-clamp-1">
                {report.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Date Range Selector & Generate Button - Compact */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Generate Report</CardTitle>
              <CardDescription className="text-xs">
                Select date range and generate
              </CardDescription>
            </div>
            {reportData && (
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportCSV}
                  className="h-8"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export</span>
                  <span className="sm:hidden">CSV</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSaveReport}
                  className="h-8"
                >
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            {/* Date Range */}
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Date Range
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "justify-start text-left font-normal h-9 flex-1",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      <span className="text-xs">
                        {dateRange.from ? format(dateRange.from, "MMM dd, yyyy") : "Start date"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
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
                      size="sm"
                      className={cn(
                        "justify-start text-left font-normal h-9 flex-1",
                        !dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      <span className="text-xs">
                        {dateRange.to ? format(dateRange.to, "MMM dd, yyyy") : "End date"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
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

            {/* Generate Button */}
            <Button 
              onClick={handleGenerateReport} 
              disabled={isLoading}
              className="h-9 sm:w-auto w-full"
              size="sm"
            >
              {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              <span className="text-xs font-medium">Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Display */}
      {reportData && (
        <div className="space-y-4">
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