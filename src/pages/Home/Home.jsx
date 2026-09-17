import { useEffect, useState } from "react";
import { Bell, ChevronRight, Package, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { categories } from "../../constants/catalog";
import SearchBar from "../../components/common/SearchBar";
import ProductCard from "../../components/product/ProductCard";

export default function Home({ addToCart, wishlist, toggleWish }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  useEffect(() => { api.products().then(setProducts).catch(console.error); }, []);
  return <div><section className="hero-wrap"><SearchBar value={search} onChange={setSearch}/><div className="hero"><div>
    <p className="eyebrow">আপনার এলাকা, আপনার নিজের বাজার</p><h1>আপনার প্রয়োজন,<br/>আপনার কাছেই!</h1><p>স্থানীয় দোকান থেকে প্রতিদিনের প্রয়োজনীয় জিনিস একসাথে।</p>
    <Link className="primary-btn" to="/shop">এখনই কিনুন <ChevronRight size={18}/></Link>
  </div><div className="hero-art"><span>🥕</span><span>🍅</span><span>🛍️</span><span>🥬</span></div></div></section>
  <section className="service-strip"><div><Truck/><b>দ্রুত ডেলিভারি</b><small>আপনার এলাকায়</small></div><div><ShieldCheck/><b>নিরাপদ পেমেন্ট</b><small>বিশ্বস্ত চেকআউট</small></div><div><Bell/><b>সাপোর্ট</b><small>প্রয়োজনে পাশে</small></div><div><Package/><b>লোকাল শপ</b><small>স্থানীয় ব্যবসার সাথে</small></div></section>
  <section><div className="section-heading"><h2>All Categories</h2><Link to="/shop">View All <ChevronRight size={17}/></Link></div><div className="category-grid">{categories.map(([name, icon]) => <Link to={`/shop?category=${encodeURIComponent(name)}`} className="category-card" key={name}><div>{icon}</div><b>{name}</b><span>Explore now →</span></Link>)}</div></section>
  <section><div className="section-heading"><h2>Featured Products</h2><Link to="/shop">View All <ChevronRight size={17}/></Link></div><div className="product-grid">{products.slice(0, 8).map(product => <ProductCard key={product._id} product={product} {...{ addToCart, wishlist, toggleWish }} />)}</div></section></div>;
}
