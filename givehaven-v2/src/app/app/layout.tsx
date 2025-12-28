import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "GiveHaven - Connecting Hearts to Homes",
    description: "Browse what children's homes need, pledge what you have, and make real impact.",
    openGraph: {
        title: "GiveHaven - Connecting Hearts to Homes",
        description: "Browse what children's homes need, pledge what you have, and make real impact.",
        url: "https://www.ndakita.com/app",
        type: "website",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "GiveHaven - Connecting Hearts to Homes",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "GiveHaven - Connecting Hearts to Homes",
        description: "Browse what children's homes need, pledge what you have, and make real impact.",
        images: ["/og-image.jpg"],
    },
};

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
