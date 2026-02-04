import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode, type ElementType } from 'react';
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
    Smartphone,
    Sparkles,
    Play
} from 'lucide-react';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.5 }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' }
    }
};

// Animated section component
function AnimatedSection({ children, className = '' }: { children: ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Feature card component with animations
function FeatureCard({
    icon: Icon,
    title,
    description,
    metric,
    metricIcon: MetricIcon,
    delay = 0
}: {
    icon: ElementType;
    title: string;
    description: ReactNode;
    metric: string;
    metricIcon: ElementType;
    delay?: number;
}) {
    return (
        <motion.article
            variants={fadeInUp}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="group bg-white p-8 rounded-2xl border-2 border-neutral-200 hover:border-primary-300 hover:shadow-2xl transition-all duration-300"
        >
            <motion.div
                className="w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
            >
                <Icon className="w-8 h-8 text-primary-600" aria-hidden="true" />
            </motion.div>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
                {title}
            </h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
                {description}
            </p>
            <div className="flex items-center text-primary-700 font-medium text-sm">
                <MetricIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                {metric}
            </div>
        </motion.article>
    );
}

export function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white overflow-hidden">
            {/* Enhanced Navigation with animation */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
                role="navigation"
                aria-label="Main navigation"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link to="/" className="flex items-center gap-3 group" aria-label="AFOCE Home">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: -3 }}
                                className="relative w-12 h-12 rounded-2xl bg-white/80 border border-white/60 shadow-[0_6px_20px_rgba(37,99,235,0.18)] flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_12px_30px_rgba(37,99,235,0.25)]"
                            >
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/80 to-primary-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="relative text-primary-700 font-black text-2xl tracking-tight">A</span>
                            </motion.div>
                            <span className="text-2xl font-bold text-primary-800 tracking-tight group-hover:text-primary-900 transition-colors">AFOCE</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-8">
                            {['About', 'Features', 'Pricing'].map((item, index) => (
                                <motion.div
                                    key={item}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index + 0.3 }}
                                >
                                    <Link
                                        to={`/${item.toLowerCase()}`}
                                        className="px-3 py-2 rounded-xl text-neutral-700 hover:text-primary-700 hover:bg-white/70 hover:shadow-[0_6px_16px_rgba(37,99,235,0.12)] transition-all font-semibold text-base"
                                    >
                                        {item}
                                    </Link>
                                </motion.div>
                            ))}
                            <div className="h-8 w-px bg-neutral-300"></div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Link
                                    to="/login"
                                    className="px-4 py-2 rounded-2xl border border-white/60 bg-white/60 text-primary-800 hover:bg-white/80 hover:shadow-[0_8px_20px_rgba(37,99,235,0.18)] transition-all font-semibold text-base"
                                >
                                    Login
                                </Link>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link
                                    to="/register"
                                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-bold shadow-[0_10px_25px_rgba(37,99,235,0.25)] hover:shadow-[0_14px_30px_rgba(37,99,235,0.32)] text-base"
                                >
                                    Start Free Trial
                                </Link>
                            </motion.div>
                        </div>
                        <button className="md:hidden p-2 rounded-lg hover:bg-neutral-100">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section with staggered animations */}
            <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden" aria-labelledby="hero-title">
                {/* Animated background gradient */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.08),transparent_50%)]"
                    aria-hidden="true"
                />

                {/* Floating particles effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-primary-400/30 rounded-full"
                            style={{
                                left: `${15 + i * 15}%`,
                                top: `${20 + (i % 3) * 25}%`,
                            }}
                            animate={{
                                y: [0, -30, 0],
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                                duration: 3 + i * 0.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: i * 0.3,
                            }}
                        />
                    ))}
                </div>

                <div className="max-w-7xl mx-auto relative">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            className="max-w-xl"
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                        >
                            <motion.div
                                variants={fadeInUp}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur border border-primary-200/60 text-primary-700 rounded-full text-[15px] font-semibold mb-8 shadow-sm"
                            >
                                <Sparkles className="w-4 h-4" />
                                Made for Nepal's Business Ecosystem
                            </motion.div>
                            <motion.h1
                                variants={fadeInUp}
                                id="hero-title"
                                className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-7 leading-[1.1] tracking-tight"
                            >
                                Automate finance.
                                <motion.span
                                    className="block text-primary-600 mt-2"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                >
                                    Stay IRD-compliant.
                                </motion.span>
                            </motion.h1>
                            <motion.p
                                variants={fadeInUp}
                                className="text-lg md:text-xl text-neutral-700 mb-10 leading-relaxed"
                            >
                                AFOCE is the workflow‑intelligent platform that streamlines invoicing, expenses, VAT, and approvals—built for Nepal.
                            </motion.p>
                            <motion.div
                                variants={fadeInUp}
                                className="flex flex-col sm:flex-row gap-4 items-start mb-8"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Link
                                        to="/register"
                                        className="group inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl text-base"
                                    >
                                        Start Free Trial
                                        <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <Link
                                        to="/features"
                                        className="inline-flex items-center justify-center px-8 py-4 border-2 border-neutral-300 text-neutral-800 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 font-semibold text-base"
                                    >
                                        <Play className="mr-2 w-5 h-5" />
                                        See How It Works
                                    </Link>
                                </motion.div>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className="flex flex-wrap items-center gap-6 text-[15px] text-neutral-700"
                            >
                                {['14-day free trial', 'No credit card required', 'Setup in 5 minutes'].map((text, i) => (
                                    <motion.span
                                        key={text}
                                        className="flex items-center gap-2 font-medium"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 + i * 0.1 }}
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-success-600" />
                                        {text}
                                    </motion.span>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Dashboard preview card with animations */}
                        <motion.div
                            initial={{ opacity: 0, x: 50, rotateY: -10 }}
                            animate={{ opacity: 1, x: 0, rotateY: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                            whileHover={{ y: -5, transition: { duration: 0.3 } }}
                            className="bg-white/90 backdrop-blur-lg border-2 border-neutral-200/60 rounded-3xl shadow-2xl p-7 lg:p-9"
                        >
                            <div className="flex items-center justify-between mb-7">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Live snapshot</p>
                                    <p className="text-xl font-bold text-neutral-900 mt-1">Business overview</p>
                                </div>
                                <motion.div
                                    className="px-3 py-1.5 rounded-full bg-success-100 text-success-700 text-xs font-bold shadow-sm"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    Compliant
                                </motion.div>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <motion.div
                                    className="rounded-2xl border-2 border-neutral-200 p-5 bg-gradient-to-br from-white to-neutral-50/50"
                                    whileHover={{ scale: 1.02, borderColor: 'rgba(37, 99, 235, 0.3)' }}
                                >
                                    <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wide">Outstanding</p>
                                    <motion.p
                                        className="text-2xl font-bold text-neutral-900 mt-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        ₹3,20,000
                                    </motion.p>
                                    <p className="text-xs text-success-600 mt-2 font-semibold">+12% this month</p>
                                </motion.div>
                                <motion.div
                                    className="rounded-2xl border-2 border-neutral-200 p-5 bg-gradient-to-br from-white to-neutral-50/50"
                                    whileHover={{ scale: 1.02, borderColor: 'rgba(37, 99, 235, 0.3)' }}
                                >
                                    <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wide">VAT Payable</p>
                                    <motion.p
                                        className="text-2xl font-bold text-neutral-900 mt-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        ₹45,500
                                    </motion.p>
                                    <p className="text-xs text-warning-600 mt-2 font-semibold">Due in 8 days</p>
                                </motion.div>
                                <motion.div
                                    className="rounded-2xl border-2 border-neutral-200 p-5 col-span-2 bg-gradient-to-br from-white to-neutral-50/50"
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wide mb-4">Workflow approvals</p>
                                    <motion.div
                                        className="flex items-center justify-between rounded-xl bg-primary-50/50 px-5 py-3.5 border border-primary-100"
                                        whileHover={{ x: 5 }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shadow-sm"
                                                animate={{ rotate: [0, 10, -10, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                            >
                                                <Clock className="w-5 h-5 text-primary-600" />
                                            </motion.div>
                                            <div>
                                                <p className="text-sm font-semibold text-neutral-900">3 items pending</p>
                                                <p className="text-xs text-neutral-500">Invoices &gt; ₹50K</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold text-primary-700">Review</span>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Trust Indicators with slide-in animation */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="py-12 bg-white border-y border-neutral-200"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-6 text-sm text-neutral-600">
                        <div className="font-semibold text-neutral-800">Trusted by Nepal's growing teams</div>
                        <motion.div
                            className="flex flex-wrap gap-3"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {['Retail', 'Services', 'Manufacturing', 'Hospitality', 'Agencies'].map((label) => (
                                <motion.span
                                    key={label}
                                    variants={scaleIn}
                                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
                                    className="px-3 py-1 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-700 cursor-default"
                                >
                                    {label}
                                </motion.span>
                            ))}
                        </motion.div>
                        <div className="flex items-center gap-6">
                            {['13% VAT', 'Bikram Sambat', 'Audit-ready'].map((text, i) => (
                                <motion.div
                                    key={text}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="text-neutral-900 font-semibold"
                                >
                                    {text}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* How It Works - Animated Steps */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50">
                <div className="max-w-6xl mx-auto">
                    <AnimatedSection className="text-center mb-12">
                        <motion.h2
                            variants={fadeInUp}
                            className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3"
                        >
                            How it works
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-neutral-700">
                            Get compliant workflows running in minutes, not weeks.
                        </motion.p>
                    </AnimatedSection>
                    <AnimatedSection className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: 'Connect your business', body: 'Add your company, VAT details, and users in a guided setup.' },
                            { title: 'Automate approvals', body: 'Define thresholds, receipt rules, and role-based approvals.' },
                            { title: 'Track & file VAT', body: 'See VAT summaries and generate filings on time.' },
                        ].map((step, index) => (
                            <motion.div
                                key={step.title}
                                variants={fadeInUp}
                                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm"
                            >
                                <motion.div
                                    className="inline-flex items-center justify-center mb-4"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-white/80 border border-white/60 shadow-[0_6px_18px_rgba(37,99,235,0.18)] backdrop-blur text-primary-800 text-base font-bold flex items-center justify-center">
                                        {index + 1}
                                    </div>
                                </motion.div>
                                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{step.title}</h3>
                                <p className="text-neutral-700 text-sm leading-relaxed">{step.body}</p>
                            </motion.div>
                        ))}
                    </AnimatedSection>
                </div>
            </section>

            {/* Problem Section with hover animations */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <AnimatedSection className="text-center mb-20">
                        <motion.span
                            variants={fadeIn}
                            className="text-danger-600 font-semibold text-sm uppercase tracking-wider mb-3 block"
                        >
                            The Challenge
                        </motion.span>
                        <motion.h2
                            variants={fadeInUp}
                            className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6"
                        >
                            Stop Losing Money to Manual Processes
                        </motion.h2>
                        <motion.div variants={fadeInUp} className="flex justify-center">
                            <p className="text-xl md:text-2xl text-neutral-700 max-w-2xl leading-relaxed text-center">
                                Nepal's SMEs waste precious hours on spreadsheets, miss critical tax deadlines,
                                and struggle with expense tracking—costing valuable time and money every single day.
                            </p>
                        </motion.div>
                    </AnimatedSection>

                    <AnimatedSection className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: FileText, title: 'Excel Chaos', text: '70% of Nepal SMEs still rely on spreadsheets—manual, error-prone, impossible to audit, and vulnerable to catastrophic data loss.' },
                            { icon: Shield, title: 'Compliance Nightmares', text: 'Missing VAT filings, failed audits, and costly IRD penalties that could have been easily prevented with proper systems in place.' },
                            { icon: Clock, title: 'Time Drain', text: 'Countless hours wasted chasing invoices, reconciling bank statements, and performing tedious manual data entry.' },
                        ].map((item, i) => (
                            <motion.article
                                key={item.title}
                                variants={fadeInUp}
                                whileHover={{
                                    y: -8,
                                    borderColor: 'rgba(239, 68, 68, 0.4)',
                                    boxShadow: '0 25px 50px rgba(239, 68, 68, 0.15)'
                                }}
                                className="group p-8 bg-white border-2 border-neutral-200 rounded-2xl transition-all duration-300"
                            >
                                <motion.div
                                    className="w-16 h-16 bg-gradient-to-br from-danger-50 to-danger-100 rounded-2xl flex items-center justify-center mb-6"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                >
                                    <item.icon className="w-8 h-8 text-danger-600" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-4">{item.title}</h3>
                                <p className="text-neutral-700 leading-relaxed">{item.text}</p>
                            </motion.article>
                        ))}
                    </AnimatedSection>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-neutral-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <AnimatedSection className="text-center mb-20">
                        <motion.span
                            variants={fadeIn}
                            className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3 block"
                        >
                            The Solution
                        </motion.span>
                        <motion.h2
                            variants={fadeInUp}
                            className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6"
                        >
                            Built for Nepal's Business Reality
                        </motion.h2>
                        <motion.div variants={fadeInUp} className="flex justify-center">
                            <p className="text-xl md:text-2xl text-neutral-700 max-w-3xl leading-relaxed text-center">
                                Everything you need to run a compliant, efficient business—
                                <span className="block mt-2 font-semibold text-neutral-900">designed specifically for Nepal's unique regulatory environment</span>
                            </p>
                        </motion.div>
                    </AnimatedSection>

                    <AnimatedSection className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={CheckCircle2}
                            title="Smart Approval Workflows"
                            description={<>Invoices over ₹50,000 automatically route to managers. Expenses require receipts. <span className="block mt-2 font-semibold text-neutral-900">Business policies enforced automatically.</span></>}
                            metric="Reduce approval time by 80%"
                            metricIcon={TrendingUp}
                        />
                        <FeatureCard
                            icon={FileText}
                            title="IRD-Compliant Invoicing"
                            description={<>Sequential numbering, 13% VAT automation, Bikram Sambat dates, PAN validation— <span className="block mt-2 font-semibold text-neutral-900">all built-in and IRD-approved.</span></>}
                            metric="100% audit-ready"
                            metricIcon={Shield}
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Intelligent Expense Management"
                            description={<>Submit expenses, attach receipts, auto-categorize transactions, and enforce budget limits. <span className="block mt-2 font-semibold text-neutral-900">Never lose a receipt again.</span></>}
                            metric="Save 10+ hours per week"
                            metricIcon={Clock}
                        />
                        <FeatureCard
                            icon={BarChart3}
                            title="Real-Time Business Insights"
                            description={<>Monitor cash position, track overdue invoices, get budget alerts, and analyze profitability— <span className="block mt-2 font-semibold text-neutral-900">all in one intuitive dashboard.</span></>}
                            metric="Live analytics & reporting"
                            metricIcon={BarChart3}
                        />
                        <FeatureCard
                            icon={Lock}
                            title="Complete Audit Trail"
                            description={<>Every action logged with precise timestamps, immutable records, and comprehensive compliance tracking. <span className="block mt-2 font-semibold text-neutral-900">IRD auditors will love you.</span></>}
                            metric="Bank-grade security"
                            metricIcon={Lock}
                        />
                        <FeatureCard
                            icon={Users}
                            title="Seamless Team Collaboration"
                            description={<>Add unlimited users, set role-based permissions, enable approval notifications, and track all activity. <span className="block mt-2 font-semibold text-neutral-900">Keep your team synchronized.</span></>}
                            metric="Unlimited team members"
                            metricIcon={Users}
                        />
                    </AnimatedSection>
                </div>
            </section>

            {/* CTA Section with gradient animation */}
            <motion.section
                className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                {/* Animated background */}
                <motion.div
                    className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]"
                    animate={{
                        backgroundPosition: ['0px 0px', '64px 64px'],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                />

                <div className="max-w-4xl mx-auto text-center relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block mb-6"
                    >
                        <span className="px-5 py-2.5 bg-white/70 text-neutral-900 rounded-full text-base font-semibold border border-white/70 shadow-lg backdrop-blur-md">
                            🚀 Join 1000+ Nepal Businesses
                        </span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
                    >
                        Ready to Modernize Your Business?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-primary-100 mb-12 leading-relaxed"
                    >
                        Join Nepal's leading businesses using AFOCE to automate workflows,
                        maintain IRD compliance, and focus on what truly matters—sustainable growth.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                to="/register"
                                className="group inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                            >
                                Start Your Free Trial
                                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }}>
                            <Link
                                to="/pricing"
                                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/40 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
                            >
                                View Pricing
                            </Link>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-8 text-primary-100"
                    >
                        {['14-day free trial', 'No credit card required', 'Setup in 5 minutes'].map((text) => (
                            <span key={text} className="flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6" />
                                <span className="font-medium">{text}</span>
                            </span>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            {/* Footer */}
            <footer className="bg-neutral-900 text-neutral-400 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
                        <div className="col-span-2">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center gap-3 mb-4"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">A</span>
                                </div>
                                <span className="text-xl font-bold text-white">AFOCE</span>
                            </motion.div>
                            <p className="text-neutral-400 leading-relaxed mb-4">
                                Nepal's intelligent business operating system.
                                Automate operations, ensure compliance, accelerate sustainable growth.
                            </p>
                            <div className="flex gap-4">
                                <Globe className="w-5 h-5 text-primary-400" />
                                <Smartphone className="w-5 h-5 text-primary-400" />
                                <Shield className="w-5 h-5 text-primary-400" />
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Product</h4>
                            <ul className="space-y-3">
                                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link to="/register" className="hover:text-white transition-colors">Start Free</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Company</h4>
                            <ul className="space-y-3">
                                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><a href="mailto:support@afoce.com" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Legal</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-neutral-800 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-sm text-neutral-500">
                                © 2026 AFOCE. Built with ❤️ for Nepal's SMEs.
                            </p>
                            <div className="flex items-center gap-6 text-sm">
                                <span className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-success-500" />
                                    <span className="text-neutral-400">IRD Compliant</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-primary-500" />
                                    <span className="text-neutral-400">Secure</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-primary-500" />
                                    <span className="text-neutral-400">Nepal-Based</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
