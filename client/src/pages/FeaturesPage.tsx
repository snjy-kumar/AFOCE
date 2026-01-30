import { Link } from 'react-router-dom';
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
    Globe,
    Smartphone
} from 'lucide-react';

export function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation - Sticky with backdrop blur */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-sm" role="navigation" aria-label="Main navigation">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-18">
                        <Link
                            to="/"
                            className="flex items-center gap-3 group transition-transform duration-300 hover:scale-105"
                            aria-label="AFOCE home"
                        >
                            <div className="w-11 h-11 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                <span className="text-white font-bold text-xl">A</span>
                            </div>
                            <span className="text-xl font-bold text-neutral-900 tracking-tight">AFOCE</span>
                        </Link>
                        <div className="flex items-center gap-8">
                            <Link
                                to="/"
                                className="inline-flex items-center text-neutral-700 hover:text-neutral-900 transition-all duration-300 font-semibold text-[15px]"
                                aria-label="Back to home page"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Enhanced with gradient */}
            <section className="py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-neutral-50 relative overflow-hidden" aria-labelledby="hero-heading">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent_50%)]"></div>

                <div className="max-w-4xl mx-auto text-center relative">
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-100 text-primary-800 rounded-full text-[15px] font-bold mb-8 animate-fade-in shadow-sm">
                        <Zap className="w-4 h-4" />
                        Workflow-Intelligent Features
                    </div>
                    <h1 id="hero-heading" className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-8 animate-slide-up tracking-tight leading-[1.1]">
                        Everything You Need to Run Your Business
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-700 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        Workflow-intelligent features designed for <strong className="text-neutral-900 font-semibold">Nepal's business reality</strong>. Automate compliance, enforce policies, and focus on growth.
                    </p>
                </div>
            </section>

            {/* Feature Overview */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="overview-heading">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 id="overview-heading" className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
                            Feature overview
                        </h2>
                        <p className="text-lg text-neutral-700">A quick scan of what you get, out of the box.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
                        {[
                            { icon: FileText, title: 'IRD-ready invoices', desc: 'Sequential numbering, VAT, PAN validation, BS dates.' },
                            { icon: Users, title: 'Approval workflows', desc: 'Rules, thresholds, and role‑based approvals.' },
                            { icon: BarChart3, title: 'Live reporting', desc: 'Profit/Loss, VAT summaries, and cash flow.' },
                            { icon: Repeat, title: 'Bank reconciliation', desc: 'Match transactions and auto-suggest entries.' },
                            { icon: Lock, title: 'Audit trails', desc: 'Immutable history of every change and approval.' },
                            { icon: Smartphone, title: 'Anywhere access', desc: 'Cloud-first, secure, and fast on any device.' },
                        ].map((item) => (
                            <div key={item.title} className="p-7 rounded-2xl border-2 border-neutral-200 bg-gradient-to-br from-white to-neutral-50/60 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center mb-4 shadow-sm">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-3">{item.title}</h3>
                                <p className="text-[15px] text-neutral-700 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Smart Invoicing Section - Enhanced with visual invoice */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-50 to-white" aria-labelledby="invoicing-heading">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="animate-slide-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-semibold mb-4 shadow-sm">
                                <FileText className="w-4 h-4" />
                                Smart Invoicing
                            </div>
                            <h2 id="invoicing-heading" className="text-4xl font-bold text-neutral-900 mb-4">
                                IRD-Compliant Invoicing
                            </h2>
                            <p className="text-xl text-neutral-800 leading-relaxed mb-8">
                                Professional invoices that meet all <strong className="text-primary-600">Inland Revenue Department</strong> requirements
                            </p>
                            <ul className="space-y-5">
                                <li className="flex items-start p-4 bg-white rounded-xl border-2 border-primary-100 hover:border-primary-200 transition-all duration-300 hover:shadow-md group">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <strong className="text-neutral-900 text-lg block mb-1">Sequential Numbering</strong>
                                        <p className="text-neutral-700">Automatic invoice numbering with <strong className="text-neutral-900">no gaps</strong> (IRD audit requirement)</p>
                                    </div>
                                </li>
                                <li className="flex items-start p-4 bg-white rounded-xl border-2 border-success-100 hover:border-success-200 transition-all duration-300 hover:shadow-md group">
                                    <div className="w-10 h-10 bg-gradient-to-br from-success-600 to-success-700 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <strong className="text-neutral-900 text-lg block mb-1">13% VAT Automation</strong>
                                        <p className="text-neutral-700">Automatic VAT calculation for <strong className="text-neutral-900">registered businesses</strong></p>
                                    </div>
                                </li>
                                <li className="flex items-start p-4 bg-white rounded-xl border-2 border-warning-100 hover:border-warning-200 transition-all duration-300 hover:shadow-md group">
                                    <div className="w-10 h-10 bg-gradient-to-br from-warning-600 to-warning-700 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <strong className="text-neutral-900 text-lg block mb-1">Bikram Sambat Support</strong>
                                        <p className="text-neutral-700">Native support for <strong className="text-neutral-900">Nepal's official calendar</strong></p>
                                    </div>
                                </li>
                                <li className="flex items-start p-4 bg-white rounded-xl border-2 border-danger-100 hover:border-danger-200 transition-all duration-300 hover:shadow-md group">
                                    <div className="w-10 h-10 bg-gradient-to-br from-danger-600 to-danger-700 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <strong className="text-neutral-900 text-lg block mb-1">PAN Validation</strong>
                                        <p className="text-neutral-700">Verify customer <strong className="text-neutral-900">PAN numbers automatically</strong></p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white border-2 border-neutral-200 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <div className="space-y-5">
                                <div className="border-b-2 border-neutral-200 pb-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-sm font-semibold text-neutral-600">Invoice #</span>
                                        <span className="font-mono text-sm font-bold bg-primary-100 text-primary-800 px-3 py-1 rounded">INV-2081-0001</span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-semibold text-neutral-600">Date</span>
                                        <span className="text-sm font-bold text-neutral-800">2081-10-15 BS</span>
                                    </div>
                                </div>
                                <div className="border-b-2 border-neutral-200 pb-4">
                                    <div className="text-sm font-semibold text-neutral-600 mb-2">Customer</div>
                                    <div className="font-bold text-lg text-neutral-900">ABC Pvt. Ltd.</div>
                                    <div className="text-sm text-neutral-700 font-medium">PAN: 123456789</div>
                                </div>
                                <div className="space-y-3 border-b-2 border-neutral-200 pb-4">
                                    <div className="flex justify-between text-base">
                                        <span className="text-neutral-800 font-medium">Consulting Services</span>
                                        <span className="font-bold text-neutral-900">₹50,000</span>
                                    </div>
                                    <div className="flex justify-between text-base">
                                        <span className="text-neutral-700">VAT (13%)</span>
                                        <span className="font-semibold text-success-700">₹6,500</span>
                                    </div>
                                </div>
                                <div className="flex justify-between font-bold text-2xl pt-2">
                                    <span className="text-neutral-900">Total</span>
                                    <span className="text-primary-700">₹56,500</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Approval Workflows Section - Enhanced with workflow visualization */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="workflows-heading">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 animate-fade-in">
                            <div className="bg-gradient-to-br from-neutral-50 to-white border-2 border-neutral-200 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-warning-200 shadow-md hover:shadow-lg transition-all duration-300">
                                        <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-full flex items-center justify-center shadow-md">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-neutral-900">Invoice Created</div>
                                            <div className="text-sm text-neutral-700 font-medium">₹75,000 • Branch Manager</div>
                                        </div>
                                        <div className="px-3 py-1 bg-warning-100 text-warning-800 rounded-full text-xs font-bold shadow-sm">
                                            Draft
                                        </div>
                                    </div>
                                    <div className="ml-6 border-l-4 border-primary-300 pl-6 py-3">
                                        <div className="flex items-center gap-2 text-sm text-neutral-700 font-medium p-3 bg-primary-50 rounded-lg">
                                            <AlertCircle className="w-5 h-5 text-primary-600" />
                                            <span>Requires approval (&gt;₹50,000)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-success-200 shadow-md hover:shadow-lg transition-all duration-300">
                                        <div className="w-12 h-12 bg-gradient-to-br from-success-600 to-success-700 rounded-full flex items-center justify-center shadow-md">
                                            <CheckCircle2 className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-neutral-900">Manager Approved</div>
                                            <div className="text-sm text-neutral-700 font-medium">2 hours ago</div>
                                        </div>
                                        <div className="px-3 py-1 bg-success-100 text-success-800 rounded-full text-xs font-bold shadow-sm">
                                            Approved
                                        </div>
                                    </div>
                                    <div className="ml-6 border-l-4 border-success-300 pl-6 py-3">
                                        <div className="flex items-center gap-2 text-sm text-neutral-700 font-medium p-3 bg-success-50 rounded-lg">
                                            <Clock className="w-5 h-5 text-success-600" />
                                            <span>Ready to send to customer</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 md:order-2 animate-slide-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-100 text-success-800 rounded-full text-sm font-semibold mb-4 shadow-sm">
                                <Repeat className="w-4 h-4" />
                                Workflow Engine
                            </div>
                            <h2 id="workflows-heading" className="text-4xl font-bold text-neutral-900 mb-4">
                                Smart Approval Workflows
                            </h2>
                            <p className="text-xl text-neutral-800 leading-relaxed mb-8">
                                Automate approvals based on <strong className="text-neutral-900">custom rules</strong>. No more manual checking or policy violations.
                            </p>
                            <ul className="space-y-5">
                                <li className="flex items-start p-4 bg-gradient-to-br from-primary-50 to-white rounded-xl border-2 border-primary-100 hover:border-primary-200 transition-all duration-300 hover:shadow-md group">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <strong className="text-neutral-900 text-lg block mb-1">Rule-Based Routing</strong>
                                        <p className="text-neutral-700">Invoices &gt;₹50,000 <strong className="text-neutral-900">auto-route to managers</strong> for approval</p>
                                    </div>
                                </li>
                                <li className="flex items-start p-4 bg-gradient-to-br from-success-50 to-white rounded-xl border-2 border-success-100 hover:border-success-200 transition-all duration-300 hover:shadow-md group">
                                    <div className="w-10 h-10 bg-gradient-to-br from-success-600 to-success-700 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <strong className="text-neutral-900 text-lg block mb-1">Policy Enforcement</strong>
                                        <p className="text-neutral-700">Block expenses without receipts, <strong className="text-neutral-900">enforce budget limits</strong></p>
                                    </div>
                                </li>
                                <li className="flex items-start p-4 bg-gradient-to-br from-warning-50 to-white rounded-xl border-2 border-warning-100 hover:border-warning-200 transition-all duration-300 hover:shadow-md group">
                                    <div className="w-10 h-10 bg-gradient-to-br from-warning-600 to-warning-700 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <strong className="text-neutral-900 text-lg block mb-1">Instant Notifications</strong>
                                        <p className="text-neutral-700">Email alerts when <strong className="text-neutral-900">approval needed</strong> or status changes</p>
                                    </div>
                                </li>
                                <li className="flex items-start p-4 bg-gradient-to-br from-danger-50 to-white rounded-xl border-2 border-danger-100 hover:border-danger-200 transition-all duration-300 hover:shadow-md group">
                                    <div className="w-10 h-10 bg-gradient-to-br from-danger-600 to-danger-700 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <strong className="text-neutral-900 text-lg block mb-1">Audit Trail</strong>
                                        <p className="text-neutral-700">Complete history of who approved what, <strong className="text-neutral-900">when, and why</strong></p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Expense Management Section - Enhanced with grid layout */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-50 to-white" aria-labelledby="expense-heading">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-warning-100 text-warning-800 rounded-full text-sm font-semibold mb-4 shadow-sm">
                            <BarChart3 className="w-4 h-4" />
                            Expense Management
                        </div>
                        <h2 id="expense-heading" className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                            Track Every Rupee
                        </h2>
                        <p className="text-xl text-neutral-700 leading-relaxed max-w-3xl mx-auto">
                            Submit, approve, and categorize expenses with <strong className="text-neutral-900">receipt attachment</strong> and <strong className="text-neutral-900">budget controls</strong>
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
                        <div className="p-8 bg-white rounded-2xl border-2 border-primary-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group" role="article">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <FileText className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-3">
                                Receipt Management
                            </h3>
                            <p className="text-neutral-800 leading-relaxed mb-4">
                                Attach receipts to expenses. Enforce policy: expenses &gt;₹5,000 <strong className="text-neutral-900">must have receipts</strong>.
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2 text-neutral-700">
                                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" />
                                    <span>Photo upload with OCR</span>
                                </li>
                                <li className="flex items-center gap-2 text-neutral-700">
                                    <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" />
                                    <span>Automatic categorization</span>
                                </li>
                            </ul>
                        </div>
                        <div className="p-8 bg-white rounded-2xl border-2 border-warning-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group" role="article">
                            <div className="w-16 h-16 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <AlertCircle className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-3">
                                Budget Alerts
                            </h3>
                            <p className="text-neutral-800 leading-relaxed mb-4">
                                Get notified when departments reach <strong className="text-neutral-900">80% of budget</strong>. Block expenses at 100%.
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2 text-neutral-700">
                                    <CheckCircle2 className="w-4 h-4 text-warning-600 flex-shrink-0" />
                                    <span>Real-time tracking</span>
                                </li>
                                <li className="flex items-center gap-2 text-neutral-700">
                                    <CheckCircle2 className="w-4 h-4 text-warning-600 flex-shrink-0" />
                                    <span>Automated notifications</span>
                                </li>
                            </ul>
                        </div>
                        <div className="p-8 bg-white rounded-2xl border-2 border-success-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group" role="article">
                            <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <BarChart3 className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-3">
                                Auto-Categorization
                            </h3>
                            <p className="text-neutral-800 leading-relaxed mb-4">
                                Expenses automatically categorized. Track spending by <strong className="text-neutral-900">category and department</strong>.
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2 text-neutral-700">
                                    <CheckCircle2 className="w-4 h-4 text-success-600 flex-shrink-0" />
                                    <span>Smart ML categorization</span>
                                </li>
                                <li className="flex items-center gap-2 text-neutral-700">
                                    <CheckCircle2 className="w-4 h-4 text-success-600 flex-shrink-0" />
                                    <span>Custom categories</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Real-Time Insights Section - Enhanced with dashboard preview */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="insights-heading">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-100 text-success-800 rounded-full text-sm font-semibold mb-4 shadow-sm">
                            <TrendingUp className="w-4 h-4" />
                            Business Intelligence
                        </div>
                        <h2 id="insights-heading" className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                            Know Your Numbers
                        </h2>
                        <p className="text-xl text-neutral-700 leading-relaxed max-w-3xl mx-auto">
                            Real-time dashboard with <strong className="text-neutral-900">actionable insights</strong>—no spreadsheet gymnastics
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
                        <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-2xl border-2 border-primary-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]" role="article">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-neutral-900">Cash Position</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-neutral-200">
                                    <span className="text-neutral-700 font-medium">Bank Balance</span>
                                    <span className="font-bold text-lg text-neutral-900">₹250,000</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-neutral-200">
                                    <span className="text-neutral-700 font-medium">Receivables</span>
                                    <span className="font-bold text-lg text-success-700">₹120,000</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-neutral-200">
                                    <span className="text-neutral-700 font-medium">Payables</span>
                                    <span className="font-bold text-lg text-danger-700">-₹80,000</span>
                                </div>
                                <div className="pt-3 border-t-2 border-primary-300 flex justify-between items-center p-3 bg-primary-100 rounded-lg">
                                    <span className="font-bold text-neutral-900 text-lg">Net Position</span>
                                    <span className="font-bold text-2xl text-primary-700">₹290,000</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-warning-50 to-white p-8 rounded-2xl border-2 border-warning-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]" role="article">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-warning-600 to-warning-700 rounded-xl flex items-center justify-center shadow-md">
                                    <AlertCircle className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-neutral-900">Workflow Status</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-neutral-200 hover:border-warning-300 transition-colors duration-200">
                                    <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                        5
                                    </div>
                                    <div>
                                        <div className="font-bold text-neutral-900">Pending Approvals</div>
                                        <div className="text-sm text-neutral-700">₹125,000 total value</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-neutral-200 hover:border-danger-300 transition-colors duration-200">
                                    <div className="w-12 h-12 bg-gradient-to-br from-danger-500 to-danger-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                        15
                                    </div>
                                    <div>
                                        <div className="font-bold text-neutral-900">Overdue Invoices</div>
                                        <div className="text-sm text-neutral-700">Follow up needed</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-neutral-200 hover:border-warning-300 transition-colors duration-200">
                                    <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                        2
                                    </div>
                                    <div>
                                        <div className="font-bold text-neutral-900">Missing Receipts</div>
                                        <div className="text-sm text-neutral-700">Action required</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Security & Compliance Section - Enhanced with icon grid */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-50 to-white" aria-labelledby="security-heading">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-danger-100 text-danger-800 rounded-full text-sm font-semibold mb-4 shadow-sm">
                            <Shield className="w-4 h-4" />
                            Security & Compliance
                        </div>
                        <h2 id="security-heading" className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                            Built for Audits
                        </h2>
                        <p className="text-xl text-neutral-700 leading-relaxed max-w-3xl mx-auto">
                            <strong className="text-neutral-900">Enterprise-grade security</strong> and immutable audit trails for IRD compliance
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                        <div className="bg-white p-8 rounded-2xl border-2 border-primary-200 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group" role="article">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <Lock className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-neutral-900 mb-2">Bank-Level Encryption</h3>
                            <p className="text-sm text-neutral-700">256-bit SSL/TLS encryption for all data</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border-2 border-success-200 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group" role="article">
                            <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-neutral-900 mb-2">Immutable Logs</h3>
                            <p className="text-sm text-neutral-700">Tamper-proof audit trail</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border-2 border-warning-200 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group" role="article">
                            <div className="w-16 h-16 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-neutral-900 mb-2">Role-Based Access</h3>
                            <p className="text-sm text-neutral-700">Control who sees what data</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border-2 border-danger-200 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group" role="article">
                            <div className="w-16 h-16 bg-gradient-to-br from-danger-500 to-danger-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <FileText className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-neutral-900 mb-2">IRD Reports</h3>
                            <p className="text-sm text-neutral-700">One-click compliance reports</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Additional Features Grid */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="additional-heading">
                <div className="max-w-6xl mx-auto">
                    <h2 id="additional-heading" className="text-4xl font-bold text-neutral-900 mb-12 text-center animate-slide-up">
                        And Much More...
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
                        <div className="p-6 bg-gradient-to-br from-primary-50 to-white rounded-xl border-2 border-primary-100 hover:border-primary-200 transition-all duration-300 hover:shadow-lg group">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-neutral-900 mb-2">Multi-Currency</h3>
                            <p className="text-neutral-700 text-sm">Handle NPR, USD, INR with automatic conversion</p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-success-50 to-white rounded-xl border-2 border-success-100 hover:border-success-200 transition-all duration-300 hover:shadow-lg group">
                            <div className="w-12 h-12 bg-gradient-to-br from-success-600 to-success-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                <Smartphone className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-neutral-900 mb-2">Mobile App</h3>
                            <p className="text-neutral-700 text-sm">iOS & Android apps for on-the-go management</p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-warning-50 to-white rounded-xl border-2 border-warning-100 hover:border-warning-200 transition-all duration-300 hover:shadow-lg group">
                            <div className="w-12 h-12 bg-gradient-to-br from-warning-600 to-warning-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-neutral-900 mb-2">Advanced Reports</h3>
                            <p className="text-neutral-700 text-sm">P&L, Balance Sheet, Cash Flow statements</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Enhanced with gradient and pattern */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden" aria-labelledby="cta-heading">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_50%)]"></div>

                <div className="max-w-4xl mx-auto text-center relative animate-fade-in">
                    <h2 id="cta-heading" className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Experience the Difference
                    </h2>
                    <p className="text-xl md:text-2xl text-primary-100 mb-10 leading-relaxed">
                        See how AFOCE can <strong className="text-white">transform your business operations</strong>. Join hundreds of Nepal businesses already saving time and money.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center justify-center px-10 py-5 bg-white text-primary-700 rounded-xl hover:bg-neutral-50 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105"
                        aria-label="Start your free trial"
                    >
                        Start Free Trial
                    </Link>
                    <p className="text-primary-100 mt-6 text-lg">
                        14 days free • No credit card required • Full feature access
                    </p>
                </div>
            </section>

            {/* Footer - Enhanced with better contrast */}
            <footer className="bg-neutral-900 text-neutral-400 py-12 px-4 sm:px-6 lg:px-8" role="contentinfo">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-lg">A</span>
                            </div>
                            <span className="text-xl font-bold text-white">AFOCE</span>
                        </div>
                        <p className="text-neutral-300 text-lg mb-2">Everything you need to run your business</p>
                        <p className="text-neutral-500">© 2026 AFOCE. Built for Nepal's SMEs with ❤️</p>
                    </div>
                    <div className="flex justify-center gap-8 text-sm">
                        <Link to="/about" className="text-neutral-400 hover:text-white transition-colors" aria-label="About AFOCE">About</Link>
                        <Link to="/pricing" className="text-neutral-400 hover:text-white transition-colors" aria-label="View pricing">Pricing</Link>
                        <Link to="/features" className="text-neutral-400 hover:text-white transition-colors" aria-label="View features">Features</Link>
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
                
                .animate-slide-up {
                    animation: slide-up 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
