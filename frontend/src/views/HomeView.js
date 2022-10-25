import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function HomeView() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get("/api/products");
        setProducts(result.data);
      } catch (error) {
        console.error("Error fetching api data", error);
      }
    };
    console.log('i fire once');
    fetchData();
  }, []);

  return (
    <div>
      <h1>Featured Products</h1>
      <div className="products">
        {products.map((product) => (
          <div className="product" key={product.slug}>
            <Link to={`product/${product.slug}`}>
              <div className="image-frame">
                <img src={product.image} alt={product.name} />
              </div>
            </Link>

            <div className="product-info">
              <Link to={`product/${product.slug}`}>
                <p>{product.name}</p>
              </Link>
              <p>
                <strong>${product.price}</strong>
              </p>
              <button>Add to cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomeView;
