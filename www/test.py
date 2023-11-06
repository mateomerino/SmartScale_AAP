import mysql.connector
import json

# Configuración de la conexión a la base de datos
config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'password',
    'database': 'union_agricola'
}

# Función para realizar la consulta a la base de datos y guardar en JSON
def consulta_y_guardado_en_json():
    try:
        connection = mysql.connector.connect(**config)
        if connection.is_connected():
            print("Conexión a la base de datos establecida.")
            
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM productos")
            productos = cursor.fetchall()

            # Guardar la información en un archivo JSON
            with open('products.json', 'w') as file:
                json.dump(productos, file, indent=4)

            print("Datos guardados en 'products.json'.")

    except mysql.connector.Error as e:
        print(f"Error: {e}")
    finally:
        if 'connection' in locals():
            connection.close()
            print("Conexión a la base de datos cerrada.")

if __name__ == "__main__":
    consulta_y_guardado_en_json()
