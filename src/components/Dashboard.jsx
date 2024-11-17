import { useEffect, useState } from 'react'; // Importa useEffect y useState
import { FaUtensils, FaPlus } from "react-icons/fa"; // Importa los íconos que necesites
import './Dashboard.css'; // Asegúrate de crear un archivo CSS para estilos
import { useNavigate } from "react-router-dom"; // Importa useNavigate
import img1 from '../assets/img1.png'; // Asegúrate de la ruta correcta
import img2 from '../assets/img2.png'; // Asegúrate de la ruta correcta
import img3 from '../assets/img3.png'; // Asegúrate de la ruta correcta
import img4 from '../assets/img4.png'; // Asegúrate de la ruta correcta
import img5 from '../assets/img5.png'; // Asegúrate de la ruta correcta
import img6 from '../assets/img6.png'; // Asegúrate de la ruta correcta

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0); // Estado para la imagen activa
  const images = [img1, img2, img3, img4, img5, img6]; // Array con las imágenes

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length); // Cambia la imagen cada segundo
    }, 1500); // Cambia cada 1000 ms (1 segundo)

    return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
  }, [images.length]);

  const handleAddIngredients = () => {
    navigate('/ingredientes'); 
  };

  const handleAddDishes = () => {
    navigate('/platos'); 
  };

  return (
    <div className="dashboard-container">
      <div className="cards-container">
        <div className="card" onClick={handleAddIngredients}>
          <FaPlus size={40} />
          <h3>Agregar Ingredientes</h3>
        </div>
        <div className="card" onClick={handleAddDishes}>
          <FaUtensils size={40} />
          <h3>Agregar Platos</h3>
        </div>
      </div>
      <div className="carousel">
        <div className="main-image">
          <img 
            src={images[currentIndex]} 
            alt={`Imagen ${currentIndex + 1}`} 
            className="large-image"
          />
        </div>
        <div className="carousel-images">
          {images.map((img, index) => (
            <img 
              key={index} 
              src={img} 
              alt={`Imagen ${index + 1}`} 
              className="small-image"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
