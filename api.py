import os
import json
import requests
from tabulate import tabulate

def show_all_user():
    output = os.popen('curl http://iueight2020.synology.me:8080/api/user/showall').read()
    data = json.loads(output)
    os.system('clear')
    table_data = [[item['_id'], item['email'], item['username'], item['admin'], item['datetime']] for item in data]
    headers = ['id', 'email', 'username', 'admin','datetime']
    print(tabulate(table_data,headers,tablefmt='grid'))
    input("Press Enter to go back to the index...")

def create_user():
    os.system('clear')
    email = str(input('Input email: '))
    username = str(input('Input username: '))
    password = str(input('Input password: '))
    output = os.popen(f'curl -X POST http://iueight2020.synology.me:8080/api/user/add -H "Content-Type: application/json" -d \'{{"email": "{email}", "username": "{username}", "password": "{password}"}}\'').read()
    data = json.loads(output)
    os.system('clear')
    table_data = [[data['message']]]
    headers = ['message']
    print(tabulate(table_data, headers, tablefmt='grid'))
    input("Press Enter to go back to the index...")

def drop_user():
    while True:
        output = os.popen('curl http://iueight2020.synology.me:8080/api/user/showall').read()
        data = json.loads(output)
        os.system('clear')
        table_data = [[item['_id'], item['email'], item['username'], item['admin'], item['datetime']] for item in data]
        headers = ['id', 'email', 'username', 'admin','datetime']
        print(tabulate(table_data,headers,tablefmt='grid'))
        userid = str(input('Input user id to drop user: '))
        if userid == '' :
            print('User ID cannot be empty. Please input again.')
            input("Press Enter to continue")
            os.system('clear')
            True
        else:
            break
    output_user = os.popen(f'curl -X DELETE http://iueight2020.synology.me:8080/api/user/drop/{userid}').read()
    data_user = json.loads(output_user)
    output_blog = os.popen(f'curl -X DELETE http://iueight2020.synology.me:8080/api/blogs/delete_blog/{userid}').read()
    data_blog = json.loads(output_blog)
    output_comment = os.popen(f'curl -X DELETE http://iueight2020.synology.me:8080/api/user/delete_comment/{userid}').read()
    data_comment = json.loads(output_comment)
    os.system('clear')
    table_data = [[data_user['message']]]
    headers = ['message']
    print(tabulate(table_data, headers, tablefmt='grid'))
    table_data = [[data_blog['message']]]
    headers = ['message']
    print(tabulate(table_data, headers, tablefmt='grid'))
    table_data = [[data_comment['message']]]
    headers = ['message']
    print(tabulate(table_data, headers, tablefmt='grid'))
    input("Press Enter to go back to the index...")

def updata_user():
    while True:
        output = os.popen('curl http://iueight2020.synology.me:8080/api/user/showall').read()
        data = json.loads(output)
        os.system('clear')
        table_data = [[item['_id'], item['email'], item['username'], item['admin'], item['datetime']] for item in data]
        headers = ['id', 'email', 'username', 'admin','datetime']
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
    output = os.popen(f'curl -X PUT http://iueight2020.synology.me:8080/api/user/update/{userid} -H "Content-Type: application/json" -d \'{json_payload_str}\'').read()
    data = json.loads(output)
    os.system('clear')
    table_data = [[data['message']]]
    headers = ['message']
    print(tabulate(table_data, headers, tablefmt='grid'))
    input("Press Enter to go back to the index...")
    
def check_server():
    url = "http://iueight2020.synology.me:8080"
    try:
        response = requests.get(url)
        return True
    except requests.ConnectionError:
        print(f"{url} is unreachable or the connection is refused.")
        input("Press Enter")
        return False

def find_with_username():
    username = str(input('Input username: '))
    output = os.popen(f'curl http://iueight2020.synology.me:8080/api/user/get_with_username/{username}').read()
    data = json.loads(output)
    os.system('clear')
    table_data = [[item['_id'], item['email'], item['username'], item['admin'], item['datetime']] for item in data]
    headers = ['id', 'email', 'username', 'admin','datetime']
    print(tabulate(table_data,headers,tablefmt='grid'))
    input("Press Enter to go back to the index...")

def get_blog():
    output = os.popen('curl http://iueight2020.synology.me:8080/api/blogs/get_all_blog').read()
    data = json.loads(output)
    os.system('clear')
    table_data = []
    for item in data:
        userdetails = item.get('userdetails', [{}])[0]
        table_data.append([item.get('_id', ''), userdetails.get('username', ''), item.get('title', ''), item.get('content', ''), item.get('datetime', ''), item.get('channel', '')])
    headers = ["_id", "username", "title", "content", "datetime", "channel"]
    print(tabulate(table_data, headers=headers, tablefmt="grid"))
    input("Press Enter to go back to the index...")

def get_blog_comment():
    output = os.popen('curl http://iueight2020.synology.me:8080/api/blogs/get_all_blog').read()
    data = json.loads(output)
    os.system('clear')
    table_data = []
    for item in data:
        userdetails = item.get('userdetails', [{}])[0]
        table_data.append([item.get('_id', ''), userdetails.get('username', ''), item.get('title', ''), item.get('content', ''), item.get('datetime', ''), item.get('channel', '')])
    headers = ["_id", "username", "title", "content", "datetime", "channel"]
    print(tabulate(table_data, headers=headers, tablefmt="grid"))
    blog_id = str(input('Input blog id: '))
    output = os.popen(f'curl http://iueight2020.synology.me:8080/api/blogs/get_blog_comment/{blog_id}').read()
    data = json.loads(output)
    os.system('clear')
    table_data = []
    for item in data:
        userdetails = item.get('userdetails', [{}])[0]
        table_data.append([item.get('_id', ''), userdetails.get('username', ''), item.get('content', ''), item.get('datetime', '')])
    headers = ["_id", "username", "content", "datetime"]
    print(tabulate(table_data, headers=headers, tablefmt="grid"))
    input("Press Enter to go back to the index...")

def delete_comment():
    os.system('clear')

    while True:
        comment_id = str(input('Input comment id: '))
        if comment_id == '' :
            print('Comment ID cannot be empty. Please input again.')
            input("Press Enter to continue")
            os.system('clear')
            True
        else:
            break
    output = os.popen(f'curl -X DELETE http://iueight2020.synology.me:8080/api/blogs/delete_comment/{comment_id}').read()
    data = json.loads(output)
    os.system('clear')
    table_data = [[data['message']]]
    headers = ['message']
    print(tabulate(table_data, headers, tablefmt='grid'))
    input("Press Enter to go back to the index...")

while True:
    index = {
        1: 'Showall user',
        2: 'Create user',
        3: 'Drop user',
        4: 'Update user',
        5: 'Find with username',
        6: 'Get blog',
        7: 'Get blog comment',
        8: 'Delete comment'
    }
    if not check_server():
        break
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
            show_all_user()
        elif index_num == 2:
            create_user()
        elif index_num == 3:
            drop_user()
        elif index_num == 4:
            updata_user()
        elif index_num == 5:
            find_with_username()
        elif index_num == 6:
            get_blog()
        elif index_num == 7:
            get_blog_comment()
        elif index_num == 8:
            delete_comment()
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
