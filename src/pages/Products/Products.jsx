import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import SearchBar from "../../components/common/SearchBar";
import ProductCard from "../../components/product/ProductCard";

function categoryParams(location) {
  return new URLSearchParams(location.search);
}

export default function Products({ addToCart, wishlist, toggleWish }) {
  const location = useLocation();
  const navigate = useNavigate();
  const query = categoryParams(location);
  const [search, setSearch] = useState(query.get("search") || "");
  const [shuffleSeed] = useState(() => Math.random().toString(36).slice(2));
  const [categoryState, setCategoryState] = useState({ loaded: false, categories: [], error: "" });
  const [categoryReload, setCategoryReload] = useState(0);
  const [productReload, setProductReload] = useState(0);
  const mainCategoryId = query.get("mainCategoryId") || "";
  const subcategoryId = query.get("subcategoryId") || "";
  const legacyCategory = query.get("category") || "";
  const requestedPage = Number(query.get("page") || 1);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = 12;
  const selectedMain = categoryState.categories.find(category => category._id === mainCategoryId);
  const selectedSubcategory = selectedMain?.subcategories?.find(category => category._id === subcategoryId);
  const requestKey = JSON.stringify([search, mainCategoryId, subcategoryId, legacyCategory, page]);
  const [productState, setProductState] = useState({ key: "", products: [], total: 0, pages: 0, error: "" });
  const loading = productState.key !== requestKey;
  const products = loading ? [] : productState.products;
  const productError = !loading ? productState.error : "";
  const categoryTree = categoryState.categories;

  useEffect(() => {
    let active = true;
    api.categories()
      .then(result => {
        if (!active) return;
        setCategoryState({ loaded: true, categories: Array.isArray(result.categories) ? result.categories : [], error: "" });
      })
      .catch(error => {
        if (active) setCategoryState({ loaded: true, categories: [], error: error.message || "Unable to load categories." });
      });
    return () => { active = false; };
  }, [categoryReload]);

  useEffect(() => {
    if (!categoryState.loaded) return;
    const params = categoryParams(location);
    if (!params.get("mainCategoryId") && params.get("subcategoryId")) {
      const parent = categoryTree.find(category => category.subcategories?.some(subcategory => subcategory._id === params.get("subcategoryId")));
      if (parent) params.set("mainCategoryId", parent._id);
    } else if (!params.get("mainCategoryId") && legacyCategory) {
      const main = categoryTree.find(category => category.name.localeCompare(legacyCategory, undefined, { sensitivity: "base" }) === 0);
      const parent = categoryTree.find(category => category.subcategories?.some(subcategory => subcategory.name.localeCompare(legacyCategory, undefined, { sensitivity: "base" }) === 0));
      if (main) params.set("mainCategoryId", main._id);
      else if (parent) {
        params.set("mainCategoryId", parent._id);
        params.set("subcategoryId", parent.subcategories.find(subcategory => subcategory.name.localeCompare(legacyCategory, undefined, { sensitivity: "base" }) === 0)._id);
      }
    }
    if (params.toString() !== new URLSearchParams(location.search).toString()) {
      params.delete("category");
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
  }, [categoryState.loaded, categoryTree, legacyCategory, location, navigate]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ search });
    if (mainCategoryId) params.set("mainCategoryId", mainCategoryId);
    if (subcategoryId) params.set("subcategoryId", subcategoryId);
    if (legacyCategory && !mainCategoryId) params.set("category", legacyCategory);
    params.set("shuffleSeed", shuffleSeed);
    params.set("page", String(page));
    params.set("limit", String(pageSize));
    api.products(params.toString())
      .then(result => {
        if (!active) return;
        if (result?.pages && page > result.pages) {
          const updated = categoryParams(location);
          updated.set("page", String(result.pages));
          navigate({ pathname: location.pathname, search: updated.toString() }, { replace: true });
          return;
        }
        const resultProducts = Array.isArray(result) ? result : Array.isArray(result?.products) ? result.products : [];
        setProductState({ key: requestKey, products: resultProducts, total: Array.isArray(result) ? result.length : Number(result.total || 0), pages: Array.isArray(result) ? 1 : Number(result.pages || 0), error: "" });
      })
      .catch(error => {
        if (active) setProductState({ key: requestKey, products: [], total: 0, pages: 0, error: error.message || "Unable to load products." });
      });
    return () => { active = false; };
  }, [requestKey, productReload, search, mainCategoryId, subcategoryId, legacyCategory, page, location, navigate, shuffleSeed]);

  const navigateToCategory = (mainId = "", subId = "") => {
    const params = categoryParams(location);
    params.delete("category");
    if (mainId) params.set("mainCategoryId", mainId);
    else params.delete("mainCategoryId");
    if (subId) params.set("subcategoryId", subId);
    else params.delete("subcategoryId");
    params.delete("page");
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };
  const changePage = nextPage => {
    const params = categoryParams(location);
    params.set("page", String(nextPage));
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };
  const changeSearch = value => {
    setSearch(value);
    if (query.has("page")) {
      const params = categoryParams(location);
      params.delete("page");
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
  };
  const retryProducts = () => {
    setProductState({ key: "", products: [], total: 0, pages: 0, error: "" });
    setProductReload(value => value + 1);
  };
  const clearFilters = () => {
    setSearch("");
    navigateToCategory();
  };

  return <section>
    <SearchBar value={search} onChange={changeSearch} mainCategoryId={mainCategoryId} subcategoryId={subcategoryId} />
    <div className="section-heading"><div><h1>Shop</h1>{selectedMain && <p className="muted">{selectedMain.name}{selectedSubcategory ? ` / ${selectedSubcategory.name}` : ""}</p>}</div><span className="muted">{loading ? "Loading…" : productError ? "Results unavailable" : `${loading ? 0 : productState.total} results`}</span></div>
    <div className="chips" aria-label="Filter products by main category">
      <button type="button" onClick={() => navigateToCategory()} className={!mainCategoryId ? "selected" : ""} aria-pressed={!mainCategoryId}>All</button>
      {categoryTree.map(category => <button type="button" onClick={() => navigateToCategory(category._id)} className={mainCategoryId === category._id && !subcategoryId ? "selected" : ""} aria-pressed={mainCategoryId === category._id && !subcategoryId} key={category._id}>{category.name}</button>)}
    </div>
    {selectedMain && <div className="chips shop-subcategory-chips" aria-label={`Filter ${selectedMain.name} by subcategory`}>
      <button type="button" onClick={() => navigateToCategory(selectedMain._id)} className={!subcategoryId ? "selected" : ""} aria-pressed={!subcategoryId}>All {selectedMain.name}</button>
      {selectedMain.subcategories?.map(subcategory => <button type="button" onClick={() => navigateToCategory(selectedMain._id, subcategory._id)} className={subcategoryId === subcategory._id ? "selected" : ""} aria-pressed={subcategoryId === subcategory._id} key={subcategory._id}>{subcategory.name}</button>)}
    </div>}
    {categoryState.error && <div className="category-load-error" role="alert"><span>Categories could not be loaded: {categoryState.error}</span><button type="button" onClick={() => setCategoryReload(value => value + 1)}>Retry categories</button></div>}
    {loading ? <div className="shop-state" role="status">Loading products…</div>
      : productError ? <div className="shop-state shop-state-error" role="alert"><p>{productError}</p><button type="button" onClick={retryProducts}>Try again</button></div>
        : products.length ? <><div className="product-grid">{products.map(product => <ProductCard key={product._id} product={product} {...{ addToCart, wishlist, toggleWish }} />)}</div>{productState.pages > 1 && <nav className="shop-pagination" aria-label="Product pages"><button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</button><span>Page {page} of {productState.pages}</span><button type="button" disabled={page >= productState.pages} onClick={() => changePage(page + 1)}>Next</button></nav>}</>
          : <div className="shop-state"><h2>No products found</h2><p>{search ? "Try another search or choose a different category." : selectedSubcategory ? `There are no products in ${selectedSubcategory.name} right now.` : selectedMain ? `There are no products in ${selectedMain.name} right now.` : "Products will appear here when they are available."}</p>{(mainCategoryId || subcategoryId || legacyCategory || search) && <button type="button" onClick={clearFilters}>Clear filters</button>}</div>}
  </section>;
}
