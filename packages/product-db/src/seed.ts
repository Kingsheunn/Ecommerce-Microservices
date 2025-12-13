import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const categories = [
    { name: 'T-shirts', slug: 't-shirts' },
    { name: 'Shoes', slug: 'shoes' },
    { name: 'Accessories', slug: 'accessories' },
    { name: 'Bags', slug: 'bags' },
    { name: 'Dresses', slug: 'dresses' },
    { name: 'Jackets', slug: 'jackets' },
    { name: 'Gloves', slug: 'gloves' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  // Create products
  const products = [
    {
      name: 'Adidas CoreFit T-Shirt',
      shortDescription: 'Comfortable and stylish t-shirt for everyday wear',
      description: 'Experience ultimate comfort with this Adidas CoreFit T-Shirt. Made from high-quality materials that wick away moisture and keep you cool during workouts or casual outings.',
      price: 3990, // Price in cents
      sizes: ['s', 'm', 'l', 'xl', 'xxl'],
      colors: ['gray', 'purple', 'green'],
      images: {
        gray: '/products/1g.png',
        purple: '/products/1p.png',
        green: '/products/1gr.png',
      },
      categorySlug: 't-shirts',
    },
    {
      name: 'Puma Ultra Warm Zip',
      shortDescription: 'Warm and cozy zip-up jacket for cold weather',
      description: 'Stay warm and stylish with the Puma Ultra Warm Zip. Perfect for layering during winter activities.',
      price: 5990,
      sizes: ['s', 'm', 'l', 'xl'],
      colors: ['gray', 'green'],
      images: {
        gray: '/products/2g.png',
        green: '/products/2gr.png',
      },
      categorySlug: 'jackets',
    },
    {
      name: 'Nike Air Essentials Pullover',
      shortDescription: 'Essential pullover for your wardrobe',
      description: 'The Nike Air Essentials Pullover combines comfort and style. Made with soft fabrics and a relaxed fit.',
      price: 6990,
      sizes: ['s', 'm', 'l'],
      colors: ['green', 'blue', 'black'],
      images: {
        green: '/products/3gr.png',
        blue: '/products/3b.png',
        black: '/products/3bl.png',
      },
      categorySlug: 'jackets',
    },
    {
      name: 'Nike Dri Flex T-Shirt',
      shortDescription: 'Moisture-wicking t-shirt for active lifestyles',
      description: 'Stay dry and comfortable with the Nike Dri Flex T-Shirt. Perfect for workouts and sports activities.',
      price: 2990,
      sizes: ['s', 'm', 'l'],
      colors: ['white', 'pink'],
      images: {
        white: '/products/4w.png',
        pink: '/products/4p.png',
      },
      categorySlug: 't-shirts',
    },
    {
      name: 'Under Armour StormFleece',
      shortDescription: 'Water-resistant fleece for all weather',
      description: 'The Under Armour StormFleece provides protection from the elements while keeping you warm.',
      price: 4990,
      sizes: ['s', 'm', 'l'],
      colors: ['red', 'orange', 'black'],
      images: {
        red: '/products/5r.png',
        orange: '/products/5o.png',
        black: '/products/5bl.png',
      },
      categorySlug: 'jackets',
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
