import "./App.css";
import data from "./dummy/data";

function App() {
  return (
    <div>
      <header>
        <a href="/">Ecommers</a>
      </header>
      <main>
        <h1>Featured Products</h1>
        <div className="products">
          {data.products.map((product) => (
            <div className="product" key={product.slug}>
              <a href={`product/${product.slug}`}>
                <div className="image-frame">
                  <img src={product.image} alt={product.name} />
                </div>
              </a>

              <div className="product-info">
                <a href={`product/${product.slug}`}>
                  <p>{product.name}</p>
                </a>
                <p>
                  <strong>${product.price}</strong>
                </p>
                <button>Add to cart</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
