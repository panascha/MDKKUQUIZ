type ButtonProps = {
  textButton: string;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ textButton, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-lg shadow transition duration-300 ${className}`}
      {...props}
    >
      {textButton}
    </button>
  );
}
