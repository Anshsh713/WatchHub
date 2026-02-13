import "./Home.css";
import Movies_Section from "./Movies_Section";

export default function Home() {
  return (
    <div className="Main-contain">
      <div className="Movie-Section">
        <Movies_Section />
      </div>
    </div>
  );
}
