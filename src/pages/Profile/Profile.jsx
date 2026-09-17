import { useEffect, useState } from "react";
import { Heart, LogOut, Package, ShieldCheck, Truck, User } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";

export default function Profile({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  useEffect(() => { if (user) api.myOrders().then(setOrders).catch(() => {}); }, [user]);
  if (!user) return <div className="empty"><User size={48}/><h2>Sign in to view your account</h2><Link className="primary-btn" to="/login">Sign In</Link></div>;
  return <section><div className="account-head"><div><span className="avatar">{user.name[0]}</span></div><div><h1>{user.name}</h1><p className="muted">{user.email}</p></div><button className="outline-btn" onClick={onLogout}><LogOut/> Logout</button></div><div className="account-grid"><Link to="/orders" className="account-card"><Package/><b>{orders.length}</b><span>Total Orders</span></Link><Link to="/wishlist" className="account-card"><Heart/><span>My Wishlist</span></Link><div className="account-card"><Truck/><span>Local Delivery</span></div><div className="account-card"><ShieldCheck/><span>Secure Shopping</span></div></div></section>;
}
