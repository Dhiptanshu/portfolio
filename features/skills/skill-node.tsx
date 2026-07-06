"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Sparkles, ArrowRight } from "lucide-react";
import type { SkillNodeData } from "@/features/skills/skill-graph-utils";

function SkillNodeComponent({ data, selected }: NodeProps<SkillNodeData>) {
  const { skill, categoryName, readonly } = data;
  const isMastered = skill.level >= 5;

  return (
    <div
      className={`rpg-panel relative w-64 p-4 transition-transform duration-200 cursor-pointer ${
        selected ? "-translate-y-2 shadow-[8px_8px_0px_hsl(var(--border))]" : ""
      }`}
      style={{
        backgroundColor: selected ? 'hsl(var(--card))' : 'hsl(var(--background))',
        borderColor: selected ? skill.color_theme || 'hsl(var(--primary))' : 'hsl(var(--border))',
      }}
    >
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !rounded-sm !border-2 !border-border !bg-background" isConnectable={!readonly} />
      
      <div className="flex justify-between items-start mb-2 border-b-2 border-dashed border-border/30 pb-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{categoryName}</p>
        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border-2 border-border ${isMastered ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
          Lv. {skill.level}
        </span>
      </div>
      
      <div className="flex items-center gap-3 mb-2">
        <div className="p-1.5 rounded bg-card border-2 border-border" style={{ color: skill.color_theme || 'hsl(var(--primary))' }}>
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="font-black text-lg text-foreground leading-tight">{skill.name}</h3>
      </div>
      
      <p className="mt-2 text-xs font-medium leading-relaxed text-muted-foreground line-clamp-2">
        {skill.description}
      </p>
      
      <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase text-muted-foreground">
        <span>{skill.xp.toLocaleString()} EXP</span>
        {selected && <ArrowRight className="w-3 h-3 text-primary animate-pulse" />}
      </div>

      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !rounded-sm !border-2 !border-border !bg-background" isConnectable={!readonly} />
    </div>
  );
}

export const SkillNode = memo(SkillNodeComponent);
