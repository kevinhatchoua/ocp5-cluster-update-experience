import { Breadcrumb, BreadcrumbItem } from "@patternfly/react-core";
import { Link } from "react-router";

interface BreadcrumbItemData {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItemData[];
  /** Extra classes on the nav (default bottom margin matches prior layout). */
  className?: string;
}

export default function Breadcrumbs({ items, className = "mb-4" }: BreadcrumbsProps) {
  return (
    <Breadcrumb className={className}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast) {
          return (
            <BreadcrumbItem key={index} isActive>
              {item.label}
            </BreadcrumbItem>
          );
        }

        if (item.path) {
          return (
            <BreadcrumbItem
              key={index}
              render={({ className: linkClass, ariaCurrent }) => (
                <Link to={item.path!} className={linkClass} aria-current={ariaCurrent ?? undefined}>
                  {item.label}
                </Link>
              )}
            />
          );
        }

        return <BreadcrumbItem key={index}>{item.label}</BreadcrumbItem>;
      })}
    </Breadcrumb>
  );
}
