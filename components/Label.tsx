import { ButtonHTMLAttributes } from "react";

interface Props {
  text: string;
  containerElement?: keyof JSX.IntrinsicElements;
}

const Label: React.FC<Props & ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  containerElement = "label",
  text,
}) => {
  const ContainerElement = containerElement;

  return (
    <ContainerElement className="block pb-3">
      <span className="font-bold block">{text}</span>
      {children}
    </ContainerElement>
  );
};

export default Label;
