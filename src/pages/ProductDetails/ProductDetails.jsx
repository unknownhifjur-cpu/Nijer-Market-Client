import { useEffect, useState } from "react";
import { ArrowLeft, Heart, ShoppingCart, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../services/api";
import { money } from "../../utils/format";
import BrandLoader from "../../components/common/BrandLoader";

export default function ProductDetails({ addToCart, wishlist, toggleWish }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  useEffect(() => { api.product(id).then(setProduct).catch(console.error); }, [id]);
  if (!product) return <BrandLoader title="Loading product..." detail="Getting the details ready for you." />;
  return <section className="detail-page"><Link to="/shop" className="back-link"><ArrowLeft size={18}/> Back to shop</Link><div className="detail-grid"><div className="detail-image"><img src={product.image} alt={product.name}/></div><div>
    <span className="badge">{product.badge}</span><h1>{product.nameBn || product.name}</h1><div className="rating big"><Star fill="currentColor"/> {product.rating} <span>({product.reviews} reviews)</span></div><p className="muted">{product.unit} · {product.category}</p><div className="big-price">{money(product.price)} <del>{money(product.mrp)}</del></div><p>{product.description || "Fresh, quality product from a trusted local market seller."}</p>
    <div className="detail-actions"><button className="primary-btn" onClick={() => addToCart(product)}><ShoppingCart/> Add to Cart</button><button className={`outline-btn ${wishlist.some(item => item._id === product._id) ? "wished" : ""}`} onClick={() => toggleWish(product)}><Heart/> Wishlist</button></div>
  </div></div></section>;
}
