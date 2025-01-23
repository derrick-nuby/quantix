'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getProduct } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';

export default function ProductPage() {
  const params = useParams<{ id: string; }>();
  const router = useRouter();
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', params.id],
    queryFn: () => getProduct(params.id)
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Card className="max-w-2xl mx-auto">
        {product && (
          <>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Image
                src={'/placeholder.svg'}
                alt={product.name}
                width={500}
                height={300}
                className="w-full h-64 object-cover rounded-md mb-4"
              />
              <p>Low Stock Threshold: {product.lowStock}</p>
              <p>Created At: {new Date(product.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </>
        )}
        <CardFooter>
          <Link href={`/products/${params.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" /> Edit Product
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

