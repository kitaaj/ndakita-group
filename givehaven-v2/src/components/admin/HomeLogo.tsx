"use client";

import { useState } from "react";
import Image from "next/image";
import { Building2 } from "lucide-react";

interface HomeLogoProps {
    src?: string | null;
    alt: string;
    size?: number;
}

export default function HomeLogo({ src, alt, size = 56 }: HomeLogoProps) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return (
            <div
                className="rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                    width: size,
                    height: size,
                    backgroundColor: "rgba(13, 148, 136, 0.1)"
                }}
            >
                <Building2 size={size * 0.43} style={{ color: "#0D9488" }} />
            </div>
        );
    }

    return (
        <div
            className="rounded-full overflow-hidden flex-shrink-0"
            style={{ width: size, height: size }}
        >
            <Image
                src={src}
                alt={alt}
                width={size}
                height={size}
                className="w-full h-full object-cover"
                onError={() => setHasError(true)}
            />
        </div>
    );
}


