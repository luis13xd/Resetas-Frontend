import { useState, useEffect, useRef } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./CreateDish.css";

const CreateDish = () => {
  const [ingredientsList, setIngredientsList] = useState([]);
  const [dish, setDish] = useState({ name: "", ingredients: [] });
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [quantity, setQuantity] = useState("");
  const [dishesList, setDishesList] = useState([]);
  const [dishesCount, setDishesCount] = useState(0);
  const [editingDish, setEditingDish] = useState(null);
  const formRef = useRef(null);
  const [profitPercentage, setProfitPercentage] = useState("");

  // Obtener ingredientes del backend
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch(
          "https://resetas-backend-production.up.railway.app/api/ingredients"
        );
        const data = await response.json();
        setIngredientsList(data);
      } catch (error) {
        console.error("Error al obtener los ingredientes:", error);
      }
    };

    const fetchDishes = async () => {
      try {
        const response = await fetch(
          "https://resetas-backend-production.up.railway.app/api/dishes"
        );
        const data = await response.json();
        setDishesList(data);
        setDishesCount(data.length); // Inicializa el conteo con los platos existentes
      } catch (error) {
        console.error("Error al obtener los platos:", error);
      }
    };

    fetchIngredients();
    fetchDishes();
  }, []);

  const handleAddIngredient = () => {
    const ingredient = ingredientsList.find(
      (ing) => ing.name === selectedIngredient
    );
    const parsedQuantity = parseFloat(quantity);

    if (ingredient && !isNaN(parsedQuantity) && parsedQuantity > 0) {
      if (ingredient.quantity < parsedQuantity) {
        alert("No hay suficiente cantidad de este ingrediente disponible.");
        return;
      }

      setIngredientsList((prevList) => {
        return prevList.map((ing) =>
          ing.name === ingredient.name
            ? { ...ing, quantity: ing.quantity - parsedQuantity }
            : ing
        );
      });

      const updatedIngredients = [
        ...dish.ingredients,
        {
          ...ingredient,
          quantity: parsedQuantity,
          unitPrice: ingredient.unitCost * parsedQuantity,
        },
      ];
      setDish((prevDish) => {
        const totalCost = calculateDishTotal(updatedIngredients);
        const profit = calculateProfit(totalCost, prevDish.price);
        const margin = calculateMargin(totalCost, prevDish.price);

        return {
          ...prevDish,
          ingredients: updatedIngredients,
          totalCost,
          profit,
          margin,
        };
      });

      setSelectedIngredient("");
      setQuantity("");
    } else {
      alert(
        "Por favor, selecciona un ingrediente válido y proporciona una cantidad correcta."
      );
    }
  };

  const handleDeleteIngredient = (ingredientName) => {
    const updatedIngredients = dish.ingredients.filter(
      (ing) => ing.name !== ingredientName
    );
    setDish((prevDish) => ({ ...prevDish, ingredients: updatedIngredients }));
  };

  // Función para manejar la edición
  const handleEditDish = (dishToEdit) => {
    setDish(dishToEdit); // Rellena el formulario con los datos del plato
    setProfitPercentage(dishToEdit.margin?.toString() || "");
    setEditingDish(dishToEdit._id); // Guarda el ID del plato en edición
  };

  const handleUpdateDish = async () => {
    if (dish.name && dish.ingredients.length > 0) {
      const totalCost = calculateDishTotal(dish.ingredients);
      const profit = (totalCost * parseFloat(profitPercentage)) / 100;
      const price = totalCost + profit;
  
      const updatedDish = {
        ...dish,
        totalCost,
        profit,
        price,
        margin: profitPercentage,
      };
  
      try {
        const response = await fetch(
          `https://resetas-backend-production.up.railway.app/api/dishes/${editingDish}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedDish),
          }
        );
  
        if (response.ok) {
          const updatedDishFromServer = await response.json();
          setDishesList((prevList) =>
            prevList.map((d) =>
              d._id === editingDish ? updatedDishFromServer : d
            )
          );
          setDish({ name: "", ingredients: [] });
          setProfitPercentage(""); // Limpia el porcentaje
          setEditingDish(null);
        } else {
          alert("Error al actualizar el plato.");
        }
      } catch (error) {
        console.error("Error al actualizar el plato:", error);
      }
    } else {
      alert("Completa los datos del plato antes de actualizar.");
    }
  };
  

  const handleSaveDish = async () => {
    if (dish.name && dish.ingredients.length > 0) {
      const totalCost = calculateDishTotal(dish.ingredients);
  
      // Calcular precio automáticamente basado en el porcentaje de ganancia
      const profit = (totalCost * parseFloat(profitPercentage)) / 100;
      const price = totalCost + profit;
  
      const dishWithPricing = {
        ...dish,
        totalCost,
        price,
        profit,
        margin: profitPercentage,
      };
  
      try {
        const response = await fetch(
          "https://resetas-backend-production.up.railway.app/api/dishes",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dishWithPricing),
          }
        );
        const newDish = await response.json();
  
        if (response.ok) {
          setDishesList((prevList) => [...prevList, newDish]);
          setDishesCount((prevCount) => prevCount + 1);
          setDish({ name: "", ingredients: [] });

          setProfitPercentage(""); // Limpiar el porcentaje de ganancia
        } else {
          alert("Error al guardar el plato.");
        }
      } catch (error) {
        console.error("Error al guardar el plato:", error);
      }
    } else {
      alert("Completa los datos del plato antes de guardar.");
    }
  };
  

  const handleDeleteDish = async (index) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este plato?"
    );
    if (confirmDelete) {
      try {
        const dishToDelete = dishesList[index];
        await fetch(
          `https://resetas-backend-production.up.railway.app/api/dishes/${dishToDelete._id}`,
          {
            method: "DELETE",
          }
        );

        const updatedDishesList = dishesList.filter((_, i) => i !== index);
        setDishesList(updatedDishesList);
        setDishesCount(updatedDishesList.length);
      } catch (error) {
        console.error("Error al eliminar el plato:", error);
      }
    }
  };

  const calculateDishTotal = (ingredients) => {
    return ingredients.reduce((total, ing) => total + (ing.unitPrice || 0), 0);
  };

  const calculateProfit = (totalCost, price) => {
    return price - totalCost;
  };

  const calculateMargin = (totalCost, price) => {
    return totalCost > 0 ? ((price - totalCost) / totalCost) * 100 : 0;
  };

  if (formRef.current) {
    formRef.current.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div>
      <h3>{editingDish ? "Editar Plato" : "Crear Plato"}</h3>
      <div ref={formRef} className="form-container">
        <input
          type="text"
          placeholder="Nombre del Plato"
          value={dish.name}
          onChange={(e) => setDish({ ...dish, name: e.target.value })}
        />
        <br />
        <input
          type="number"
          placeholder="Porcentaje de Ganancia (%)"
          value={profitPercentage}
          onChange={(e) => setProfitPercentage(e.target.value)}
        />
        <br />
        <select
          value={selectedIngredient}
          onChange={(e) => setSelectedIngredient(e.target.value)}
        >
          <option value="">Seleccionar Ingrediente</option>
          {ingredientsList.map((ing, index) => (
            <option key={index} value={ing.name}>
              {ing.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Cantidad"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <button onClick={handleAddIngredient}>Agregar Ingrediente</button>
        <ul>
          {dish.ingredients.map((ing, index) => (
            <li key={index}>
              {ing.name} - {ing.quantity} {ing.unit} (Precio: ${" "}
              {ing.unitPrice
                ? ing.unitPrice.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                : "0"}
              ){/* Ícono de eliminar ingrediente */}
              <FaTrash
                onClick={() => handleDeleteIngredient(ing.name)}
                style={{
                  cursor: "pointer",
                  color: "red",
                  marginLeft: "10px",
                }}
                title="Eliminar Ingrediente"
              />
            </li>
          ))}
        </ul>
        <button onClick={editingDish ? handleUpdateDish : handleSaveDish}>
          {editingDish ? "Actualizar Plato" : "Guardar Plato"}
        </button>
      </div>
      {dishesList.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Platos Creados {dishesCount}</h3>
          <div className="dishes-container">
            {dishesList.map((dish, index) => (
              <div
                key={index}
                className="dish-card"
                style={{
                  position: "relative",
                  marginBottom: "20px",
                  border: "1px solid #ccc",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                <FaEdit
                  onClick={() => handleEditDish(dish)}
                  style={{
                    cursor: "pointer",
                    color: "blue",
                    marginRight: "10px",
                    position: "absolute",
                    top: "10px",
                    right: "40px",
                  }}
                  title="Editar Plato"
                />
                <FaTrash
                  onClick={() => handleDeleteDish(index)}
                  style={{
                    cursor: "pointer",
                    color: "red",
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                  }}
                  title="Eliminar Plato"
                />
                <h4>{dish.name}</h4>
                {/* Tabla de Ingredientes */}
                <div className="ingredients-table">
                  <div className="ingredients-header">
                    <span>Ingredientes</span>
                  </div>
                  <br />
                  {dish.ingredients.map((ing, i) => (
                    <div className="ingredients-row" key={i}>
                      <span>{ing.name}</span>
                      <span>
                        {ing.quantity} {ing.unit}
                      </span>
                      <span>
                        $
                        {ing.unitPrice
                          ? ing.unitPrice.toLocaleString("es-CO", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })
                          : "0"}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Tabla de Valores de Ganancia y Margen */}
                <div className="pricing-table">
                  <br />
                  <div className="pricing-row">
                    <span>
                      <strong>Valor del Plato:</strong>
                    </span>
                    <span>
                      $
                      {calculateDishTotal(dish.ingredients).toLocaleString(
                        "es-CO",
                        { minimumFractionDigits: 0, maximumFractionDigits: 0 }
                      )}
                    </span>
                  </div>
                  <div className="pricing-row">
                    <span>
                      <strong>Precio de Venta:</strong>
                    </span>
                    <span>
                      $
                      {dish.price
                        ? dish.price.toLocaleString("es-CO", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })
                        : "0"}
                    </span>
                  </div>
                  <div className="pricing-row">
                    <span>
                      <strong>Total de Ganancias:</strong>
                    </span>
                    <span>
                      $
                      {dish.profit
                        ? dish.profit.toLocaleString("es-CO", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })
                        : "0"}
                    </span>
                  </div>
                  <div className="pricing-row">
                    <span>
                      <strong>Margen de Ganancia:</strong>
                    </span>
                    <span>
                      {dish.margin
                        ? dish.margin.toLocaleString("es-CO", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })
                        : "0"}
                      %
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateDish;
