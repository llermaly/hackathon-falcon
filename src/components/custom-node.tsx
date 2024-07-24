import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

function CustomNode({ data }: any) {
  return (
    <div className="rounded-md border-2 border-stone-400 bg-white px-4 py-2 shadow-md">
      <div className="flex">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          {data.emoji}
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold">{data.skill}</div>
          {/* <div className="text-gray-500">{data.description}</div> */}
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-teal-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-teal-500"
      />
    </div>
  );
}

export default memo(CustomNode);
