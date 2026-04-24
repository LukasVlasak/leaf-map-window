import "./styles/styles.scss";
// potreba importu zde, FA obsahuje relativni cesty (../webfonts), ktere po buildu webpacku nesedi, pokud neni import v src/*
import "@fortawesome/fontawesome-free/css/fontawesome.css";
import "@fortawesome/fontawesome-free/css/solid.css";

export { default } from "./MapWindow";