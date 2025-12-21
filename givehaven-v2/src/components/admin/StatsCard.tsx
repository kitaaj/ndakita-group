import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: "teal" | "coral" | "yellow" | "slate";
}

const colorMap = {
    teal: { bg: "rgba(13, 148, 136, 0.1)", icon: "#0D9488" },
    coral: { bg: "rgba(249, 115, 22, 0.1)", icon: "#F97316" },
    yellow: { bg: "rgba(251, 191, 36, 0.1)", icon: "#FBBF24" },
    slate: { bg: "rgba(100, 116, 139, 0.1)", icon: "#64748B" },
};

export default function StatsCard({ title, value, icon: Icon, trend, color = "teal" }: StatsCardProps) {
    const colors = colorMap[color];

    return (
        <div
            className="p-6 rounded-2xl"
            style={{
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.9)",
                boxShadow: "0 4px 20px rgba(13, 148, 136, 0.08)",
            }}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium" style={{ color: "#64748B" }}>
                        {title}
                    </p>
                    <p className="text-3xl font-bold mt-1" style={{ color: "#1E293B" }}>
                        {value}
                    </p>
                    {trend && (
                        <p
                            className="text-sm font-medium mt-2"
                            style={{ color: trend.isPositive ? "#10B981" : "#EF4444" }}
                        >
                            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last month
                        </p>
                    )}
                </div>
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: colors.bg }}
                >
                    <Icon size={24} style={{ color: colors.icon }} />
                </div>
            </div>
        </div>
    );
}
