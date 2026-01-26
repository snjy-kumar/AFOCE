import { Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Zap, Star, Crown } from 'lucide-react';

export function PricingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation - Sticky with backdrop blur */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-neutral-200 shadow-sm" role="navigation" aria-label="Main navigation">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link
                            to="/"
                            className="flex items-center gap-2 transition-transform duration-300 hover:scale-105"
                            aria-label="AFOCE home"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-lg">A</span>
                            </div>
                            <span className="text-xl font-bold text-neutral-900">AFOCE</span>
                        </Link>
                        <div className="flex items-center gap-8">
                            <Link
                                to="/"
                                className="inline-flex items-center text-neutral-700 hover:text-neutral-900 transition-all duration-300 font-medium"
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
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-neutral-50 relative overflow-hidden" aria-labelledby="hero-heading">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.05),transparent_50%)]"></div>

                <div className="max-w-4xl mx-auto text-center relative">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-100 text-success-800 rounded-full text-sm font-semibold mb-6 animate-fade-in shadow-sm">
                        <Star className="w-4 h-4" />
                        14-day free trial • No credit card required
                    </div>
                    <h1 id="hero-heading" className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 animate-slide-up">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-700 mb-4 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        Choose the plan that fits your business size. <strong className="text-neutral-900">Scale as you grow</strong>, with no hidden fees.
                    </p>
                    <p className="text-lg text-neutral-600 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        Save 16% with annual billing • Upgrade or downgrade anytime
                    </p>
                </div>
            </section>

            {/* Pricing Cards - Enhanced with better styling */}
            <section className="py-16 px-4 sm:px-6 lg:px-8" aria-labelledby="plans-heading">
                <div className="max-w-7xl mx-auto">
                    <h2 id="plans-heading" className="sr-only">Available pricing plans</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Starter Plan */}
                        <div className="border-2 border-neutral-200 rounded-2xl p-8 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in" role="article" aria-labelledby="starter-plan">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-neutral-500 to-neutral-600 rounded-xl flex items-center justify-center shadow-md">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <h3 id="starter-plan" className="text-2xl font-bold text-neutral-900">Starter</h3>
                            </div>
                            <p className="text-neutral-700 mb-6 min-h-[3rem]">Perfect for small businesses getting started with automation</p>
                            <div className="mb-8">
                                <div className="flex items-baseline mb-2">
                                    <span className="text-5xl font-bold text-neutral-900">$10</span>
                                    <span className="text-neutral-600 ml-2 text-lg">/month</span>
                                </div>
                                <p className="text-sm text-neutral-600 font-medium">₹800/month billed monthly</p>
                                <p className="text-xs text-success-600 font-semibold mt-1">Save $20 with annual billing</p>
                            </div>
                            <Link
                                to="/register"
                                className="block w-full text-center px-6 py-4 border-2 border-primary-600 text-primary-700 rounded-xl hover:bg-primary-50 transition-all duration-300 font-bold mb-8 shadow-md hover:shadow-lg"
                                aria-label="Start free trial with Starter plan"
                            >
                                Start Free Trial
                            </Link>
                            <div className="space-y-4" role="list" aria-label="Starter plan features">
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800"><strong className="text-neutral-900">50 invoices</strong>/month</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800"><strong className="text-neutral-900">2 user</strong> accounts</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800">Basic approval workflows</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800">Expense tracking with receipts</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800">13% VAT automation</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800">Basic reports & dashboards</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800">Email support (24h response)</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <X className="w-5 h-5 text-neutral-300 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-500">Multi-location support</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <X className="w-5 h-5 text-neutral-300 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-500">Custom workflows</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <X className="w-5 h-5 text-neutral-300 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-500">API access</span>
                                </div>
                            </div>
                        </div>

                        {/* Professional Plan - Most Popular */}
                        <div className="border-2 border-primary-600 rounded-2xl p-8 bg-gradient-to-br from-primary-50 to-white relative shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 animate-fade-in" style={{ animationDelay: '0.1s' }} role="article" aria-labelledby="professional-plan">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-bold rounded-full shadow-lg">
                                Most Popular
                            </div>
                            <div className="flex items-center gap-2 mb-6 mt-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                                    <Star className="w-5 h-5 text-white" />
                                </div>
                                <h3 id="professional-plan" className="text-2xl font-bold text-neutral-900">Professional</h3>
                            </div>
                            <p className="text-neutral-800 mb-6 min-h-[3rem] font-medium">For growing businesses ready to scale operations</p>
                            <div className="mb-8">
                                <div className="flex items-baseline mb-2">
                                    <span className="text-5xl font-bold text-primary-700">$20</span>
                                    <span className="text-neutral-700 ml-2 text-lg font-semibold">/month</span>
                                </div>
                                <p className="text-sm text-neutral-700 font-medium">₹1,600/month billed monthly</p>
                                <p className="text-xs text-success-700 font-bold mt-1">Save $40 with annual billing</p>
                            </div>
                            <Link
                                to="/register"
                                className="block w-full text-center px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-bold mb-8 shadow-xl hover:shadow-2xl transform hover:scale-105"
                                aria-label="Start free trial with Professional plan (recommended)"
                            >
                                Start Free Trial
                            </Link>
                            <div className="space-y-4" role="list" aria-label="Professional plan features">
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-900"><strong>Unlimited</strong> invoices</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-900"><strong>5 user</strong> accounts</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-900"><strong>Advanced</strong> approval workflows</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-900">Policy enforcement & budget limits</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-900">All Starter features included</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-900">Advanced reports & analytics</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-900">Bank reconciliation</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-900"><strong>Priority support</strong> (4h response)</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <X className="w-5 h-5 text-neutral-400 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-600">Unlimited locations</span>
                                </div>
                            </div>
                        </div>

                        {/* Business Plan */}
                        <div className="border-2 border-warning-200 rounded-2xl p-8 bg-gradient-to-br from-warning-50 to-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '0.2s' }} role="article" aria-labelledby="business-plan">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-warning-600 to-warning-700 rounded-xl flex items-center justify-center shadow-md">
                                    <Crown className="w-5 h-5 text-white" />
                                </div>
                                <h3 id="business-plan" className="text-2xl font-bold text-neutral-900">Business</h3>
                            </div>
                            <p className="text-neutral-700 mb-6 min-h-[3rem]">For established enterprises with complex needs</p>
                            <div className="mb-8">
                                <div className="flex items-baseline mb-2">
                                    <span className="text-5xl font-bold text-neutral-900">$30</span>
                                    <span className="text-neutral-600 ml-2 text-lg">/month</span>
                                </div>
                                <p className="text-sm text-neutral-600 font-medium">₹2,400/month billed monthly</p>
                                <p className="text-xs text-success-600 font-semibold mt-1">Save $60 with annual billing</p>
                            </div>
                            <Link
                                to="/register"
                                className="block w-full text-center px-6 py-4 border-2 border-warning-600 text-warning-700 rounded-xl hover:bg-warning-50 transition-all duration-300 font-bold mb-8 shadow-md hover:shadow-lg"
                                aria-label="Start free trial with Business plan"
                            >
                                Start Free Trial
                            </Link>
                            <div className="space-y-4" role="list" aria-label="Business plan features">
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-warning-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800"><strong className="text-neutral-900">Everything</strong> in Professional</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-warning-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800"><strong className="text-neutral-900">Unlimited</strong> users</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-warning-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800"><strong className="text-neutral-900">Multi-location</strong> support</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-warning-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800">Custom workflow rules & automation</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-warning-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800">Advanced audit logs & compliance</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-warning-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800">Full API access for integrations</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-warning-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800"><strong className="text-neutral-900">Dedicated account manager</strong></span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-warning-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800"><strong className="text-neutral-900">Phone & email support</strong> (2h response)</span>
                                </div>
                                <div className="flex items-start" role="listitem">
                                    <Check className="w-5 h-5 text-warning-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <span className="text-neutral-800">Custom integrations & onboarding</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Comparison Table - Enhanced with better contrast */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-50 to-white" aria-labelledby="comparison-heading">
                <div className="max-w-6xl mx-auto">
                    <h2 id="comparison-heading" className="text-4xl font-bold text-neutral-900 mb-12 text-center animate-slide-up">
                        Detailed Feature Comparison
                    </h2>
                    <div className="overflow-x-auto shadow-xl rounded-2xl animate-fade-in">
                        <table className="w-full bg-white border-2 border-neutral-200 rounded-2xl" role="table" aria-label="Pricing plan comparison">
                            <thead>
                                <tr className="border-b-2 border-neutral-300 bg-gradient-to-r from-neutral-100 to-neutral-50">
                                    <th scope="col" className="text-left py-5 px-6 text-neutral-900 font-bold text-lg">Feature</th>
                                    <th scope="col" className="text-center py-5 px-6 text-neutral-900 font-bold text-lg">Starter</th>
                                    <th scope="col" className="text-center py-5 px-6 text-primary-700 font-bold text-lg">Professional</th>
                                    <th scope="col" className="text-center py-5 px-6 text-warning-700 font-bold text-lg">Business</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                <tr className="hover:bg-neutral-50 transition-colors duration-200">
                                    <td className="py-5 px-6 text-neutral-800 font-semibold">Monthly Invoices</td>
                                    <td className="text-center py-5 px-6 text-neutral-700 font-medium">50</td>
                                    <td className="text-center py-5 px-6 text-primary-700 font-bold">Unlimited</td>
                                    <td className="text-center py-5 px-6 text-warning-700 font-bold">Unlimited</td>
                                </tr>
                                <tr className="hover:bg-neutral-50 transition-colors duration-200">
                                    <td className="py-5 px-6 text-neutral-800 font-semibold">Users</td>
                                    <td className="text-center py-5 px-6 text-neutral-700 font-medium">2</td>
                                    <td className="text-center py-5 px-6 text-neutral-700 font-medium">5</td>
                                    <td className="text-center py-5 px-6 text-warning-700 font-bold">Unlimited</td>
                                </tr>
                                <tr className="hover:bg-neutral-50 transition-colors duration-200">
                                    <td className="py-5 px-6 text-neutral-800 font-semibold">Approval Workflows</td>
                                    <td className="text-center py-5 px-6"><Check className="w-6 h-6 text-primary-600 inline" aria-label="Included" /></td>
                                    <td className="text-center py-5 px-6"><Check className="w-6 h-6 text-primary-600 inline" aria-label="Included" /></td>
                                    <td className="text-center py-5 px-6"><Check className="w-6 h-6 text-warning-600 inline" aria-label="Included" /></td>
                                </tr>
                                <tr className="hover:bg-neutral-50 transition-colors duration-200">
                                    <td className="py-5 px-6 text-neutral-800 font-semibold">VAT Automation (13%)</td>
                                    <td className="text-center py-5 px-6"><Check className="w-6 h-6 text-primary-600 inline" aria-label="Included" /></td>
                                    <td className="text-center py-5 px-6"><Check className="w-6 h-6 text-primary-600 inline" aria-label="Included" /></td>
                                    <td className="text-center py-5 px-6"><Check className="w-6 h-6 text-warning-600 inline" aria-label="Included" /></td>
                                </tr>
                                <tr className="hover:bg-neutral-50 transition-colors duration-200">
                                    <td className="py-5 px-6 text-neutral-800 font-semibold">Expense Management</td>
                                    <td className="text-center py-5 px-6"><Check className="w-6 h-6 text-primary-600 inline" aria-label="Included" /></td>
                                    <td className="text-center py-5 px-6"><Check className="w-6 h-6 text-primary-600 inline" aria-label="Included" /></td>
                                    <td className="text-center py-5 px-6"><Check className="w-6 h-6 text-warning-600 inline" aria-label="Included" /></td>
                                </tr>
                                <tr className="hover:bg-neutral-50 transition-colors duration-200">
                                    <td className="py-5 px-6 text-neutral-800 font-semibold">Bank Reconciliation</td>
                                    <td className="text-center py-5 px-6"><X className="w-6 h-6 text-neutral-300 inline" aria-label="Not included" /></td>
                                    <td className="text-center py-5 px-6"><Check className="w-6 h-6 text-primary-600 inline" aria-label="Included" /></td>
                                    <td className="text-center py-5 px-6"><Check className="w-6 h-6 text-warning-600 inline" aria-label="Included" /></td>
                                </tr>
                                <tr className="hover:bg-neutral-50 transition-colors duration-200">
                                    <td className="py-5 px-6 text-neutral-800 font-semibold">Multi-Location Support</td>
                                    <td className="text-center py-5 px-6"><X className="w-6 h-6 text-neutral-300 inline" aria-label="Not included" /></td>
                                    <td className="text-center py-5 px-6"><X className="w-6 h-6 text-neutral-300 inline" aria-label="Not included" /></td>
                                    <td className="text-center py-5 px-6"><Check className="w-6 h-6 text-warning-600 inline" aria-label="Included" /></td>
                                </tr>
                                <tr className="hover:bg-neutral-50 transition-colors duration-200">
                                    <td className="py-5 px-6 text-neutral-800 font-semibold">Custom Workflows</td>
                                    <td className="text-center py-5 px-6"><X className="w-6 h-6 text-neutral-300 inline" aria-label="Not included" /></td>
                                    <td className="text-center py-5 px-6"><X className="w-6 h-6 text-neutral-300 inline" aria-label="Not included" /></td>
                                    <td className="text-center py-5 px-6"><Check className="w-6 h-6 text-warning-600 inline" aria-label="Included" /></td>
                                </tr>
                                <tr className="hover:bg-neutral-50 transition-colors duration-200">
                                    <td className="py-5 px-6 text-neutral-800 font-semibold">API Access</td>
                                    <td className="text-center py-5 px-6"><X className="w-6 h-6 text-neutral-300 inline" aria-label="Not included" /></td>
                                    <td className="text-center py-5 px-6"><X className="w-6 h-6 text-neutral-300 inline" aria-label="Not included" /></td>
                                    <td className="text-center py-5 px-6"><Check className="w-6 h-6 text-warning-600 inline" aria-label="Included" /></td>
                                </tr>
                                <tr className="hover:bg-neutral-50 transition-colors duration-200">
                                    <td className="py-5 px-6 text-neutral-800 font-semibold">Support Level</td>
                                    <td className="text-center py-5 px-6 text-neutral-700 font-medium">Email (24h)</td>
                                    <td className="text-center py-5 px-6 text-primary-700 font-bold">Priority (4h)</td>
                                    <td className="text-center py-5 px-6 text-warning-700 font-bold">Dedicated (2h)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ Section - Enhanced with better styling */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="faq-heading">
                <div className="max-w-4xl mx-auto">
                    <h2 id="faq-heading" className="text-4xl font-bold text-neutral-900 mb-12 text-center animate-slide-up">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-6 animate-fade-in">
                        <div className="border-2 border-neutral-200 bg-gradient-to-br from-white to-neutral-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" role="article">
                            <h3 className="text-xl font-bold text-neutral-900 mb-3 flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">Q</div>
                                Can I change plans later?
                            </h3>
                            <p className="text-neutral-800 leading-relaxed pl-10">
                                <strong className="text-neutral-900">Yes, absolutely!</strong> You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any payments. No penalties for switching plans.
                            </p>
                        </div>
                        <div className="border-2 border-neutral-200 bg-gradient-to-br from-white to-neutral-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" role="article">
                            <h3 className="text-xl font-bold text-neutral-900 mb-3 flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-success-600 to-success-700 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">Q</div>
                                What happens after the free trial?
                            </h3>
                            <p className="text-neutral-800 leading-relaxed pl-10">
                                After your <strong className="text-neutral-900">14-day trial</strong>, you'll be prompted to enter payment information. <strong className="text-neutral-900">No automatic charges</strong>—you decide if you want to continue. Your data remains safe during the trial period.
                            </p>
                        </div>
                        <div className="border-2 border-neutral-200 bg-gradient-to-br from-white to-neutral-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" role="article">
                            <h3 className="text-xl font-bold text-neutral-900 mb-3 flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-warning-600 to-warning-700 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">Q</div>
                                Is my data secure?
                            </h3>
                            <p className="text-neutral-800 leading-relaxed pl-10">
                                <strong className="text-neutral-900">100% secure.</strong> We use bank-level encryption, regular security audits, and immutable audit logs. Your financial data is hosted in secure data centers with <strong className="text-neutral-900">99.9% uptime guarantee</strong>. We never sell or share your data.
                            </p>
                        </div>
                        <div className="border-2 border-neutral-200 bg-gradient-to-br from-white to-neutral-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" role="article">
                            <h3 className="text-xl font-bold text-neutral-900 mb-3 flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-danger-600 to-danger-700 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">Q</div>
                                Do you offer discounts for annual billing?
                            </h3>
                            <p className="text-neutral-800 leading-relaxed pl-10">
                                <strong className="text-neutral-900">Yes!</strong> We offer <strong className="text-success-700">2 months free</strong> when you pay annually (save 16%). For example, pay ₹9,600 for Starter (instead of ₹9,600) and get 2 months free. <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold underline">Contact us</Link> for annual billing options.
                            </p>
                        </div>
                        <div className="border-2 border-neutral-200 bg-gradient-to-br from-white to-neutral-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" role="article">
                            <h3 className="text-xl font-bold text-neutral-900 mb-3 flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">Q</div>
                                Can I cancel anytime?
                            </h3>
                            <p className="text-neutral-800 leading-relaxed pl-10">
                                <strong className="text-neutral-900">Yes, cancel anytime.</strong> No long-term contracts, no cancellation fees. You can export all your data before canceling. We'll be sad to see you go, but we make it easy.
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
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl md:text-2xl text-primary-100 mb-10 leading-relaxed">
                        Start your 14-day free trial today. <strong className="text-white">No credit card required.</strong> Experience the power of workflow automation.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center justify-center px-10 py-5 bg-white text-primary-700 rounded-xl hover:bg-neutral-50 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105"
                        aria-label="Start your free trial"
                    >
                        Start Free Trial
                    </Link>
                    <p className="text-primary-100 mt-6 text-lg">All features • Cancel anytime • Support included</p>
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
                        <p className="text-neutral-300 text-lg mb-2">Workflow-intelligent financial operations</p>
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
