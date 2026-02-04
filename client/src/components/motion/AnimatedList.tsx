import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '../../lib/utils';

const listContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1,
        },
    },
};

const listItemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 0.95,
        transition: {
            duration: 0.2,
            ease: 'easeIn',
        },
    },
};

interface AnimatedListProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * AnimatedList - A container for animated list items.
 * Children will stagger in and animate out when removed.
 */
export function AnimatedList({ children, className }: AnimatedListProps) {
    return (
        <motion.ul
            className={cn('space-y-3', className)}
            initial="hidden"
            animate="visible"
            variants={listContainerVariants}
        >
            <AnimatePresence mode="popLayout">
                {children}
            </AnimatePresence>
        </motion.ul>
    );
}

interface AnimatedListItemProps {
    children: React.ReactNode;
    className?: string;
    layoutId?: string;
}

/**
 * AnimatedListItem - Individual item in an AnimatedList.
 * Must have a unique `key` prop for proper exit animations.
 */
export function AnimatedListItem({
    children,
    className,
    layoutId,
}: AnimatedListItemProps) {
    return (
        <motion.li
            layout
            layoutId={layoutId}
            variants={listItemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(className)}
        >
            {children}
        </motion.li>
    );
}
