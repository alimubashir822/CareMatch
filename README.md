Created & Developed by [Mubashir Ali](#developer-creator) (Full-Stack Healthcare Technology Engineer | AI Healthcare Solutions Builder)

# CareMatch AI — Advanced Healthcare Discovery & Relationship Platform

CareMatch AI is a production-grade, AI-powered healthcare appointment marketplace and relationship platform built on Next.js 15, Prisma (SQLite), Tailwind CSS, and custom cookie-based JWT authentication.

This platform bridges the gap between patients, doctors, clinic managers, and system administrators, transforming traditional medical directories into a modern care relationship portal.

---

## 🚀 Key Features

### 1. 🤖 AI Care Concierge & Matchmaker
* **Conversational Symptom Intake:** Directly on the homepage, patients can input their concerns (e.g., *"I have acute back pain"* or *"I need a cardiologist"*).
* **AI Compatibility Score:** Evaluates doctors and yields compatibility percentages (0-100%) checking specialty, budget, location, accepted insurance network, and preferred care style.
* **Text-to-Speech Guidance:** Uses browser `SpeechSynthesis` to verbally output suggestions and doctor matching feedback.
* **Intake Wizard Integration:** Seamlessly pre-populates symptom concern and duration parameters into the booking form when transitioning from AI chat to doctor booking.

### 2. 📁 Patient Healthcare Passport & Intake
* **Lifelong Medical Timeline:** Aggregates past consults, billing invoices, prescription files, and document logs chronologically in a visual stepper timeline.
* **Family Profiles Accounts:** Allows managing health history, documents, and bookings for parents, spouses, and children in a single unified account.
* **Intake Brief Generator:** Collects primary concerns, symptom duration, questions for the doctor, and allergies, serializing them inside structured JSON strings in the database.
* **Preventive Health Advisor:** Conversational follow-up assistant widget prompts completed patients to check in on their recovery and recommends age-appropriate preventive screenings.

### 3. 📈 Doctor Growth Analytics & AI Profile Coach
* **AI Bio Optimization Coach:** Analyzes provider biographies, identifies credentials/insurance gaps, and generates professionally polished descriptions applicable with a single click.
* **Practice Analytics:** Visualizes monthly user profile views, conversion rates, and booking statistics using interactive custom SVG charts.
* **Availability Schedules:** Interactive tools for doctors to configure weekday and weekend appointment slots.
* **Patient Brief Checklist:** Displays diagnostic concerns and checklist targets in the doctor's dashboard for each booked consult.

### 4. 🏥 Clinic & Admin Dashboards
* **Clinic Management:** Aggregates statistics, staff rosters, and booking operations across multiple doctors.
* **Admin Verification Engine:** Platform operators can verify doctor identities, review licenses, search patients, and monitor tamper-proof global security audit logs.

### 5. 📞 Telemedicine Video Consultations
* **Virtual Consultation Suites:** Simulated audio/video streaming controls, secure in-session patient-provider messaging, and interactive digital prescription generators that immediately sync prescriptions back to the patient's Health Passport.
* **Mobile-Optimized Tab Switcher:** Adapts dynamically to mobile widths, allowing users to toggle between the Video Feed and Chat/Prescription panel without vertical layout breaks.

---

## 🛠️ Technology Stack

* **Framework:** Next.js 15 (App Router, dynamic API routes, Server Actions, TS)
* **Database & ORM:** SQLite + Prisma ORM (Zero-config local database file setup)
* **Security & Auth:** Cookie-based session validation using `jose` JWT signing with role-based middleware redirection.
* **UI & Styling:** Responsive HSL CSS variables (`globals.css`) + Tailwind CSS, glassmorphic layouts, and micro-animations.
* **Icons:** `lucide-react`

---

## 🧠 CareMatch Compatibility Score Algorithm

The compatibility score (0-100%) between a patient's preferences and a doctor's profile is calculated in [scoring.ts](file:///c:/Users/Mubashir%20Ali/Desktop/CareMatch/src/lib/scoring.ts) based on 5 parameters:

| Factor | Weight | Score Breakdown |
| :--- | :--- | :--- |
| **Specialty Alignment** | **40%** | **40 pts** for exact specialty match; **10 pts** for mismatches (e.g. general consult). |
| **Budget Capping** | **15%** | **15 pts** if consultation fee is under max price; scaled proportionally (`15 * (budget / price)`) otherwise. |
| **Location Matching** | **15%** | **15 pts** for matching city/state or remote telehealth; **10 pts** for partial remote match; **5 pts** for mismatch. |
| **Insurance Network** | **15%** | **15 pts** if provider is in-network (e.g., Aetna, BCBS, Cigna); **5 pts** if out-of-network. |
| **Care Type Mode** | **15%** | **15 pts** if doctor accepts preferred care type (Video vs In-Person); **8 pts** otherwise. |

---

## 🗄️ Relational Database Models

Prisma represents 13 relational tables configured at [schema.prisma](file:///c:/Users/Mubashir%20Ali/Desktop/CareMatch/prisma/schema.prisma):

- **User / Patient / Doctor / Clinic / Specialty:** Core authentication profiles and department classifications.
- **Appointment:** Connects doctor and patient, tracking services, prices, dates, timeslots, and JSON serialized intake briefs.
- **Availability:** Configurable time slots for doctor schedules.
- **Review:** Ratings, patient feedback comments, and doctor reply strings.
- **Payment:** Subscription plans, invoice dates, amounts, status, and transaction IDs.
- **Message:** In-app chat messages between patients and doctors.
- **Document:** Clinical records, scans, prescriptions, and lab reports.
- **Waitlist:** Automatically maps canceled appointments to patients waiting for slots.
- **AuditLog:** Log ledger of administrative actions for security tracking.

---

## 🔐 Seeded Credentials (Quick Login Enabled)

| Role | Email | Password | Name / Entity | Specialty / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Patient** | `patient@carematch.com` | `password123` | Sarah Connor | Primary Patient |
| **Doctor** | `dr.sarah@carematch.com` | `password123` | Dr. Sarah Ahmed | Specialty: Dermatology |
| **Doctor** | `dr.john@carematch.com` | `password123` | Dr. John Smith | Specialty: Cardiology |
| **Clinic** | `metro@clinic.com` | `password123` | Metro Health Center | Multi-Doctor Clinic |
| **Admin** | `admin@carematch.com` | `password123` | CareMatch Admin | Global System Admin |

---

## 🛠️ Development & Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database and Seed Data
Prisma is configured to use SQLite out-of-the-box. Run the migrations and seed script to pre-populate mock data for reviews, metrics, and profiles:
```bash
npx prisma db push
node prisma/seed.js
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Production Build Verification
To run static compiler export verification and ensure type safety:
```bash
npm run build
```

---

<a id="developer-creator"></a>
## 👤 Developer & Creator

I am a Full-Stack Healthcare Technology Developer specializing in building modern, scalable, and AI-powered healthcare platforms. I create high-performance digital solutions using React.js, Next.js, TypeScript, and Tailwind CSS to deliver fast, secure, and user-friendly experiences.

My expertise covers complete application development, from frontend architecture and responsive interfaces to backend systems powered by Node.js, REST APIs, GraphQL, PostgreSQL, and Prisma ORM. I build reliable platforms designed for scalability, performance, and long-term growth.

I work with modern cloud infrastructure including AWS, Vercel Edge, Google Cloud, Cloudflare CDN, Docker, and CI/CD pipelines to deploy secure and optimized applications.

With a strong focus on healthcare technology, I develop solutions including patient portals, AI automation systems, EHR integrations, and healthcare applications built around industry standards such as FHIR APIs and HIPAA compliance requirements.

My goal is to combine modern software engineering, cloud technologies, and healthcare innovation to help organizations build smarter digital experiences that improve patient engagement, operational efficiency, and healthcare delivery.

### 📫 Connect with Me

- 💼 **LinkedIn**: <a href="https://linkedin.com/in/mubashirali822" target="_blank" rel="noopener noreferrer">mubashirali822</a>
- 📧 **Email**: <a href="mailto:alimubashir822@gmail.com" target="_blank" rel="noopener noreferrer">alimubashir822@gmail.com</a>
- 🌐 **Website**: <a href="https://www.medclinicx.com/" target="_blank" rel="noopener noreferrer">medclinicx.com</a>
- 🏥 **View More Healthcare Solutions**: <a href="https://www.medclinicx.com/demo" target="_blank" rel="noopener noreferrer">medclinicx.com/demo</a>

⭐ *Building the next generation of digital healthcare technology.*
