import { Link } from 'react-router-dom';
import { PublicNav } from '../components/public/PublicNav';
import { PublicCTA } from '../components/public/PublicCTA';
import { PublicFooter } from '../components/public/PublicFooter';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import {
    CheckCircle2,
    FileText,
    Shield,
    Users,
    Zap,
    ArrowRight,
    Clock,
    BarChart3,
    TrendingUp,
    Lock,
    Globe,
    Building2,
    ChevronRight,
    Star,
} from 'lucide-react';

// ─── Scroll-triggered reveal ──────────────────────────────────────────────────

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ value, label }: { value: string; label: string }) {
    return (
        <div className="flex flex-col items-center px-8 sm:px-10">
            <span className="text-[2rem] font-black text-indigo-950 leading-none mb-1.5">{value}</span>
            <span className="text-[0.75rem] text-slate-500 font-bold uppercase tracking-widest">{label}</span>
        </div>
    );
}

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({
    icon: Icon,
    label,
    title,
    description,
    metric,
    index,
}: {
    icon: typeof FileText;
    label: string;
    title: string;
    description: string;
    metric: string;
    index: number;
}) {
    return (
        <Reveal delay={index * 0.06} className="group relative bg-white border border-slate-200 rounded-[2rem] p-8 flex flex-col hover:border-blue-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 overflow-hidden">
            {/* Top gradient highlight on hover */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" aria-hidden />
            </div>
            
            {/* Label */}
            <span className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-blue-600 mb-3">{label}</span>
            
            {/* Title */}
            <h3 className="text-xl font-bold text-indigo-950 mb-3 leading-snug">{title}</h3>
            
            {/* Description */}
            <p className="text-[0.95rem] text-slate-600 font-medium leading-relaxed flex-1 mb-8">{description}</p>
            
            {/* Metric */}
            <div className="flex items-center gap-2 text-[0.8rem] font-bold text-emerald-700 bg-emerald-50 w-fit px-3 py-1.5 rounded-lg">
                <TrendingUp className="w-4 h-4" aria-hidden />
                {metric}
            </div>
        </Reveal>
    );
}

// ─── Problem card ─────────────────────────────────────────────────────────────

function ProblemCard({ icon: Icon, title, text, index }: {
    icon: typeof FileText; title: string; text: string; index: number;
}) {
    return (
        <Reveal delay={index * 0.07} className="group relative bg-white border border-slate-200 rounded-[2rem] p-8 hover:border-red-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/5 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* bg number */}
            <span className="absolute -bottom-4 right-0 text-[10rem] font-black text-slate-50 select-none pointer-events-none leading-none group-hover:-translate-y-2 transition-transform duration-500">
                {index + 1}
            </span>
            <div className="relative z-10 w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 overflow-hidden">
                <Icon className="w-6 h-6 text-slate-400" aria-hidden />
            </div>
            <h3 className="relative z-10 text-xl font-bold text-indigo-950 mb-3">{title}</h3>
            <p className="relative z-10 text-[0.95rem] text-slate-600 font-medium leading-relaxed">{text}</p>
        </Reveal>
    );
}

// ─── Testimonial card ─────────────────────────────────────────────────────────

function TestimonialCard({ quote, name, role, company, index }: {
    quote: string; name: string; role: string; company: string; index: number;
}) {
    return (
        <Reveal delay={index * 0.07} className="bg-white border border-slate-200 rounded-[2rem] p-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col items-center text-center">
            <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden />
                ))}
            </div>
            <blockquote className="text-[1.05rem] font-medium text-slate-700 leading-relaxed mb-8 flex-1 w-full relative">
                <span className="absolute -left-2 -top-2 text-3xl text-slate-200 font-serif leading-none">"</span>
                {quote}
                <span className="absolute -right-2 bottom-0 text-3xl text-slate-200 font-serif leading-none">"</span>
            </blockquote>
            <div className="flex flex-col items-center gap-3 w-full border-t border-slate-100 pt-6">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center font-black text-lg text-indigo-700 border border-indigo-100">
                    {name[0]}
                </div>
                <div>
                    <div className="text-[0.95rem] font-bold text-indigo-950 leading-tight">{name}</div>
                    <div className="text-[0.75rem] font-bold text-slate-500 uppercase tracking-wider mt-1">{role}</div>
                    <div className="text-[0.75rem] font-medium text-slate-400">{company}</div>
                </div>
            </div>
        </Reveal>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function LandingPage() {
    const heroRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-blue-200 selection:text-blue-950">

            {/* ── Nav ───────────────────────────────────────────────────────── */}
            <PublicNav />

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <section ref={heroRef} className="relative mt-16 min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-32 px-6 overflow-hidden bg-white" aria-labelledby="hero-title">
                {/* Background visual elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
                    <div className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full bg-blue-50/50 blur-3xl opacity-80" />
                    <div className="absolute top-40 -left-20 w-[600px] h-[600px] rounded-full bg-indigo-50/30 blur-3xl opacity-80" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:64px_64px] border-b border-slate-100" />
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto gap-16 lg:gap-8 w-full">
                    {/* Left content */}
                    <motion.div className="flex-1 relative z-10 max-w-2xl text-center lg:text-left" style={{ y: heroY, opacity: heroOpacity }}>
                        {/* Trust Badge */}
                        <motion.div
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55 }}
                        >
                            <Building2 className="w-4 h-4" aria-hidden />
                            Trusted by 1000+ SMEs in Nepal
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            id="hero-title"
                            className="text-[2.75rem] sm:text-6xl lg:text-[4rem] font-black leading-[1.05] tracking-tight text-indigo-950 mb-7"
                            initial={{ opacity: 0, y: 36 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                        >
                            The modern way to <br className="hidden lg:block"/>
                            manage <span className="text-blue-600">business finance.</span>
                        </motion.h1>

                        {/* Subheading */}
                        <motion.p
                            className="text-[1.1rem] text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10 font-medium"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.22 }}
                        >
                            AFOCE is the intelligent operating system for Nepal's growing businesses. We automate invoicing, expenses, approvals, and ensure seamless IRD compliance.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            className="flex flex-wrap gap-4 justify-center lg:justify-start mb-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: 0.32 }}
                        >
                            {/* Make sure button styles forcefully override any global a/button styles with ! text styles */}
                            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white !text-white font-bold text-[0.95rem] shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:bg-blue-700 hover:-translate-y-0.5 transition-all !no-underline border-none outline-none">
                                Start Your Trial <ArrowRight className="w-4 h-4" aria-hidden />
                            </Link>
                            <Link to="/features" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 !text-slate-700 font-bold text-[0.95rem] hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 transition-all shadow-sm !no-underline">
                                Book a Demo
                            </Link>
                        </motion.div>

                        <motion.div
                            className="flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start text-[0.85rem] text-slate-500 font-bold"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.48 }}
                        >
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free 14-day trial</span>
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Cancel anytime</span>
                        </motion.div>
                    </motion.div>

                    {/* Right side - App UI Preview */}
                    <motion.div
                        className="flex-1 w-full max-w-[550px]"
                        initial={{ opacity: 0, y: 60, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.85, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Rendered window frame */}
                        <div className="bg-white rounded-[2rem] p-3 shadow-[0_20px_80px_-20px_rgba(30,58,138,0.15)] border border-slate-200/60 relative">
                            {/* Inner App Container */}
                            <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-6 overflow-hidden">
                                
                                {/* App Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                                            <BarChart3 className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-indigo-950 leading-tight">Financial Overview</h3>
                                            <p className="text-[0.7rem] uppercase tracking-wider text-slate-500 font-bold">Baisakh 2083</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-[0.7rem] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        IRD Synced
                                    </span>
                                </div>

                                {/* KPI Cards rows */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {/* Card 1 */}
                                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
                                        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 mb-2">Total Revenue</p>
                                        <div className="flex items-end gap-2 mb-3">
                                            <span className="text-[1.35rem] font-black text-indigo-950 leading-none">NPR 4.2M</span>
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-emerald-600 bg-emerald-50 px-2 flex-grow-0 w-max py-1 rounded-md">
                                            <TrendingUp className="w-3 h-3" />
                                            +14% vs last mo
                                        </span>
                                    </div>
                                    {/* Card 2 */}
                                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
                                        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 mb-2">Pending VAT</p>
                                        <div className="flex items-end gap-2 mb-3">
                                            <span className="text-[1.35rem] font-black text-indigo-950 leading-none">NPR 452K</span>
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-blue-600 bg-blue-50 px-2 flex-grow-0 w-max py-1 rounded-md">
                                            <Clock className="w-3 h-3" />
                                            Due in 12 days
                                        </span>
                                    </div>
                                </div>

                                {/* Approvals Module */}
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-[0.75rem] uppercase tracking-wider font-bold text-slate-400">Action required</h4>
                                    </div>
                                    <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[0.85rem] font-bold text-indigo-950 truncate">Q1 Marketing Agency Invoice</p>
                                            <p className="text-[0.7rem] uppercase tracking-wider text-slate-500 font-bold mt-0.5">Awaiting Manager Approval</p>
                                        </div>
                                        <div className="px-3 py-1.5 bg-indigo-950 rounded-lg shrink-0 flex items-center justify-center">
                                           <span className="text-white !text-white text-[0.7rem] font-black uppercase tracking-widest">Review</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Logos/Stats strip ──────────────────────────────────────────── */}
            <section className="bg-white border-y border-slate-200 py-12" aria-label="Key statistics">
                <div className="max-w-6xl mx-auto px-6">
                    <p className="text-center text-[0.7rem] font-bold text-slate-400 uppercase tracking-[0.2em] mb-10">Powering modern finance teams in Nepal</p>
                    <div className="flex flex-wrap items-center justify-center gap-y-10 gap-x-6 md:gap-x-12">
                        <StatPill value="1000+" label="Active Businesses" />
                        <div className="hidden sm:block w-px h-12 bg-slate-200" />
                        <StatPill value="2Cr+" label="Invoices Processed" />
                        <div className="hidden md:block w-px h-12 bg-slate-200" />
                        <StatPill value="100%" label="IRD Compliant" />
                        <div className="hidden sm:block w-px h-12 bg-slate-200" />
                        <StatPill value="12 hrs" label="Saved per week" />
                    </div>
                </div>
            </section>

            {/* ── Problem Section ────────────────────────────────────────────── */}
            <section className="py-28 px-6 bg-slate-50" aria-labelledby="problem-title">
                <div className="max-w-6xl mx-auto">
                    <Reveal className="text-center max-w-2xl mx-auto mb-16">
                        <span className="inline-block px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-[0.65rem] font-black uppercase tracking-[0.2em] mb-5">The Challenge</span>
                        <h2 id="problem-title" className="text-4xl lg:text-5xl font-black text-indigo-950 tracking-tight leading-[1.1] mb-5">
                            Stop losing money to manual workflows.
                        </h2>
                        <p className="text-lg text-slate-600 font-medium leading-relaxed">
                            Finance teams waste days on data entry, risk severe compliance penalties, and lack real-time visibility.
                        </p>
                    </Reveal>

                    <div className="grid md:grid-cols-3 gap-6">
                        <ProblemCard icon={FileText} title="Spreadsheet Chaos" text="70% of SMEs rely on fragile Excel sheets. They are prone to critical errors, difficult to audit, and terrible for collaboration." index={0} />
                        <ProblemCard icon={Shield} title="Compliance Risk" text="Missing regulatory deadlines or miscalculating VAT leads to failed audits, heavy IRD penalties, and massive organizational stress." index={1} />
                        <ProblemCard icon={Clock} title="Time Sinks" text="Chasing executives for invoice approvals and hunting down lost physical receipts burns through your team's most valuable hours." index={2} />
                    </div>
                </div>
            </section>

            {/* ── Features Section ───────────────────────────────────────────── */}
            <section className="py-28 px-6 bg-white border-t border-slate-200" aria-labelledby="features-title">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-12 gap-16 lg:gap-8 items-start">
                        {/* Sticky Header Side */}
                        <div className="lg:col-span-4 lg:sticky lg:top-32">
                            <Reveal>
                                <span className="inline-block px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-[0.65rem] font-black uppercase tracking-[0.2em] mb-5">The Solution</span>
                                <h2 id="features-title" className="text-4xl lg:text-5xl font-black text-indigo-950 tracking-tight leading-[1.1] mb-6">
                                    Built entirely for robust business.
                                </h2>
                                <p className="text-[1.1rem] text-slate-600 font-medium leading-relaxed mb-8">
                                    Replace fragmented tools with a single, secure, and fully cohesive financial operations platform.
                                </p>
                                <Link to="/features" className="inline-flex items-center font-bold text-blue-600 hover:text-blue-700 group !no-underline">
                                    See all features <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Reveal>
                        </div>

                        {/* Grid Side */}
                        <div className="lg:col-span-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                {[
                                    { icon: CheckCircle2, label: 'Workflows', title: 'Automated Approvals', description: 'Rule-based routing ensures the right manager sees the right invoice instantly, slashing turnaround times by 80%.', metric: '80% faster approvals' },
                                    { icon: FileText, label: 'Invoicing', title: 'Flawless Billing', description: 'Real-time validation, automatic sequential numbering, and complete IRD alignment right out of the box.', metric: 'Zero calculation errors' },
                                    { icon: Zap, label: 'Expenses', title: 'Digital Receipts', description: 'Employees capture receipts cleanly, and the system intelligently extracts data to magically categorize spending.', metric: 'No lost paperwork' },
                                    { icon: BarChart3, label: 'Reporting', title: 'Instant Visibility', description: 'Generate complex P&L, VAT payable, and cash-flow reports with one simple click, always based on live data.', metric: 'Real-time accuracy' },
                                ].map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Testimonials ───────────────────────────────────────────────── */}
            <section className="py-28 px-6 bg-slate-50 border-t border-slate-200" aria-labelledby="reviews-title">
                <div className="max-w-7xl mx-auto">
                    <Reveal className="text-center max-w-2xl mx-auto mb-16">
                        <h2 id="reviews-title" className="text-3xl lg:text-4xl font-black text-indigo-950 tracking-tight mb-4">You're in good company.</h2>
                        <p className="text-lg text-slate-600 font-medium">Join the smartest finance teams standardizing on AFOCE.</p>
                    </Reveal>

                    <div className="grid md:grid-cols-3 gap-6">
                        <TestimonialCard quote="We finally escaped spreadsheet hell. The automated VAT calculation and IRD syncing alone justified the switch in month one." name="Priya Sharma" role="VP of Finance" company="Kathmandu Retail Group" index={0} />
                        <TestimonialCard quote="The multi-layer approval workflow completely transformed how we spend. Total visibility, zero friction for managers." name="Rajan Thapa" role="Operations Director" company="TechVentures Pvt Ltd" index={1} />
                        <TestimonialCard quote="Setup took literally 10 minutes. The UI is leaps and bounds ahead of legacy ERPs we evaluated. Absolutely fantastic." name="Sita Karki" role="Founder" company="Himalayan Traders" index={2} />
                    </div>
                </div>
            </section>

            {/* ── Light Mode CTA (Requested Layout) ──────────────────────────── */}
            <PublicCTA />

            {/* ── Footer ─────────────────────────────────────────────────────── */}
            <PublicFooter />
        </div>
    );
}
