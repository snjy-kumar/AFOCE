import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function PublicNav() {
    return (
        <motion.nav
            initial={{ y: -72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200"
            role="navigation"
            aria-label="Main navigation"
        >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
                {/* Brand */}
                <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group !no-underline" aria-label="AFOCE Home">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                        A
                    </div>
                    <span className="font-extrabold text-[1.25rem] tracking-tight text-indigo-950">AFOCE</span>
                </Link>

                {/* Links */}
                <div className="hidden md:flex items-center gap-2">
                    {['Features', 'Pricing', 'About'].map((item, i) => (
                        <motion.div key={item} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.3 }}>
                            <Link to={`/${item.toLowerCase()}`} className="px-4 py-2 rounded-lg text-[0.9rem] font-bold text-slate-600 hover:text-indigo-950 hover:bg-slate-100 transition-colors !no-underline">
                                {item}
                            </Link>
                        </motion.div>
                    ))}

                    <div className="w-px h-5 bg-slate-200 mx-3" />

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
                        <Link to="/login" className="px-4 py-2 rounded-lg text-[0.9rem] font-bold text-slate-600 hover:text-indigo-950 transition-colors !no-underline">
                            Sign in
                        </Link>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.65 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link to="/register" className="ml-2 px-5 py-2.5 rounded-xl bg-indigo-950 text-white !text-white text-[0.9rem] font-bold shadow-md hover:shadow-lg transition-all hover:bg-black !no-underline">
                            Start Free Trial
                        </Link>
                    </motion.div>
                </div>
            </div>
        </motion.nav>
    );
}
