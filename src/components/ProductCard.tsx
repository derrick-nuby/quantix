import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertCircle, MoreVertical, Edit, Eye, Star } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    lowStock: number;
    createdAt: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{product.name}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href={`/products/${product.id}/edit`} className="flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/products/${product.id}`} className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                <span>View Product</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Star className="mr-2 h-4 w-4" />
              <span>Add to Favorites</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <Image
          src={'/placeholder.svg'}
          alt={product.name}
          width={500}
          height={192}
          className="w-full h-48 object-cover rounded-md"
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center">
          <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
          <span>Low stock: {product.lowStock}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Added: {new Date(product.createdAt).toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  );
}

