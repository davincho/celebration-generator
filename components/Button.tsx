import { ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-green-200 border-green-200 text-green-900 border-2 hover:bg-green-300 hover:border-green-700 active:bg-green-400",
  default:
    "bg-white border-gray-200 border-2 hover:border-gray-400 active:bg-gray-100",
};

interface Props {
  variant?: keyof typeof variants;
}

const Button: React.FC<Props & ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  variant = "default",
  ...props
}) => {
  return (
    <button
      {...props}
      className={`rounded-lg cursor-pointer p-2 block ${variants[variant]}`}
    >
      {children}
    </button>
  );
};

export default Button;
