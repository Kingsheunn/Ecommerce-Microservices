import { Request, Response } from "express";
import { prisma, Prisma } from "@repo/product-db";
import { publisher } from "../utils/qstash.js";
import { StripeProductType } from "@repo/types";
import { createProductSchema, updateProductSchema, paginationSchema, validateRequest, validateQuery } from "@repo/types";

export const createProduct = [
  validateRequest(createProductSchema),
  async (req: Request, res: Response) => {
    try {
      const data = req.validatedData as Prisma.ProductCreateInput;

      const product = await prisma.product.create({ data });

      const stripeProduct: StripeProductType = {
        id: product.id.toString(),
        name: product.name,
        price: product.price,
      };

      await publisher.publish(
        `${process.env.PAYMENT_SERVICE_URL}/webhooks/products`,
        stripeProduct,
        { retries: 3 }
      );
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
];

export const updateProduct = [
  validateRequest(updateProductSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data: Prisma.ProductUpdateInput = req.validatedData;

      const updatedProduct = await prisma.product.update({
        where: { id: Number(id) },
        data,
      });

      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
];

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedProduct = await prisma.product.delete({
      where: { id: Number(id) },
    });

    await publisher.publish(
      `${process.env.PAYMENT_SERVICE_URL}/webhooks/products/delete`,
      { productId: Number(id) },
      { retries: 3 }
    );

    return res.status(200).json(deletedProduct);
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProducts = [
  validateQuery(paginationSchema),
  async (req: Request, res: Response) => {
    try {
      const { limit, sort, category, search, popular } = req.validatedQuery;

      const orderBy = (() => {
        switch (sort) {
          case "asc":
            return { price: Prisma.SortOrder.asc };
          case "desc":
            return { price: Prisma.SortOrder.desc };
          case "oldest":
            return { createdAt: Prisma.SortOrder.asc };
          default:
            return { createdAt: Prisma.SortOrder.desc };
        }
      })();

      // Handle popular products - for now show newest products
      // In a real implementation, this would use sales/popularity metrics
      const take = limit || (popular ? 5 : undefined);

      const products = await prisma.product.findMany({
        where: {
          ...(category && {
            category: {
              slug: category,
            }
          }),
          ...(search && {
            name: {
              contains: search,
              mode: "insensitive" as const,
            }
          }),
        },
        include: {
          category: true,
        },
        orderBy,
        take,
      });

      res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
];

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
