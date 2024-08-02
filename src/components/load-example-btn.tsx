import React from "react";
import Button from "./button";
import { FaChevronRight } from "react-icons/fa6";
import useApp from "@/hooks/use-app";

const LoadExampleButton = () => {
  const { handleLoadExamples } = useApp();

  return (
    <Button
      onClick={handleLoadExamples}
      className="btn btn-primary btn-xs text-white"
    >
      Load example <FaChevronRight className="h-3 text-white" />
    </Button>
  );
};

export default LoadExampleButton;
