export interface Product {
    _id: string;
    title: string;
    description: string;
    price: {
        current: number;
        currency: string;
        beforeDiscount: number;
        discountPercentage: number;
    };
    category: {
        id: string;
        name: string;
        image: string;
    };
    thumbnail: string;
    stock: number;
    rating: number;
    brand: string;
    warranty: number;
    images: string[];
    issueDate: string;
}

export interface ApiResponse {
    total: number;
    limit: number;
    page: number;
    skip: number;
    products: Product[];
}