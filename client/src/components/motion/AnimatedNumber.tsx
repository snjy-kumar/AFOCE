import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '../../lib/utils';

interface AnimatedNumberProps {
    value: number;
    className?: string;
    formatFn?: (value: number) => string;
    duration?: number;
}

/**
 * AnimatedNumber - Smoothly animates between number values.
 * Great for dashboard stats, counters, and financial figures.
 * 
 * @example
 * <AnimatedNumber value={1234.56} formatFn={(n) => `NPR ${n.toFixed(2)}`} />
 */
export function AnimatedNumber({
    value,
    className,
    formatFn = (n) => n.toLocaleString(),
    duration = 0.8,
}: AnimatedNumberProps) {
    const spring = useSpring(0, {
        mass: 1,
        stiffness: 75,
        damping: 15,
    });

    const display = useTransform(spring, (current) =>
        formatFn(Math.round(current * 100) / 100)
    );

    const [displayValue, setDisplayValue] = useState(formatFn(0));

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    useEffect(() => {
        const unsubscribe = display.on('change', (latest) => {
            setDisplayValue(latest);
        });
        return unsubscribe;
    }, [display]);

    return (
        <motion.span className={cn('tabular-nums', className)}>
            {displayValue}
        </motion.span>
    );
}

interface CountUpProps {
    from?: number;
    to: number;
    className?: string;
    formatFn?: (value: number) => string;
    delay?: number;
}

/**
 * CountUp - Counts up from one number to another on mount.
 * Use for initial page load animations.
 */
export function CountUp({
    from = 0,
    to,
    className,
    formatFn = (n) => n.toLocaleString(),
    delay = 0,
}: CountUpProps) {
    const [value, setValue] = useState(from);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (hasAnimated.current) return;

        const timer = setTimeout(() => {
            setValue(to);
            hasAnimated.current = true;
        }, delay * 1000);

        return () => clearTimeout(timer);
    }, [to, delay]);

    return (
        <AnimatedNumber
            value={value}
            className={className}
            formatFn={formatFn}
        />
    );
}
