"use client";

import { useEffect, useRef, useCallback } from "react";

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: string | HTMLElement,
                options: TurnstileOptions
            ) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
    }
}

interface TurnstileOptions {
    sitekey: string;
    callback?: (token: string) => void;
    "error-callback"?: () => void;
    "expired-callback"?: () => void;
    theme?: "light" | "dark" | "auto";
    size?: "normal" | "compact";
}

interface TurnstileWidgetProps {
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
    theme?: "light" | "dark" | "auto";
    size?: "normal" | "compact";
    className?: string;
}

export default function TurnstileWidget({
    onVerify,
    onError,
    onExpire,
    theme = "auto",
    size = "normal",
    className = "",
}: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const scriptLoadedRef = useRef(false);

    const renderWidget = useCallback(() => {
        if (!containerRef.current || !window.turnstile) return;

        // Remove existing widget if any
        if (widgetIdRef.current) {
            try {
                window.turnstile.remove(widgetIdRef.current);
            } catch {
                // Widget might already be removed
            }
        }

        const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

        if (!sitekey) {
            console.error("Turnstile: Site key not configured");
            return;
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey,
            callback: onVerify,
            "error-callback": onError,
            "expired-callback": onExpire,
            theme,
            size,
        });
    }, [onVerify, onError, onExpire, theme, size]);

    useEffect(() => {
        // Check if script already exists
        if (document.querySelector('script[src*="turnstile"]')) {
            scriptLoadedRef.current = true;
            // Wait for turnstile to be available
            const checkTurnstile = setInterval(() => {
                if (window.turnstile) {
                    clearInterval(checkTurnstile);
                    renderWidget();
                }
            }, 100);
            return () => clearInterval(checkTurnstile);
        }

        // Load Turnstile script
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.defer = true;

        script.onload = () => {
            scriptLoadedRef.current = true;
            // Small delay to ensure turnstile is initialized
            setTimeout(renderWidget, 100);
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup widget on unmount
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch {
                    // Widget might already be removed
                }
            }
        };
    }, [renderWidget]);

    return (
        <div
            ref={containerRef}
            className={`turnstile-widget ${className}`}
            style={{ minHeight: size === "compact" ? "65px" : "75px" }}
        />
    );
}
