import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
  categories: string[];
}

export default function CategoryFilter({ selected, onSelect, categories }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selected === category ? "default" : "outline"}
          onClick={() => onSelect(category)}
          className={`rounded-full px-6 uppercase text-xs font-medium tracking-wide ${
            selected === category ? "" : "hover-elevate"
          }`}
          data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, "-")}`}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
