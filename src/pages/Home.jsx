// Home.jsx
import { useState } from "react";
import { Link, Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import AddIngredient from "../components/AddIngredient";
import CreateDish from "../components/CreateDish";
import { FaHome, FaUtensils } from 'react-icons/fa'; 
import { GiStandingPotion } from "react-icons/gi";
import './Home.css'; 
import Logo from '../assets/file.png';

const Home = () => {
  const [ingredientsList, setIngredientsList] = useState([]);
  const [dishesList, setDishesList] = useState([]);

  return (
    <div>
      <nav>
        <div className="logo">
          <img src={Logo} alt="Logo" />
        </div>
        <div className="menu-items">
          <ul>
            <li>
              <Link to="/">
                <FaHome /> Inicio
              </Link>
            </li>
            <li>
              <Link to="/ingredientes">
                <GiStandingPotion /> Ingredientes
              </Link>
            </li>
            <li>
              <Link to="/platos">
                <FaUtensils /> Platos
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <main>
        <Routes>
        <Route path="/" element={<Dashboard ingredientsList={ingredientsList} dishesList={dishesList} />} />

          <Route
            path="/ingredientes"
            element={<AddIngredient setIngredientsList={setIngredientsList} ingredientsList={ingredientsList} />}
          />
          <Route
            path="/platos"
            element={<CreateDish dishesList={dishesList} setDishesList={setDishesList} />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default Home;
