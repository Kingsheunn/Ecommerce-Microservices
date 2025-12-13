"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Eye } from "lucide-react";
import { ProductWithCategory } from "@repo/types";

interface ProductActionsProps {
  product: ProductWithCategory;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/api/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to delete product");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(product.id);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        <Eye className="w-4 h-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{product.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
