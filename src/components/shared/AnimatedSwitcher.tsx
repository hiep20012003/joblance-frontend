'use client';

import {ReactNode, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AnimatePresence, easeInOut, motion} from 'framer-motion';

interface AnimatedSwitcherProps {
    activeKey: string | number;
    children: ReactNode;
    transitionDuration?: number; // seconds
    className?: string;
    direction?: 'left' | 'right';
}

export default function AnimatedSwitcher({
                                             activeKey,
                                             children,
                                             transitionDuration = 0.3,
                                             className = '',
                                             direction = 'right',
                                         }: AnimatedSwitcherProps) {
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [containerHeight, setContainerHeight] = useState<number>(0);
    const previousKeyRef = useRef<string | number>(activeKey);

    useLayoutEffect(() => {
        if (previousKeyRef.current !== activeKey && contentRef.current) {
            const currentHeight = contentRef.current.offsetHeight;
            setContainerHeight(currentHeight);
        }
        previousKeyRef.current = activeKey;
    }, [activeKey]);

    // Đo chiều cao sau khi render xong
    useEffect(() => {
        if (!contentRef.current) return;

        const updateHeight = () => {
            if (contentRef.current) {
                setContainerHeight(contentRef.current.offsetHeight);
            }
        };

        // Đợi animation hoàn tất
        const timer = setTimeout(updateHeight, 50);

        const ro = new ResizeObserver(updateHeight);
        ro.observe(contentRef.current);

        return () => {
            clearTimeout(timer);
            ro.disconnect();
        };
    }, [activeKey]);

    const motionVariants = {
        initial: {opacity: 0, x: direction === 'right' ? -40 : 40},
        animate: {opacity: 1, x: 0},
        exit: {opacity: 0, x: direction === 'right' ? -40 : 40},
    };

    const transition = {duration: transitionDuration, ease: easeInOut};

    return (
        <motion.div
            className={`relative w-full overflow-hidden ${className}`}
            animate={{height: containerHeight || 'auto'}}
            transition={transition}
        >
            <div ref={contentRef} className="w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeKey}
                        variants={motionVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={transition}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}