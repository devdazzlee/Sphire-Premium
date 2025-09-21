import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

export function PromoGrid() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-auto">
        <div className="bg-amber-100 rounded-lg p-6 flex flex-col justify-between min-h-[280px]">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Vacuums & more under $150</h3>
            <Button variant="link" className="p-0 h-auto text-blue-600 font-medium">
              Shop now
            </Button>
          </div>
          <div className="mt-4">
            <img src="/robot-vacuum-cleaner.png" alt="Robot vacuum" className="w-full h-24 object-contain" />
          </div>
        </div>

        <div className="bg-sky-200 rounded-lg p-6 flex flex-col justify-between min-h-[280px]">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Backpacks from Wonder Nation, Pokémon & more</h3>
            <Button variant="link" className="p-0 h-auto text-blue-600 font-medium">
              Shop now
            </Button>
          </div>
          <div className="mt-4">
            <img src="/colorful-school-backpacks-pokemon.png" alt="School backpacks" className="w-full h-24 object-contain" />
          </div>
        </div>

        <div className="lg:col-span-2 bg-sky-100 rounded-lg p-8 flex items-center justify-between min-h-[280px] relative">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">Your fave brands, for less</p>
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Resold at
              <br />
              Walmart
            </h2>
            <Button className="bg-white text-blue-600 hover:bg-gray-50 border border-blue-600 rounded-full px-6">
              Shop now
            </Button>
          </div>
          <div className="flex-1 flex justify-center">
            <img src="/apple-watch-white-band.png" alt="Apple Watch" className="w-48 h-48 object-contain" />
          </div>
          <Button
            size="sm"
            className="absolute bottom-4 right-4 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2"
          >
            <Play className="h-4 w-4" />
          </Button>
        </div>

        <div className="bg-green-700 text-white rounded-lg p-6 flex flex-col justify-between min-h-[280px]">
          <div>
            <h3 className="text-xl font-bold mb-2">Hot new arrivals</h3>
            <Button variant="link" className="p-0 h-auto text-white font-medium underline">
              Shop now
            </Button>
            <div className="mt-4 text-2xl font-bold">StockX</div>
          </div>
          <div className="mt-4">
            <img src="/trendy-sneakers-shoes.png" alt="Trendy sneakers" className="w-full h-24 object-contain" />
          </div>
        </div>

        <div className="bg-yellow-200 rounded-lg p-6 flex flex-col justify-between min-h-[280px]">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">College tech starting at $19.88</h3>
            <Button variant="link" className="p-0 h-auto text-blue-600 font-medium">
              Shop tech
            </Button>
            <div className="text-2xl font-bold text-blue-900 mt-2">★</div>
          </div>
          <div className="mt-4">
            <img src="/laptop-computer-monitor-tech.png" alt="College tech" className="w-full h-24 object-contain" />
          </div>
        </div>

        <div className="bg-orange-100 rounded-lg p-6 flex flex-col justify-between min-h-[280px]">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Top 100 school picks</h3>
            <Button variant="link" className="p-0 h-auto text-blue-600 font-medium">
              Shop now
            </Button>
          </div>
          <div className="mt-4">
            <img src="/school-supplies-backpack-lunch-box.png" alt="School supplies" className="w-full h-24 object-contain" />
          </div>
        </div>

        <div className="bg-yellow-100 rounded-lg p-6 flex flex-col justify-between min-h-[280px]">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Up to 55% off</h3>
            <Button variant="link" className="p-0 h-auto text-blue-600 font-medium">
              Shop now
            </Button>
            <div className="text-2xl font-bold text-blue-900 mt-2">Flash</div>
          </div>
          <div className="mt-4">
            <img src="/blue-floral-dress-clothing.png" alt="Fashion clothing" className="w-full h-24 object-contain" />
          </div>
        </div>

        <div className="bg-gray-200 rounded-lg p-6 flex flex-col justify-between min-h-[280px]">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">New decor from Mainstays</h3>
            <Button variant="link" className="p-0 h-auto text-blue-600 font-medium">
              Shop now
            </Button>
          </div>
          <div className="mt-4">
            <img src="/home-decor-vase-lamp-modern.png" alt="Home decor" className="w-full h-24 object-contain" />
          </div>
        </div>
      </div>
    </div>
  )
}
