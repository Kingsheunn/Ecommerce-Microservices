export default function AboutPage() {
  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl font-medium mb-8 text-center">
            About KINGSHEUNN LUXURY
          </h1>

          <div className="prose prose-lg max-w-none space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Welcome to KINGSHEUNN LUXURY, where premium fashion meets accessible elegance.
              We believe that luxury shouldn't be out of reach, and our mission is to bring
              you the finest quality clothing and accessories at prices that make sense.
            </p>

            <h2 className="font-serif text-3xl font-medium mt-12 mb-4">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed">
              Founded with a vision to democratize luxury fashion, KINGSHEUNN LUXURY has been
              serving discerning customers who appreciate quality craftsmanship and timeless
              design. Every piece in our collection is carefully curated to ensure it meets
              our high standards of excellence.
            </p>

            <h2 className="font-serif text-3xl font-medium mt-12 mb-4">Our Values</h2>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start">
                <span className="font-semibold mr-2">Quality:</span>
                We source only the finest materials and work with skilled artisans to create
                pieces that stand the test of time.
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">Sustainability:</span>
                We're committed to ethical practices and sustainable fashion that respects
                both people and the planet.
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">Accessibility:</span>
                Luxury should be attainable. We strive to offer premium products at fair prices.
              </li>
            </ul>

            <h2 className="font-serif text-3xl font-medium mt-12 mb-4">Our Promise</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you shop with KINGSHEUNN LUXURY, you're not just buying clothes—you're
              investing in pieces that will become staples in your wardrobe for years to come.
              We stand behind every product we sell and are committed to providing exceptional
              customer service every step of the way.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
