import { ButtonHTMLAttributes } from "react";

const Button: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      className="rounded-lg bg-gray-200 hover:bg-gray-300 cursor-pointer p-1"
    >
      {children}
    </button>
  );
};

export default Button;