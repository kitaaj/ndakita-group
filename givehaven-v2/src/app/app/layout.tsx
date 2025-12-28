import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "GiveHaven - Connecting Hearts to Homes",
    description: "Make your kindness count where it matters most. Connecting generous hearts directly to verified children's homes.",
    openGraph: {
        title: "GiveHaven - Connecting Hearts to Homes",
        description: "Make your kindness count where it matters most. Connecting generous hearts directly to verified children's homes.",
        url: "https://www.ndakita.com/app",
        type: "website",
        images: [
            {
                url: "/og-image-app.png",
                width: 1200,
                height: 630,
                alt: "GiveHaven - Connecting Hearts to Homes",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "GiveHaven - Connecting Hearts to Homes",
        description: "Make your kindness count where it matters most. Connecting generous hearts directly to verified children's homes.",
        images: ["/og-image-app.png"],
    },
};

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
