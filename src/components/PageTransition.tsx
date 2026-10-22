import React from 'react';
import { motion, AnimatePresence, Transition, Variants } from 'framer-motion';

export interface PageTransitionProps {
  children: React.ReactNode;
  routeKey: string;
  className?: string;
}

/**
 * Page transition variants:
 * - Entering page slides in from the right (x: 40) and fades in (opacity: 0 -> 1)
 * - Exiting page slides slightly to the left (x: -30) and fades out (opacity: 1 -> 0)
 * - Timing: duration of 0.4 seconds with 'easeOut'
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    x: 40,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -30,
  },
};

export const pageTransition: Transition = {
  duration: 0.4,
  ease: 'easeOut',
};

/**
 * PageTransition wrapper component
 * Wrap active page/view components inside this wrapper with their active routeKey.
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  routeKey,
  className = 'w-full flex-1 flex flex-col',
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
