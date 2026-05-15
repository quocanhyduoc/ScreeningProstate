import sqlite3

def check_users():
    try:
        conn = sqlite3.connect('screening.db')
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
        if not cursor.fetchone():
            print("Table 'users' does not exist.")
            return
        
        cursor.execute("SELECT id, username, role FROM users;")
        users = cursor.fetchall()
        if not users:
            print("No users found in database.")
        else:
            print("Users found:")
            for u in users:
                print(f"ID: {u[0]}, Username: {u[1]}, Role: {u[2]}")
        conn.close()
    except Exception as e:
        print(f"Error checking users: {e}")

if __name__ == "__main__":
    check_users()
