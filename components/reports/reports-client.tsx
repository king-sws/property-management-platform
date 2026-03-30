/* eslint-disable @typescript-eslint/no-explicit-any */
// components/reports/reports-client.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BarChart3,
  DollarSign,
  FileText,
  Home,
  TrendingUp,
  Calendar as CalendarIcon,
  Download,
  Loader2,
  Save,
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
  { id: "financial",       title: "Financial",    description: "Income & expenses",    icon: DollarSign },
  { id: "occupancy",       title: "Occupancy",    description: "Vacancy rates",         icon: Home },
  { id: "maintenance",     title: "Maintenance",  description: "Repair tickets",        icon: BarChart3 },
  { id: "rent-roll",       title: "Rent Roll",    description: "Tenant summary",        icon: FileText },
  { id: "payment-history", title: "Payments",     description: "Transaction history",   icon: TrendingUp },
];

type DateRange = { from: Date; to: Date };

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
        case "financial":       result = await generateFinancialReport(dateRange.from, dateRange.to); break;
        case "occupancy":       result = await generateOccupancyReport(dateRange.to); break;
        case "maintenance":     result = await generateMaintenanceReport(dateRange.from, dateRange.to); break;
        case "rent-roll":       result = await generateRentRollReport(dateRange.to); break;
        case "payment-history": result = await generatePaymentHistoryReport(dateRange.from, dateRange.to); break;
        default: throw new Error("Invalid report type");
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
      const result = await saveFinancialReport(activeReport, dateRange.from, dateRange.to, reportData);
      if (result.success) { toast.success("Report saved successfully"); }
      else { toast.error(result.error || "Failed to save report"); }
    } catch {
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

  const activeType = reportTypes.find((r) => r.id === activeReport);

  return (
    <div className="space-y-6">

      {/* ── Report type picker ── */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Report Type</CardTitle>
          <CardDescription>Choose which report to generate</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x">
            {reportTypes.map((report, idx) => {
              const Icon = report.icon;
              const isActive = activeReport === report.id;
              return (
                <button
  key={report.id}
  onClick={() => { setActiveReport(report.id); setReportData(null); }}
  className={cn(
    "flex flex-col items-start gap-1 px-5 py-4 text-left transition-colors hover:bg-muted/30",
    idx < 2 && "border-b sm:border-b-0",
    idx === 2 && "border-b md:border-b-0",
    isActive
      ? "bg-muted/50 border-t-2 border-t-primary"
      : "border-t-2 border-t-transparent"
  )}
>
  <div className="flex items-center gap-2">
    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
    <span className={cn("text-sm font-medium", isActive ? "text-primary" : "")}>{report.title}</span>
  </div>
  <p className="text-xs text-muted-foreground">{report.description}</p>
  {/* Remove the absolute div entirely */}
</button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Controls card ── */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>
                {activeType?.title ?? "Report"} Report
              </CardTitle>
              <CardDescription>
                {format(dateRange.from, "MMM d, yyyy")} – {format(dateRange.to, "MMM d, yyyy")}
              </CardDescription>
            </div>
            {reportData && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleSaveReport}>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="px-6 py-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end border-b">
            {/* Date pickers */}
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Date Range
              </p>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-left font-normal h-9 flex-1"
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
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
                      className="justify-start text-left font-normal h-9 flex-1"
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
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

            {/* Generate button */}
            <Button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="h-9 sm:w-auto"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Generating...</>
              ) : (
                "Generate Report"
              )}
            </Button>
          </div>

          {/* Quick range presets */}
          <div className="px-6 py-3 flex flex-wrap gap-2">
            {[
              { label: "This Month",    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),      to: new Date() },
              { label: "Last Month",    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),  to: new Date(new Date().getFullYear(), new Date().getMonth(), 0) },
              { label: "This Quarter",  from: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1), to: new Date() },
              { label: "This Year",     from: new Date(new Date().getFullYear(), 0, 1),                          to: new Date() },
            ].map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setDateRange({ from: preset.from, to: preset.to })}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Report output ── */}
      {reportData && (
        <div className="space-y-4">
          {activeReport === "financial"       && <FinancialReportView data={reportData} />}
          {activeReport === "occupancy"       && <OccupancyReportView data={reportData} />}
          {activeReport === "maintenance"     && <MaintenanceReportView data={reportData} />}
          {activeReport === "rent-roll"       && <RentRollView data={reportData} />}
          {activeReport === "payment-history" && <PaymentHistoryView data={reportData} />}
        </div>
      )}
    </div>
  );
}

function generateCSV(reportType: string, data: any): string {
  let csv = "";
  switch (reportType) {
    case "financial":
      csv = "Category,Amount\n";
      csv += `Total Income,${data.summary.totalIncome}\n`;
      csv += `Total Expenses,${data.summary.totalExpenses}\n`;
      csv += `Net Income,${data.summary.netIncome}\n\nIncome By Type\n`;
      Object.entries(data.incomeByType).forEach(([type, amount]) => { csv += `${type},${amount}\n`; });
      break;
    case "occupancy":
      csv = "Property,Total Units,Occupied,Vacant,Occupancy Rate\n";
      data.properties.forEach((p: any) => { csv += `${p.propertyName},${p.totalUnits},${p.occupiedUnits},${p.vacantUnits},${p.occupancyRate}%\n`; });
      break;
    case "maintenance":
      csv = "Status,Count\n";
      Object.entries(data.byStatus).forEach(([status, count]) => { csv += `${status},${count}\n`; });
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