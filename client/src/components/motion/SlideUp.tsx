import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '../../lib/utils';

const slideUpVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for natural feel
        },
    },
};

interface SlideUpProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

/**
 * SlideUp - Animates children with a slide-up + fade effect.
 * Great for hero sections, cards, and content blocks.
 */
export function SlideUp({ children, className, delay = 0 }: SlideUpProps) {
    return (
        <motion.div
            className={cn(className)}
            initial="hidden"
            animate="visible"
            variants={slideUpVariants}
            transition={{ delay }}
        >
            {children}
        </motion.div>
    );
}
