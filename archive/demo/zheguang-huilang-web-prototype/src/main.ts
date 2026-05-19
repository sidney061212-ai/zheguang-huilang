import "./style.css";
import { Game } from "./game";
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
new Game(canvas);
