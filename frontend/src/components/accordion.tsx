import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  question: string;
  answer: React.ReactNode;
}

/** Single-open accordion with proper button/region semantics and a smooth height transition. */
const Accordion: React.FC<{ items: AccordionItem[]; className?: string }> = ({
  items,
  className,
}) => {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <div className={cn("border-t", className)}>
      {items.map((item, index) => {
        const isOpen = open === index;
        const buttonId = `${base}-q-${index}`;
        const panelId = `${base}-a-${index}`;
        return (
          <div key={item.question} className="border-b">
            <h3 className="font-sans">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left"
              >
                <span className="font-serif text-xl font-medium tracking-tight sm:text-2xl">
                  {item.question}
                </span>
                <Plus
                  aria-hidden="true"
                  className={cn(
                    "size-5 shrink-0 transition-transform duration-200",
                    isOpen && "rotate-45",
                  )}
                />
              </button>
            </h3>
            <div
              className="disclosure"
              data-open={isOpen}
              role="region"
              id={panelId}
              aria-labelledby={buttonId}
            >
              <div inert={!isOpen}>
                <div className="text-muted-foreground max-w-2xl pb-7 leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
