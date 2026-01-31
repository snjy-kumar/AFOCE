import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Users, TrendingUp, Shield, Zap, Globe, CheckCircle2, Building2, Award } from 'lucide-react';

export function AboutPage() {
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

            {/* Hero Section - Enhanced with gradient background */}
            <section className="py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-neutral-50 relative overflow-hidden" aria-labelledby="hero-heading">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent_50%)]"></div>

                <div className="max-w-4xl mx-auto text-center relative">
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-100 text-primary-800 rounded-full text-[15px] font-bold mb-8 animate-fade-in shadow-sm">
                        <Building2 className="w-4 h-4" />
                        Adaptive Financial Operations & Compliance Engine
                    </div>
                    <h1 id="hero-heading" className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-8 animate-slide-up tracking-tight leading-[1.1]">
                        About AFOCE
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-700 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        Building Nepal's first workflow-intelligent financial platform that combines <strong className="text-neutral-900 font-semibold">user-friendly accounting</strong>, <strong className="text-neutral-900 font-semibold">smart automation</strong>, and <strong className="text-neutral-900 font-semibold">Nepal-specific compliance</strong> in one seamless solution.
                    </p>
                </div>
            </section>

            {/* Highlights */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white" aria-label="Company highlights">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-7">
                        <div className="p-7 rounded-2xl border-2 border-neutral-200 bg-gradient-to-br from-white to-neutral-50 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                    <Target className="w-6 h-6 text-primary-600" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900">Workflow-first finance</h3>
                            </div>
                            <p className="text-neutral-700 text-[15px] leading-relaxed">
                                Automate approvals, enforce policies, and keep every transaction audit‑ready.
                            </p>
                        </div>
                        <div className="p-7 rounded-2xl border-2 border-neutral-200 bg-gradient-to-br from-white to-neutral-50 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-success-600" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900">Nepal compliant</h3>
                            </div>
                            <p className="text-neutral-700 text-[15px] leading-relaxed">
                                VAT (13%), PAN validation, and Bikram Sambat support built in by default.
                            </p>
                        </div>
                        <div className="p-7 rounded-2xl border-2 border-neutral-200 bg-gradient-to-br from-white to-neutral-50 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-warning-600" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900">Designed for SMEs</h3>
                            </div>
                            <p className="text-neutral-700 text-[15px] leading-relaxed">
                                Clear UX, local support, and pricing that scales with growing teams.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section - Enhanced with metrics */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="mission-heading">
                <div className="max-w-6xl mx-auto">
                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 animate-fade-in">
                        <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100 shadow-sm">
                            <div className="text-4xl font-bold text-neutral-900 mb-2">400K+</div>
                            <div className="text-sm font-medium text-neutral-900">Registered Businesses</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-success-50 to-white rounded-2xl border border-success-100 shadow-sm">
                            <div className="text-4xl font-bold text-neutral-900 mb-2">70%</div>
                            <div className="text-sm font-medium text-neutral-900">SMEs Using Excel</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-warning-50 to-white rounded-2xl border border-warning-100 shadow-sm">
                            <div className="text-4xl font-bold text-neutral-900 mb-2">13%</div>
                            <div className="text-sm font-medium text-neutral-900">VAT Automation</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-danger-50 to-white rounded-2xl border border-danger-100 shadow-sm">
                            <div className="text-4xl font-bold text-neutral-900 mb-2">100%</div>
                            <div className="text-sm font-medium text-neutral-900">IRD Compliant</div>
                        </div>
                    </div>

                    <div className="mb-16 animate-slide-up">
                        <h2 id="mission-heading" className="text-4xl font-bold text-neutral-900 mb-6 text-center">Our Mission</h2>
                        <div className="flex justify-center">
                            <p className="text-xl text-neutral-800 leading-relaxed max-w-4xl text-center">
                                We're building <strong className="text-primary-600">Nepal's first workflow-intelligent financial operations platform</strong> that combines user-friendly invoicing with business process automation and Nepal-specific compliance. Our goal is to <strong className="text-neutral-900">eliminate manual spreadsheet work</strong> and bring <strong className="text-neutral-900">enterprise-grade automation</strong> to Nepal's growing SMEs.
                            </p>
                        </div>
                    </div>

                    <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <h2 className="text-4xl font-bold text-neutral-900 mb-8 text-center">The Problem We Solve</h2>
                        <p className="text-xl text-neutral-800 leading-relaxed mb-8 max-w-4xl mx-auto text-center">
                            Nepal's SMEs face a <strong className="text-danger-600">critical gap</strong> in financial software:
                        </p>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="p-8 bg-gradient-to-br from-danger-50 to-white rounded-2xl border-2 border-danger-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                                <div className="w-16 h-16 bg-white/80 backdrop-blur rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
                                    <Globe className="w-8 h-8 text-danger-600" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-3">Global SaaS</h3>
                                <p className="text-neutral-800 leading-relaxed mb-3">
                                    <strong>QuickBooks, Xero:</strong> Generic solutions with no Nepal IRD integration
                                </p>
                                <p className="text-danger-700 font-semibold">₹2,000+/month • No local compliance</p>
                            </div>
                            <div className="p-8 bg-gradient-to-br from-warning-50 to-white rounded-2xl border-2 border-warning-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                                <div className="w-16 h-16 bg-white/80 backdrop-blur rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
                                    <Shield className="w-8 h-8 text-warning-600" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-3">Desktop Software</h3>
                                <p className="text-neutral-800 leading-relaxed mb-3">
                                    Offline-only, no collaboration, outdated user experience
                                </p>
                                <p className="text-warning-700 font-semibold">No cloud access • Legacy UX</p>
                            </div>
                            <div className="p-8 bg-gradient-to-br from-neutral-100 to-white rounded-2xl border-2 border-neutral-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                                <div className="w-16 h-16 bg-white/80 backdrop-blur rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
                                    <TrendingUp className="w-8 h-8 text-neutral-700" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-3">Excel Spreadsheets</h3>
                                <p className="text-neutral-800 leading-relaxed mb-3">
                                    Used by <strong>70% of Nepal SMEs</strong>—manual, error-prone, no compliance tracking
                                </p>
                                <p className="text-neutral-700 font-semibold">High error rate • No automation</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solution Section - Enhanced with cards */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-50 via-white to-primary-50" aria-labelledby="solution-heading">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 animate-slide-up">
                        <h2 id="solution-heading" className="text-4xl font-bold text-neutral-900 mb-6">Our Solution</h2>
                        <p className="text-xl text-neutral-800 leading-relaxed max-w-3xl mx-auto">
                            AFOCE combines <strong className="text-primary-600">three critical elements</strong> that no other Nepal-focused solution offers:
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
                        <div className="p-8 bg-white rounded-2xl border-2 border-primary-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group" role="article" aria-label="Accounting software features">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                                Accounting Software
                            </h3>
                            <p className="text-neutral-700 leading-relaxed mb-6 text-lg">
                                Professional invoicing, expense tracking, and financial reporting with <strong className="text-neutral-900">real-time insights</strong>
                            </p>
                            <ul className="space-y-3" aria-label="Accounting features list">
                                <li className="flex items-start">
                                    <CheckCircle2 className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-1" aria-hidden="true" />
                                    <span className="text-neutral-700">Sequential invoice numbering</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle2 className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-1" aria-hidden="true" />
                                    <span className="text-neutral-700">Multi-currency support</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle2 className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-1" aria-hidden="true" />
                                    <span className="text-neutral-700">Bank reconciliation</span>
                                </li>
                            </ul>
                        </div>
                        <div className="p-8 bg-white rounded-2xl border-2 border-success-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group" role="article" aria-label="Workflow engine features">
                            <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                                Workflow Engine
                            </h3>
                            <p className="text-neutral-700 leading-relaxed mb-6 text-lg">
                                Smart approval routing, policy enforcement, and <strong className="text-neutral-900">automated notifications</strong>
                            </p>
                            <ul className="space-y-3" aria-label="Workflow features list">
                                <li className="flex items-start">
                                    <CheckCircle2 className="w-5 h-5 text-success-600 mr-3 flex-shrink-0 mt-1" aria-hidden="true" />
                                    <span className="text-neutral-700">Rule-based approvals</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle2 className="w-5 h-5 text-success-600 mr-3 flex-shrink-0 mt-1" aria-hidden="true" />
                                    <span className="text-neutral-700">Budget limit enforcement</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle2 className="w-5 h-5 text-success-600 mr-3 flex-shrink-0 mt-1" aria-hidden="true" />
                                    <span className="text-neutral-700">Immutable audit trails</span>
                                </li>
                            </ul>
                        </div>
                        <div className="p-8 bg-white rounded-2xl border-2 border-warning-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group" role="article" aria-label="Compliance automation features">
                            <div className="w-16 h-16 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                                Compliance Automation
                            </h3>
                            <p className="text-neutral-700 leading-relaxed mb-6 text-lg">
                                13% VAT automation, IRD formats, Bikram Sambat, and <strong className="text-neutral-900">complete audit trails</strong>
                            </p>
                            <ul className="space-y-3" aria-label="Compliance features list">
                                <li className="flex items-start">
                                    <CheckCircle2 className="w-5 h-5 text-warning-600 mr-3 flex-shrink-0 mt-1" aria-hidden="true" />
                                    <span className="text-neutral-700">IRD API integration</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle2 className="w-5 h-5 text-warning-600 mr-3 flex-shrink-0 mt-1" aria-hidden="true" />
                                    <span className="text-neutral-700">PAN validation</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle2 className="w-5 h-5 text-warning-600 mr-3 flex-shrink-0 mt-1" aria-hidden="true" />
                                    <span className="text-neutral-700">Bikram Sambat calendar</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Unique Value Section - Enhanced differentiation */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="differentiation-heading">
                <div className="max-w-6xl mx-auto">
                    <h2 id="differentiation-heading" className="text-4xl font-bold text-neutral-900 mb-12 text-center animate-slide-up">
                        What Makes AFOCE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-700">Different</span>
                    </h2>
                    <div className="space-y-6 animate-fade-in">
                        <div className="p-8 border-2 border-primary-200 bg-gradient-to-r from-primary-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                    <span className="text-white font-bold text-xl">1</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                                        Regulatory Integration
                                    </h3>
                                    <p className="text-neutral-800 leading-relaxed text-lg">
                                        Direct <strong className="text-primary-600">IRD API integration</strong> (Phase 2), Nepal tax compliance <strong className="text-neutral-900">built-in, not bolted on</strong>. This is a <span className="bg-warning-100 text-warning-800 px-2 py-1 rounded font-semibold">12+ month barrier to entry</span> for competitors. Our compliance engine ensures every transaction meets Inland Revenue Department standards.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 border-2 border-success-200 bg-gradient-to-r from-success-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-success-600 to-success-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                    <span className="text-white font-bold text-xl">2</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                                        Workflow Intelligence
                                    </h3>
                                    <p className="text-neutral-800 leading-relaxed text-lg">
                                        Smart approval routing based on <strong className="text-success-600">custom business rules</strong> (not just status changes). Invoices &gt;₹50,000 auto-route to managers. Expenses need receipts. <strong className="text-neutral-900">Policies enforced automatically</strong>—no manual checking, no policy violations, no surprises during audits.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 border-2 border-warning-200 bg-gradient-to-r from-warning-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-warning-600 to-warning-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                    <span className="text-white font-bold text-xl">3</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                                        Local Payment Gateways
                                    </h3>
                                    <p className="text-neutral-800 leading-relaxed text-lg">
                                        Integration with <strong className="text-warning-600">eSewa, Khalti, and Fonepay</strong> (Phase 2). Your customers can pay invoices with <strong className="text-neutral-900">one click</strong> using familiar payment methods. No international payment processors, no complicated setup—just seamless local payments that Nepal businesses and customers trust.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 border-2 border-danger-200 bg-gradient-to-r from-danger-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-danger-600 to-danger-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                                    <span className="text-white font-bold text-xl">4</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                                        Nepal-First Design
                                    </h3>
                                    <p className="text-neutral-800 leading-relaxed text-lg">
                                        <strong className="text-danger-600">Bikram Sambat calendar</strong> native support, Devanagari text support, Nepal tax rules (13% VAT, PAN validation), and <strong className="text-neutral-900">local business practices</strong>. Not a global product adapted for Nepal—a Nepal product designed for Nepal businesses from day one.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Market Section - Enhanced with icons and visuals */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-50 to-white" aria-labelledby="market-heading">
                <div className="max-w-6xl mx-auto">
                    <h2 id="market-heading" className="text-4xl font-bold text-neutral-900 mb-16 text-center animate-slide-up">
                        Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-700">Nepal's SMEs</span>
                    </h2>
                    <div className="grid md:grid-cols-2 gap-12 animate-fade-in">
                        <div className="p-8 bg-white rounded-2xl border-2 border-primary-200 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-neutral-900">Target Market</h3>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-start p-4 bg-primary-50 rounded-xl transition-all duration-300 hover:bg-primary-100">
                                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                                    <div>
                                        <span className="text-neutral-900 font-semibold">400,000+</span>
                                        <span className="text-neutral-700"> registered businesses in Nepal</span>
                                    </div>
                                </li>
                                <li className="flex items-start p-4 bg-primary-50 rounded-xl transition-all duration-300 hover:bg-primary-100">
                                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                                    <div>
                                        <span className="text-neutral-900 font-semibold">100,000</span>
                                        <span className="text-neutral-700"> businesses with ₹20L+ annual revenue</span>
                                    </div>
                                </li>
                                <li className="flex items-start p-4 bg-primary-50 rounded-xl transition-all duration-300 hover:bg-primary-100">
                                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                                    <div>
                                        <span className="text-neutral-900 font-semibold">30,000</span>
                                        <span className="text-neutral-700"> businesses actively seeking software solutions</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="p-8 bg-white rounded-2xl border-2 border-success-200 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-success-600 to-success-700 rounded-xl flex items-center justify-center shadow-md">
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-neutral-900">Who We Serve</h3>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-start p-4 bg-success-50 rounded-xl transition-all duration-300 hover:bg-success-100">
                                    <CheckCircle2 className="w-5 h-5 text-success-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800">Multi-location restaurants and retail chains</span>
                                </li>
                                <li className="flex items-start p-4 bg-success-50 rounded-xl transition-all duration-300 hover:bg-success-100">
                                    <CheckCircle2 className="w-5 h-5 text-success-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800">Growing consulting and service firms</span>
                                </li>
                                <li className="flex items-start p-4 bg-success-50 rounded-xl transition-all duration-300 hover:bg-success-100">
                                    <CheckCircle2 className="w-5 h-5 text-success-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800">Retail shop networks and distributors</span>
                                </li>
                                <li className="flex items-start p-4 bg-success-50 rounded-xl transition-all duration-300 hover:bg-success-100">
                                    <CheckCircle2 className="w-5 h-5 text-success-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800">Any business needing approval workflows</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section - Enhanced with gradient cards */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="principles-heading">
                <div className="max-w-6xl mx-auto">
                    <h2 id="principles-heading" className="text-4xl font-bold text-neutral-900 mb-16 text-center animate-slide-up">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-700">Principles</span>
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
                        <div className="p-8 border-2 border-neutral-200 bg-gradient-to-br from-white to-neutral-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900">
                                    Simplicity Over Complexity
                                </h3>
                            </div>
                            <p className="text-neutral-800 leading-relaxed">
                                We build features that <strong className="text-neutral-900">solve real problems</strong>, not check enterprise buzzword boxes. If it doesn't make your business easier, we don't build it. Every feature is tested with real Nepal businesses.
                            </p>
                        </div>
                        <div className="p-8 border-2 border-neutral-200 bg-gradient-to-br from-white to-neutral-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-success-600 to-success-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                                    <CheckCircle2 className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900">
                                    Transparency
                                </h3>
                            </div>
                            <p className="text-neutral-800 leading-relaxed">
                                Clear pricing, honest comparisons, and straightforward documentation. <strong className="text-neutral-900">No hidden fees</strong> or surprise charges. What you see is what you get—always.
                            </p>
                        </div>
                        <div className="p-8 border-2 border-neutral-200 bg-gradient-to-br from-white to-neutral-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-warning-600 to-warning-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900">
                                    Security First
                                </h3>
                            </div>
                            <p className="text-neutral-800 leading-relaxed">
                                Bank-level encryption, immutable audit logs, and regular security audits. Your financial data is our <strong className="text-neutral-900">top priority</strong>. We follow industry best practices and Nepal data protection standards.
                            </p>
                        </div>
                        <div className="p-8 border-2 border-neutral-200 bg-gradient-to-br from-white to-neutral-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-danger-600 to-danger-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                                    <Award className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900">
                                    Nepal-Focused
                                </h3>
                            </div>
                            <p className="text-neutral-800 leading-relaxed">
                                Built by people who <strong className="text-neutral-900">understand Nepal's business challenges</strong>. Local support, local compliance, local payment methods. We speak your language—literally and figuratively.
                            </p>
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
                        Join Nepal's Modern Businesses
                    </h2>
                    <p className="text-xl md:text-2xl text-primary-100 mb-10 leading-relaxed">
                        Start automating your workflows and staying compliant today. Join hundreds of Nepal businesses already saving time and money.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center justify-center px-10 py-5 bg-white text-primary-700 rounded-xl hover:bg-neutral-50 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105"
                        aria-label="Start your free trial"
                    >
                        Start Free Trial
                    </Link>
                    <p className="text-primary-100 mt-6 text-lg">14 days free • No credit card required • Cancel anytime</p>
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
                        <p className="text-neutral-300 text-lg mb-2">Adaptive Financial Operations & Compliance Engine</p>
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
