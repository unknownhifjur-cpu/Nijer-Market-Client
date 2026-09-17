import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";

const money = value => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function ProductCard({ product, addToCart, wishlist, toggleWish }) {
  const wished = wishlist.some(item => item._id === product._id);
  return <article className="product-card">
    <button className={`wish-btn ${wished ? "wished" : ""}`} onClick={() => toggleWish(product)}><Heart fill={wished ? "currentColor" : "none"}/></button>
    <Link to={`/product/${product._id}`} className="product-image-wrap"><span className="badge">{product.badge}</span><img src={product.image} alt={product.name} /></Link>
    <div className="product-body"><div className="muted">{product.unit} · {product.category}</div>
      <Link to={`/product/${product._id}`} className="product-name">{product.nameBn || product.name}</Link>
      <div className="rating"><Star size={15} fill="currentColor"/> {product.rating} <span>({product.reviews})</span></div>
      <div className="price-row"><strong>{money(product.price)}</strong><del>{money(product.mrp)}</del><span>{product.discount}% OFF</span></div>
      <button className="add-btn" onClick={() => addToCart(product)}><ShoppingCart size={17}/> Add to Cart</button>
    </div>
  </article>;
}
