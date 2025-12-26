"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    Home,
    MapPin,
    FileText,
    Upload,
    CheckCircle,
    Loader2,
    AlertTriangle,
    X,
} from "lucide-react";
import {
    getCurrentSession,
    getMyHome,
    createHome,
    uploadFile,
    signInWithGoogle,
} from "@/lib/supabase";

type Step = 1 | 2 | 3 | 4;

export default function RegisterHomePage() {
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [docFile, setDocFile] = useState<File | null>(null);
    const [docName, setDocName] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        contact_email: "",
        contact_phone: "",
        story: "",
        address: "",
    });

    useEffect(() => {
        async function checkAuth() {
            try {
                const session = await getCurrentSession();
                if (!session) {
                    setIsAuthenticated(false);
                    setIsCheckingAuth(false);
                    return;
                }

                // Check if already has a home
                const existingHome = await getMyHome();
                if (existingHome) {
                    router.push("/home");
                    return;
                }

                setIsAuthenticated(true);
            } catch (error) {
                console.error("Auth check failed:", error);
            } finally {
                setIsCheckingAuth(false);
            }
        }

        checkAuth();
    }, [router]);

    function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    function handleDocChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setDocFile(file);
            setDocName(file.name);
        }
    }

    function nextStep() {
        if (currentStep < 4) {
            setCurrentStep((prev) => (prev + 1) as Step);
        }
    }

    function prevStep() {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as Step);
        }
    }

    function validateStep(): boolean {
        switch (currentStep) {
            case 1:
                if (!formData.name.trim()) {
                    setError("Please enter your home's name");
                    return false;
                }
                break;
            case 2:
                if (!formData.address.trim()) {
                    setError("Please enter your address");
                    return false;
                }
                break;
            case 3:
                if (!docFile && !docName) {
                    setError("Please upload a verification document");
                    return false;
                }
                break;
        }
        setError(null);
        return true;
    }

    function handleNext() {
        if (validateStep()) {
            nextStep();
        }
    }

    async function handleSubmit() {
        setError(null);
        setIsSubmitting(true);

        try {
            let logoUrl: string | undefined;
            let docUrl: string | undefined;

            // Upload files (will silently fail if storage policies aren't set up)
            if (logoFile) {
                try {
                    const fileName = `logos/${Date.now()}-${logoFile.name}`;
                    logoUrl = await uploadFile("images", fileName, logoFile);
                } catch (uploadErr) {
                    console.error("Logo upload failed:", uploadErr);
                    // Continue without logo
                }
            }

            if (docFile) {
                try {
                    const fileName = `docs/${Date.now()}-${docFile.name}`;
                    docUrl = await uploadFile("documents", fileName, docFile);
                } catch (uploadErr) {
                    console.error("Doc upload failed:", uploadErr);
                    // Continue without doc
                }
            }

            console.log("Creating home with data:", {
                name: formData.name,
                contact_email: formData.contact_email,
                contact_phone: formData.contact_phone,
                story: formData.story,
                address: formData.address,
            });

            await createHome({
                name: formData.name,
                contact_email: formData.contact_email,
                contact_phone: formData.contact_phone,
                story: formData.story,
                address: formData.address,
                logo_url: logoUrl,
                registration_doc_url: docUrl,
            });

            router.push("/home");
        } catch (err) {
            console.error("Failed to register home:", err);
            setError(err instanceof Error ? err.message : "Failed to register. Please try again.");
            setIsSubmitting(false);
        }
    }

    async function handleGoogleSignIn() {
        try {
            await signInWithGoogle();
        } catch (err) {
            console.error("Sign in failed:", err);
            setError("Failed to sign in. Please try again.");
        }
    }

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F8FAFC" }}>
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
                        style={{ borderColor: "#0D9488", borderTopColor: "transparent" }}
                    />
                    <p className="text-sm font-medium" style={{ color: "#64748B" }}>
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    // Not authenticated - show sign in prompt
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#F8FAFC" }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md rounded-2xl border p-8 text-center"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(20px)",
                        borderColor: "rgba(13, 148, 136, 0.1)",
                    }}
                >
                    <div
                        className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                        style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}
                    >
                        <Home size={32} style={{ color: "#0D9488" }} />
                    </div>
                    <h1 className="text-2xl font-bold mb-2" style={{ color: "#1E293B" }}>
                        Register Your Home
                    </h1>
                    <p className="text-sm mb-6" style={{ color: "#64748B" }}>
                        Sign in to register your children's home and start receiving donations.
                    </p>

                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl border text-sm font-medium transition-all hover:bg-gray-50"
                        style={{ borderColor: "rgba(13, 148, 136, 0.2)", color: "#1E293B" }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 mt-6 text-sm"
                        style={{ color: "#64748B" }}
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                </motion.div>
            </div>
        );
    }

    // Authenticated - show registration wizard
    const steps = [
        { number: 1, label: "Basic Info" },
        { number: 2, label: "Location" },
        { number: 3, label: "Verification" },
        { number: 4, label: "Finish" },
    ];

    return (
        <div className="min-h-screen p-6" style={{ backgroundColor: "#F8FAFC" }}>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 mb-8"
                >
                    <Link
                        href="/"
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "#64748B" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(13, 148, 136, 0.1)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: "#1E293B" }}>
                            Register Your Home
                        </h1>
                        <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                            Complete the steps below to get started.
                        </p>
                    </div>
                </motion.div>

                {/* Progress Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center justify-between mb-8"
                >
                    {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all"
                                    style={{
                                        backgroundColor: currentStep >= step.number
                                            ? "#0D9488"
                                            : "rgba(13, 148, 136, 0.1)",
                                        color: currentStep >= step.number
                                            ? "white"
                                            : "#64748B",
                                    }}
                                >
                                    {currentStep > step.number ? (
                                        <CheckCircle size={18} />
                                    ) : (
                                        step.number
                                    )}
                                </div>
                                <span
                                    className="text-xs mt-2 font-medium"
                                    style={{ color: currentStep >= step.number ? "#0D9488" : "#64748B" }}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className="w-12 sm:w-20 h-0.5 mx-2"
                                    style={{
                                        backgroundColor: currentStep > step.number
                                            ? "#0D9488"
                                            : "rgba(13, 148, 136, 0.2)"
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </motion.div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 rounded-lg border mb-6"
                        style={{
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            borderColor: "rgba(239, 68, 68, 0.3)",
                        }}
                    >
                        <AlertTriangle size={20} style={{ color: "#EF4444" }} />
                        <p className="text-sm" style={{ color: "#991B1B" }}>{error}</p>
                    </motion.div>
                )}

                {/* Step Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border p-8"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(20px)",
                        borderColor: "rgba(13, 148, 136, 0.1)",
                    }}
                >
                    <AnimatePresence mode="wait">
                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-6">
                                    <Home size={40} className="mx-auto mb-3" style={{ color: "#0D9488" }} />
                                    <h2 className="text-xl font-bold" style={{ color: "#1E293B" }}>
                                        Tell us about your home
                                    </h2>
                                    <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                                        This information will be shown to potential donors.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "#1E293B" }}>
                                        Home Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Hope Children's Home"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all focus:ring-2"
                                        style={{
                                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                                            borderColor: "rgba(13, 148, 136, 0.2)",
                                            color: "#1E293B",
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: "#1E293B" }}>
                                            Contact Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.contact_email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all focus:ring-2"
                                            style={{
                                                backgroundColor: "rgba(255, 255, 255, 0.8)",
                                                borderColor: "rgba(13, 148, 136, 0.2)",
                                                color: "#1E293B",
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: "#1E293B" }}>
                                            Contact Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.contact_phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all focus:ring-2"
                                            style={{
                                                backgroundColor: "rgba(255, 255, 255, 0.8)",
                                                borderColor: "rgba(13, 148, 136, 0.2)",
                                                color: "#1E293B",
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "#1E293B" }}>
                                        About Your Home
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="Tell donors about your mission, the children you serve, and your needs..."
                                        value={formData.story}
                                        onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all focus:ring-2 resize-none"
                                        style={{
                                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                                            borderColor: "rgba(13, 148, 136, 0.2)",
                                            color: "#1E293B",
                                        }}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Location */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-6">
                                    <MapPin size={40} className="mx-auto mb-3" style={{ color: "#0D9488" }} />
                                    <h2 className="text-xl font-bold" style={{ color: "#1E293B" }}>
                                        Where are you located?
                                    </h2>
                                    <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                                        This helps donors find and deliver items to you.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "#1E293B" }}>
                                        Address *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 123 Main Street, Nairobi, Kenya"
                                        value={formData.address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all focus:ring-2"
                                        style={{
                                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                                            borderColor: "rgba(13, 148, 136, 0.2)",
                                            color: "#1E293B",
                                        }}
                                    />
                                </div>

                                <div
                                    className="h-48 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: "rgba(13, 148, 136, 0.05)" }}
                                >
                                    <div className="text-center">
                                        <MapPin size={32} className="mx-auto mb-2" style={{ color: "#64748B" }} />
                                        <p className="text-sm" style={{ color: "#64748B" }}>
                                            Map integration coming soon
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Verification */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-6">
                                    <FileText size={40} className="mx-auto mb-3" style={{ color: "#0D9488" }} />
                                    <h2 className="text-xl font-bold" style={{ color: "#1E293B" }}>
                                        Verification Documents
                                    </h2>
                                    <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                                        Upload official documents so we can verify your home.
                                    </p>
                                </div>

                                <div
                                    className="p-4 rounded-lg border"
                                    style={{
                                        backgroundColor: "rgba(251, 191, 36, 0.1)",
                                        borderColor: "rgba(251, 191, 36, 0.3)",
                                    }}
                                >
                                    <p className="text-sm" style={{ color: "#92400E" }}>
                                        <strong>Why verification?</strong> We verify all homes to protect donors and ensure
                                        their contributions reach legitimate organizations.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "#1E293B" }}>
                                        Registration Certificate *
                                    </label>
                                    <p className="text-xs mb-3" style={{ color: "#64748B" }}>
                                        Upload your government registration, NGO certificate, or similar official documentation.
                                    </p>

                                    {docName ? (
                                        <div
                                            className="flex items-center justify-between p-4 rounded-lg"
                                            style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText size={24} style={{ color: "#0D9488" }} />
                                                <span className="text-sm font-medium" style={{ color: "#0D9488" }}>
                                                    {docName}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => { setDocFile(null); setDocName(null); }}
                                                className="p-1 rounded-full"
                                                style={{ color: "#EF4444" }}
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label
                                            className="flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 border-dashed cursor-pointer transition-all hover:border-teal-400"
                                            style={{ borderColor: "rgba(13, 148, 136, 0.3)" }}
                                        >
                                            <Upload size={32} style={{ color: "#64748B" }} />
                                            <p className="text-sm mt-3 font-medium" style={{ color: "#64748B" }}>
                                                Click to upload
                                            </p>
                                            <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
                                                PDF, DOC, or image files
                                            </p>
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                className="hidden"
                                                onChange={handleDocChange}
                                            />
                                        </label>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Finish */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-6">
                                    <div
                                        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                                        style={{ backgroundColor: "rgba(13, 148, 136, 0.1)" }}
                                    >
                                        <CheckCircle size={32} style={{ color: "#0D9488" }} />
                                    </div>
                                    <h2 className="text-xl font-bold" style={{ color: "#1E293B" }}>
                                        Almost there!
                                    </h2>
                                    <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                                        Add a logo (optional) and submit your registration.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-3" style={{ color: "#1E293B" }}>
                                        Home Logo (Optional)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        {logoPreview ? (
                                            <div className="relative">
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo"
                                                    className="w-24 h-24 rounded-xl object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                                                    className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <label
                                                className="w-24 h-24 rounded-xl flex flex-col items-center justify-center cursor-pointer border-2 border-dashed transition-all hover:border-teal-400"
                                                style={{ borderColor: "rgba(13, 148, 136, 0.3)" }}
                                            >
                                                <Upload size={24} style={{ color: "#64748B" }} />
                                                <span className="text-xs mt-1" style={{ color: "#64748B" }}>
                                                    Upload
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleLogoChange}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Summary */}
                                <div
                                    className="rounded-lg p-4 space-y-3"
                                    style={{ backgroundColor: "rgba(13, 148, 136, 0.05)" }}
                                >
                                    <h4 className="font-medium text-sm" style={{ color: "#1E293B" }}>
                                        Registration Summary
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <p style={{ color: "#64748B" }}>
                                            <span className="font-medium" style={{ color: "#1E293B" }}>Name:</span> {formData.name}
                                        </p>
                                        <p style={{ color: "#64748B" }}>
                                            <span className="font-medium" style={{ color: "#1E293B" }}>Address:</span> {formData.address}
                                        </p>
                                        <p style={{ color: "#64748B" }}>
                                            <span className="font-medium" style={{ color: "#1E293B" }}>Document:</span> {docName || "Not uploaded"}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className="p-4 rounded-lg border"
                                    style={{
                                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                                        borderColor: "rgba(59, 130, 246, 0.3)",
                                    }}
                                >
                                    <p className="text-sm" style={{ color: "#1E40AF" }}>
                                        <strong>What happens next?</strong> Our team will review your documents within 1-2 business days.
                                        Once verified, you'll be able to post needs and receive donations!
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: "rgba(13, 148, 136, 0.1)" }}>
                        {currentStep > 1 ? (
                            <button
                                onClick={prevStep}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                style={{ color: "#64748B" }}
                            >
                                <ArrowLeft size={18} />
                                Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {currentStep < 4 ? (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90"
                                style={{ backgroundColor: "#0D9488" }}
                            >
                                Continue
                                <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ backgroundColor: "#0D9488" }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        Complete Registration
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
