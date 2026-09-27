# 💸 PaisaPulse — AI Cashflow Guardian

> **"Paise sirf aaj ke nahi hote. Kal ke bhi hote hain."**  
> *Account mein ₹10,000 hain. Par kya woh actually tumhare hain?*

PaisaPulse looks forward instead of backwards. While traditional budgeting apps only tell you what you spent yesterday, PaisaPulse projects your commitments 14–30 days into the future and gives you continuous, real-time permission: **Safe-to-Spend Today**.

---

## 🌟 Key Features

### 1. 🧠 Spend Value Intelligence ("What is Actually Worth Your Money?")
- **Money Cost ≠ Personal Value**: A ₹10 daily chai habit may be far more personally valuable to you than a ₹1,500 impulse purchase.
- **Value Discovery Engine**: Continuously learns your habits, frequency, joy, and emotional ROI.
- **Value × Cost Matrix**:
  - 🟢 **Keep & Protect** (High Value, Low Cost — e.g. Daily Chai, Gym, Books)
  - 🔵 **Meaningful Spending** (High Value, High Cost — e.g. Annual Vacation, Family Dinners)
  - 🟡 **Small Leaks** (Low Value, Low Cost — e.g. Zombie Subscriptions, Auto-renewals)
  - 🔴 **Review First** (Low Value, High Cost — e.g. Weekend Delivery Spikes, Impulse Tech)
- **Dual Perspectives View**: Compare "Where Your Money Goes" (Raw Cash Outflow) vs. "What Money Means To You" (Value & Life Happiness).

### 2. 🛡️ Safe-to-Spend Algorithm
- **Daily Guilt-Free Spending Limit**: Calculates exactly how much you can spend today without touching your upcoming bills or emergency safety buffer.
- **Ring-Fenced Commitments**: Automatically reserves rent, EMIs, credit card bills, and utilities.
- **Untouchable Emergency Buffer**: Protects your emergency reserve so you never drop below your safety floor.

### 3. 🧬 PaisaTwin Digital Twin Simulation
- **Continuous Forward Simulation Matrix**: Real-time projection over 7, 14, and 30-day horizons.
- **Posture States**:
  - 🟢 **Chill Mode**: Safe liquidity, emergency buffer 100% intact.
  - 🟡 **Cautious Mode**: Cash dip approaching; discretionary cap trimmed.
  - 🔴 **Defense Mode**: Liquidity compression ahead; ring-fenced bills prioritized.

### 4. 🔮 "Can I Afford This?" Decision Center & What-If Engine
- Simulate any one-time purchase or recurring subscription before spending a single rupee.
- Instant verdict with forward cashflow impact and alternative recommendations.

### 5. 🗣️ Hinglish (देसी) & English Language Toggle
- Full bilingual experience tailored for Indian users (*"Kya Main Ye Khareed Sakta Hu?"*, *"Shubh Prabhat"*, *"Isko Bilkul Mat Roko"*, *"Pocket Mein Cash"*).

### 6. ☁️ Live Cloud Sync & Secure Authentication
- Supabase cloud synchronization for multi-device persistence.
- Phone OTP & Email/Password authentication with privacy-first session handling.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript & Modern React
- **Styling**: Tailwind CSS, Custom Editorial Typography System (Playfair Display, Manrope, Space Grotesk)
- **Animations**: GSAP, Lucide React Icons
- **Database & Sync**: Supabase (PostgreSQL, Row Level Security)
- **AI Engine**: Groq Cloud LLM (Qwen 2.5 / Llama 3)
- **Audio FX**: Web Audio API Sound Effects

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/alhajbaig/PaisaPulse.git
cd PaisaPulse
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_GROQ_API_KEY=your-groq-api-key
NEXT_PUBLIC_GROQ_MODEL=qwen/qwen3.8-27b
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Privacy

- All user authentication credentials and tokens are strictly kept client-side and authenticated via secure Supabase Auth.
- No public user lists or account directories are displayed without explicit authenticated sessions.

---

## 📄 License

MIT License. Built with ❤️ for financial peace of mind.
