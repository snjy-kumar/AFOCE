import { Link } from 'react-router-dom';
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
    Smartphone
} from 'lucide-react';

export function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
            {/* Enhanced Navigation */}
            <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_8px_30px_rgba(15,23,42,0.08)]" role="navigation" aria-label="Main navigation">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link to="/" className="flex items-center gap-3 group" aria-label="AFOCE Home">
                            <div className="relative w-12 h-12 rounded-2xl bg-white/80 border border-white/60 shadow-[0_6px_20px_rgba(37,99,235,0.18)] flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_12px_30px_rgba(37,99,235,0.25)] group-hover:-translate-y-0.5">
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/80 to-primary-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="relative text-primary-700 font-black text-2xl tracking-tight">A</span>
                            </div>
                            <span className="text-2xl font-bold text-primary-800 tracking-tight group-hover:text-primary-900 transition-colors">AFOCE</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-8">
                            <Link
                                to="/about"
                                className="px-3 py-2 rounded-xl text-neutral-700 hover:text-primary-700 hover:bg-white/70 hover:shadow-[0_6px_16px_rgba(37,99,235,0.12)] transition-all font-semibold text-base"
                                aria-label="Learn about AFOCE"
                            >
                                About
                            </Link>
                            <Link
                                to="/features"
                                className="px-3 py-2 rounded-xl text-neutral-700 hover:text-primary-700 hover:bg-white/70 hover:shadow-[0_6px_16px_rgba(37,99,235,0.12)] transition-all font-semibold text-base"
                                aria-label="Explore features"
                            >
                                Features
                            </Link>
                            <Link
                                to="/pricing"
                                className="px-3 py-2 rounded-xl text-neutral-700 hover:text-primary-700 hover:bg-white/70 hover:shadow-[0_6px_16px_rgba(37,99,235,0.12)] transition-all font-semibold text-base"
                                aria-label="View pricing plans"
                            >
                                Pricing
                            </Link>
                            <div className="h-8 w-px bg-neutral-300"></div>
                            <Link
                                to="/login"
                                className="px-4 py-2 rounded-2xl border border-white/60 bg-white/60 text-primary-800 hover:bg-white/80 hover:shadow-[0_8px_20px_rgba(37,99,235,0.18)] transition-all font-semibold text-base"
                                aria-label="Sign in to your account"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-bold shadow-[0_10px_25px_rgba(37,99,235,0.25)] hover:shadow-[0_14px_30px_rgba(37,99,235,0.32)] text-base"
                                aria-label="Start your free trial"
                            >
                                Start Free Trial
                            </Link>
                        </div>
                        {/* Mobile menu button */}
                        <button className="md:hidden p-2 rounded-lg hover:bg-neutral-100">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden" aria-labelledby="hero-title">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.08),transparent_50%)]" aria-hidden="true"></div>

                <div className="max-w-7xl mx-auto relative">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="max-w-xl animate-slide-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur border border-primary-200/60 text-primary-700 rounded-full text-[15px] font-semibold mb-8 shadow-sm hover:shadow-md transition-shadow">
                                🇳🇵 Made for Nepal's Business Ecosystem
                            </div>
                            <h1
                                id="hero-title"
                                className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-7 leading-[1.1] tracking-tight"
                            >
                                Automate finance.
                                <span className="block text-primary-600 mt-2">Stay IRD-compliant.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-neutral-700 mb-10 leading-relaxed">
                                AFOCE is the workflow‑intelligent platform that streamlines invoicing, expenses, VAT, and approvals—built for Nepal.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 items-start mb-8">
                                <Link
                                    to="/register"
                                    className="group inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:scale-105 text-base"
                                    aria-label="Get started with free trial"
                                >
                                    Start Free Trial
                                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                                </Link>
                                <Link
                                    to="/features"
                                    className="inline-flex items-center justify-center px-8 py-4 border-2 border-neutral-300 text-neutral-800 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 font-semibold text-base"
                                    aria-label="See how AFOCE works"
                                >
                                    See How It Works
                                </Link>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 text-[15px] text-neutral-700">
                                <span className="flex items-center gap-2 font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-success-600" aria-hidden="true" />
                                    14-day free trial
                                </span>
                                <span className="flex items-center gap-2 font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-success-600" aria-hidden="true" />
                                    No credit card required
                                </span>
                                <span className="flex items-center gap-2 font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-success-600" aria-hidden="true" />
                                    Setup in 5 minutes
                                </span>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-lg border-2 border-neutral-200/60 rounded-3xl shadow-2xl p-7 lg:p-9 animate-slide-up hover:shadow-3xl transition-shadow duration-500" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-center justify-between mb-7">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Live snapshot</p>
                                    <p className="text-xl font-bold text-neutral-900 mt-1">Business overview</p>
                                </div>
                                <div className="px-3 py-1.5 rounded-full bg-success-100 text-success-700 text-xs font-bold shadow-sm">Compliant</div>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="rounded-2xl border-2 border-neutral-200 p-5 bg-gradient-to-br from-white to-neutral-50/50 hover:shadow-md transition-shadow">
                                    <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wide">Outstanding</p>
                                    <p className="text-2xl font-bold text-neutral-900 mt-2">₹3,20,000</p>
                                    <p className="text-xs text-success-600 mt-2 font-semibold">+12% this month</p>
                                </div>
                                <div className="rounded-2xl border-2 border-neutral-200 p-5 bg-gradient-to-br from-white to-neutral-50/50 hover:shadow-md transition-shadow">
                                    <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wide">VAT Payable</p>
                                    <p className="text-2xl font-bold text-neutral-900 mt-2">₹45,500</p>
                                    <p className="text-xs text-warning-600 mt-2 font-semibold">Due in 8 days</p>
                                </div>
                                <div className="rounded-2xl border-2 border-neutral-200 p-5 col-span-2 bg-gradient-to-br from-white to-neutral-50/50 hover:shadow-md transition-shadow">
                                    <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wide mb-4">Workflow approvals</p>
                                    <div className="flex items-center justify-between rounded-xl bg-primary-50/50 px-5 py-3.5 border border-primary-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shadow-sm">
                                                <Clock className="w-5 h-5 text-primary-600" aria-hidden="true" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-neutral-900">3 items pending</p>
                                                <p className="text-xs text-neutral-500">Invoices &gt; ₹50K</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold text-primary-700">Review</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Indicators */}
            <section className="py-12 bg-white border-y border-neutral-200" aria-label="Key metrics and achievements">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-6 text-sm text-neutral-600">
                        <div className="font-semibold text-neutral-800">Trusted by Nepal’s growing teams</div>
                        <div className="flex flex-wrap gap-3">
                            {['Retail', 'Services', 'Manufacturing', 'Hospitality', 'Agencies'].map((label) => (
                                <span key={label} className="px-3 py-1 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-700">
                                    {label}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-neutral-900 font-semibold">13% VAT</div>
                            <div className="text-neutral-900 font-semibold">Bikram Sambat</div>
                            <div className="text-neutral-900 font-semibold">Audit-ready</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50" aria-labelledby="how-it-works-title">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 id="how-it-works-title" className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
                            How it works
                        </h2>
                        <p className="text-neutral-700">Get compliant workflows running in minutes, not weeks.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: 'Connect your business', body: 'Add your company, VAT details, and users in a guided setup.' },
                            { title: 'Automate approvals', body: 'Define thresholds, receipt rules, and role-based approvals.' },
                            { title: 'Track & file VAT', body: 'See VAT summaries and generate filings on time.' },
                        ].map((step, index) => (
                            <div key={step.title} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                                <div className="inline-flex items-center justify-center mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/80 border border-white/60 shadow-[0_6px_18px_rgba(37,99,235,0.18)] backdrop-blur text-primary-800 text-base font-bold flex items-center justify-center">
                                        {index + 1}
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{step.title}</h3>
                                <p className="text-neutral-700 text-sm leading-relaxed">{step.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Problem Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8" aria-labelledby="problems-title">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-danger-600 font-semibold text-sm uppercase tracking-wider mb-3 block" role="status">The Challenge</span>
                        <h2 id="problems-title" className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                            Stop Losing Money to Manual Processes
                        </h2>
                        <div className="flex justify-center">
                            <p className="text-xl md:text-2xl text-neutral-700 max-w-2xl leading-relaxed text-center">
                                Nepal's SMEs waste precious hours on spreadsheets, miss critical tax deadlines,
                                and struggle with expense tracking—costing valuable time and money every single day.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <article className="group p-8 bg-white border-2 border-neutral-200 rounded-2xl hover:border-danger-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="w-16 h-16 bg-gradient-to-br from-danger-50 to-danger-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <FileText className="w-8 h-8 text-danger-600" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-4">
                                Excel Chaos
                            </h3>
                            <p className="text-neutral-700 leading-relaxed">
                                <span className="font-bold text-neutral-900">70% of Nepal SMEs</span> still rely on spreadsheets—
                                manual, error-prone, impossible to audit, and vulnerable to catastrophic data loss.
                            </p>
                        </article>

                        <article className="group p-8 bg-white border-2 border-neutral-200 rounded-2xl hover:border-danger-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="w-16 h-16 bg-gradient-to-br from-danger-50 to-danger-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Shield className="w-8 h-8 text-danger-600" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-4">
                                Compliance Nightmares
                            </h3>
                            <p className="text-neutral-700 leading-relaxed">
                                Missing VAT filings, failed audits, and <span className="font-bold text-neutral-900">costly IRD penalties</span> that
                                could have been easily prevented with proper systems in place.
                            </p>
                        </article>

                        <article className="group p-8 bg-white border-2 border-neutral-200 rounded-2xl hover:border-danger-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="w-16 h-16 bg-gradient-to-br from-danger-50 to-danger-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Clock className="w-8 h-8 text-danger-600" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-4">
                                Time Drain
                            </h3>
                            <p className="text-neutral-700 leading-relaxed">
                                <span className="font-bold text-neutral-900">Countless hours wasted</span> chasing invoices,
                                reconciling bank statements, and performing tedious manual data entry—time that should be spent growing your business.
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-neutral-50 to-white" aria-labelledby="features-title">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3 block text-center" role="status">The Solution</span>
                        <h2 id="features-title" className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 text-center">
                            Built for Nepal's Business Reality
                        </h2>
                        <div className="flex justify-center">
                            <p className="text-xl md:text-2xl text-neutral-700 max-w-3xl leading-relaxed text-center">
                                Everything you need to run a compliant, efficient business—
                                <span className="block mt-2 font-semibold text-neutral-900">designed specifically for Nepal's unique regulatory environment</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <article className="group bg-white p-8 rounded-2xl border-2 border-neutral-200 hover:border-primary-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle2 className="w-8 h-8 text-primary-600" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-4">
                                Smart Approval Workflows
                            </h3>
                            <p className="text-neutral-700 leading-relaxed mb-4">
                                Invoices over ₹50,000 automatically route to managers. Expenses require receipts.
                                <span className="block mt-2 font-semibold text-neutral-900">Business policies enforced automatically—zero manual oversight needed.</span>
                            </p>
                            <div className="flex items-center text-primary-700 font-medium text-sm">
                                <TrendingUp className="w-4 h-4 mr-2" aria-hidden="true" />
                                Reduce approval time by 80%
                            </div>
                        </article>

                        <article className="group bg-white p-8 rounded-2xl border-2 border-neutral-200 hover:border-primary-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <FileText className="w-8 h-8 text-primary-600" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-4">
                                IRD-Compliant Invoicing
                            </h3>
                            <p className="text-neutral-700 leading-relaxed mb-4">
                                Sequential numbering, 13% VAT automation, Bikram Sambat dates, PAN validation—
                                <span className="block mt-2 font-semibold text-neutral-900">all built-in and IRD-approved from day one.</span>
                            </p>
                            <div className="flex items-center text-success-700 font-medium text-sm">
                                <Shield className="w-4 h-4 mr-2" aria-hidden="true" />
                                100% audit-ready
                            </div>
                        </article>

                        <article className="group bg-white p-8 rounded-2xl border-2 border-neutral-200 hover:border-primary-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Zap className="w-8 h-8 text-primary-600" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-4">
                                Intelligent Expense Management
                            </h3>
                            <p className="text-neutral-700 leading-relaxed mb-4">
                                Submit expenses, attach receipts, auto-categorize transactions, and enforce budget limits.
                                <span className="block mt-2 font-semibold text-neutral-900">Never lose a receipt or miss a reimbursement again.</span>
                            </p>
                            <div className="flex items-center text-warning-700 font-medium text-sm">
                                <Clock className="w-4 h-4 mr-2" aria-hidden="true" />
                                Save 10+ hours per week
                            </div>
                        </article>

                        <article className="group bg-white p-8 rounded-2xl border-2 border-neutral-200 hover:border-primary-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <BarChart3 className="w-8 h-8 text-primary-600" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-4">
                                Real-Time Business Insights
                            </h3>
                            <p className="text-neutral-700 leading-relaxed mb-4">
                                Monitor cash position, track overdue invoices, get budget alerts, and analyze profitability—
                                <span className="block mt-2 font-semibold text-neutral-900">all in one beautiful, intuitive dashboard.</span>
                            </p>
                            <div className="flex items-center text-primary-700 font-medium text-sm">
                                <BarChart3 className="w-4 h-4 mr-2" aria-hidden="true" />
                                Live analytics & reporting
                            </div>
                        </article>

                        <article className="group bg-white p-8 rounded-2xl border-2 border-neutral-200 hover:border-primary-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Lock className="w-8 h-8 text-primary-600" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-4">
                                Complete Audit Trail
                            </h3>
                            <p className="text-neutral-700 leading-relaxed mb-4">
                                Every action logged with precise timestamps, immutable records, and comprehensive compliance tracking.
                                <span className="block mt-2 font-semibold text-neutral-900">IRD auditors will appreciate your documentation.</span>
                            </p>
                            <div className="flex items-center text-success-700 font-medium text-sm">
                                <Lock className="w-4 h-4 mr-2" aria-hidden="true" />
                                Bank-grade security
                            </div>
                        </article>

                        <article className="group bg-white p-8 rounded-2xl border-2 border-neutral-200 hover:border-primary-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Users className="w-8 h-8 text-primary-600" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-4">
                                Seamless Team Collaboration
                            </h3>
                            <p className="text-neutral-700 leading-relaxed mb-4">
                                Add unlimited users, set role-based permissions, enable approval notifications, and track all activity.
                                <span className="block mt-2 font-semibold text-neutral-900">Keep your entire team perfectly synchronized.</span>
                            </p>
                            <div className="flex items-center text-primary-700 font-medium text-sm">
                                <Users className="w-4 h-4 mr-2" aria-hidden="true" />
                                Unlimited team members
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="comparison-title">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 id="comparison-title" className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                            Why Choose AFOCE?
                        </h2>
                        <div className="flex justify-center">
                            <p className="text-xl text-neutral-700 max-w-2xl text-center">
                                See how we compare to traditional methods and international accounting software
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border-2 border-neutral-200 shadow-xl">
                        <table className="w-full" role="table" aria-label="Feature comparison table">
                            <thead className="bg-neutral-50">
                                <tr className="border-b-2 border-neutral-200">
                                    <th scope="col" className="text-left py-6 px-6 text-neutral-900 font-bold text-lg">Feature</th>
                                    <th scope="col" className="py-6 px-4 text-neutral-800 font-semibold">
                                        <span className="inline-flex w-full justify-center pl-1">Excel</span>
                                    </th>
                                    <th scope="col" className="py-6 px-4 text-neutral-800 font-semibold">
                                        <span className="inline-flex w-full justify-center pl-1">QuickBooks</span>
                                    </th>
                                    <th scope="col" className="py-6 px-4 bg-primary-50 text-primary-800 font-bold">
                                        <span className="inline-flex w-full justify-center pl-1">AFOCE</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                <tr className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                                    <th scope="row" className="py-5 px-6 text-neutral-900 font-semibold text-left">Nepal VAT (13%)</th>
                                    <td className="text-center py-5 px-4">
                                        <span className="text-2xl" role="img" aria-label="Not supported">❌</span>
                                    </td>
                                    <td className="text-center py-5 px-4">
                                        <span className="text-2xl" role="img" aria-label="Not supported">❌</span>
                                    </td>
                                    <td className="text-center py-5 px-4 bg-primary-50">
                                        <span className="text-2xl text-primary-600 font-bold" role="img" aria-label="Fully supported">✓</span>
                                    </td>
                                </tr>
                                <tr className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                                    <th scope="row" className="py-5 px-6 text-neutral-900 font-semibold text-left">Approval Workflows</th>
                                    <td className="text-center py-5 px-4">
                                        <span className="text-2xl" role="img" aria-label="Not supported">❌</span>
                                    </td>
                                    <td className="text-center py-5 px-4 text-neutral-700">
                                        <span className="block font-bold">$150/mo</span>
                                        <span className="text-xs">Advanced only</span>
                                    </td>
                                    <td className="text-center py-5 px-4 bg-primary-50">
                                        <span className="text-2xl text-primary-600 font-bold" role="img" aria-label="Included">✓</span>
                                    </td>
                                </tr>
                                <tr className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                                    <th scope="row" className="py-5 px-6 text-neutral-900 font-semibold text-left">Bikram Sambat Calendar</th>
                                    <td className="text-center py-5 px-4">
                                        <span className="text-2xl" role="img" aria-label="Not supported">❌</span>
                                    </td>
                                    <td className="text-center py-5 px-4">
                                        <span className="text-2xl" role="img" aria-label="Not supported">❌</span>
                                    </td>
                                    <td className="text-center py-5 px-4 bg-primary-50">
                                        <span className="text-2xl text-primary-600 font-bold" role="img" aria-label="Fully supported">✓</span>
                                    </td>
                                </tr>
                                <tr className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                                    <th scope="row" className="py-5 px-6 text-neutral-900 font-semibold text-left">IRD E-filing Ready</th>
                                    <td className="text-center py-5 px-4">
                                        <span className="text-2xl" role="img" aria-label="Not supported">❌</span>
                                    </td>
                                    <td className="text-center py-5 px-4">
                                        <span className="text-2xl" role="img" aria-label="Not supported">❌</span>
                                    </td>
                                    <td className="text-center py-5 px-4 bg-primary-50">
                                        <span className="text-2xl text-primary-600 font-bold" role="img" aria-label="Fully supported">✓</span>
                                    </td>
                                </tr>
                                <tr className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                                    <th scope="row" className="py-5 px-6 text-neutral-900 font-semibold text-left">Cloud Access</th>
                                    <td className="text-center py-5 px-4">
                                        <span className="text-2xl" role="img" aria-label="Not supported">❌</span>
                                    </td>
                                    <td className="text-center py-5 px-4">
                                        <span className="text-2xl text-success-600 font-bold" role="img" aria-label="Supported">✓</span>
                                    </td>
                                    <td className="text-center py-5 px-4 bg-primary-50">
                                        <span className="text-2xl text-primary-600 font-bold" role="img" aria-label="Supported">✓</span>
                                    </td>
                                </tr>
                                <tr className="bg-neutral-50">
                                    <th scope="row" className="py-6 px-6 text-neutral-900 font-bold text-lg text-left">Price/month</th>
                                    <td className="text-center py-6 px-4">
                                        <span className="text-2xl font-bold text-neutral-800">Free</span>
                                        <span className="block text-xs text-neutral-600 mt-1">But costly errors</span>
                                    </td>
                                    <td className="text-center py-6 px-4">
                                        <span className="text-2xl font-bold text-neutral-800">$70</span>
                                        <span className="block text-xs text-neutral-600 mt-1">+ Nepal customization</span>
                                    </td>
                                    <td className="text-center py-6 px-4 bg-primary-50">
                                        <span className="text-3xl font-bold text-primary-600">$10-30</span>
                                        <span className="block text-sm text-primary-800 font-semibold mt-1">Nepal-ready</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-neutral-50 to-white" aria-labelledby="testimonial-title">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 id="testimonial-title" className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                            Trusted by Nepal's Growing Businesses
                        </h2>
                        <div className="flex justify-center">
                            <p className="text-xl text-neutral-700 max-w-2xl text-center">
                                From startups to established enterprises, businesses across Nepal trust AFOCE
                            </p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <article className="bg-white p-8 rounded-2xl border-2 border-neutral-200 shadow-lg hover:shadow-xl hover:border-primary-200 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                                    <Users className="w-8 h-8 text-primary-700" aria-hidden="true" />
                                </div>
                                <div>
                                    <div className="font-bold text-neutral-900">Small Businesses</div>
                                    <div className="text-sm text-neutral-600">1-10 employees</div>
                                </div>
                            </div>
                            <p className="text-neutral-700 leading-relaxed italic">
                                "Perfect for startups and small teams who need professional invoicing without overwhelming complexity or enterprise pricing."
                            </p>
                        </article>

                        <article className="bg-white p-8 rounded-2xl border-2 border-neutral-200 shadow-lg hover:shadow-xl hover:border-success-200 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-success-100 to-success-200 rounded-full flex items-center justify-center">
                                    <TrendingUp className="w-8 h-8 text-success-700" aria-hidden="true" />
                                </div>
                                <div>
                                    <div className="font-bold text-neutral-900">Growing Companies</div>
                                    <div className="text-sm text-neutral-600">10-50 employees</div>
                                </div>
                            </div>
                            <p className="text-neutral-700 leading-relaxed italic">
                                "Workflow automation saved us 15 hours per week. We achieved complete ROI within the very first month of implementation."
                            </p>
                        </article>

                        <article className="bg-white p-8 rounded-2xl border-2 border-neutral-200 shadow-lg hover:shadow-xl hover:border-warning-200 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-warning-100 to-warning-200 rounded-full flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-warning-700" aria-hidden="true" />
                                </div>
                                <div>
                                    <div className="font-bold text-neutral-900">Compliance Focused</div>
                                    <div className="text-sm text-neutral-600">IRD audit success</div>
                                </div>
                            </div>
                            <p className="text-neutral-700 leading-relaxed italic">
                                "We passed our first IRD audit with absolutely zero issues. The comprehensive audit trail feature is simply amazing."
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden" aria-labelledby="cta-title">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]" aria-hidden="true"></div>

                <div className="max-w-4xl mx-auto text-center relative">
                    <div className="inline-block mb-6">
                        <span className="px-5 py-2.5 bg-white/70 text-neutral-900 rounded-full text-base font-semibold border border-white/70 shadow-[0_12px_26px_rgba(15,23,42,0.22)] backdrop-blur-md" role="status">
                            🚀 Join 1000+ Nepal Businesses
                        </span>
                    </div>
                    <h2 id="cta-title" className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                        Ready to Modernize Your Business?
                    </h2>
                    <p className="text-xl md:text-2xl text-primary-100 mb-12 leading-relaxed">
                        Join Nepal's leading businesses using AFOCE to automate workflows,
                        maintain IRD compliance, and focus on what truly matters—sustainable growth.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            to="/register"
                            className="group inline-flex items-center justify-center px-6 py-3 bg-white/85 text-primary-700 rounded-lg border border-white/70 backdrop-blur-md shadow-[0_10px_22px_rgba(15,23,42,0.18)] transition-all duration-300 ease-out hover:bg-white hover:-translate-y-0.5 hover:scale-[1.03] active:translate-y-0 font-semibold text-base"
                            aria-label="Start your free trial now"
                        >
                            Start Your Free Trial
                            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                        </Link>
                        <Link
                            to="/pricing"
                            className="inline-flex items-center justify-center px-6 py-3 border border-white/60 bg-white/15 text-white rounded-lg backdrop-blur-md shadow-[0_10px_22px_rgba(15,23,42,0.18)] transition-all duration-300 ease-out hover:bg-white/25 hover:border-white/80 hover:-translate-y-0.5 hover:scale-[1.03] active:translate-y-0 font-semibold text-base"
                            aria-label="View our pricing plans"
                        >
                            View Pricing
                        </Link>
                    </div>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-8 text-primary-100" role="list">
                        <span className="flex items-center gap-3" role="listitem">
                            <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                            <span className="font-medium">14-day free trial</span>
                        </span>
                        <span className="flex items-center gap-3" role="listitem">
                            <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                            <span className="font-medium">No credit card required</span>
                        </span>
                        <span className="flex items-center gap-3" role="listitem">
                            <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                            <span className="font-medium">Setup in 5 minutes</span>
                        </span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-neutral-900 text-neutral-400 py-16 px-4 sm:px-6 lg:px-8" role="contentinfo">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
                        <div className="col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">A</span>
                                </div>
                                <span className="text-xl font-bold text-white">AFOCE</span>
                            </div>
                            <p className="text-neutral-400 leading-relaxed mb-4">
                                Nepal's intelligent business operating system.
                                Automate operations, ensure compliance, accelerate sustainable growth.
                            </p>
                            <div className="flex gap-4">
                                <Globe className="w-5 h-5 text-primary-400" aria-label="Global access" />
                                <Smartphone className="w-5 h-5 text-primary-400" aria-label="Mobile friendly" />
                                <Shield className="w-5 h-5 text-primary-400" aria-label="Secure platform" />
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
                                    <Shield className="w-4 h-4 text-success-500" aria-hidden="true" />
                                    <span className="text-neutral-400">IRD Compliant</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-primary-500" aria-hidden="true" />
                                    <span className="text-neutral-400">Secure</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-primary-500" aria-hidden="true" />
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
