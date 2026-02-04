import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '../../lib/utils';

const fadeInVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

interface FadeInProps {
    children: React.ReactNode;
    className?: string;
    duration?: number;
    delay?: number;
}

/**
 * FadeIn - Animates children with a fade-in effect.
 * Use for elements that should appear smoothly.
 */
export function FadeIn({
    children,
    className,
    duration = 0.4,
    delay = 0,
}: FadeInProps) {
    return (
        <motion.div
            className={cn(className)}
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
            transition={{ duration, delay, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    );
}

const staggerContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const staggerItemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
    },
};

interface FadeInStaggerProps {
    children: React.ReactNode;
    className?: string;
    staggerDelay?: number;
}

/**
 * FadeInStagger - Container that staggers the fade-in of its children.
 * Children should use the `FadeInStaggerItem` or have `variants` prop.
 */
export function FadeInStagger({
    children,
    className,
    staggerDelay = 0.1,
}: FadeInStaggerProps) {
    return (
        <motion.div
            className={cn(className)}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: { staggerChildren: staggerDelay },
                },
            }}
        >
            {React.Children.map(children, (child) =>
                React.isValidElement(child) ? (
                    <motion.div variants={staggerItemVariants}>{child}</motion.div>
                ) : (
                    child
                )
            )}
        </motion.div>
    );
}
