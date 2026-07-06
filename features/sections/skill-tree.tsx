"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type { SkillGraphData } from "@/lib/types";

const PublicSkillTree = dynamic(
  () =>
    import("@/features/skills/public-skill-tree").then(
      (mod) => mod.PublicSkillTree
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[70vh] items-center justify-center text-sm text-muted-foreground">
        Loading skill tree…
      </div>
    ),
  }
);

export function SkillTreeSection({ graph }: { graph: SkillGraphData }) {
  return (
    <section id="skills" className="relative">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <PublicSkillTree graph={graph} />
      </motion.div>
    </section>
  );
}
