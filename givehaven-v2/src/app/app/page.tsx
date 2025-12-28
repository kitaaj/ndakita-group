"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, MessageCircle, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NeedCard from "@/components/explore/NeedCard";
import { getPublicActiveNeeds, type PublicNeed } from "@/lib/supabase";

export default function HomePage() {
  const [featuredNeeds, setFeaturedNeeds] = useState<PublicNeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedNeeds() {
      try {
        const needs = await getPublicActiveNeeds();
        // Get first 3 needs for featured section
        setFeaturedNeeds(needs.slice(0, 3));
      } catch (error) {
        console.error("Failed to load featured needs:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadFeaturedNeeds();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Ambient Background Blurs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Teal blur - top left */}
          <motion.div
            className="absolute w-[500px] h-[500px] -top-32 -left-32 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(153, 246, 228, 0.4) 0%, transparent 70%)",
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -20, 30, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Yellow blur - bottom right */}
          <motion.div
            className="absolute w-[400px] h-[400px] -bottom-20 -right-20 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)",
            }}
            animate={{
              x: [0, -30, 20, 0],
              y: [0, 30, -20, 0],
              scale: [1, 0.95, 1.1, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Coral blur - center right */}
          <motion.div
            className="absolute w-[350px] h-[350px] top-1/3 -right-10 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, transparent 70%)",
            }}
            animate={{
              x: [0, -20, 25, 0],
              y: [0, 25, -15, 0],
              scale: [1, 1.05, 0.95, 1],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-20">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
            style={{ color: "#1E293B" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Connecting Hearts{" "}
            <span style={{ color: "#0D9488" }}>to Homes</span>
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10"
            style={{ color: "#64748B" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Browse what children&apos;s homes need. Pledge what you have.
            Make real, tangible impact in the lives of those who need it most.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link
              href="/explore"
              className="px-8 py-4 text-base font-semibold text-white rounded-xl transition-all hover:opacity-90 flex items-center gap-2"
              style={{
                backgroundColor: "#F97316",
                boxShadow: "0 4px 20px rgba(249, 115, 22, 0.3)",
              }}
            >
              Touch a Life
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/register-home"
              className="px-8 py-4 text-base font-semibold rounded-xl transition-all border-2"
              style={{
                color: "#0D9488",
                borderColor: "#0D9488",
                backgroundColor: "transparent",
              }}
            >
              Register Your Home
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div
            className="w-6 h-10 rounded-full border-2 flex items-start justify-center p-2"
            style={{ borderColor: "#94A3B8" }}
          >
            <motion.div
              className="w-1.5 h-2 rounded-full"
              style={{ backgroundColor: "#94A3B8" }}
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: "#1E293B" }}
            >
              How It Works
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "#64748B" }}
            >
              Three simple steps to make a real difference
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Home,
                step: "01",
                title: "Homes post what they need",
                desc: "Verified children's homes list the items they need — food, clothing, school supplies, and more.",
              },
              {
                icon: Search,
                step: "02",
                title: "Browse & Pledge",
                desc: "See what's needed near you. When you have something to give, pledge it with one click.",
              },
              {
                icon: MessageCircle,
                step: "03",
                title: "Connect & Deliver",
                desc: "Chat directly with the home to coordinate pickup or delivery. No middlemen, no fees.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="relative rounded-2xl p-8 text-center"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(13, 148, 136, 0.1)",
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Step number */}
                <span
                  className="absolute top-4 right-4 text-5xl font-bold opacity-10"
                  style={{ color: "#0D9488" }}
                >
                  {item.step}
                </span>
                <div
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}
                >
                  <item.icon size={32} style={{ color: "#0D9488" }} />
                </div>
                <h3
                  className="text-xl font-semibold mb-3"
                  style={{ color: "#1E293B" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#64748B" }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Needs Section */}
      <section
        className="py-20 md:py-28"
        style={{ backgroundColor: "rgba(13, 148, 136, 0.03)" }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: "#1E293B" }}
            >
              What Homes are Currently Looking For
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "#64748B" }}
            >
              See what children&apos;s homes are looking for right now
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={40} className="animate-spin" style={{ color: "#0D9488" }} />
            </div>
          ) : featuredNeeds.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {featuredNeeds.map((need, index) => (
                  <motion.div
                    key={need.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <NeedCard
                      need={need}
                      onPledge={() => {
                        window.location.href = "/explore";
                      }}
                      isPledging={false}
                    />
                  </motion.div>
                ))}
              </div>
              <div className="text-center">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all"
                  style={{
                    backgroundColor: "rgba(13, 148, 136, 0.1)",
                    color: "#0D9488",
                  }}
                >
                  I Want to See More
                  <ArrowRight size={16} />
                </Link>
              </div>
            </>
          ) : (
            <motion.div
              className="text-center py-12 rounded-2xl"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                border: "1px solid rgba(13, 148, 136, 0.1)",
              }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <p style={{ color: "#64748B" }}>
                No active needs right now. Check back soon!
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* For Homes CTA Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            className="rounded-3xl p-8 md:p-16 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0D9488 0%, #115E59 100%)",
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Decorative circles */}
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
              style={{ backgroundColor: "white" }}
            />
            <div
              className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10"
              style={{ backgroundColor: "white" }}
            />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Do You Represent Any Children&apos;s Home?
              </h2>
              <p
                className="text-lg max-w-xl mx-auto mb-8"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
              >
                Join GiveHaven to connect with donors who want to help.
                Registration is free, verification is quick, and the impact is real.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {["Free to Join", "Direct Connection", "Verified Community"].map((benefit) => (
                  <span
                    key={benefit}
                    className="px-4 py-2 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      color: "white",
                    }}
                  >
                    {benefit}
                  </span>
                ))}
              </div>
              <Link
                href="/register-home"
                className="inline-block px-8 py-4 text-base font-semibold rounded-xl transition-all hover:opacity-90"
                style={{
                  backgroundColor: "white",
                  color: "#0D9488",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                }}
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
