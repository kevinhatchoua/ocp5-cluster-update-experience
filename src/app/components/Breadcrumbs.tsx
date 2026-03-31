import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-[8px] text-[14px] mb-[16px]">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-[8px]">
          {index > 0 && (
            <ChevronRight className="size-[14px] text-[#4d4d4d] dark:text-[#b0b0b0]" />
          )}
          {item.path && index < items.length - 1 ? (
            <Link
              to={item.path}
              className="text-[#0066cc] dark:text-[#4dabf7] hover:underline font-['Red_Hat_Text_VF:Regular',sans-serif]"
            >
              {item.label}
            </Link>
          ) : (
            <span className={index === items.length - 1 ? "text-[#151515] dark:text-white font-medium font-['Red_Hat_Text_VF:Regular',sans-serif]" : "text-[#4d4d4d] dark:text-[#b0b0b0] font-['Red_Hat_Text_VF:Regular',sans-serif]"}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}