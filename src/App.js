import { useEffect, useState } from "react";
import supabase from "./supabase";
import "./style.css";

const CATEGORIES = [
  { name: "✨ Minting Now", color: "#1E1F22" },
  { name: "📅 Minting Today", color: "#1E1F22" },
  { name: "📌 Released", color: "#1E1F22" },
  { name: "🚫 Delayed", color: "#1E1F22" },
  { name: "⛔ Malicious", color: "#1E1F22" },
  { name: "👤 PFP", color: "#1E1F22" },
  { name: "💳 Membership", color: "#1E1F22" },
  { name: "🎮 Gaming", color: "#1E1F22" },
];

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);

        let query = supabase.from("facts").select("*");

        if (currentCategory !== "all")
          query = query.eq("category", currentCategory);

        const { data: facts, error } = await query
          .order("votesInteresting", { ascending: false })
          .limit(1000);
        setFacts(facts);
        setIsLoading(false);

        if (!error) setFacts(facts);
        else alert("Error getting data");
      }
      getFacts();
    },
    [currentCategory]
  );

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />

      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />

        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ showForm, setShowForm }) {
  const appTitle = "Mint Tracker";

  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="80" width="80" alt="RYFT Logo" />
        <h1>{appTitle}</h1>
      </div>

      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "Close" : "Add Project"}
      </button>
    </header>
  );
}

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLenght = text.length;

  async function handleSubmit(e) {
    // 1. PREVENT BROSWER RELOAD
    e.preventDefault();
    console.log(text, source, category);

    // 2. CHECK IF DATA IS VALID -> CREATE NEW FACT
    if (text && isValidHttpUrl(source) && category && textLenght <= 200) {
      // 3. UPLOAD FACT TO SUPERBASE AND RECEIVE FACT OBJECT
      setIsUploading(true);
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert({ text, source, category })
        .select();
      setIsUploading(false);

      // 4. ADD NEW FACT TO UI
      if (!error) setFacts((facts) => [newFact[0], ...facts]);

      // 5. RESET INPUT FIELDS
      setText("");
      setSource("");
      setCategory("");

      // 6. CLOSE FORM
      setShowForm(false);
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      {" "}
      <input
        type="text"
        placeholder="Share a project's name..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <span>{200 - textLenght}</span>
      <input
        value={source}
        type="text"
        placeholder="Source..."
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option>Choose category: </option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}
function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0) {
    return (
      <p className="message">
        No facts for this category yet! Create your the first one!
      </p>
    );
  }
  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>

      <p>There are {facts.length} facts in the database. Add your own</p>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed =
    fact.votesInteresting < fact.votesFalse ||
    fact.votesInteresting < fact.votesMindblowing;

  async function handleVote(columnName) {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [columnName]: fact[columnName] + 1 })
      .eq("id", fact.id)
      .select();
    setIsUpdating(false);

    if (!error)
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
  }

  return (
    <li className="fact">
      <div className="fact-content">
        <div className="tags-container">
          <p>
            {isDisputed ? <span className="disputed">[🛑DYOR]</span> : null}
          </p>
          <span
            className="tag"
            style={{
              backgroundColor: CATEGORIES.find(
                (cat) => cat.name === fact.category
              )?.color,
            }}
          >
            {fact.category}
          </span>
        </div>

        <div className="fact-details">
          <h2>╔▣ {fact.heading} ▣╗</h2>
          <br></br>
          <h4>Collection Info</h4>
          <p>📦Supply: {fact.supply}</p>
          <p>🏷️ Price: {fact.price}</p>
          <p>⛓️ Chain: {fact.chain}</p>
          <p>💸 Raise: {fact.raise}</p>
          <hr></hr>
          <h4>Release Date</h4>
          <p>
            📅 Mint will start{" "}
            {fact.release.replace(":00", "").replace("T", " ")}
          </p>
          <hr></hr>
          <h4>Social Links</h4>
          <a href={fact.twitter} target="_blank">
            🐦 Twitter
          </a>
          <br></br>
          <a href={fact.discord} target="_blank">
            👤 Discord
          </a>
          <br></br>
          <a href={fact.website} target="_blank">
            🌐 Website
          </a>
          <hr></hr>
          <h4>Mint Links</h4>
          <a href={fact.opensea} target="_blank">
            🌊 OpenSea
          </a>
          <br></br>
          <a href={fact.mint} target="_blank">
            🌿 Mint Site
          </a>
          <br></br>
          <a href={fact.contract} target="_blank">
            📜 Contract
          </a>
          <hr></hr>
          <h4>Notes</h4>
          <p>{fact.notes}</p>
        </div>
      </div>

      <div className="vote-buttons">
        <button
          onClick={() => handleVote("votesInteresting")}
          disabled={isUpdating}
        >
          🚀 {fact.votesInteresting}
        </button>
        <button
          onClick={() => handleVote("votesMindblowing")}
          disabled={isUpdating}
        >
          👎 {fact.votesMindblowing}
        </button>
        <button onClick={() => handleVote("votesFalse")} disabled={isUpdating}>
          ⛔️ {fact.votesFalse}
        </button>
      </div>
    </li>
  );
}
export default App;
