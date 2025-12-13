"use client";
import {
  Footprints,
  Glasses,
  Briefcase,
  Shirt,
  ShoppingBasket,
  Hand,
  Venus,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const categories = [
  {
    name: "All",
    icon: <ShoppingBasket className="w-4 h-4" />,
    slug: "all",
  },
  {
    name: "T-shirts",
    icon: <Shirt className="w-4 h-4" />,
    slug: "T-shirts",
  },
  {
    name: "Shoes",
    icon: <Footprints className="w-4 h-4" />,
    slug: "Shoes",
  },
  {
    name: "Accessories",
    icon: <Glasses className="w-4 h-4" />,
    slug: "Accessories",
  },
  {
    name: "Bags",
    icon: <Briefcase className="w-4 h-4" />,
    slug: "Bags",
  },
  {
    name: "Dresses",
    icon: <Venus className="w-4 h-4" />,
    slug: "Dresses",
  },
  {
    name: "Jackets",
    icon: <Shirt className="w-4 h-4" />,
    slug: "Jackets",
  },
  {
    name: "Pants",
    icon: <Shirt className="w-4 h-4" />,
    slug: "Pants",
  },
];

const Categories = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedCategory = searchParams.get("category") || "all";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
      {categories.map((category) => (
        <Button
          key={category.name}
          variant={selectedCategory === category.slug ? "default" : "outline"}
          size="sm"
          onClick={() => handleChange(category.slug)}
          className="rounded-full flex items-center gap-2"
        >
          {category.icon}
          <span className="hidden sm:inline">{category.name}</span>
        </Button>
      ))}
    </div>
  );
};

export default Categories;
