export const CONTACT_PHONE = "+91 9111333243";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const BLOG_LINK = {
  href: "/blog",
  label: "Blog",
  external: false,
} as const;

export const GMB_GUIDE_LINKS = [
  {
    id: "connect-gmb",
    href: "/features#connect-gmb",
    label: "How To Connect GMB",
    description: "Step-by-step connection guide",
    icon: "link" as const,
    iconLabel: "🔗",
  },
  {
    id: "create-post",
    href: "/features#create-post",
    label: "Create AI Post",
    description: "Generate and schedule GMB posts with AI",
    icon: "book" as const,
    iconLabel: "📝",
  },
  {
    id: "reply-review",
    href: "/features#reply-review",
    label: "Reply to Reviews",
    description: "AI-assisted review response workflows",
    icon: "chat" as const,
    iconLabel: "💬",
  },
  {
    id: "magic-qr",
    href: "/features#magic-qr",
    label: "Generate Magic QR",
    description: "Collect 5-star reviews on autopilot",
    icon: "qr" as const,
    iconLabel: "⊞",
  },
  {
    id: "post-gmb",
    href: "/features#post-gmb",
    label: "Post on GMB",
    description: "Publish updates directly to Google",
    icon: "send" as const,
    iconLabel: "📤",
  },
] as const;

export const FOOTER_ROUTES = {
  product: [
    { label: "Post Management", href: "/features" },
    { label: "Review Management", href: "/features" },
    { label: "Magic QR", href: "/features#magic-qr" },
    { label: "Analytics", href: "/features" },
    { label: "Local SEO", href: "/features" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/about#careers" },
    { label: "Contact", href: "/contact" },
    { label: "Partners", href: "/contact" },
  ],
  resources: [
    { label: "Blog", href: "/blog" },
    { label: "API Docs", href: "/features" },
    { label: "Help Center", href: "/contact" },
    { label: "Community", href: "/contact" },
  ],
} as const;

export const STATS = [
  { value: "200%", label: "Profit increase", sub: "Average ROI for local businesses" },
  { value: "87%", label: "Reduced costs", sub: "Compared to traditional agencies" },
  { value: "100%", label: "Automation", sub: "Set it and forget it marketing" },
] as const;

export const INDUSTRIES = [
  { name: "Real Estate", icon: "🏠" },
  { name: "Healthcare", icon: "🏥" },
  { name: "Fashion", icon: "👗" },
  { name: "Restaurant", icon: "🍽️" },
  { name: "Salon", icon: "💇" },
  { name: "Fitness", icon: "💪" },
  { name: "Retail", icon: "🛍️" },
  { name: "Legal", icon: "⚖️" },
  { name: "Automotive", icon: "🚗" },
  { name: "Education", icon: "📚" },
] as const;

export const LOCATIONS = [
  { name: "Dubai", image: "/marketing/cities/dubai.svg", gradient: "linear-gradient(135deg,#c4a574,#8b6914)" },
  { name: "Paris", image: "/marketing/cities/paris.svg", gradient: "linear-gradient(135deg,#6b7280,#374151)" },
  { name: "London", image: "/marketing/cities/london.svg", gradient: "linear-gradient(135deg,#64748b,#1e293b)" },
  { name: "Mumbai", image: "/marketing/cities/mumbai.svg", gradient: "linear-gradient(135deg,#f59e0b,#b45309)" },
  { name: "New York", image: "/marketing/cities/newyork.svg", gradient: "linear-gradient(135deg,#475569,#0f172a)" },
] as const;

export const IMAGE_GALLERY = [
  { alt: "AI food post", gradient: "linear-gradient(135deg,#fef3c7,#fbbf24)" },
  { alt: "AI product shot", gradient: "linear-gradient(135deg,#fce7f3,#ec4899)" },
  { alt: "AI lifestyle", gradient: "linear-gradient(135deg,#dbeafe,#3b82f6)" },
  { alt: "AI retail", gradient: "linear-gradient(135deg,#d1fae5,#10b981)" },
  { alt: "AI salon", gradient: "linear-gradient(135deg,#ede9fe,#8b5cf6)" },
  { alt: "AI fitness", gradient: "linear-gradient(135deg,#ffedd5,#f97316)" },
] as const;

export const VIDEO_GALLERY = [
  { alt: "AI video 1", gradient: "linear-gradient(135deg,#1e293b,#334155)" },
  { alt: "AI video 2", gradient: "linear-gradient(135deg,#374151,#111827)" },
  { alt: "AI video 3", gradient: "linear-gradient(135deg,#0f172a,#1e3a5f)" },
  { alt: "AI video 4", gradient: "linear-gradient(135deg,#292524,#44403c)" },
  { alt: "AI video 5", gradient: "linear-gradient(135deg,#18181b,#27272a)" },
] as const;

export const DOMINATE_FEATURES = [
  {
    icon: "✨",
    title: "AI Content Generator",
    description: "Create high-quality captions, posts, and marketing messages instantly using AI.",
  },
  {
    icon: "📅",
    title: "Smart Scheduling",
    description: "Plan your entire month at once. Posts go live automatically at the right time.",
  },
  {
    icon: "⭐",
    title: "Review Management",
    description: "Respond to reviews with AI-powered suggestions. Build trust with instant replies.",
  },
  {
    icon: "📊",
    title: "Performance Analytics",
    description: "Track profile visibility, audience growth, and engagement from one dashboard.",
  },
] as const;

export const KPI_METRICS = [
  { label: "Total Views", value: "12.4K", change: "+18%", spark: [40, 55, 45, 70, 65, 80, 90] },
  { label: "Total Clicks", value: "2,847", change: "+24%", spark: [30, 45, 50, 55, 60, 75, 85] },
  { label: "Calls", value: "186", change: "+12%", spark: [20, 35, 30, 45, 50, 55, 60] },
  { label: "Reviews", value: "433", change: "+8%", spark: [50, 52, 55, 58, 60, 62, 65] },
] as const;

export const LINE_CHART_DATA = [
  { month: "Jan", views: 2400, clicks: 400 },
  { month: "Feb", views: 3200, clicks: 520 },
  { month: "Mar", views: 4100, clicks: 680 },
  { month: "Apr", views: 5200, clicks: 820 },
  { month: "May", views: 6800, clicks: 1100 },
  { month: "Jun", views: 8400, clicks: 1400 },
  { month: "Jul", views: 10200, clicks: 1800 },
] as const;

export const DONUT_DATA = [
  { name: "Search", value: 45, color: "#FACC15" },
  { name: "Maps", value: 30, color: "#111827" },
  { name: "Direct", value: 15, color: "#9CA3AF" },
  { name: "Social", value: 10, color: "#E5E7EB" },
] as const;

export const BAR_DATA = [
  { name: "Mon", engagement: 65 },
  { name: "Tue", engagement: 78 },
  { name: "Wed", engagement: 90 },
  { name: "Thu", engagement: 72 },
  { name: "Fri", engagement: 85 },
  { name: "Sat", engagement: 95 },
  { name: "Sun", engagement: 88 },
] as const;

export const TESTIMONIALS = [
  {
    quote: "Limbu AI helped us rank #1 in local search within 30 days. The AI posts save us hours every week.",
    author: "Priya Sharma",
    role: "Salon Owner",
    rating: 5,
    beforeAfter: [
      { name: "Before", value: 120 },
      { name: "After", value: 340 },
    ],
  },
  {
    quote: "Managing 12 client locations was chaos. Limbu unified everything — posts, reviews, analytics.",
    author: "Rahul Mehta",
    role: "Digital Agency",
    rating: 5,
    beforeAfter: [
      { name: "Before", value: 80 },
      { name: "After", value: 280 },
    ],
  },
  {
    quote: "Review replies used to take forever. Now AI drafts them instantly and we just approve.",
    author: "Anita Desai",
    role: "Restaurant Owner",
    rating: 5,
    beforeAfter: [
      { name: "Before", value: 95 },
      { name: "After", value: 310 },
    ],
  },
] as const;

export const COMPARISON_OLD = [
  "Manual, delayed review responses",
  "Chaos when managing multiple locations",
  "Password sharing risks and poor security",
  "Guessing what content performs best",
  "Hours spent managing GMB weekly",
] as const;

export const COMPARISON_NEW = [
  "Instant AI-driven SEO optimization",
  "Unified multi-platform dashboard",
  "Secure OAuth — no password sharing",
  "Data-driven content that performs",
  "Set it and forget it automation",
] as const;

export const FAQ = [
  {
    q: "What is Limbu.ai and how does it help Local SEO?",
    a: "Limbu.ai is an AI marketing platform that automates Google Business Profile activity. By consistently posting updates and replying to reviews instantly, it helps improve your visibility in local search results.",
  },
  {
    q: "Is it safe to connect my Google and Facebook accounts?",
    a: "Yes. Limbu.ai uses official, secure OAuth interactions directly approved by Google and Meta. We never store your passwords.",
  },
  {
    q: "Can I manage multiple locations for different clients?",
    a: "Absolutely. Limbu.ai is designed for scale. You can toggle between different brands or locations within the same dashboard.",
  },
  {
    q: "Does Limbu.ai actually write the content for me?",
    a: "Yes. Our generative AI helps create captions, suggest hashtags, and draft review replies. You always have full control to edit or approve.",
  },
  {
    q: "How long does it take to see results in rankings?",
    a: "Our users typically see increased engagement within the first 30 days. Consistent GBP activity signals relevance to Google's local algorithm.",
  },
  {
    q: "Is there a long-term commitment required?",
    a: "No. Our subscription plans are flexible. You can choose monthly billing and cancel at any time.",
  },
] as const;

export const LOGO_PARTNERS = ["Google", "Meta", "Shopify", "Stripe", "HubSpot", "Salesforce"] as const;

/** @deprecated Use FOOTER_ROUTES for internal Next.js links */
export const FOOTER_COLUMNS = {
  product: ["Post Management", "Review Management", "Magic QR", "Analytics", "Local SEO"],
  company: ["About Us", "Careers", "Contact", "Partners"],
  resources: ["Blog", "API Docs", "Help Center", "Community"],
} as const;
