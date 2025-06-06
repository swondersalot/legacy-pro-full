import React from "react";
import { Button as ShadcnButton } from "shadcn-ui";

type ButtonProps = React.ComponentProps<typeof ShadcnButton> & {
  children: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <ShadcnButton {...props} className="bg-blue-600 hover:bg-blue-700 text-white">
      {children}
    </ShadcnButton>
  );
};

export default Button;
