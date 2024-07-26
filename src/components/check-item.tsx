import { FaCheck } from "react-icons/fa";

const CheckItem = ({
  children,
  isStrong,
}: {
  children: React.ReactNode;
  isStrong?: boolean;
}) => {
  const bg = isStrong ? "bg-blue-600" : "bg-blue-400";
  const text = isStrong
    ? "text-blue-600 uppercase font-semibold"
    : "text-gray-500";

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${bg}`}
      >
        <FaCheck className="h-2 text-white" />
      </div>
      <span className={`${text} text-xs`}>{children}</span>
    </div>
  );
};

export default CheckItem;
