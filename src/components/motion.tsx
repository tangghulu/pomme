import { motion, type HTMLMotionProps } from "framer-motion";
import React from "react";

export const PageTransition = ({ children, className, ...props }: HTMLMotionProps<"div"> & { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerContainer = ({ children, className, ...props }: HTMLMotionProps<"div"> & { children: React.ReactNode }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: {},
      visible: { transition: { staggerChildren: 0.06 } },
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className, ...props }: HTMLMotionProps<"div"> & { children: React.ReactNode }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 16 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const FadeIn = ({ children, delay = 0, className, ...props }: HTMLMotionProps<"div"> & { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const ScaleIn = ({ children, delay = 0, className, ...props }: HTMLMotionProps<"div"> & { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.35, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);
