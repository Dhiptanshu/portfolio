"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Award, Sparkles } from "lucide-react";
import type { SkillNodeData } from "@/features/skills/skill-graph-utils";

function SkillNodeComponent({ data, selected }: NodeProps<SkillNodeData>) {
  const { skill, categoryName, readonly } = data;
  const progress = Math.min(100, Math.round((skill.xp % 1000) / 10));

  return (
    <div
      className="group relative w-60 rounded-lg border bg-card/95 p-4 shadow-2xl backdrop-blur transition-transform duration-200 hover:-translate-y-1"
      style={{
        borderColor: selected ? skill.color_theme : "rgba(222, 200, 156, 0.24)",
        boxShadow: selected ? `0 0 34px ${skill.color_theme}55` : `0 0 24px ${skill.color_theme}22`
      }}
    >
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-background !bg-primary" isConnectable={!readonly} />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-secondary" style={{ color: skill.color_theme }}>
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="line-clamp-1 text-sm font-semibold text-foreground">{skill.name}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">{categoryName}</p>
          </div>
        </div>
        <div className="rounded-full border border-border bg-background px-2 py-1 text-xs text-primary">Lv {skill.level}</div>
      </div>
      <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">{skill.description}</p>
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Award className="h-3 w-3" />{skill.xp.toLocaleString()} XP</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: skill.color_theme }} />
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-background !bg-primary" isConnectable={!readonly} />
    </div>
  );
}

export const SkillNode = memo(SkillNodeComponent);
