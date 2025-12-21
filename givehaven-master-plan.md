# Project: GiveHaven - Master Execution Plan

**Project Type:** Full Stack Web Platform + High-Fidelity Teaser  
**Role:** Senior Software Engineer & UI Designer (Autonomous Agent)  
**Current Date:** December 20, 2025  
**Deadline:** ASAP (Teaser), Sprint-based (Full Platform)  
**Aesthetic:** "Glassmorphism Future" (Reference: Microsoft Year in Review (https://www.microsoft.com/en-us/edge/update/year-in-review?form=MT016U&channel=stable&version=143.0.3650.96&sg=1&cs=261674308)) — High depth, fluid animations, floating elements.

---

## 1. Technology Stack Architecture
Use this stack to ensure modern performance, type safety, and "wow" factor visuals.

### **Frontend & UI**
*   **Framework:** **Next.js 15 (App Router)** – *Strict Mode enabled.*
*   **Language:** **TypeScript** – *Strict typing required for all interfaces.*
*   **Styling:** **Tailwind CSS v4** – *Utility-first styling.*
*   **Component System:** **Shadcn/UI** (Radix Primitives) – *heavily customized with glass styles.*
*   **Animation Engine:** **Framer Motion** – *Mandatory for page transitions, layout morphing, and floating effects.*
*   **Maps:** **Mapbox GL JS** (react-map-gl) – *Custom dark-mode map style to fit the theme.*

### **Backend & Infrastructure**
*   **BaaS:** **Supabase** – *PostgreSQL DB, Auth, Realtime subscriptions, and Storage.*
*   **Validation:** **Zod** – *Schema validation for forms and API routes.*
*   **Forms:** **React Hook Form**.
*   **State Management:** **Zustand** – *For global donation cart and user session state.*

---

## 2. Phase 1: The "Teaser" (Immediate Placeholder)
**Objective:** Deploy a stunning, animated landing page to capture interest while the full app is built.
**Visuals:** Replicate the "Microsoft 2025" video aesthetic.

### **1.1. Setup & Config**
1.  **Initialize:** Create Next.js project. Configure `tailwind.config.ts` with a "Deep Forest" theme (Dark Greens, Slate, Gold accents).
2.  **Global CSS:** Add standard glassmorphism utilities (`.glass-panel`: backdrop-blur-xl, bg-white/5, border-white/10).

### **1.2. The "Floating World" Component**
1.  **Build `FloatingGrid.tsx`:**
    *   Create a full-screen container (`h-screen`, `overflow-hidden`).
    *   Position 6-8 high-quality images of *happy children* and *community supplies* absolutely around the edges.
    *   **Animation:** Use Framer Motion to animate them floating gently (`y: [0, -20, 0]`) with staggered delays. Add a parallax effect linked to mouse movement (`useMouseMove`).

### **1.3. The Hero Modal**
1.  **Build `GlassHero.tsx`:**
    *   Center a large, frosted glass card.
    *   **Typography:** Large, elegant serif headings (e.g., *Playfair Display*) paired with clean sans-serif body text (e.g., *Inter* or *Geist*).
    *   **Content:** "GiveHaven: Connecting Hearts to Homes."
    *   **Action:** A glowing "Join Waitlist" button that opens a modal form.
    *   **Transition:** On click, expand the card (using `layoutId`) to fill the screen, revealing the "About" section below.

---

## 3. Phase 2: The "Zero-Capital" Backend Infrastructure
**Constraint:** Must use permanently free tiers.
**Provider:** **Supabase** (Database, Auth, Storage, Realtime).

### **3.1. Database Schema (P2P Model)**
1.  **`profiles`**: Links to Auth ID. Stores `role` ('donor' | 'home').
2.  **`homes`**: Public profile for the institution.
    *   `verified`: Boolean (Only field the Admin touches).
    *   `location`: Lat/Long coordinates.
3.  **`needs`**:
    *   `status`: 'active' | 'pending_pickup' | 'completed'.
4.  **`chat_rooms`**:
    *   Links `need_id`, `donor_id`, `home_id`.
    *   *Logic:* Created automatically when a Donor pledges.
5.  **`messages`**:
    *   Stores the conversation history.

### **3.2. Automated Security Policies (RLS)**
*   **Row Level Security (RLS):** Crucial.
    *   *Homes* can only edit their own needs.
    *   *Donors* can only read "active" needs.
    *   *Chat Messages* are strictly visible ONLY to the 2 participants (Donor & Home).
    *   *Admin* has super-access but no operational tasks.

---

## 4. Phase 3: The "Hands-Off" Logic Flow
**Objective:** The app runs itself. Admins never coordinate deliveries.

### **4.1. The Verification Gate (The ONLY Admin Task)**
*   **Flow:** Home registers -> Uploads Gov Registration Doc -> Status: "Pending".
*   **Admin Dashboard:** You log in, see a list of PDFs, click "Verify" or "Reject".
*   *Once verified, the Home can post unlimited needs without your approval.*

### **4.2. The Donation Loop (Direct Peer-to-Peer)**
1.  **Discovery:** Donor finds a need on the Map.
2.  **Pledge:** Donor clicks "I have this item."
3.  **Connection:**
    *   The system changes need status to `pending_pickup` (hides it from other donors).
    *   The system **automatically creates a Chat Room**.
    *   The system redirects the Donor to the Chat UI.
4.  **Coordination:**
    *   Donor: "I can drop it off Tuesday at 2 PM."
    *   Home: "Perfect, ask for Sarah at the gate."
5.  **Completion:**
    *   Home receives item.
    *   Home clicks **"Confirm Receipt"** button inside the chat.
    *   Need is moved to `history`. Donor gets "Impact Points" (Gamification).

---

## 5. Phase 4: Frontend & Maps (No Cost)
**Constraint:** Do not use Google Maps API or paid Mapbox tiles.

### **5.1. Map Stack**
*   **Library:** `react-map-gl` with `maplibre-gl` (Open Source fork).
*   **Tiles:** Use **CartoDB Voyager** or **OpenStreetMap** (Free, no API key).
*   **Styling:** Use CSS filters (grayscale/contrast) to force the colorful free map tiles to match the "Dark Glass" aesthetic of the site.

### **5.2. Realtime Chat UI**
*   Use Supabase Realtime subscriptions to build a WhatsApp-like interface.
*   **Components:** Message bubbles, timestamp, "Unread" indicators.
## 6. Phase 5: Data Intelligence & Transparency
**Objective:** Provide real-time proof of impact for the public and deep data for the admin.

### **6.1. Database Schema Updates (for Analytics)**
1.  **`needs` Table Additions:**
    *   `completed_at`: Timestamp (set when status changes to 'completed').
    *   `category`: String (e.g., 'Food', 'Education', 'Health').
    *   `quantity_fulfilled`: Integer.
2.  **`logs` Table (Audit Trail):**
    *   Tracks critical actions: `id`, `user_id`, `action` ('pledge', 'complete', 'cancel'), `timestamp`.

### **6.2. The "Transparency" Public Section**
*   **Route:** `/impact` (or a section on the Landing Page).
*   **Visuals:**
    *   **Live Tickers:** Animated numbers for "Total Items Donated", "Homes Supported", "Active Donors".
    *   **Category Breakdown:** A simple Donut Chart (using `recharts`) showing distribution (e.g., 40% Food, 30% Books).
    *   **Map Heatmap:** Visual cluster of where help is going (anonymized, no specific addresses).
*   **Data Source:** Use Supabase `rpc` (Stored Procedures) to fetch aggregated stats efficiently without exposing sensitive user data.

### **6.3. Admin Dashboard & Exporting**
*   **Route:** `/admin/analytics` (Protected Route).
*   **Feature: The "Data Dump"**
    *   Create a "Date Range" selector (Start Date - End Date).
    *   **"Download CSV" Button:**
        *   Fetches raw `completed_needs` data from Supabase for that range.
        *   Uses a utility like `papaparse` or native JS to convert JSON -> CSV.
        *   Triggers a browser download named `givehaven-report-[DATE].csv`.
*   **Columns to Export:**
    *   `Need ID`
    *   `Home Name`
    *   `Item Category`
    *   `Date Posted`
    *   `Date Fulfilled`
    *   `Duration` (Time to fulfill)
    *   *Note:* Exclude Donor PII (Personal Identifiable Information) from the export unless strictly necessary for legal reasons.

For a charity focusing on **dignity, transparency, and hope**, the best theme is **"Morning Light" (Frosted Glass & Warmth)**.

Think of it like a **modern art gallery or a sunny day**: bright, clean, airy, and optimistic. It feels like a fresh start.

### 🎨 The "Sunrise Clarity" Palette

This theme uses a lot of **white space**, **soft shadows**, and **frosted glass** over subtle, warm gradients. It feels transparent (literally matching your slogan) and safe.

#### 1. The Psychology
*   **White/Cream Backgrounds:** Represent transparency and cleanliness.
*   **Soft Teal/Sage (Primary):** Represents safety, growth, and calm (The "Haven").
*   **Coral/Tangerine (Action):** Warm, energetic, and human. It stands out without being aggressive like "Error Red."
*   **Dark Slate (Text):** Easier on the eyes than pure black.

#### 2. The Color Tokens (Add this to the .md file)

```markdown
## 7. Design System: Color Palette (Tailwind Config)
**Instruction:** The aesthetic is "Light Glassmorphism". Clean, airy, and hopeful.

### **7.1. Color Tokens**
*   **Backgrounds:**
    *   `canvas-base`: `#F8FAFC` (Slate-50 - A very soft, cool white)
    *   `canvas-warm`: `#FFF7ED` (Orange-50 - Used for "human" sections)
*   **Brand Colors:**
    *   `haven-teal`: `#0D9488` (Teal-600 - Trustworthy, grounded)
    *   `haven-teal-light`: `#99F6E4` (Teal-200 - For soft backgrounds/gradients)
*   **Action/Warmth:**
    *   `heart-coral`: `#F97316` (Orange-500 - The "Donate" button. Warm & urgent)
    *   `sun-yellow`: `#FBBF24` (Amber-400 - For highlights/icons)
*   **Typography:**
    *   `text-primary`: `#1E293B` (Slate-800 - Sharp, legible)
    *   `text-muted`: `#64748B` (Slate-500)
*   **Glass Surface (The Card):**
    *   `glass-bg`: `rgba(255, 255, 255, 0.7)` (70% opacity white)
    *   `glass-border`: `rgba(255, 255, 255, 0.8)`
    *   `glass-shadow`: `0 8px 32px rgba(13, 148, 136, 0.1)` (Teal tinted shadow)

### **7.2. Implementation Nuance**
*   **The "Microsoft" 3D Effect:** Since the background is light, you will create depth using **colored ambient blurs**.
*   *Action:* Place giant, highly blurred circles of `haven-teal-light` and `sun-yellow` moving slowly *behind* the white glass cards. This makes the glass look like it's glowing.
```

### Visual Metaphor
Imagine looking through a clean window at a sunrise.
*   **The Content** sits on "Frosted White Glass" cards.
*   **The Background** is a soft, moving gradient of pale blue and warm orange (the sky).
*   **The Buttons** are bright Coral (the sun).

This feels **institutional yet kind**. It builds trust immediately.