import bcrypt from "bcryptjs";

const data = {
  users: [
    {
      name: "admin",
      email: "admin@admin.com",
      passwordHash: bcrypt.hashSync("admin"),
      isAdmin: true,
    },
    {
      name: "user",
      email: "user@user.com",
      passwordHash: bcrypt.hashSync("user"),
      isAdmin: false,
    },
  ],
  products: [
    {
      name: "Nike air force one",
      slug: "nike-air-force-one-shoes",
      category: "Shoes",
      image: "/dummy/images/airForceOne.jpg", // 680 x 830
      price: 300,
      brand: "Nike",
      rating: 4.5,
      numReviews: 10,
      description: "Shoes for Swag",
      countInStock: 0,
    },
    {
      name: "Anime Shirt Siyah",
      slug: "anime-shirt-siyah",
      category: "shirts",
      image: "/dummy/images/animeShirt.jpg", // 680 x 830
      price: 80,
      brand: "Siyah",
      rating: 5,
      numReviews: 14,
      description: "UwU",
      countInStock: 4,
    },
    {
      name: "Anime Bucket Hat Akatsuki",
      slug: "Anime-bucket-hat-akatsuki",
      category: "Hats",
      image: "/dummy/images/animeBucketHat.jpg", // 680 x 830
      price: 50,
      brand: "Anime",
      rating: 4,
      numReviews: 8,
      description: "Naruto hat",
      countInStock: 1,
    },
    {
      name: "Black Slim Jeans Levis",
      slug: "Black-slim-jeans-levis",
      category: "Jeans",
      image: "/dummy/images/blackJeansLevis.jpg", // 680 x 830
      price: 250,
      brand: "Levis",
      rating: 5,
      numReviews: 15,
      description: "Black soul",
      countInStock: 4,
    },
    {
      name: "Anime Shirt Siyah2",
      slug: "anime-shirt-siyah2",
      category: "shirts",
      image: "/dummy/images/animeShirt.jpg", // 680 x 830
      price: 80,
      brand: "Siyah",
      rating: 5,
      numReviews: 14,
      description: "UwU",
      countInStock: 5,
    },
    {
      name: "Anime Bucket Hat Akatsuki2",
      slug: "Anime-bucket-hat-akatsuki2",
      category: "Hats",
      image: "/dummy/images/animeBucketHat.jpg", // 680 x 830
      price: 50,
      brand: "Anime",
      rating: 4,
      numReviews: 8,
      description: "Naruto hat",
      countInStock: 4,
    },
    {
      name: "Black Slim Jeans Levis2",
      slug: "Black-slim-jeans-levis2",
      category: "Jeans",
      image: "/dummy/images/blackJeansLevis.jpg", // 680 x 830
      price: 250,
      brand: "Levis",
      rating: 5,
      numReviews: 15,
      description: "Black soul",
      countInStock: 0,
    },
  ],
};

export default data;
