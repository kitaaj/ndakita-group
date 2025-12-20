"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";

// Images positioned to frame the content - more density
const images = [
    // Foreground - Very Large (closer to viewer) - Strong parallax
    { src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format", alt: "Happy child", x: "-5%", y: "3%", depth: -280, blur: 0, width: 420, height: 280 },
    { src: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format", alt: "Food donation", x: "68%", y: "72%", depth: -300, blur: 0, width: 450, height: 300 },
    { src: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=800&auto=format", alt: "Helping hands", x: "75%", y: "-5%", depth: -260, blur: 0, width: 400, height: 270 },
    { src: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=800&auto=format", alt: "Volunteers", x: "-8%", y: "68%", depth: -290, blur: 0, width: 430, height: 285 },
    // Midground - Medium parallax
    { src: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=600&auto=format", alt: "Reading book", x: "78%", y: "35%", depth: -160, blur: 0, width: 300, height: 200 },
    { src: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=600&auto=format", alt: "Happy playing", x: "-3%", y: "38%", depth: -170, blur: 0, width: 310, height: 205 },
    { src: "https://images.unsplash.com/photo-1594708767771-a7502209ff51?q=80&w=600&auto=format", alt: "Children learning", x: "35%", y: "-8%", depth: -150, blur: 0, width: 280, height: 190 },
    { src: "https://images.unsplash.com/photo-1497375638960-ca368c7231e4?q=80&w=600&auto=format", alt: "Community garden", x: "40%", y: "85%", depth: -155, blur: 0, width: 290, height: 195 },
    // Background - Smaller parallax (further away moves less)
    { src: "https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?q=80&w=500&auto=format", alt: "School supplies", x: "88%", y: "55%", depth: -80, blur: 0, width: 200, height: 135 },
    { src: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=500&auto=format", alt: "Community help", x: "5%", y: "18%", depth: -90, blur: 0, width: 210, height: 140 },
    { src: "https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?q=80&w=500&auto=format", alt: "Charity event", x: "55%", y: "15%", depth: -70, blur: 0, width: 190, height: 130 },
    { src: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=500&auto=format", alt: "Team work", x: "15%", y: "88%", depth: -75, blur: 0, width: 195, height: 132 },
];

interface ImageData {
    src: string;
    alt: string;
    x: string;
    y: string;
    depth: number;
    blur: number;
    width: number;
    height: number;
}

function FloatingImage({ img, mouseX, mouseY }: { img: ImageData; mouseX: ReturnType<typeof useSpring>; mouseY: ReturnType<typeof useSpring> }) {
    const x = useTransform(mouseX, (val: number) => val * img.depth);
    const y = useTransform(mouseY, (val: number) => val * img.depth);

    return (
        <motion.div
            className="absolute rounded-2xl overflow-hidden shadow-2xl"
            style={{
                left: img.x,
                top: img.y,
                x,
                y,
                filter: `grayscale(1) blur(${img.blur}px)`,
                width: img.width,
                height: img.height,
                zIndex: Math.abs(img.depth), // Higher depth = closer to viewer = higher z-index
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            whileHover={{ scale: 1.03, filter: "grayscale(1)", opacity: 1, zIndex: 200 }}
        >
            <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
            />
        </motion.div>
    );
}

export default function FloatingGrid() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring physics
    const springConfig = { damping: 30, stiffness: 80, mass: 0.8 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    // Subtle 3D Tilt
    const rotateX = useTransform(smoothY, [-1, 1], [2, -2]);
    const rotateY = useTransform(smoothX, [-1, 1], [-2, 2]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth - 0.5) * 2;
            const y = (e.clientY / innerHeight - 0.5) * 2;
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <motion.div
            className="fixed inset-0 overflow-hidden pointer-events-none z-0"
            style={{
                perspective: "1500px",
                perspectiveOrigin: "center center",
            }}
        >
            <motion.div
                className="absolute inset-0"
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
            >
                {images.map((img, i) => (
                    <FloatingImage key={i} img={img} mouseX={smoothX} mouseY={smoothY} />
                ))}
            </motion.div>
        </motion.div>
    );
}
