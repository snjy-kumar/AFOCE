import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode, type ElementType } from 'react';
import {
    ArrowLeft,
    FileText,
    CheckCircle2,
    Zap,
    BarChart3,
    Shield,
    Users,
    Repeat,
    Clock,
    AlertCircle,
    TrendingUp,
    Lock,
    DollarSign,
    Smartphone,
    ArrowRight,
    Sparkles
} from 'lucide-react';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
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
            delayChildren: 0.1
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

const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: 'easeOut' }
    }
};

const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: 'easeOut' }
    }
};

// Animated section component with scroll trigger
function AnimatedSection({
    children,
    className = '',
    delay = 0
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.1,
                        delayChildren: delay
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Feature overview card
function FeatureCard({
    icon: Icon,
    title,
    desc,
    color = 'primary'
}: {
    icon: ElementType;
    title: string;
    desc: string;
    color?: 'primary' | 'success' | 'warning' | 'danger';
}) {
    const colorClasses = {
        primary: 'bg-primary-100 text-primary-700 border-primary-200 hover:border-primary-300',
        success: 'bg-success-100 text-success-700 border-success-200 hover:border-success-300',
        warning: 'bg-warning-100 text-warning-700 border-warning-200 hover:border-warning-300',
        danger: 'bg-danger-100 text-danger-700 border-danger-200 hover:border-danger-300',
    };

    return (
        <motion.div
            variants={fadeInUp}
            whileHover={{ y: -8, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
            className={`p-7 rounded-2xl border-2 ${colorClasses[color]} bg-gradient-to-br from-white to-neutral-50/60 shadow-md transition-all duration-300`}
        >
            <motion.div
                className={`w-12 h-12 rounded-xl ${colorClasses[color].split(' ')[0]} flex items-center justify-center mb-4 shadow-sm`}
                whileHover={{ scale: 1.1, rotate: 5 }}
            >
                <Icon className="w-6 h-6" />
            </motion.div>
            <h3 className="text-lg font-bold text-neutral-900 mb-3">{title}</h3>
            <p className="text-[15px] text-neutral-700 leading-relaxed">{desc}</p>
        </motion.div>
    );
}

export function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white overflow-hidden">
            {/* Navigation */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-neutral-200/80 shadow-sm"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-18">
                        <Link to="/" className="flex items-center gap-3 group">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: -3 }}
                                className="w-11 h-11 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md"
                            >
                                <span className="text-white font-bold text-xl">A</span>
                            </motion.div>
                            <span className="text-xl font-bold text-neutral-900 tracking-tight">AFOCE</span>
                        </Link>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Link
                                to="/"
                                className="inline-flex items-center text-neutral-700 hover:text-neutral-900 transition-all duration-300 font-semibold text-[15px]"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Home
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-neutral-50 relative overflow-hidden">
                {/* Animated background */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent_50%)]" />
                </motion.div>

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-3 h-3 bg-primary-400/20 rounded-full"
                            style={{
                                left: `${10 + i * 12}%`,
                                top: `${15 + (i % 4) * 20}%`,
                            }}
                            animate={{
                                y: [0, -40, 0],
                                opacity: [0.2, 0.5, 0.2],
                            }}
                            transition={{
                                duration: 4 + i * 0.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: i * 0.4,
                            }}
                        />
                    ))}
                </div>

                <div className="max-w-4xl mx-auto text-center relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-100 text-primary-800 rounded-full text-[15px] font-bold mb-8 shadow-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        Workflow-Intelligent Features
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-8 tracking-tight leading-[1.1]"
                    >
                        Everything You Need to
                        <motion.span
                            className="block text-primary-600 mt-2"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                        >
                            Run Your Business
                        </motion.span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-xl md:text-2xl text-neutral-700 leading-relaxed"
                    >
                        Workflow-intelligent features designed for <strong className="text-neutral-900 font-semibold">Nepal's business reality</strong>.
                        Automate compliance, enforce policies, and focus on growth.
                    </motion.p>
                </div>
            </section>

            {/* Feature Overview */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <AnimatedSection className="text-center mb-12">
                        <motion.h2
                            variants={fadeInUp}
                            className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4"
                        >
                            Feature overview
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-lg text-neutral-700">
                            A quick scan of what you get, out of the box.
                        </motion.p>
                    </AnimatedSection>

                    <AnimatedSection className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
                        <FeatureCard icon={FileText} title="IRD-ready invoices" desc="Sequential numbering, VAT, PAN validation, BS dates." color="primary" />
                        <FeatureCard icon={Users} title="Approval workflows" desc="Rules, thresholds, and role‑based approvals." color="success" />
                        <FeatureCard icon={BarChart3} title="Live reporting" desc="Profit/Loss, VAT summaries, and cash flow." color="warning" />
                        <FeatureCard icon={Repeat} title="Bank reconciliation" desc="Match transactions and auto-suggest entries." color="primary" />
                        <FeatureCard icon={Lock} title="Audit trails" desc="Immutable history of every change and approval." color="danger" />
                        <FeatureCard icon={Smartphone} title="Anywhere access" desc="Cloud-first, secure, and fast on any device." color="success" />
                    </AnimatedSection>
                </div>
            </section>

            {/* Smart Invoicing Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-50 to-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <AnimatedSection>
                            <motion.div
                                variants={slideInLeft}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-semibold mb-4 shadow-sm"
                            >
                                <FileText className="w-4 h-4" />
                                Smart Invoicing
                            </motion.div>
                            <motion.h2
                                variants={fadeInUp}
                                className="text-4xl font-bold text-neutral-900 mb-4"
                            >
                                IRD-Compliant Invoicing
                            </motion.h2>
                            <motion.p
                                variants={fadeInUp}
                                className="text-xl text-neutral-800 leading-relaxed mb-8"
                            >
                                Professional invoices that meet all <strong className="text-primary-600">Inland Revenue Department</strong> requirements
                            </motion.p>

                            <motion.ul variants={staggerContainer} className="space-y-5">
                                {[
                                    { color: 'primary', title: 'Sequential Numbering', desc: 'Automatic invoice numbering with no gaps (IRD audit requirement)' },
                                    { color: 'success', title: '13% VAT Automation', desc: 'Automatic VAT calculation for registered businesses' },
                                    { color: 'warning', title: 'Bikram Sambat Support', desc: "Native support for Nepal's official calendar" },
                                    { color: 'danger', title: 'PAN Validation', desc: 'Verify customer PAN numbers automatically' },
                                ].map((item) => (
                                    <motion.li
                                        key={item.title}
                                        variants={fadeInUp}
                                        whileHover={{ x: 10, transition: { duration: 0.2 } }}
                                        className={`flex items-start p-4 bg-white rounded-xl border-2 border-${item.color}-100 hover:border-${item.color}-200 transition-all duration-300 hover:shadow-md group`}
                                    >
                                        <motion.div
                                            className={`w-10 h-10 bg-gradient-to-br from-${item.color}-600 to-${item.color}-700 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 shadow-md`}
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                        >
                                            <CheckCircle2 className="w-5 h-5 text-white" />
                                        </motion.div>
                                        <div>
                                            <strong className="text-neutral-900 text-lg block mb-1">{item.title}</strong>
                                            <p className="text-neutral-700">{item.desc}</p>
                                        </div>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </AnimatedSection>

                        <AnimatedSection delay={0.2}>
                            <motion.div
                                variants={slideInRight}
                                whileHover={{ y: -5, boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }}
                                className="bg-white border-2 border-neutral-200 rounded-2xl p-8 shadow-2xl"
                            >
                                <motion.div
                                    className="space-y-5"
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={staggerContainer}
                                >
                                    <motion.div variants={fadeIn} className="border-b-2 border-neutral-200 pb-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-sm font-semibold text-neutral-600">Invoice #</span>
                                            <motion.span
                                                className="font-mono text-sm font-bold bg-primary-100 text-primary-800 px-3 py-1 rounded"
                                                animate={{ scale: [1, 1.02, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                INV-2081-0001
                                            </motion.span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm font-semibold text-neutral-600">Date</span>
                                            <span className="text-sm font-bold text-neutral-800">2081-10-15 BS</span>
                                        </div>
                                    </motion.div>
                                    <motion.div variants={fadeIn} className="border-b-2 border-neutral-200 pb-4">
                                        <div className="text-sm font-semibold text-neutral-600 mb-2">Customer</div>
                                        <div className="font-bold text-lg text-neutral-900">ABC Pvt. Ltd.</div>
                                        <div className="text-sm text-neutral-700 font-medium">PAN: 123456789</div>
                                    </motion.div>
                                    <motion.div variants={fadeIn} className="space-y-3 border-b-2 border-neutral-200 pb-4">
                                        <div className="flex justify-between text-base">
                                            <span className="text-neutral-800 font-medium">Consulting Services</span>
                                            <span className="font-bold text-neutral-900">₹50,000</span>
                                        </div>
                                        <div className="flex justify-between text-base">
                                            <span className="text-neutral-700">VAT (13%)</span>
                                            <span className="font-semibold text-success-700">₹6,500</span>
                                        </div>
                                    </motion.div>
                                    <motion.div
                                        variants={scaleIn}
                                        className="flex justify-between font-bold text-2xl pt-2"
                                    >
                                        <span className="text-neutral-900">Total</span>
                                        <motion.span
                                            className="text-primary-700"
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                        >
                                            ₹56,500
                                        </motion.span>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Approval Workflows Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <AnimatedSection className="order-2 md:order-1">
                            <motion.div
                                variants={slideInLeft}
                                className="bg-gradient-to-br from-neutral-50 to-white border-2 border-neutral-200 rounded-2xl p-8 shadow-2xl"
                            >
                                <motion.div
                                    className="space-y-6"
                                    variants={staggerContainer}
                                >
                                    <motion.div
                                        variants={fadeInUp}
                                        whileHover={{ x: 5 }}
                                        className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-warning-200 shadow-md"
                                    >
                                        <motion.div
                                            className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-full flex items-center justify-center shadow-md"
                                            animate={{ rotate: [0, 5, -5, 0] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                        >
                                            <FileText className="w-6 h-6 text-white" />
                                        </motion.div>
                                        <div className="flex-1">
                                            <div className="font-bold text-neutral-900">Invoice Created</div>
                                            <div className="text-sm text-neutral-700 font-medium">₹75,000 • Branch Manager</div>
                                        </div>
                                        <div className="px-3 py-1 bg-warning-100 text-warning-800 rounded-full text-xs font-bold shadow-sm">
                                            Draft
                                        </div>
                                    </motion.div>

                                    <motion.div variants={fadeIn} className="ml-6 border-l-4 border-primary-300 pl-6 py-3">
                                        <div className="flex items-center gap-2 text-sm text-neutral-700 font-medium p-3 bg-primary-50 rounded-lg">
                                            <AlertCircle className="w-5 h-5 text-primary-600" />
                                            <span>Requires approval (&gt;₹50,000)</span>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        variants={fadeInUp}
                                        whileHover={{ x: 5 }}
                                        className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-success-200 shadow-md"
                                    >
                                        <motion.div
                                            className="w-12 h-12 bg-gradient-to-br from-success-600 to-success-700 rounded-full flex items-center justify-center shadow-md"
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <CheckCircle2 className="w-6 h-6 text-white" />
                                        </motion.div>
                                        <div className="flex-1">
                                            <div className="font-bold text-neutral-900">Manager Approved</div>
                                            <div className="text-sm text-neutral-700 font-medium">2 hours ago</div>
                                        </div>
                                        <div className="px-3 py-1 bg-success-100 text-success-800 rounded-full text-xs font-bold shadow-sm">
                                            Approved
                                        </div>
                                    </motion.div>

                                    <motion.div variants={fadeIn} className="ml-6 border-l-4 border-success-300 pl-6 py-3">
                                        <div className="flex items-center gap-2 text-sm text-neutral-700 font-medium p-3 bg-success-50 rounded-lg">
                                            <Clock className="w-5 h-5 text-success-600" />
                                            <span>Ready to send to customer</span>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </AnimatedSection>

                        <AnimatedSection className="order-1 md:order-2">
                            <motion.div
                                variants={fadeIn}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-success-100 text-success-800 rounded-full text-sm font-semibold mb-4 shadow-sm"
                            >
                                <Repeat className="w-4 h-4" />
                                Workflow Engine
                            </motion.div>
                            <motion.h2
                                variants={fadeInUp}
                                className="text-4xl font-bold text-neutral-900 mb-4"
                            >
                                Smart Approval Workflows
                            </motion.h2>
                            <motion.p
                                variants={fadeInUp}
                                className="text-xl text-neutral-800 leading-relaxed mb-8"
                            >
                                Automate approvals based on <strong className="text-neutral-900">custom rules</strong>. No more manual checking or policy violations.
                            </motion.p>

                            <motion.ul variants={staggerContainer} className="space-y-5">
                                {[
                                    { color: 'primary', title: 'Rule-Based Routing', desc: 'Invoices >₹50,000 auto-route to managers for approval' },
                                    { color: 'success', title: 'Policy Enforcement', desc: 'Block expenses without receipts, enforce budget limits' },
                                    { color: 'warning', title: 'Instant Notifications', desc: 'Email alerts when approval needed or status changes' },
                                    { color: 'danger', title: 'Audit Trail', desc: 'Complete history of who approved what, when, and why' },
                                ].map((item) => (
                                    <motion.li
                                        key={item.title}
                                        variants={fadeInUp}
                                        whileHover={{ x: 10 }}
                                        className={`flex items-start p-4 bg-gradient-to-br from-${item.color}-50 to-white rounded-xl border-2 border-${item.color}-100 hover:shadow-md transition-all duration-300 group`}
                                    >
                                        <motion.div
                                            className={`w-10 h-10 bg-gradient-to-br from-${item.color}-600 to-${item.color}-700 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 shadow-md`}
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                        >
                                            <Zap className="w-5 h-5 text-white" />
                                        </motion.div>
                                        <div>
                                            <strong className="text-neutral-900 text-lg block mb-1">{item.title}</strong>
                                            <p className="text-neutral-700">{item.desc}</p>
                                        </div>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Expense Management Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-50 to-white">
                <div className="max-w-6xl mx-auto">
                    <AnimatedSection className="text-center mb-16">
                        <motion.div
                            variants={fadeIn}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-warning-100 text-warning-800 rounded-full text-sm font-semibold mb-4 shadow-sm"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Expense Management
                        </motion.div>
                        <motion.h2
                            variants={fadeInUp}
                            className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6"
                        >
                            Track Every Rupee
                        </motion.h2>
                        <motion.p
                            variants={fadeInUp}
                            className="text-xl text-neutral-700 leading-relaxed max-w-3xl mx-auto"
                        >
                            Submit, approve, and categorize expenses with <strong className="text-neutral-900">receipt attachment</strong> and <strong className="text-neutral-900">budget controls</strong>
                        </motion.p>
                    </AnimatedSection>

                    <AnimatedSection className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: FileText,
                                color: 'primary',
                                title: 'Receipt Management',
                                desc: 'Attach receipts to expenses. Enforce policy: expenses >₹5,000 must have receipts.',
                                features: ['Photo upload with OCR', 'Automatic categorization']
                            },
                            {
                                icon: AlertCircle,
                                color: 'warning',
                                title: 'Budget Alerts',
                                desc: 'Get notified when departments reach 80% of budget. Block expenses at 100%.',
                                features: ['Real-time tracking', 'Automated notifications']
                            },
                            {
                                icon: BarChart3,
                                color: 'success',
                                title: 'Auto-Categorization',
                                desc: 'Expenses automatically categorized. Track spending by category and department.',
                                features: ['Smart ML categorization', 'Custom categories']
                            },
                        ].map((card) => (
                            <motion.div
                                key={card.title}
                                variants={fadeInUp}
                                whileHover={{ y: -10, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
                                className={`p-8 bg-white rounded-2xl border-2 border-${card.color}-200 shadow-xl transition-all duration-300 group`}
                            >
                                <motion.div
                                    className={`w-16 h-16 bg-gradient-to-br from-${card.color}-500 to-${card.color}-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                >
                                    <card.icon className="w-8 h-8 text-white" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-3">{card.title}</h3>
                                <p className="text-neutral-800 leading-relaxed mb-4">{card.desc}</p>
                                <ul className="space-y-2 text-sm">
                                    {card.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 text-neutral-700">
                                            <CheckCircle2 className={`w-4 h-4 text-${card.color}-600 flex-shrink-0`} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </AnimatedSection>
                </div>
            </section>

            {/* Real-Time Insights Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <AnimatedSection className="text-center mb-16">
                        <motion.div
                            variants={fadeIn}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-success-100 text-success-800 rounded-full text-sm font-semibold mb-4 shadow-sm"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Business Intelligence
                        </motion.div>
                        <motion.h2
                            variants={fadeInUp}
                            className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6"
                        >
                            Know Your Numbers
                        </motion.h2>
                        <motion.p
                            variants={fadeInUp}
                            className="text-xl text-neutral-700 leading-relaxed max-w-3xl mx-auto"
                        >
                            Real-time dashboard with <strong className="text-neutral-900">actionable insights</strong>—no spreadsheet gymnastics
                        </motion.p>
                    </AnimatedSection>

                    <AnimatedSection className="grid md:grid-cols-2 gap-8">
                        <motion.div
                            variants={slideInLeft}
                            whileHover={{ scale: 1.02 }}
                            className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-2xl border-2 border-primary-200 shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div
                                    className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md"
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                >
                                    <DollarSign className="w-6 h-6 text-white" />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-neutral-900">Cash Position</h3>
                            </div>
                            <motion.div
                                className="space-y-4"
                                variants={staggerContainer}
                            >
                                {[
                                    { label: 'Bank Balance', value: '₹250,000', color: 'neutral' },
                                    { label: 'Receivables', value: '₹120,000', color: 'success' },
                                    { label: 'Payables', value: '-₹80,000', color: 'danger' },
                                ].map((item) => (
                                    <motion.div
                                        key={item.label}
                                        variants={fadeIn}
                                        whileHover={{ x: 5 }}
                                        className="flex justify-between items-center p-3 bg-white rounded-lg border border-neutral-200"
                                    >
                                        <span className="text-neutral-700 font-medium">{item.label}</span>
                                        <span className={`font-bold text-lg text-${item.color}-700`}>{item.value}</span>
                                    </motion.div>
                                ))}
                                <motion.div
                                    variants={scaleIn}
                                    className="pt-3 border-t-2 border-primary-300 flex justify-between items-center p-3 bg-primary-100 rounded-lg"
                                >
                                    <span className="font-bold text-neutral-900 text-lg">Net Position</span>
                                    <motion.span
                                        className="font-bold text-2xl text-primary-700"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        ₹290,000
                                    </motion.span>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            variants={slideInRight}
                            whileHover={{ scale: 1.02 }}
                            className="bg-gradient-to-br from-warning-50 to-white p-8 rounded-2xl border-2 border-warning-200 shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div
                                    className="w-12 h-12 bg-gradient-to-br from-warning-600 to-warning-700 rounded-xl flex items-center justify-center shadow-md"
                                    animate={{ rotate: [0, -5, 5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                >
                                    <AlertCircle className="w-6 h-6 text-white" />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-neutral-900">Workflow Status</h3>
                            </div>
                            <motion.div
                                className="space-y-4"
                                variants={staggerContainer}
                            >
                                {[
                                    { count: 5, label: 'Pending Approvals', sub: '₹125,000 total value', color: 'warning' },
                                    { count: 15, label: 'Overdue Invoices', sub: 'Follow up needed', color: 'danger' },
                                    { count: 2, label: 'Missing Receipts', sub: 'Action required', color: 'warning' },
                                ].map((item) => (
                                    <motion.div
                                        key={item.label}
                                        variants={fadeIn}
                                        whileHover={{ x: 5 }}
                                        className={`flex items-center gap-4 p-3 bg-white rounded-lg border border-neutral-200 hover:border-${item.color}-300 transition-colors duration-200`}
                                    >
                                        <motion.div
                                            className={`w-12 h-12 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md`}
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            {item.count}
                                        </motion.div>
                                        <div>
                                            <div className="font-bold text-neutral-900">{item.label}</div>
                                            <div className="text-sm text-neutral-700">{item.sub}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Security & Compliance Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-50 to-white">
                <div className="max-w-6xl mx-auto">
                    <AnimatedSection className="text-center mb-16">
                        <motion.div
                            variants={fadeIn}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-danger-100 text-danger-800 rounded-full text-sm font-semibold mb-4 shadow-sm"
                        >
                            <Shield className="w-4 h-4" />
                            Security & Compliance
                        </motion.div>
                        <motion.h2
                            variants={fadeInUp}
                            className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6"
                        >
                            Built for Audits
                        </motion.h2>
                        <motion.p
                            variants={fadeInUp}
                            className="text-xl text-neutral-700 leading-relaxed max-w-3xl mx-auto"
                        >
                            <strong className="text-neutral-900">Enterprise-grade security</strong> and immutable audit trails for IRD compliance
                        </motion.p>
                    </AnimatedSection>

                    <AnimatedSection className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Lock, color: 'primary', title: 'Bank-Level Encryption', desc: '256-bit SSL/TLS encryption for all data' },
                            { icon: Shield, color: 'success', title: 'Immutable Logs', desc: 'Tamper-proof audit trail' },
                            { icon: Users, color: 'warning', title: 'Role-Based Access', desc: 'Control who sees what data' },
                            { icon: FileText, color: 'danger', title: 'IRD Reports', desc: 'One-click compliance reports' },
                        ].map((item) => (
                            <motion.div
                                key={item.title}
                                variants={fadeInUp}
                                whileHover={{ y: -10, boxShadow: '0 25px 50px rgba(0,0,0,0.12)' }}
                                className={`bg-white p-8 rounded-2xl border-2 border-${item.color}-200 text-center shadow-xl transition-all duration-300 group`}
                            >
                                <motion.div
                                    className={`w-16 h-16 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                                    whileHover={{ scale: 1.15, rotate: 10 }}
                                >
                                    <item.icon className="w-8 h-8 text-white" />
                                </motion.div>
                                <h3 className="font-bold text-lg text-neutral-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-neutral-700">{item.desc}</p>
                            </motion.div>
                        ))}
                    </AnimatedSection>
                </div>
            </section>

            {/* CTA Section */}
            <motion.section
                className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                {/* Animated background */}
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'linear'
                    }}
                    style={{
                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1), transparent 50%), radial-gradient(circle at bottom left, rgba(255,255,255,0.1), transparent 50%)',
                    }}
                />

                <div className="max-w-4xl mx-auto text-center relative">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold text-white mb-6"
                    >
                        Experience the Difference
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-primary-100 mb-10 leading-relaxed"
                    >
                        See how AFOCE can <strong className="text-white">transform your business operations</strong>.
                        Join hundreds of Nepal businesses already saving time and money.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center px-10 py-5 bg-white text-primary-700 rounded-xl hover:bg-neutral-50 transition-all duration-300 font-bold text-lg shadow-2xl"
                        >
                            Start Free Trial
                            <ArrowRight className="ml-3 w-5 h-5" />
                        </Link>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="text-primary-100 mt-6 text-lg"
                    >
                        14 days free • No credit card required • Full feature access
                    </motion.p>
                </div>
            </motion.section>

            {/* Footer */}
            <footer className="bg-neutral-900 text-neutral-400 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-6">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center justify-center gap-2 mb-4"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-lg">A</span>
                            </div>
                            <span className="text-xl font-bold text-white">AFOCE</span>
                        </motion.div>
                        <p className="text-neutral-300 text-lg mb-2">Everything you need to run your business</p>
                        <p className="text-neutral-500">© 2026 AFOCE. Built for Nepal's SMEs with ❤️</p>
                    </div>
                    <div className="flex justify-center gap-8 text-sm">
                        <Link to="/about" className="text-neutral-400 hover:text-white transition-colors">About</Link>
                        <Link to="/pricing" className="text-neutral-400 hover:text-white transition-colors">Pricing</Link>
                        <Link to="/features" className="text-neutral-400 hover:text-white transition-colors">Features</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
