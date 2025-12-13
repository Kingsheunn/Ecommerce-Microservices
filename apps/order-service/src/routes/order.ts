import { FastifyInstance } from "fastify";
import { shouldBeAdmin, shouldBeUser } from "../middleware/authMiddleware.js";
import { Order } from "@repo/order-db";
import { startOfMonth, subMonths } from "date-fns";
import { OrderChartType } from "@repo/types";

export const orderRoute = async (fastify: FastifyInstance) => {
  fastify.get(
    "/api/user-orders",
    { preHandler: shouldBeUser },
    async (request, reply) => {
      try {
        const orders = await Order.find({ userId: request.userId });
        return reply.send(orders);
      } catch (error) {
        console.error("Error fetching user orders:", error);
        return reply.status(500).send({ error: "Failed to fetch user orders" });
      }
    }
  );
  fastify.get(
    "/api/orders",
    { preHandler: shouldBeAdmin },
    async (request, reply) => {
      try {
        const { limit } = request.query as { limit?: string };
        const limitNum = limit ? parseInt(limit, 10) : 10; // Default to 10 if not provided
        const orders = await Order.find().limit(limitNum).sort({ createdAt: -1 });
        return reply.send(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        return reply.status(500).send({ error: "Failed to fetch orders" });
      }
    }
  );
  fastify.get(
    "/api/order-chart",
    { preHandler: shouldBeAdmin },
    async (request, reply) => {
      try {
        const now = new Date();
        const sixMonthsAgo = startOfMonth(subMonths(now, 5));

        // { month: "April", total: 173, successful: 100 }

        const raw = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: sixMonthsAgo, $lte: now },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              total: { $sum: 1 },
              successful: {
                $sum: {
                  $cond: [{ $eq: ["$status", "success"] }, 1, 0],
                  // {
                  //   "year":2025,
                  //   "month":9,
                  //   "total":100,
                  //   "successful":72
                  // }
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              year: "$_id.year",
              month: "$_id.month",
              total: 1,
              successful: 1,
            },
          },
          {
            $sort: { year: 1, month: 1 },
          },
        ]);

        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

        const results: OrderChartType[] = [];

        for (let i = 5; i >= 0; i--) {
          const d = subMonths(now, i);
          const year = d.getFullYear();
          const month = d.getMonth() + 1;

          const match = raw.find(
            (item) => item.year === year && item.month === month
          );

          results.push({
            month: monthNames[month - 1] as string,
            total: match ? match.total : 0,
            successful: match ? match.successful : 0,
          });
        }

        return reply.send(results);
      } catch (error) {
        console.error("Error fetching order chart:", error);
        return reply.status(500).send({ error: "Failed to fetch order chart data" });
      }
    }
  );
};
