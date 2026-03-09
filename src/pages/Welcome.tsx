import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import pommeIcon from "@/assets/pomme-icon.png";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, hsl(48 60% 96%) 0%, hsl(95 25% 92%) 40%, hsl(90 30% 88%) 70%, hsl(95 20% 85%) 100%)",
      }}
    >
      {/* Soft radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 45%, hsl(90 35% 75% / 0.25), transparent)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-8 w-full max-w-sm">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <img
            src={pommeIcon}
            alt="Pomme logo"
            className="w-24 h-24 drop-shadow-sm"
          />
        </motion.div>

        {/* App name */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="text-4xl font-extrabold tracking-tight text-foreground mb-4"
        >
          Pomme
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-base leading-relaxed text-muted-foreground max-w-[280px] font-medium"
        >
          Shared chores, simple schedules, and fair rotations for roommate life.
        </motion.p>
      </div>

      {/* Bottom CTA area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.85 }}
        className="absolute bottom-0 left-0 right-0 px-8 pb-12 pt-8 flex flex-col items-center gap-3 w-full max-w-sm mx-auto"
      >
        <button
          onClick={() => navigate("/auth?mode=signup")}
          className="w-full py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Get Started
        </button>

        <button
          onClick={() => navigate("/auth?mode=login")}
          className="w-full py-3 rounded-2xl font-semibold text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign In
        </button>
      </motion.div>
    </motion.div>
  );
};

export default Welcome;
