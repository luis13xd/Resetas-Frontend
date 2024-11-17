import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./AddIngredient.css";

const AddIngredient = () => {
  const [ingredient, setIngredient] = useState({
    name: "",
    unit: "gramos",
    quantity: "",
    price: "",
    unitCost: 0,
  });
  const [ingredientsList, setIngredientsList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const units = ["gramos", "mililitros", "piezas"];

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/ingredients");
        if (!response.ok) {
          throw new Error("Error al obtener ingredientes");
        }
        const data = await response.json();
        setIngredientsList(data);
      } catch (error) {
        console.error("Error en fetchIngredients:", error);
      }
    };

    fetchIngredients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIngredient((prevIngredient) => {
      const updatedIngredient = { ...prevIngredient, [name]: value };
  
      // Calculamos el costo por unidad cuando se cambian el precio o la cantidad
      if (name === "price" || name === "quantity") {
        updatedIngredient.unitCost = (updatedIngredient.price / updatedIngredient.quantity) || 0;
      }
  
      return updatedIngredient;
    });
  };
  

  const handleSaveIngredient = async (e) => {
    e.preventDefault();
    try {
      // Recalcular el costo unitario en frontend antes de enviar
      const updatedIngredient = {
        ...ingredient,
        unitCost: ingredient.price / ingredient.quantity || 0,
      };
  
      if (isEditing) {
        await fetch(`http://localhost:3000/api/ingredients/${currentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedIngredient),
        });
      } else {
        await fetch("http://localhost:3000/api/ingredients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedIngredient),
        });
      }
  
      // Actualiza la lista de ingredientes
      const response = await fetch("http://localhost:3000/api/ingredients");
      const data = await response.json();
      setIngredientsList(data);
      handleCancelEdit();
    } catch (error) {
      console.error("Error al guardar ingrediente:", error);
    }
  };
  

  const handleEdit = (id) => {
    const ingredientToEdit = ingredientsList.find((ing) => ing._id === id);
    setIngredient(ingredientToEdit);
    setIsEditing(true);
    setCurrentId(id);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/ingredients/${id}`, { method: "DELETE" });
      setIngredientsList(ingredientsList.filter((ing) => ing._id !== id));
    } catch (error) {
      console.error("Error al eliminar ingrediente:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setIngredient({ name: "", unit: "gramos", quantity: "", price: "" });
    setCurrentId(null);
  };

  return (
    <div className="ingredient-section">
      <h2>{isEditing ? "Editar Ingrediente" : "Agregar Ingrediente"}</h2>
      <form onSubmit={handleSaveIngredient}>
        <label>
          Nombre:
          <input
            type="text"
            name="name"
            value={ingredient.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Unidad de Medida:
          <select
            name="unit"
            value={ingredient.unit}
            onChange={handleChange}
            required
          >
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </label>
        <label>
          Cantidad:
          <input
            type="number"
            name="quantity"
            value={ingredient.quantity}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Precio:
          <input
            type="number"
            name="price"
            value={ingredient.price}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit">{isEditing ? "Actualizar" : "Guardar"}</button>
        {isEditing && <button onClick={handleCancelEdit}>Cancelar</button>}
      </form>

      <h3>Ingredientes Guardados</h3>
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Medida</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Unidad</th>
              <th>Editar</th>
              <th>Borrar</th>     
            </tr>
          </thead>
          <tbody>
            {ingredientsList.map((ing) => (
              <tr key={ing._id}>
                <td>{ing.name}</td>
                <td>{ing.unit}</td>
                <td>{ing.quantity}</td>
                
                <td>${ing.price}</td>
                <td>${ing.unitCost}</td>
                <td>
                  <FaEdit
                    onClick={() => handleEdit(ing._id)}
                    style={{ cursor: "pointer" }}
                  />
                </td>
                <td>
                  <FaTrash
                    onClick={() => handleDelete(ing._id)}
                    style={{ cursor: "pointer", color: "red" }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddIngredient;
