"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Download, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Badge from "@/components/admin/Badge";
import { supabase, type ActivityLog } from "@/lib/supabase";
import Papa from "papaparse";

export default function LogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [completionData, setCompletionData] = useState<{ date: string; count: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [actionFilter, setActionFilter] = useState<string>("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        if (!supabase) return;

        try {
            // Get activity logs
            const { data: logsData } = await supabase
                .from("activity_logs")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(100);

            setLogs((logsData as ActivityLog[]) || []);

            // Get completion data for chart (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data: completions } = await supabase
                .from("needs")
                .select("completed_at")
                .eq("status", "completed")
                .gte("completed_at", thirtyDaysAgo.toISOString());

            // Group by date
            const dateMap = new Map<string, number>();
            completions?.forEach((item: { completed_at: string }) => {
                const date = new Date(item.completed_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                });
                dateMap.set(date, (dateMap.get(date) || 0) + 1);
            });

            const chartData = Array.from(dateMap.entries())
                .map(([date, count]) => ({ date, count }))
                .slice(-14);

            setCompletionData(chartData);
        } catch (error) {
            console.error("Failed to load logs:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const filteredLogs = logs.filter((log) => {
        const matchesAction = actionFilter === "all" || log.action === actionFilter;
        const logDate = new Date(log.created_at);

        let matchesDate = true;
        if (dateRange.start) {
            matchesDate = matchesDate && logDate >= new Date(dateRange.start);
        }
        if (dateRange.end) {
            matchesDate = matchesDate && logDate <= new Date(dateRange.end + "T23:59:59");
        }

        return matchesAction && matchesDate;
    });

    const handleExport = async () => {
        if (!supabase) return;

        try {
            let query = supabase
                .from("needs")
                .select(`
          id,
          title,
          category,
          created_at,
          completed_at,
          homes (name)
        `)
                .eq("status", "completed");

            if (dateRange.start) {
                query = query.gte("completed_at", dateRange.start);
            }
            if (dateRange.end) {
                query = query.lte("completed_at", dateRange.end + "T23:59:59");
            }

            const { data } = await query;

            if (!data || data.length === 0) {
                alert("No data to export for the selected range");
                return;
            }

            const csvData = data.map((need: { id: string; title: string; category: string; created_at: string; completed_at: string; homes: { name: string } | null }) => ({
                "Need ID": need.id,
                "Home Name": need.homes?.name || "Unknown",
                "Item Category": need.category,
                "Date Posted": new Date(need.created_at).toLocaleDateString(),
                "Date Fulfilled": new Date(need.completed_at).toLocaleDateString(),
                "Duration (Days)": Math.ceil(
                    (new Date(need.completed_at).getTime() - new Date(need.created_at).getTime()) /
                    (1000 * 60 * 60 * 24)
                ),
            }));

            const csv = Papa.unparse(csvData);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `givehaven-report-${new Date().toISOString().split("T")[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed. Please try again.");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getActionLabel = (log: ActivityLog) => {
        // Check if metadata has status_label (for status changes)
        if (log.metadata?.status_label) {
            return `Status: ${log.metadata.status_label}`;
        }

        const labels: Record<string, string> = {
            pledge: "New Pledge",
            complete: "Need Fulfilled",
            cancel: "Pledge Cancelled",
            verify: "Home Verified",
            reject: "Home Rejected",
        };
        return labels[log.action] || log.action;
    };

    const getActionVariant = (action: string): "verified" | "pending" | "rejected" | "active" => {
        const variants: Record<string, "verified" | "pending" | "rejected" | "active"> = {
            pledge: "active",
            complete: "verified",
            cancel: "rejected",
            verify: "verified",
            reject: "rejected",
        };
        return variants[action] || "pending";
    };

    const getActionIcon = (action: string) => {
        const icons: Record<string, string> = {
            pledge: "🤝",
            complete: "✅",
            cancel: "❌",
            verify: "✓",
            reject: "✗",
        };
        return icons[action] || "•";
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 rounded-lg animate-pulse" style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }} />
                <div className="h-64 rounded-2xl animate-pulse" style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#1E293B" }}>Activity Logs</h1>
                    <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                        View platform activity and export reports
                    </p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all"
                    style={{ backgroundColor: "#0D9488", color: "white" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0F766E")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0D9488")}
                >
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            {/* Completions Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6"
                style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 4px 20px rgba(13, 148, 136, 0.08)",
                }}
            >
                <h2 className="font-semibold mb-4" style={{ color: "#1E293B" }}>Completions Over Time</h2>
                {completionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={completionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(13, 148, 136, 0.1)" />
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94A3B8" }} />
                            <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                                    border: "1px solid rgba(13, 148, 136, 0.2)",
                                    borderRadius: "8px",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#0D9488"
                                strokeWidth={2}
                                dot={{ fill: "#0D9488", r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[200px] flex items-center justify-center">
                        <p className="text-sm" style={{ color: "#94A3B8" }}>No completion data available</p>
                    </div>
                )}
            </motion.div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <Calendar size={16} style={{ color: "#64748B" }} />
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="px-3 py-2 rounded-lg text-sm"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            border: "1px solid rgba(13, 148, 136, 0.2)",
                            color: "#1E293B",
                        }}
                    />
                    <span style={{ color: "#64748B" }}>to</span>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="px-3 py-2 rounded-lg text-sm"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            border: "1px solid rgba(13, 148, 136, 0.2)",
                            color: "#1E293B",
                        }}
                    />
                </div>
                <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        border: "1px solid rgba(13, 148, 136, 0.2)",
                        color: "#1E293B",
                    }}
                >
                    <option value="all">All Actions</option>
                    <option value="pledge">Pledges</option>
                    <option value="complete">Completions</option>
                    <option value="verify">Verifications</option>
                    <option value="reject">Rejections</option>
                    <option value="cancel">Cancellations</option>
                </select>
            </div>

            {/* Activity Log - Expandable Accordion */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl overflow-hidden"
                style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 4px 20px rgba(13, 148, 136, 0.08)",
                }}
            >
                {filteredLogs.length === 0 ? (
                    <div className="text-center py-12">
                        <Activity size={48} className="mx-auto mb-3" style={{ color: "#94A3B8" }} />
                        <p style={{ color: "#64748B" }}>No activity logs found</p>
                    </div>
                ) : (
                    <div className="divide-y" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
                        <AnimatePresence>
                            {filteredLogs.map((log) => (
                                <div key={log.id}>
                                    <button
                                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                                        className="w-full flex items-center gap-4 p-4 hover:bg-white/50 transition-colors text-left"
                                    >
                                        <span className="text-xl">{getActionIcon(log.action)}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant={getActionVariant(log.action)}>
                                                    {getActionLabel(log)}
                                                </Badge>
                                                <span className="text-xs capitalize" style={{ color: "#64748B" }}>
                                                    {log.entity_type}
                                                </span>
                                                {log.user_id && (
                                                    <span className="text-xs" style={{ color: "#94A3B8" }}>
                                                        • by Admin
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                                                {formatDate(log.created_at)}
                                            </p>
                                        </div>
                                        {expandedId === log.id ? (
                                            <ChevronUp size={18} style={{ color: "#64748B" }} />
                                        ) : (
                                            <ChevronDown size={18} style={{ color: "#64748B" }} />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {expandedId === log.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 pb-4">
                                                    <div
                                                        className="p-4 rounded-xl"
                                                        style={{ backgroundColor: "rgba(13, 148, 136, 0.03)" }}
                                                    >
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <p className="font-medium mb-1" style={{ color: "#64748B" }}>Entity ID</p>
                                                                <code
                                                                    className="text-xs px-2 py-1 rounded"
                                                                    style={{ backgroundColor: "rgba(13, 148, 136, 0.1)", color: "#0D9488" }}
                                                                >
                                                                    {log.entity_id}
                                                                </code>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium mb-1" style={{ color: "#64748B" }}>Entity Type</p>
                                                                <p className="capitalize" style={{ color: "#1E293B" }}>{log.entity_type}</p>
                                                            </div>
                                                            {log.user_id && (
                                                                <div>
                                                                    <p className="font-medium mb-1" style={{ color: "#64748B" }}>Executed By</p>
                                                                    <p style={{ color: "#1E293B" }}>Admin (ID: {log.user_id.slice(0, 8)}...)</p>
                                                                </div>
                                                            )}
                                                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                                <div className="col-span-2">
                                                                    <p className="font-medium mb-1" style={{ color: "#64748B" }}>Details</p>
                                                                    <div className="space-y-1">
                                                                        {Object.entries(log.metadata).map(([key, value]) => (
                                                                            <div key={key} className="flex gap-2">
                                                                                <span className="capitalize" style={{ color: "#64748B" }}>{key.replace(/_/g, " ")}:</span>
                                                                                <span style={{ color: "#1E293B" }}>{String(value)}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
