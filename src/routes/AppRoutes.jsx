import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home/Home";
import Products from "../pages/Products/Products";
import ProductDetails from "../pages/ProductDetails/ProductDetails";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import Login from "../pages/Login/Login";
import Profile from "../pages/Profile/Profile";
import Orders from "../pages/Orders/Orders";
import Wishlist from "../pages/Wishlist/Wishlist";

export default function AppRoutes(props) {
  return <Routes>
    <Route path="/" element={<Home {...props}/>}/><Route path="/shop" element={<Products {...props}/>}/><Route path="/product/:id" element={<ProductDetails {...props}/>}/>
    <Route path="/cart" element={<Cart cart={props.cart} setCart={props.setCart}/>}/><Route path="/checkout" element={<Checkout cart={props.cart} clearCart={props.clearCart}/>}/>
    <Route path="/login" element={<Login onAuth={props.onAuth}/>}/><Route path="/account" element={<Profile user={props.user} onLogout={props.onLogout}/>}/>
    <Route path="/orders" element={<Orders/>}/><Route path="/wishlist" element={<Wishlist {...props}/>}/>
  </Routes>;
}
