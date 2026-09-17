import { Grid2X2, Home as HomeIcon, ShoppingCart, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function BottomNav({ cartCount }) {
  return <nav className="bottom-nav">
    <Link to="/"><HomeIcon/><span>Home</span></Link>
    <Link to="/shop"><Grid2X2/><span>Categories</span></Link>
    <Link to="/cart"><ShoppingCart/><span>Cart</span>{cartCount > 0 && <b>{cartCount}</b>}</Link>
    <Link to="/account"><User/><span>Account</span></Link>
  </nav>;
}
