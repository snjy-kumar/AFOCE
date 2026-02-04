import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 8,
    },
    enter: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
        },
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: {
            duration: 0.2,
            ease: 'easeIn' as const,
        },
    },
};

interface PageTransitionProps {
    children: ReactNode;
}

/**
 * PageTransition - Wraps page content for smooth page transitions.
 * Uses the current route as the animation key.
 * 
 * Usage in App.tsx:
 * ```tsx
 * <AnimatePresence mode="wait">
 *   <PageTransition key={location.pathname}>
 *     <Routes>...</Routes>
 *   </PageTransition>
 * </AnimatePresence>
 * ```
 */
export function PageTransition({ children }: PageTransitionProps) {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial="initial"
                animate="enter"
                exit="exit"
                variants={pageVariants}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

/**
 * PageTransitionWrapper - Alternative that can be used without useLocation.
 * Useful when you want to control the key externally.
 */
export function PageTransitionWrapper({
    children,
    transitionKey,
}: {
    children: ReactNode;
    transitionKey: string;
}) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={transitionKey}
                initial="initial"
                animate="enter"
                exit="exit"
                variants={pageVariants}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
