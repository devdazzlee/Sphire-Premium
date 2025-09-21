import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const featuredProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: "$199.99",
    originalPrice: "$249.99",
    image: "/premium-wireless-headphones.png",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: "$299.99",
    originalPrice: "$399.99",
    image: "/modern-smart-watch.png",
    badge: "New Arrival",
  },
  {
    id: 3,
    name: "Laptop Backpack",
    price: "$79.99",
    originalPrice: "$99.99",
    image: "/professional-laptop-backpack.png",
    badge: "Sale",
  },
  {
    id: 4,
    name: "Bluetooth Speaker",
    price: "$149.99",
    originalPrice: "$199.99",
    image: "/portable-bluetooth-speaker.png",
    badge: "Featured",
  },
]

export function FeaturedProducts() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4 font-sans">Featured Products</h2>
          <p className="text-lg text-muted-foreground font-serif">Handpicked items just for you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-card border-border"
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">{product.badge}</Badge>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-card-foreground mb-2 font-sans">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-bold text-primary">{product.price}</span>
                    <span className="text-sm text-muted-foreground line-through">{product.originalPrice}</span>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  )
}
