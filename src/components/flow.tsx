"use client";
import React, { useCallback } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
} from "@xyflow/react";

import "@xyflow/react/dist/base.css";

import CustomNode from "./custom-node";
import { RecommendationsData } from "@/server/api/routers/post";

const nodeTypes = {
  custom: CustomNode,
};

const initNodes = [
  {
    id: "1",
    type: "custom",
    data: { name: "Jane Doe", job: "CEO", emoji: "😎" },
    position: { x: 0, y: 50 },
  },
  {
    id: "2",
    type: "custom",
    data: { name: "Tyler Weary", job: "Designer", emoji: "🤓" },

    position: { x: -200, y: 200 },
  },
  {
    id: "3",
    type: "custom",
    data: { name: "Kristi Price", job: "Developer", emoji: "🤩" },
    position: { x: 200, y: 200 },
  },
];

const initEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
  },
];

interface Props {
  recommendationsData: RecommendationsData;
}

const Flow = ({ recommendationsData }: Props) => {
  console.log(recommendationsData);

  const buildNodesAndEdges = () => {
    const getPosition = (index: number) => {
      return { x: 1, y: 200 + index * 200 };
    };

    const nodes = recommendationsData.recommendations.map((skill, index) => ({
      id: skill.order.toString(),
      type: "custom",
      data: skill,
      position: getPosition(index),
    }));

    const edges = nodes.map((skill) => ({
      id: `e${skill.id}-${skill.id + 1}`,
      source: skill.id.toString(),
      target: (skill.data.order + 1).toString(),
    }));

    return { nodes, edges };
  };

  const { nodes: initNodes, edges: initEdges } = buildNodesAndEdges();

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  return (
    <div className="mt-4 h-[500px] w-full rounded-md bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default Flow;
