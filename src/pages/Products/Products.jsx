import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../services/api";
import { categories } from "../../constants/catalog";
import SearchBar from "../../components/common/SearchBar";
import ProductCard from "../../components/product/ProductCard";

export default function Products({ addToCart, wishlist, toggleWish }) {
  const query = new URLSearchParams(useLocation().search);
  const [search, setSearch] = useState(query.get("search") || "");
  const [category, setCategory] = useState(query.get("category") || "All");
  const [products, setProducts] = useState([]);
  useEffect(() => { api.products(`search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`).then(setProducts).catch(console.error); }, [search, category]);
  return <section><SearchBar value={search} onChange={setSearch}/><div className="section-heading"><h1>Shop</h1><span className="muted">{products.length} results</span></div>
    <div className="chips">{["All", ...categories.map(item => item[0])].map(item => <button onClick={() => setCategory(item)} className={category === item ? "selected" : ""} key={item}>{item}</button>)}</div>
    <div className="product-grid">{products.map(product => <ProductCard key={product._id} product={product} {...{ addToCart, wishlist, toggleWish }} />)}</div></section>;
}
