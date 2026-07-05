"use client";

import { useCallback, useMemo, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap, useEdgesState, useNodesState, type Node } from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import { SkillNode } from "@/features/skills/skill-node";
import { buildSkillEdges, buildSkillNodes, getSkillStats, type SkillNodeData } from "@/features/skills/skill-graph-utils";
import { SkillDetailModal } from "@/features/skills/skill-detail-modal";
import type { Skill, SkillGraphData } from "@/lib/types";

const nodeTypes = { skill: SkillNode };

export function PublicSkillTree({ graph }: { graph: SkillGraphData }) {
  const initialNodes = useMemo(() => buildSkillNodes(graph, true), [graph]);
  const initialEdges = useMemo(() => buildSkillEdges(graph.relationships), [graph.relationships]);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const stats = getSkillStats(graph.skills);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<SkillNodeData>) => {
    setSelectedSkill(node.data.skill);
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 luxury-grid opacity-55" />
      <div className="absolute left-0 right-0 top-0 z-10 border-b border-border bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <p className="text-xs uppercase tracking-[0.24em] text-primary">Skill Tree</p>
            <h1 className="mt-2 font-serif text-3xl md:text-5xl">Technical progression map</h1>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Stat label="Total Skills" value={stats.totalSkills.toString()} />
            <Stat label="Total XP" value={stats.totalXp.toLocaleString()} />
            <Stat label="Highest Skill" value={stats.highest?.name ?? "None"} />
            <Stat label="Max Level" value={stats.highest ? `Lv ${stats.highest.level}` : "0"} />
            <Stat label="Completion" value={`${stats.completion}%`} />
          </div>
        </div>
      </div>
      <motion.div className="h-full pt-52 md:pt-48" initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.65 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.25, duration: 900 }}
          minZoom={0.25}
          maxZoom={1.8}
          nodesDraggable={false}
          nodesConnectable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="rgba(222, 200, 156, 0.18)" gap={28} />
          <Controls className="!border-border !bg-card !text-foreground" />
          <MiniMap pannable zoomable nodeColor={(node) => node.data.skill.color_theme} maskColor="rgba(5, 6, 8, 0.72)" />
        </ReactFlow>
      </motion.div>
      <SkillDetailModal skill={selectedSkill} graph={graph} onClose={() => setSelectedSkill(null)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/80 p-3 backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-primary">{value}</p>
    </div>
  );
}
