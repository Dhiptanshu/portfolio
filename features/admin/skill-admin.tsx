"use client";

import { useCallback, useMemo, useState } from "react";
import ReactFlow, { addEdge, Background, Controls, MiniMap, useEdgesState, useNodesState, type Connection, type Edge, type Node, type NodeDragHandler } from "reactflow";
import "reactflow/dist/style.css";
import { Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SkillNode } from "@/features/skills/skill-node";
import { buildSkillEdges, buildSkillNodes, getSkillStats, type SkillNodeData } from "@/features/skills/skill-graph-utils";
import { slugify } from "@/lib/utils";
import type { Entry, Skill, SkillCategory, SkillGraphData } from "@/lib/types";

const nodeTypes = { skill: SkillNode };

export function SkillAdmin({ initialGraph, entries }: { initialGraph: SkillGraphData; entries: Entry[] }) {
  const [graph, setGraph] = useState(initialGraph);
  const [nodes, setNodes, onNodesChange] = useNodesState(useMemo(() => buildSkillNodes(initialGraph, false), [initialGraph]));
  const [edges, setEdges, onEdgesChange] = useEdgesState(useMemo(() => buildSkillEdges(initialGraph.relationships), [initialGraph.relationships]));
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(initialGraph.skills[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [newCategoryName, setNewCategoryName] = useState("");
  const stats = getSkillStats(graph.skills);
  const selectedSkill = graph.skills.find((skill) => skill.id === selectedSkillId) ?? null;

  const filteredSkills = graph.skills.filter((skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || skill.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  async function createSkill() {
    const baseName = "New Skill";
    const response = await fetch("/api/skills", {
      method: "POST",
      body: JSON.stringify({
        name: baseName,
        slug: `${slugify(baseName)}-${Date.now()}`,
        description: "Describe this skill and the journey behind it.",
        xp: 100,
        color_theme: "#dec89c",
        node_x: 80,
        node_y: 80,
        category_id: graph.categories[0]?.id ?? null,
        is_visible: true
      })
    });
    if (!response.ok) return;
    const skill = (await response.json()) as Skill;
    const nextGraph = { ...graph, skills: [skill, ...graph.skills] };
    setGraph(nextGraph);
    setNodes(buildSkillNodes(nextGraph, false));
    setSelectedSkillId(skill.id);
  }

  async function duplicateSkill(skill: Skill) {
    const response = await fetch("/api/skills", {
      method: "POST",
      body: JSON.stringify({
        ...skill,
        name: `${skill.name} Copy`,
        slug: `${skill.slug}-copy-${Date.now()}`,
        node_x: skill.node_x + 80,
        node_y: skill.node_y + 80
      })
    });
    if (!response.ok) return;
    const copySkill = (await response.json()) as Skill;
    const nextGraph = { ...graph, skills: [copySkill, ...graph.skills] };
    setGraph(nextGraph);
    setNodes(buildSkillNodes(nextGraph, false));
  }

  async function updateSkill(id: string, patch: Partial<Skill>) {
    const response = await fetch("/api/skills", { method: "PATCH", body: JSON.stringify({ id, ...patch }) });
    if (!response.ok) return;
    const updated = (await response.json()) as Skill;
    const nextGraph = { ...graph, skills: graph.skills.map((skill) => (skill.id === id ? updated : skill)) };
    setGraph(nextGraph);
    setNodes((current) => current.map((node) => (node.id === id ? { ...node, data: buildSkillNodes(nextGraph, false).find((nextNode) => nextNode.id === id)!.data } : node)));
  }

  async function deleteSkill(id: string) {
    const response = await fetch("/api/skills", { method: "DELETE", body: JSON.stringify({ id }) });
    if (!response.ok) return;
    const nextGraph = {
      ...graph,
      skills: graph.skills.filter((skill) => skill.id !== id),
      relationships: graph.relationships.filter((relationship) => relationship.parent_skill_id !== id && relationship.child_skill_id !== id),
      projectLinks: graph.projectLinks.filter((link) => link.skill_id !== id)
    };
    setGraph(nextGraph);
    setNodes((current) => current.filter((node) => node.id !== id));
    setEdges((current) => current.filter((edge) => edge.source !== id && edge.target !== id));
    setSelectedSkillId(nextGraph.skills[0]?.id ?? null);
  }

  const onConnect = useCallback(async (connection: Connection) => {
    if (!connection.source || !connection.target) return;
    const response = await fetch("/api/skill-relationships", { method: "POST", body: JSON.stringify({ parent_skill_id: connection.source, child_skill_id: connection.target }) });
    if (!response.ok) return;
    const relationship = await response.json();
    setGraph((current) => ({ ...current, relationships: [...current.relationships, relationship] }));
    setEdges((current) => addEdge({ ...connection, id: relationship.id, animated: true, type: "smoothstep", style: { stroke: "rgba(222, 200, 156, 0.62)", strokeWidth: 2 } }, current));
  }, [setEdges]);

  const onNodeDragStop: NodeDragHandler = useCallback(async (_, node: Node<SkillNodeData>) => {
    await updateSkill(node.id, { node_x: node.position.x, node_y: node.position.y } as Partial<Skill>);
  }, [graph.skills]);

  async function deleteEdge(edge: Edge) {
    const response = await fetch("/api/skill-relationships", { method: "DELETE", body: JSON.stringify({ id: edge.id }) });
    if (!response.ok) return;
    setEdges((current) => current.filter((item) => item.id !== edge.id));
    setGraph((current) => ({ ...current, relationships: current.relationships.filter((relationship) => relationship.id !== edge.id) }));
  }

  async function createCategory() {
    const response = await fetch("/api/skill-categories", { method: "POST", body: JSON.stringify({ name: newCategoryName, display_order: graph.categories.length }) });
    if (!response.ok) return;
    setGraph({ ...graph, categories: [...graph.categories, await response.json()] });
    setNewCategoryName("");
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Skills" value={stats.totalSkills.toString()} />
        <Stat label="Visible" value={graph.skills.filter((skill) => skill.is_visible).length.toString()} />
        <Stat label="Total XP" value={stats.totalXp.toLocaleString()} />
        <Stat label="Highest" value={stats.highest?.name ?? "None"} />
        <Stat label="Completion" value={`${stats.completion}%`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <aside className="grid max-h-[720px] gap-4 overflow-auto rounded-lg border border-border bg-card p-4">
          <div className="grid gap-3">
            <Input placeholder="Search skills" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">All categories</option>
              {graph.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <Button onClick={createSkill}><Plus className="h-4 w-4" />Create skill</Button>
          </div>

          <div className="grid gap-2">
            {filteredSkills.map((skill) => (
              <button key={skill.id} className="rounded-md border border-border p-3 text-left hover:bg-secondary" onClick={() => setSelectedSkillId(skill.id)}>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{skill.name}</span>
                  <span className="text-xs text-primary">Lv {skill.level}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{skill.xp.toLocaleString()} XP</p>
              </button>
            ))}
          </div>

          <div className="grid gap-2 border-t border-border pt-4">
            <p className="text-sm font-semibold">Custom categories</p>
            <div className="flex gap-2">
              <Input placeholder="Category" value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} />
              <Button size="icon" onClick={createCategory} disabled={!newCategoryName} aria-label="Create category"><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
        </aside>

        <section className="min-h-[720px] overflow-hidden rounded-lg border border-border bg-background">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedSkillId(node.id)}
            onNodeDragStop={onNodeDragStop}
            onEdgeDoubleClick={(_, edge) => deleteEdge(edge)}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="rgba(222, 200, 156, 0.16)" gap={28} />
            <Controls className="!border-border !bg-card !text-foreground" />
            <MiniMap pannable zoomable nodeColor={(node) => node.data.skill.color_theme} maskColor="rgba(5, 6, 8, 0.72)" />
          </ReactFlow>
        </section>
      </div>

      {selectedSkill ? (
        <SkillEditor
          skill={selectedSkill}
          categories={graph.categories}
          entries={entries}
          linkedEntryIds={graph.projectLinks.filter((link) => link.skill_id === selectedSkill.id).map((link) => link.entry_id)}
          onUpdate={updateSkill}
          onDelete={deleteSkill}
          onDuplicate={duplicateSkill}
          onLinkChange={async (entryId, linked) => {
            const response = await fetch("/api/skill-project-links", { method: linked ? "POST" : "DELETE", body: JSON.stringify({ skill_id: selectedSkill.id, entry_id: entryId }) });
            if (!response.ok) return;
            if (linked) setGraph({ ...graph, projectLinks: [...graph.projectLinks, await response.json()] });
            else setGraph({ ...graph, projectLinks: graph.projectLinks.filter((link) => !(link.skill_id === selectedSkill.id && link.entry_id === entryId)) });
          }}
        />
      ) : null}
    </div>
  );
}

function SkillEditor({ skill, categories, entries, linkedEntryIds, onUpdate, onDelete, onDuplicate, onLinkChange }: { skill: Skill; categories: SkillCategory[]; entries: Entry[]; linkedEntryIds: string[]; onUpdate: (id: string, patch: Partial<Skill>) => void; onDelete: (id: string) => void; onDuplicate: (skill: Skill) => void; onLinkChange: (entryId: string, linked: boolean) => void }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl">Edit {skill.name}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onUpdate(skill.id, { is_visible: !skill.is_visible })}>{skill.is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{skill.is_visible ? "Hide" : "Show"}</Button>
          <Button variant="outline" onClick={() => onDuplicate(skill)}><Copy className="h-4 w-4" />Duplicate</Button>
          <Button variant="destructive" onClick={() => onDelete(skill.id)}><Trash2 className="h-4 w-4" />Delete</Button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input value={skill.name} onChange={(event) => onUpdate(skill.id, { name: event.target.value, slug: slugify(event.target.value) })} />
        <Input value={skill.icon ?? ""} placeholder="Icon name" onChange={(event) => onUpdate(skill.id, { icon: event.target.value })} />
        <Input type="number" value={skill.xp} onChange={(event) => onUpdate(skill.id, { xp: Number(event.target.value) })} />
        <Input type="color" value={skill.color_theme} onChange={(event) => onUpdate(skill.id, { color_theme: event.target.value })} />
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={skill.category_id ?? ""} onChange={(event) => onUpdate(skill.id, { category_id: event.target.value || null })}>
          <option value="">No category</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <Input value={skill.slug} onChange={(event) => onUpdate(skill.id, { slug: slugify(event.target.value) })} />
        <Textarea className="md:col-span-2" value={skill.description ?? ""} onChange={(event) => onUpdate(skill.id, { description: event.target.value })} />
      </div>
      <div className="mt-5">
        <p className="text-sm font-semibold">Related projects</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {entries.map((entry) => {
            const linked = linkedEntryIds.includes(entry.id);
            return (
              <label key={entry.id} className="flex items-center gap-2 rounded-md border border-border p-3 text-sm">
                <input type="checkbox" checked={linked} onChange={(event) => onLinkChange(entry.id, event.target.checked)} />
                <span>{entry.title}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 truncate text-xl font-semibold text-primary">{value}</p></div>;
}
