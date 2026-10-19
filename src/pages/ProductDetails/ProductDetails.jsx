import { useEffect, useRef, useState } from "react";
import { ArrowLeft, FileText, Heart, ShoppingCart } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../services/api";
import { money } from "../../utils/format";
import BrandLoader from "../../components/common/BrandLoader";

export default function ProductDetails({ addToCart, wishlist, toggleWish }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const descriptionRef = useRef(null);
  useEffect(() => { api.product(id).then(setProduct).catch(console.error); }, [id]);
  useEffect(() => {
    const description = descriptionRef.current;
    if (description) description.style.maxHeight = descriptionExpanded ? `${description.scrollHeight}px` : "5.7em";
  }, [descriptionExpanded, product?.description]);
  if (!product) return <BrandLoader title="Loading product..." detail="Getting the details ready for you." />;
  return <section className="detail-page"><Link to="/shop" className="back-link"><ArrowLeft size={18}/> Back to shop</Link><div className="detail-grid"><div className="detail-image"><img src={product.image} alt={product.name}/></div><div>
    <span className="badge">{product.badge}</span><h1>{product.nameBn || product.name}</h1><p className="muted">{product.unit} · {product.category}</p><div className="big-price">{money(product.price)} <del>{money(product.mrp)}</del></div>
    <section className={`product-description-card${descriptionExpanded ? " expanded" : ""}`} aria-labelledby="product-description-title">
      <div className="product-description-heading">
        <span className="product-description-icon"><FileText size={18} /></span>
        <div><h2 id="product-description-title">পণ্যের বিবরণ</h2><span>Learn More</span></div>
      </div>
      <p ref={descriptionRef} className="product-description-copy">{product.description || "এই পণ্যের বিবরণ এখনো যোগ করা হয়নি।"}</p>
      {descriptionExpanded && product.brand && <p className="product-description-brand"><strong>ব্র্যান্ড:</strong> {product.brand}</p>}
      <div className="product-description-more">
        <button type="button" aria-expanded={descriptionExpanded} onClick={() => setDescriptionExpanded(expanded => !expanded)}>
          {descriptionExpanded ? "কম দেখুন ↑" : "Learn More →"}
        </button>
      </div>
    </section>
    <div className="detail-actions"><button className="primary-btn" onClick={() => addToCart(product)}><ShoppingCart/> Add to Cart</button><button className={`outline-btn ${wishlist.some(item => item._id === product._id) ? "wished" : ""}`} onClick={() => toggleWish(product)}><Heart/> Wishlist</button></div>
  </div></div></section>;
}
