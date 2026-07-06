import dagre from "dagre";
import type { Edge, Node } from "reactflow";
import type { Skill, SkillGraphData, SkillProjectLink, SkillRelationship } from "@/lib/types";

export type SkillNodeData = {
  skill: Skill;
  categoryName: string;
  projectLinks: SkillProjectLink[];
  parentIds: string[];
  childIds: string[];
  readonly?: boolean;
};

export function getSkillStats(skills: Skill[]) {
  const totalXp = skills.reduce((sum, skill) => sum + skill.xp, 0);
  const highest = skills.toSorted((a, b) => b.level - a.level || b.xp - a.xp)[0] ?? null;
  const visibleCount = skills.filter((skill) => skill.is_visible).length;
  return {
    totalSkills: skills.length,
    totalXp,
    highest,
    completion: skills.length ? Math.round((visibleCount / skills.length) * 100) : 0
  };
}

export function buildSkillNodes(data: SkillGraphData, readonly = true): Node<SkillNodeData>[] {
  const categories = data.categories || [];
  const projectLinks = data.projectLinks || [];
  const relationships = data.relationships || [];

  return data.skills.map((skill) => ({
    id: skill.id,
    type: "skill",
    position: { x: skill.node_x, y: skill.node_y },
    data: {
      skill,
      categoryName: skill.skill_categories?.name ?? categories.find((category) => category.id === skill.category_id)?.name ?? "Other",
      projectLinks: projectLinks.filter((link) => link.skill_id === skill.id),
      parentIds: relationships.filter((relationship) => relationship.child_skill_id === skill.id).map((relationship) => relationship.parent_skill_id),
      childIds: relationships.filter((relationship) => relationship.parent_skill_id === skill.id).map((relationship) => relationship.child_skill_id),
      readonly
    }
  }));
}

export function buildSkillEdges(relationships: SkillRelationship[]): Edge[] {
  return relationships.map((relationship) => ({
    id: relationship.id,
    source: relationship.parent_skill_id,
    target: relationship.child_skill_id,
    animated: true,
    type: "smoothstep",
    style: { stroke: "rgba(222, 200, 156, 0.62)", strokeWidth: 2 }
  }));
}

export function layoutWithDagre(nodes: Node<SkillNodeData>[], edges: Edge[]) {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "LR", nodesep: 90, ranksep: 150 });
  nodes.forEach((node) => graph.setNode(node.id, { width: 240, height: 112 }));
  edges.forEach((edge) => graph.setEdge(edge.source, edge.target));
  dagre.layout(graph);
  return nodes.map((node) => {
    const layoutNode = graph.node(node.id);
    return {
      ...node,
      position: {
        x: layoutNode.x - 120,
        y: layoutNode.y - 56
      }
    };
  });
}
