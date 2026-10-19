import { LoaderCircle, Mic, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function SearchBar({ value, onChange, mainCategoryId = "", subcategoryId = "" }) {
  const navigate = useNavigate();
  const shellRef = useRef(null);
  const recognitionRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [listening, setListening] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState("en-IN");
  const [voiceSupported] = useState(() => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));

  useEffect(() => {
    const query = value.trim();
    if (!query) return undefined;
    let current = true;
    const timer = setTimeout(() => {
      api.search(query, { mainCategoryId, subcategoryId }).then(result => { if (current) { setSuggestions(result.data.suggestions || []); setActiveIndex(-1); } }).catch(() => { if (current) setSuggestions([]); });
    }, 250);
    return () => { current = false; clearTimeout(timer); };
  }, [value, mainCategoryId, subcategoryId]);

  useEffect(() => {
    const close = event => { if (!shellRef.current?.contains(event.target)) setSuggestions([]); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const searchUrl = query => { const params = new URLSearchParams({ search: query }); if (mainCategoryId) params.set("mainCategoryId", mainCategoryId); if (subcategoryId) params.set("subcategoryId", subcategoryId); return `/shop?${params.toString()}`; };
  const submit = event => { event.preventDefault(); const query = suggestions[activeIndex]?.name || value.trim(); if (query) navigate(searchUrl(query)); setSuggestions([]); };
  const handleInput = event => { onChange(event.target.value); setSuggestions([]); setActiveIndex(-1); };
  const chooseSuggestion = suggestion => { onChange(suggestion.name); navigate(searchUrl(suggestion.name)); setSuggestions([]); };
  const handleKeyDown = event => {
    if (event.key === "ArrowDown" && suggestions.length) { event.preventDefault(); setActiveIndex(index => (index + 1) % suggestions.length); }
    if (event.key === "ArrowUp" && suggestions.length) { event.preventDefault(); setActiveIndex(index => (index - 1 + suggestions.length) % suggestions.length); }
    if (event.key === "Escape") setSuggestions([]);
  };
  const toggleVoice = () => {
    if (!voiceSupported) return;
    if (listening) { recognitionRef.current?.stop(); return; }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = voiceLanguage;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onresult = event => onChange(event.results[0][0].transcript);
    recognition.onerror = () => setListening(false);
    recognition.onend = () => { setListening(false); recognitionRef.current = null; };
    recognitionRef.current = recognition;
    recognition.start();
  };

  return <div className="searchbar-shell" ref={shellRef}><form className="searchbar" onSubmit={submit}>
    <Search size={21} aria-hidden="true" />
    <input aria-label="Search products" aria-expanded={suggestions.length > 0} aria-controls="search-suggestions" role="combobox" placeholder="Search for products, brands and more..." value={value} onChange={handleInput} onKeyDown={handleKeyDown} />
    <select className="voice-language" aria-label="Voice search language" value={voiceLanguage} onChange={event => setVoiceLanguage(event.target.value)}><option value="en-IN">EN</option><option value="bn-IN">বাংলা</option></select>
    <button type="button" className={`voice-search ${listening ? "listening" : ""}`} onClick={toggleVoice} disabled={!voiceSupported} title={voiceSupported ? (listening ? "Stop voice search" : "Voice search") : "Voice search is not supported in this browser"} aria-label="Voice search"><Mic size={19} />{listening && <LoaderCircle className="voice-spinner" size={13} />}</button>
    <button type="submit">Search</button>
  </form>{suggestions.length > 0 && <div className="search-suggestions" id="search-suggestions" role="listbox">
    {suggestions.map((suggestion, index) => <button type="button" role="option" aria-selected={index === activeIndex} className={index === activeIndex ? "active" : ""} key={suggestion.id} onMouseDown={event => event.preventDefault()} onClick={() => chooseSuggestion(suggestion)}><Search size={15} aria-hidden="true" /><span><strong>{suggestion.nameBn || suggestion.name}</strong><small>{suggestion.nameBn ? suggestion.name : suggestion.category}</small></span></button>)}
    <button type="button" className="view-results" onClick={submit}>View all results <span aria-hidden="true">→</span></button>
  </div>}</div>;
}
