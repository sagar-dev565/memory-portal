// Content for the public website. Edit copy, services and prices here —
// components read from this file so the page stays easy to update.

export const nav = [
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Keepsakes", href: "#keepsakes" },
  { label: "For Studios", href: "#studios" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export type ServiceIcon =
  | "vhs" | "disc" | "photo" | "film" | "audio" | "portal" | "key" | "keepsake";

export interface Service {
  icon: ServiceIcon;
  title: string;
  summary: string;
  includes: string[];
  tag?: string;
}

/** What we convert — physical media in. */
export const conversionServices: Service[] = [
  {
    icon: "vhs",
    title: "VHS & Video Tapes",
    summary: "VHS, VHS-C, Hi8, MiniDV and Betamax captured in full — even 8-hour tapes.",
    includes: ["Full-length capture", "Colour & audio clean-up", "Chapters by scene"],
    tag: "Most requested",
  },
  {
    icon: "disc",
    title: "DVDs & CDs",
    summary: "Wedding DVDs, home-movie discs and old photo CDs rescued before they fail.",
    includes: ["Scratched-disc recovery", "Menus become chapters", "Original quality kept"],
  },
  {
    icon: "photo",
    title: "Photos & Albums",
    summary: "Prints, albums and slides scanned in high resolution, the way they were meant to be seen.",
    includes: ["High-resolution scans", "Dust & crease repair", "Dates and captions added"],
  },
  {
    icon: "film",
    title: "Film Reels & Negatives",
    summary: "8mm, Super 8, 16mm reels and negatives brought back to life frame by frame.",
    includes: ["Frame-by-frame scanning", "Stabilised playback", "Music-ready exports"],
  },
  {
    icon: "audio",
    title: "Audio Cassettes",
    summary: "Voices, songs and recorded messages from cassettes and micro-cassettes.",
    includes: ["Noise reduction", "Track splitting", "Linked to family events"],
  },
];

/** What you receive — the digital and physical outcome. */
export const deliveryServices: Service[] = [
  {
    icon: "portal",
    title: "Private Family Portal",
    summary: "Every memory organised into a beautiful family timeline you can watch, browse and share.",
    includes: ["Family Timeline", "Events, albums & people", "Invite family with permissions"],
    tag: "Included",
  },
  {
    icon: "key",
    title: "Memory Key",
    summary: "A premium QR/NFC card that opens your portal securely — tap it, and your family story appears.",
    includes: ["Secure tap-to-open entry", "No passwords on the card", "Gift-ready presentation"],
  },
  {
    icon: "keepsake",
    title: "Keepsakes & Backups",
    summary: "Personalised 3D family keepsakes, printed albums, plus USB or SSD copies to keep at home.",
    includes: ["3D couple & family keepsakes", "Printed albums", "USB / SSD archive copy"],
  },
];

export const steps = [
  {
    number: "01",
    title: "Send us your memories",
    text: "Book a pickup or drop off your tapes, discs, photos and reels. Every item is logged and tracked.",
  },
  {
    number: "02",
    title: "We digitize with care",
    text: "Each item is captured by hand, cleaned up and quality-checked. Your originals come back safely.",
  },
  {
    number: "03",
    title: "We organise your story",
    text: "Memories are arranged into events, people and years — your family timeline takes shape.",
  },
  {
    number: "04",
    title: "Your portal is ready",
    text: "Open your private portal, invite family, and relive every moment on any screen.",
  },
];

export const timeline = [
  { year: "1985", title: "Parents' Wedding", meta: "1 video · 86 photos", tone: "a" },
  { year: "1990", title: "First Child", meta: "2 videos · 140 photos", tone: "b" },
  { year: "2002", title: "Family Trip to Goa", meta: "3 videos · 212 photos", tone: "c" },
  { year: "2010", title: "Graduation Day", meta: "1 video · 64 photos", tone: "d" },
  { year: "2026", title: "Today", meta: "Still being written", tone: "e" },
];

export const trustPoints = [
  { title: "Private by default", text: "Only the people you invite can see your portal. Nothing is public." },
  { title: "Originals returned", text: "Every tape, disc and photo is tracked and returned safely to you." },
  { title: "Backed up, always", text: "Memories are stored with redundant backups — plus an optional copy at home." },
  { title: "Family continuity", text: "Choose a trusted legacy contact so your family story is always looked after." },
];

export interface Plan {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

// NOTE: prices are placeholders — replace with final pricing before launch.
export const plans: Plan[] = [
  {
    name: "Memory Starter",
    price: "₹1,499",
    cadence: "per tape / 100 photos",
    description: "Digitize a few precious items and see them in your portal.",
    features: ["VHS, DVD or photo conversion", "Private portal for 1 year", "Invite up to 5 family members", "Download your files"],
    cta: "Start Preserving",
  },
  {
    name: "Family Archive",
    price: "₹7,999",
    cadence: "up to 10 tapes + 500 photos",
    description: "The complete family collection, organised into one timeline.",
    features: ["Everything in Starter", "Family Timeline & events", "Unlimited family members", "Memory Key card", "USB archive copy"],
    cta: "Preserve My Memories",
    featured: true,
  },
  {
    name: "Heirloom",
    price: "Custom",
    cadence: "large or mixed collections",
    description: "For big collections, film reels and keepsakes made to last generations.",
    features: ["Everything in Family Archive", "Film reels & negatives", "3D family keepsake", "SSD archive + printed album", "Legacy access setup"],
    cta: "Talk to Us",
  },
];

export const studioBenefits = [
  { title: "Deliver in a portal, not a pen drive", text: "Give every client a private, branded memory portal for their wedding or event." },
  { title: "Earn on every delivery", text: "Offer premium digital delivery and keepsakes, and earn on every portal you create." },
  { title: "Built for big uploads", text: "Upload thousands of photos and hours of video with progress tracking and retries." },
  { title: "Your brand, front and centre", text: "Add your studio logo and send a ready-to-share link by WhatsApp, SMS or email." },
];

export const faqs = [
  {
    q: "Is it safe to send my original tapes and photos?",
    a: "Yes. Every item is logged when it arrives, tracked through each step, and returned to you after digitization. You can see where your order is at any time.",
  },
  {
    q: "Who can see my family portal?",
    a: "Only you and the family members you invite. You choose what each person can do — view, upload, edit, download or share.",
  },
  {
    q: "Can you handle very long VHS recordings?",
    a: "Yes. We capture full tapes — including 8-hour recordings — and add chapters so you can jump to any moment and resume where you left off.",
  },
  {
    q: "What happens to my memories in the long term?",
    a: "Your memories are backed up, and you can add a trusted legacy contact. If needed, access can be transferred through a verified process so your family story continues.",
  },
  {
    q: "I'm a photographer or studio. How do I partner with you?",
    a: "Create a studio account to build portals for your clients, upload their photos and videos, preview exactly what they'll see, and deliver with one link.",
  },
  {
    q: "Can I also get my files on a USB or hard drive?",
    a: "Yes. Add a USB or SSD archive copy to any order, so you have a backup at home as well as in your portal.",
  },
];
