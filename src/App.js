import "./App.css";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Earth } from "./components/earth";
function App() {
  return (
    <Canvas>
      <Suspense fallback={null}>
        <Earth />
      </Suspense>
    </Canvas>
  );
}

export default App;
