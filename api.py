import os
import json
import requests
import time
from tabulate import tabulate


def showalluser():
    output = os.popen('curl http://localhost:8080/api/showalluser').read()
    data = json.loads(output)
    os.system('clear')
    table_data = [[item['_id'], item['email'], item['username'], item['admin']] for item in data]
    headers = ['id', 'email', 'username', 'admin']
    print(tabulate(table_data,headers,tablefmt='grid'))
    input("Press Enter to go back to the index...")

def createuser():
    os.system('clear')
    email = str(input('What is the email: '))
    username = str(input('What is the username: '))
    password = str(input('What is the password: '))
    output = os.popen(f'curl -X POST http://localhost:8080/api/newuser -H "Content-Type: application/json" -d \'{{"email": "{email}", "username": "{username}", "password": "{password}"}}\'').read()
    data = json.loads(output)
    os.system('clear')
    table_data = [[data['message']]]
    headers = ['message']
    print(tabulate(table_data, headers, tablefmt='grid'))
    input("Press Enter to go back to the index...")

def dropuser():
    while True:
        output = os.popen('curl http://localhost:8080/api/showalluser').read()
        data = json.loads(output)
        os.system('clear')
        table_data = [[item['_id'], item['email'], item['username'], item['admin']] for item in data]
        headers = ['id', 'email', 'username', 'admin']
        print(tabulate(table_data,headers,tablefmt='grid'))
        userid = str(input('Input user id to drop user: '))
        if userid == '' :
            print('User ID cannot be empty. Please input again.')
            input("Press Enter to continue")
            os.system('clear')
            True
        else:
            break
    output = os.popen(f'curl -X DELETE http://localhost:8080/api/dropuser/{userid}').read()
    data = json.loads(output)
    os.system('clear')
    table_data = [[data['message']]]
    headers = ['message']
    print(tabulate(table_data, headers, tablefmt='grid'))
    input("Press Enter to go back to the index...")

def updatauser():
    while True:
        output = os.popen('curl http://localhost:8080/api/showalluser').read()
        data = json.loads(output)
        os.system('clear')
        table_data = [[item['_id'], item['email'], item['username'], item['admin']] for item in data]
        headers = ['id', 'email', 'username', 'admin']
        print(tabulate(table_data,headers,tablefmt='grid'))
        userid = str(input('Input user id to updata user: '))
        if userid == '' :
            print('User ID cannot be empty. Please input again.')
            input("Press Enter to continue")
            os.system('clear')
            True
        else:
            break
    email = str(input('Input email: '))
    username = str(input('Input username: '))
    password = str(input('Input password: '))
    admin_input = input('Is the user an admin? (T/F): ').upper()
    json_payload ={}
    if email:
        json_payload["email"] = email
    if username:
        json_payload['username'] = username
    if password:
        json_payload['password'] = password
    if admin_input == 'T':
        json_payload['admin'] = 'true'
    elif admin_input == 'F':
        json_payload['admin'] = 'false'
    else:
        pass
    json_payload_str = json.dumps(json_payload)
    output = os.popen(f'curl -X PUT http://localhost:8080/api/updateuser/{userid} -H "Content-Type: application/json" -d \'{json_payload_str}\'').read()
    data = json.loads(output)
    os.system('clear')
    table_data = [[data['message']]]
    headers = ['message']
    print(tabulate(table_data, headers, tablefmt='grid'))
    input("Press Enter to go back to the index...")
    
def checkserver():
    url = "http://localhost:8080"
    try:
        response = requests.get(url)
    except requests.ConnectionError:
        print(f"{url} is unreachable or the connection is refused.")
        os.popen('npm start')
        print('Starting server in 10s')
        time.sleep(10)


while True:
    checkserver()
    index = {
        1: 'Showall user',
        2: 'Create user',
        3: 'Drop user',
        4: 'Update user'
    }
    try:
        os.system('clear')
        table_data = [[key, value] for key, value in index.items()]
        headers = ['Option', 'Action']
        print(tabulate(table_data,headers,tablefmt='grid'))
        user_input = input('Choose an action (Enter "quit" to quit): ')

        if user_input == 'quit':
            break
        index_num = int(user_input)
        if index_num == 1:
            showalluser()
        elif index_num == 2:
            createuser()
        elif index_num == 3:
            dropuser()
        elif index_num == 4:
            updatauser()
    except ValueError:
        try:
            os.system('clear')
            print("Invalid input. Please enter a valid number.")
            input("Press Enter to input again...")
        except KeyboardInterrupt:
            os.system('clear')
            print("KeyboardInterrupt detected. Exiting...")
            break
    except KeyboardInterrupt:
        os.system('clear')
        print("KeyboardInterrupt detected. Exiting...")
        break