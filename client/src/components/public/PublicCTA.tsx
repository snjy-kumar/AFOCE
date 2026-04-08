import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

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

export function PublicCTA() {
    return (
        <section className="py-24 px-6 relative bg-white overflow-hidden">
            <Reveal className="max-w-5xl mx-auto">
                <div className="relative bg-[#1A1A40] rounded-[2rem] overflow-hidden p-10 md:p-16 text-center shadow-2xl flex flex-col items-center">
                    {/* Abstract background graphics */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.15]">
                        <div className="absolute -top-[50%] -left-[10%] w-[1000px] h-[1000px] rounded-full bg-blue-500 blur-[120px]" />
                        <div className="absolute -bottom-[20%] right-[0%] w-[600px] h-[600px] rounded-full bg-indigo-500 blur-[100px]" />
                    </div>

                    <div className="relative z-10 max-w-2xl mx-auto w-full">
                        <h2 className="text-[2.5rem] md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                            Ready to take control of your finances?
                        </h2>
                        <p className="text-[1.1rem] text-indigo-100/90 mb-10 font-medium max-w-lg mx-auto leading-relaxed">
                            Join hundreds of businesses streamlining their operations today. Get unrestricted access for 14 days, totally free.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
                            <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-900 rounded-xl font-bold text-[0.95rem] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm !no-underline">
                                Start 14-Day Free Trial <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                            <Link to="/pricing" className="w-full sm:w-auto px-8 py-3.5 bg-[#3B34AB] text-white rounded-xl font-bold text-[0.95rem] hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 !no-underline">
                                View Pricing
                            </Link>
                        </div>
                    </div>

                    {/* Trust indicators */}
                    <div className="relative z-10 flex flex-wrap gap-x-8 gap-y-3 justify-center mt-12 w-full border-t border-white/10 pt-8">
                        {['14-day free trial', 'No credit card required', 'Setup in 5 minutes'].map((t) => (
                            <span key={t} className="flex items-center gap-2 text-[0.75rem] text-slate-300 font-bold uppercase tracking-widest">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden /> {t}
                            </span>
                        ))}
                    </div>
                </div>
            </Reveal>
        </section>
    );
}
