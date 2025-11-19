"use client";

interface StatusBadgeProps {
  verified: boolean;
}

export const StatusBadge = ({ verified }: StatusBadgeProps) => {
  const text = verified ? "Verified" : "Pending";
  const a11yText = verified
    ? "Email is verified"
    : "Email is pending verification";
  const colors = verified
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";

  return (
    <span
      aria-label={a11yText}
      className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${colors}`}
    >
      {text}
    </span>
  );
};
