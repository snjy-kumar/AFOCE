import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
    return (
        <div
            className={cn(
                'bg-white rounded-xl shadow-sm border border-[var(--color-neutral-200)] overflow-hidden',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
    children?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
    className,
    title,
    subtitle,
    action,
    children,
    ...props
}) => {
    return (
        <div
            className={cn(
                'px-6 py-4 border-b border-[var(--color-neutral-200)] flex items-center justify-between',
                className
            )}
            {...props}
        >
            {children || (
                <>
                    <div>
                        {title && (
                            <h3 className="text-lg font-semibold text-[var(--color-neutral-900)]">{title}</h3>
                        )}
                        {subtitle && (
                            <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">{subtitle}</p>
                        )}
                    </div>
                    {action && <div>{action}</div>}
                </>
            )}
        </div>
    );
};

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const CardBody: React.FC<CardBodyProps> = ({ className, children, ...props }) => {
    return (
        <div className={cn('p-6', className)} {...props}>
            {children}
        </div>
    );
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ className, children, ...props }) => {
    return (
        <div
            className={cn(
                'px-6 py-4 bg-[var(--color-neutral-50)] border-t border-[var(--color-neutral-200)]',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
