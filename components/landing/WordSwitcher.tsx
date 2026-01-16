"use client";

import { AnimatePresence, motion } from "framer-motion";

interface WordSwitcherProps {
  words: string[];
  index: number;
}

export function WordSwitcher({ words, index }: WordSwitcherProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={words[index]}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
      >
        {words[index]}
      </motion.span>
    </AnimatePresence>
  );
}
