import { useEffect, useState } from "react";
import {
  Bell,
  ChevronRight,
  Package,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { api } from "../../services/api";
import { getProductCategories } from "../../utils/categories";

import SearchBar from "../../components/common/SearchBar";
import BrandLoader from "../../components/common/BrandLoader";
import ProductCard from "../../components/product/ProductCard";

/* =================================
   ANIMATION VARIANTS
================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
};

const heroContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const heroItem = {
  hidden: {
    opacity: 0,
    y: 22,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const categoryContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const categoryItem = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const productContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const MotionLink = motion(Link);

const productItem = {
  hidden: {
    opacity: 0,
    y: 22,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

/* =================================
   HOME PAGE
================================= */

export default function Home({
  addToCart,
  wishlist,
  toggleWish,
}) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const categories = getProductCategories(products);

  /* =================================
     LOAD PRODUCTS
  ================================= */

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.products();

        console.log("Products API response:", response);

        if (cancelled) return;

        let productList = [];

        if (Array.isArray(response)) {
          productList = response;
        } else if (Array.isArray(response?.data)) {
          productList = response.data;
        } else if (Array.isArray(response?.products)) {
          productList = response.products;
        }

        setProducts(productList);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load products:", err);

        setProducts([]);

        setError(
          err?.message ||
            "পণ্যগুলো লোড করা যাচ্ছে না। আবার চেষ্টা করুন।"
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =================================
     RETRY
  ================================= */

  const handleRetry = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.products();

      console.log("Products retry response:", response);

      let productList = [];

      if (Array.isArray(response)) {
        productList = response;
      } else if (Array.isArray(response?.data)) {
        productList = response.data;
      } else if (Array.isArray(response?.products)) {
        productList = response.products;
      }

      setProducts(productList);
    } catch (err) {
      console.error("Failed to reload products:", err);

      setProducts([]);

      setError(
        err?.message ||
          "পণ্যগুলো লোড করা যাচ্ছে না। আবার চেষ্টা করুন।"
      );
    } finally {
      setLoading(false);
    }
  };

  const featuredProducts = products.slice(0, 8);

  return (
    <main className="home-page">
      {/* =================================
          HERO + SEARCH
      ================================= */}

      <section
        className="hero-wrap"
        aria-labelledby="home-hero-title"
      >
        {/* SearchBar already has its own shell */}
        <motion.div
          initial={{
            opacity: 0,
            y: -14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            ease: "easeOut",
          }}
        >
          <SearchBar
            value={search}
            onChange={setSearch}
          />
        </motion.div>

        {/* HERO */}

        <motion.div
          className="hero"
          variants={heroContainer}
          initial="hidden"
          animate="visible"
        >
          <div className="hero-content">
            <motion.p
              className="eyebrow"
              variants={heroItem}
            >
              আপনার এলাকা, আপনার নিজের বাজার
            </motion.p>

            <motion.h1
              id="home-hero-title"
              variants={heroItem}
            >
              আপনার প্রয়োজন,
              <br />
              আপনার কাছেই!
            </motion.h1>

            <motion.p
              className="hero-description"
              variants={heroItem}
            >
              স্থানীয় দোকান থেকে প্রতিদিনের প্রয়োজনীয়
              জিনিস একসাথে, সহজে এবং আপনার এলাকার
              কাছেই।
            </motion.p>

            {/* BUTTONS
                Direct motion(Link) avoids extra wrapper
                elements that can break the flex layout. */}
            <motion.div
              className="hero-actions"
              variants={heroItem}
            >
              <MotionLink
                to="/shop"
                className="primary-btn"
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
              >
                <span>এখনই কিনুন</span>

                <motion.span
                  whileHover={{
                    x: 4,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                  }}
                >
                  <ChevronRight
                    size={18}
                    aria-hidden="true"
                  />
                </motion.span>
              </MotionLink>

              <MotionLink
                to="/shop"
                className="outline-btn"
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
              >
                সব পণ্য দেখুন
              </MotionLink>
            </motion.div>
          </div>

          {/* HERO ART */}

          <motion.div
            className="hero-art"
            aria-hidden="true"
            initial={{
              opacity: 0,
              scale: 0.85,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.7,
              delay: 0.25,
              ease: "easeOut",
            }}
          >
            <motion.span
              animate={{
                y: [0, -8, 0],
                rotate: [0, 2, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              🥕
            </motion.span>

            <motion.span
              animate={{
                y: [0, -10, 0],
                rotate: [0, -2, 0],
              }}
              transition={{
                duration: 3.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
            >
              🍅
            </motion.span>

            <motion.span
              animate={{
                y: [0, -7, 0],
                rotate: [0, 3, 0],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            >
              🛍️
            </motion.span>

            <motion.span
              animate={{
                y: [0, -9, 0],
                rotate: [0, -3, 0],
              }}
              transition={{
                duration: 3.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
            >
              🥬
            </motion.span>
          </motion.div>
        </motion.div>
      </section>

      {/* =================================
          SERVICES
      ================================= */}

      <motion.section
        className="service-strip"
        aria-label="আমাদের সেবাসমূহ"
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.2,
        }}
        variants={fadeUp}
      >
        <ServiceItem
          icon={
            <Truck
              size={24}
              aria-hidden="true"
            />
          }
          title="দ্রুত ডেলিভারি"
          description="আপনার এলাকায়"
        />

        <ServiceItem
          icon={
            <ShieldCheck
              size={24}
              aria-hidden="true"
            />
          }
          title="নিরাপদ পেমেন্ট"
          description="বিশ্বস্ত চেকআউট"
        />

        <ServiceItem
          icon={
            <Bell
              size={24}
              aria-hidden="true"
            />
          }
          title="সাপোর্ট"
          description="প্রয়োজনে পাশে"
        />

        <ServiceItem
          icon={
            <Package
              size={24}
              aria-hidden="true"
            />
          }
          title="লোকাল শপ"
          description="স্থানীয় ব্যবসার সাথে"
        />
      </motion.section>

      {/* =================================
          CATEGORIES
      ================================= */}

      <motion.section
        className="home-section"
        aria-labelledby="categories-title"
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.15,
        }}
        variants={fadeUp}
      >
        <div className="section-heading">
          <div>
            <h2 id="categories-title">
              All Categories
            </h2>

            <p className="muted">
              প্রয়োজন অনুযায়ী পণ্য খুঁজে নিন
            </p>
          </div>

          <Link to="/shop">
            View All
            <ChevronRight
              size={17}
              aria-hidden="true"
            />
          </Link>
        </div>

        <motion.div
          className="category-grid"
          variants={categoryContainer}
        >
          {categories.map(name => (
            <motion.div
              key={name}
              className="category-motion-item"
              variants={categoryItem}
              whileHover={{
                y: -6,
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
            >
              <Link
                to={`/shop?category=${encodeURIComponent(
                  name
                )}`}
                className="category-card"
                aria-label={`${name} category`}
              >
                <motion.div
                  className="category-icon"
                  aria-hidden="true"
                  whileHover={{
                    scale: 1.1,
                    rotate: 3,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  }}
                >
                  <Package
                    size={32}
                    strokeWidth={1.8}
                  />
                </motion.div>

                <b>{name}</b>

                <span>
                  Explore now{" "}
                  <motion.span
                    className="category-arrow"
                    aria-hidden="true"
                    whileHover={{
                      x: 4,
                    }}
                  >
                    →
                  </motion.span>
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* =================================
          FEATURED PRODUCTS
      ================================= */}

      <motion.section
        className="home-section"
        aria-labelledby="featured-title"
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.08,
        }}
        variants={fadeUp}
      >
        <div className="section-heading">
          <div>
            <h2 id="featured-title">
              Featured Products
            </h2>

            <p className="muted">
              আপনার জন্য বেছে নেওয়া কিছু পণ্য
            </p>
          </div>

          <Link to="/shop">
            View All
            <ChevronRight
              size={17}
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* LOADING */}

        {loading && <BrandLoader title="পণ্য লোড হচ্ছে..." detail="আপনার এলাকার পণ্য প্রস্তুত করা হচ্ছে" />}

        {/* ERROR */}

        {!loading && error && (
          <motion.div
            className="empty error-state"
            role="alert"
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
          >
            <Search
              size={40}
              aria-hidden="true"
            />

            <h3>পণ্য লোড করা যায়নি</h3>

            <p className="muted">
              {error}
            </p>

            <motion.button
              type="button"
              className="primary-btn"
              onClick={handleRetry}
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.97,
              }}
            >
              আবার চেষ্টা করুন
            </motion.button>
          </motion.div>
        )}

        {/* EMPTY STATE */}

        {!loading &&
          !error &&
          featuredProducts.length === 0 && (
            <motion.div
              className="empty"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.45,
              }}
            >
              <Package
                size={42}
                aria-hidden="true"
              />

              <h3>এখনও কোনো পণ্য নেই</h3>

              <p className="muted">
                খুব শীঘ্রই নতুন পণ্য এখানে
                দেখা যাবে।
              </p>

              <motion.div
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
              >
                <Link
                  to="/shop"
                  className="outline-btn"
                >
                  Shop দেখুন
                </Link>
              </motion.div>
            </motion.div>
          )}

        {/* PRODUCTS */}

        {!loading &&
          !error &&
          featuredProducts.length > 0 && (
            <motion.div
              className="product-grid"
              variants={productContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.08,
              }}
            >
              {featuredProducts.map((product) => (
                <motion.div
                  key={
                    product._id ||
                    product.id
                  }
                  className="product-motion-item"
                  variants={productItem}
                  whileHover={{
                    y: -5,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 22,
                  }}
                >
                  <ProductCard
                    product={product}
                    addToCart={addToCart}
                    wishlist={wishlist}
                    toggleWish={toggleWish}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
      </motion.section>
    </main>
  );
}

/* =================================
   SERVICE ITEM
================================= */

function ServiceItem({
  icon,
  title,
  description,
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      <motion.div
        whileHover={{
          scale: 1.08,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 15,
        }}
      >
        {icon}
      </motion.div>

      <b>{title}</b>

      <small>{description}</small>
    </motion.div>
  );
}
