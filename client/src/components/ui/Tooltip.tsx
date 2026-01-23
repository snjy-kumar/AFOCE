import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

/**
 * Tooltip component for helpful hints throughout the app
 */

interface TooltipProps {
    content: string | React.ReactNode;
    children: React.ReactElement;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
    delay = 200,
    className,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const timeoutRef = useRef<number>(0);
    const targetRef = useRef<HTMLElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const showTooltip = () => {
        timeoutRef.current = window.setTimeout(() => {
            if (targetRef.current) {
                const rect = targetRef.current.getBoundingClientRect();
                const tooltipRect = tooltipRef.current?.getBoundingClientRect();

                let top = 0;
                let left = 0;

                switch (position) {
                    case 'top':
                        top = rect.top - (tooltipRect?.height || 0) - 8;
                        left = rect.left + rect.width / 2;
                        break;
                    case 'bottom':
                        top = rect.bottom + 8;
                        left = rect.left + rect.width / 2;
                        break;
                    case 'left':
                        top = rect.top + rect.height / 2;
                        left = rect.left - (tooltipRect?.width || 0) - 8;
                        break;
                    case 'right':
                        top = rect.top + rect.height / 2;
                        left = rect.right + 8;
                        break;
                }

                setCoords({ top, left });
                setIsVisible(true);
            }
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const positionClasses = {
        top: '-translate-x-1/2',
        bottom: '-translate-x-1/2',
        left: '-translate-y-1/2',
        right: '-translate-y-1/2',
    };

    const arrowClasses = {
        top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-[var(--color-neutral-900)] border-l-transparent border-r-transparent border-b-transparent',
        bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-b-[var(--color-neutral-900)] border-l-transparent border-r-transparent border-t-transparent',
        left: 'right-[-4px] top-1/2 -translate-y-1/2 border-l-[var(--color-neutral-900)] border-t-transparent border-b-transparent border-r-transparent',
        right: 'left-[-4px] top-1/2 -translate-y-1/2 border-r-[var(--color-neutral-900)] border-t-transparent border-b-transparent border-l-transparent',
    };

    const clonedChild = React.cloneElement(children, {
        // @ts-ignore - ref forwarding
        ref: targetRef,
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        onFocus: showTooltip,
        onBlur: hideTooltip,
    });

    return (
        <>
            {clonedChild}
            {isVisible &&
                createPortal(
                    <div
                        ref={tooltipRef}
                        className={cn(
                            'fixed z-[9999] px-3 py-2 text-xs font-medium text-white bg-[var(--color-neutral-900)] rounded-lg shadow-lg pointer-events-none',
                            'animate-in fade-in-0 zoom-in-95 duration-200',
                            positionClasses[position],
                            className
                        )}
                        style={{
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                        }}
                    >
                        {content}
                        <div
                            className={cn(
                                'absolute w-0 h-0 border-4',
                                arrowClasses[position]
                            )}
                        />
                    </div>,
                    document.body
                )}
        </>
    );
};
