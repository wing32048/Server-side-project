>[!NOTE]
>This README.md file should be read before doing any action !

# 1. Project info: Project name, Group info (group no., students’ names and SID)
	Project Name: XXXBlog
	Students ID + Name:
	- Wong Kin Wui 		13512817
	- Ngai Kin Fung 	13734198
	- Law Cheuk Hin 	13677010
	- Law Ka Shing 		13343833 
	- Huang Chun Yu 	13061682

# 2. Project file intro
- server.js: a brief summary of functionalities it provided:
	Signup  
	Login  
	Forget Password  
	Create Blogs and comments  
	Show comments created time  
	Search blogs
	Edit blogs
	Delete comments
	Delete blogs
	Find with username
	


- package.json: 
	Lists of dependencies:
    -    express
    -    ejs
    -    passport
    -    express-session
    -    cookie-parser
    -    passport-facebook
    -    mongoose
    -    uuid
    -    bcrypt



- public (folder, if you have): what static files included:
	There are 2 css file
	- 	Lstyle.css
	- 	style.css


- views (folder, if you have): what EJS or UI files included:
	There are 13 files
	- 	admin.ejs
 	-	blogcomments.ejs
  	-	change.ejs
  	-	.ejs
 	-	.ejs
  	-	.ejs
  	-	.ejs
 	-	.ejs
  	-	.ejs
	- 	.ejs
 	-	.ejs
  	-	.ejs
  	-	.ejs



# 3. The cloud-based server URL (your server host running on the cloud platform) for testing:

http://iueight2020.synology.me:8080/



# 4. Operation guides (like a user flow) for your server
- the use of Login/Logout pages: a list of valid login information, sign in steps? 

	>Login information: 
	> - admin@admin.com/P@ssw0rd 	(Administrator)     
	> - loser@cc.com/123 	(User)
	> 
	> Click the word "Login", enter the login information and click the login button below to sign in.


- the use of your CRUD web pages: which button or UI is used to implement create, read, update, and delete?
	> On the main page, the login button has implemented read, while the sign up button has implemented read and create.
	> On the login page, there are also a "Forget Password" button, this has implemented read and update.
	> After successful login, there is a `Create a New Blog` button, it implemented create. 
	> When login as an admininstrator, you are able to delete comments, by clicking the blog that comments located and you'll see a Delete button, the delete button implements delete.


- the use your RESTful CRUD services: the lists of APIs? HTTP request types? Path URI? How to test them? 
CURL testing commands?

	> `curl http://iueight2020.synology.me:8080/api/test` is a GET Method, it should return `{"message":"Hello world!"}` as respond
