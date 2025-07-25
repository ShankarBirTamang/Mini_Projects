import "./App.css";
import GratitudeCard from "./components/GratitudeCard";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-3">
            Gratitude Card Generator
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Create beautiful, heartfelt gratitude cards to share your appreciation with the world
          </p>
        </div>
        <GratitudeCard />
      </div>
    </div>
  );
}

export default App;
