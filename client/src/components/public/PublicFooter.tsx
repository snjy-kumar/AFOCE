import { Link } from 'react-router-dom';
import { Globe, Shield, Lock, BarChart3 } from 'lucide-react';

export function PublicFooter() {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-8 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-y-12 gap-x-8 mb-16">
                    {/* Brand */}
                    <div className="col-span-2">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white shadow-sm">A</div>
                            <span className="font-extrabold text-[1.25rem] text-indigo-950 tracking-tight">AFOCE</span>
                        </div>
                        <p className="text-[0.95rem] text-slate-500 leading-relaxed mb-6 max-w-sm font-medium">
                            Nepal's intelligent business operating system. Automate operations, ensure compliance, accelerate growth.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" aria-label="Globe" className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50 hover:text-blue-600 transition-colors">
                                <Globe className="w-4 h-4" />
                            </a>
                            <a href="#" aria-label="Mobile" className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50 hover:text-blue-600 transition-colors">
                                <BarChart3 className="w-4 h-4" />
                            </a>
                            <a href="#" aria-label="Security" className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50 hover:text-blue-600 transition-colors">
                                <Shield className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {[
                        { heading: 'Product', links: [{ label: 'Features', to: '/features' }, { label: 'Pricing', to: '/pricing' }, { label: 'Start Free', to: '/register' }] },
                        { heading: 'Company', links: [{ label: 'About Us', to: '/about' }, { label: 'Contact', to: '#' }] },
                        { heading: 'Legal', links: [{ label: 'Privacy Policy', to: '#' }, { label: 'Terms of Service', to: '#' }, { label: 'Security', to: '#' }] },
                    ].map((col) => (
                        <div key={col.heading}>
                            <h4 className="text-[0.7rem] font-black text-indigo-950 uppercase tracking-[0.2em] mb-4">{col.heading}</h4>
                            <ul className="space-y-3">
                                {col.links.map((l) => (
                                    <li key={l.label}>
                                        <Link to={l.to} className="text-[0.9rem] text-slate-500 font-bold hover:text-blue-600 transition-colors !no-underline">{l.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[0.85rem] text-slate-400 font-bold">© {new Date().getFullYear()} AFOCE. Built with ❤️ for Nepal's SMEs.</p>
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        {[
                            { icon: Shield, label: 'IRD Compliant' },
                            { icon: Lock, label: 'Secure' },
                            { icon: Globe, label: 'Nepal-Based' },
                        ].map(({ icon: Icon, label }) => (
                            <span key={label} className="flex items-center gap-1.5 text-[0.75rem] text-slate-500 font-black uppercase tracking-widest">
                                <Icon className="w-3.5 h-3.5 text-emerald-500" aria-hidden />
                                {label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
