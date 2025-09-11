from mysql.connector import connect

def get_db_connection():
    return connect(
        host="localhost",
        user="root",  # Altere para seu usuário do MySQL
        password="",  # Altere para sua senha do MySQL
        database="biblioteca"
    )