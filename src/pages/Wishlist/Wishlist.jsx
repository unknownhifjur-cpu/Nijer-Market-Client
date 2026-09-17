import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../../components/product/ProductCard";

export default function Wishlist({ wishlist, toggleWish, addToCart }) {
  return <section><div className="section-heading"><h1>My Wishlist</h1><span>{wishlist.length} saved items</span></div>{!wishlist.length ? <div className="empty"><Heart size={48}/><h2>Your wishlist is empty</h2><Link className="primary-btn" to="/shop">Explore Products</Link></div> : <div className="product-grid">{wishlist.map(product => <ProductCard key={product._id} product={product} {...{ addToCart, wishlist, toggleWish }} />)}</div>}</section>;
}
