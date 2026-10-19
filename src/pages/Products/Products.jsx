import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { categoryKey } from "../../utils/categories";
import SearchBar from "../../components/common/SearchBar";
import ProductCard from "../../components/product/ProductCard";

export default function Products({ addToCart, wishlist, toggleWish }) {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const [search, setSearch] = useState(query.get("search") || "");
  const [category, setCategory] = useState(query.get("category") || "All");
  const [categoryState, setCategoryState] = useState({ loaded: false, categories: [], error: "" });
  const [categoryReload, setCategoryReload] = useState(0);
  const [productReload, setProductReload] = useState(0);
  const [productState, setProductState] = useState({ key: "", products: [], error: "" });
  const selectedCategory = categoryState.loaded
    && category !== "All"
    && !categoryState.categories.some(item => categoryKey(item) === categoryKey(category))
    ? "All"
    : category;
  const requestKey = JSON.stringify([search, selectedCategory]);
  const loading = productState.key !== requestKey;
  const products = loading ? [] : productState.products;
  const productError = !loading ? productState.error : "";

  useEffect(() => {
    let active = true;
    api.productCategories()
      .then(result => {
        if (!active) return;
        const categories = Array.isArray(result.categories) ? result.categories : [];
        setCategoryState({ loaded: true, categories, error: "" });
      })
      .catch(error => {
        if (active) setCategoryState({ loaded: true, categories: [], error: error.message || "Unable to load product categories." });
      });
    return () => { active = false; };
  }, [categoryReload]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ search, category: selectedCategory });
    api.products(params.toString())
      .then(result => {
        if (active) setProductState({ key: requestKey, products: Array.isArray(result) ? result : [], error: "" });
      })
      .catch(error => {
        if (active) setProductState({ key: requestKey, products: [], error: error.message || "Unable to load products." });
      });
    return () => { active = false; };
  }, [requestKey, productReload, search, selectedCategory]);

  const selectCategory = selected => {
    setCategory(selected);
    const params = new URLSearchParams(location.search);
    if (selected === "All") params.delete("category");
    else params.set("category", selected);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  const retryProducts = () => {
    setProductState({ key: "", products: [], error: "" });
    setProductReload(value => value + 1);
  };

  const categoryLabels = categoryState.categories;

  return <section>
    <SearchBar value={search} onChange={setSearch} />
    <div className="section-heading"><h1>Shop</h1><span className="muted">{loading ? "Loading…" : productError ? "Results unavailable" : `${products.length} results`}</span></div>
    <div className="chips" aria-label="Filter products by category">
      {["All", ...categoryLabels].map(item => <button type="button" onClick={() => selectCategory(item)} className={categoryKey(category) === categoryKey(item) ? "selected" : ""} aria-pressed={categoryKey(category) === categoryKey(item)} key={item}>{item}</button>)}
    </div>
    {categoryState.error && <div className="category-load-error" role="alert"><span>Categories could not be loaded: {categoryState.error}</span><button type="button" onClick={() => setCategoryReload(value => value + 1)}>Retry categories</button></div>}
    {loading ? <div className="shop-state" role="status">Loading products…</div>
      : productError ? <div className="shop-state shop-state-error" role="alert"><p>{productError}</p><button type="button" onClick={retryProducts}>Try again</button></div>
        : products.length ? <div className="product-grid">{products.map(product => <ProductCard key={product._id} product={product} {...{ addToCart, wishlist, toggleWish }} />)}</div>
          : <div className="shop-state"><h2>No products found</h2><p>{search ? "Try another search or choose a different category." : selectedCategory !== "All" ? "There are no products in this category right now." : "Products will appear here when they are available."}</p>{(selectedCategory !== "All" || search) && <button type="button" onClick={() => { setSearch(""); selectCategory("All"); }}>Clear filters</button>}</div>}
  </section>;
}
