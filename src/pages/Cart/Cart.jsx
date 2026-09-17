import { ShoppingCart, Trash2, Minus, Plus, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { money } from "../../utils/format";

export default function Cart({ cart, setCart }) {
  const navigate = useNavigate();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal >= 499 || subtotal === 0 ? 0 : 60;
  const update = (id, quantity) => setCart(cart.map(item => item._id === id ? { ...item, quantity: Math.max(1, quantity) } : item));
  return <section><div className="section-heading"><h1>My Cart</h1><span>{cart.length} items</span></div>{!cart.length ? <div className="empty"><ShoppingCart size={48}/><h2>Your cart is empty</h2><Link className="primary-btn" to="/shop">Start Shopping</Link></div> : <div className="cart-layout"><div>{cart.map(item => <div className="cart-item" key={item._id}><img src={item.image} alt={item.name}/><div className="cart-info"><b>{item.nameBn || item.name}</b><span className="muted">{item.unit}</span><strong>{money(item.price)}</strong></div><div className="qty"><button onClick={() => update(item._id, item.quantity - 1)}><Minus/></button><span>{item.quantity}</span><button onClick={() => update(item._id, item.quantity + 1)}><Plus/></button></div><button className="icon-btn" onClick={() => setCart(cart.filter(value => value._id !== item._id))}><Trash2/></button></div>)}</div><aside className="summary"><h2>Order Summary</h2><div><span>Items</span><b>{money(subtotal)}</b></div><div><span>Delivery</span><b>{delivery ? money(delivery) : "FREE"}</b></div><hr/><div className="total"><span>Total</span><b>{money(subtotal + delivery)}</b></div><button className="primary-btn full" onClick={() => navigate("/checkout")}>Proceed to Checkout <ChevronRight/></button></aside></div>}</section>;
}
