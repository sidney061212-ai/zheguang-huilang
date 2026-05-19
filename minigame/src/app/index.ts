import { GameApp } from "./GameApp";
import { WechatPlatformAdapter } from "../platform/WechatPlatformAdapter";

const app = new GameApp(new WechatPlatformAdapter());
app.init();
app.start();
