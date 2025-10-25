'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface NyxCardProps {
    children: ReactNode;
    delay?: number;
    className?: string;
    onClick?: () => void;
}

export const NyxCard = ({ children, delay = 0, className = "", onClick }: NyxCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
                duration: 0.6, 
                delay,
                ease: "easeOut" 
            }}
            whileHover={{ 
                scale: onClick ? 1.02 : 1.01, 
                y: -5,
                transition: { duration: 0.2 }
            }}
            className={`
                bg-gradient-to-br from-card-dark/80 to-purple-primary/10 
                backdrop-blur-sm 
                rounded-2xl 
                border border-gray-700/50 
                hover:border-purple-primary/50 
                transition-all duration-300 
                shadow-xl 
                hover:shadow-2xl hover:shadow-purple-primary/20
                relative
                overflow-hidden
                group
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
            onClick={onClick}
        >
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Card content */}
            <div className="relative z-10 p-6">
                {children}
            </div>
        </motion.div>
    );
};