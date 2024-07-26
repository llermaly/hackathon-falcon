import React from "react";

const Button = ({
  isLoading,
  children,
  ...rest
}: {
  isLoading?: boolean;
  children: React.ReactNode;
  [x: string]: any;
}) => {
  return (
    <button disabled={isLoading} {...rest}>
      {isLoading && (
        <span className="loading loading-spinner loading-xs"></span>
      )}
      {children}
    </button>
  );
};

export default Button;
