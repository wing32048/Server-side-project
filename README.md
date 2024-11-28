>[!NOTE]
>This README.md file should be read before doing any action !

# 1. Project info: Project name, Group info (group no., students’ names and SID)
	Project Name: XXXBlog
 	Group ID: 29
	Students ID + Name:
	- Wong Kin Wui 		13512817
	- Ngai Kin Fung 	13734198
	- Law Cheuk Hin 	13677010
	- Law Ka Shing 		13343833 
	- Huang Chun Yu 	13061682

# 2. Project file intro
- server.js: a brief summary of functionalities it provided:
	>Signup  
	>Login  
	>Forget Password  
	>Create Blogs and comments  
	>Search blogs   
	>Edit blogs
 	>Delete Blogs   			(Administrator Privilage)     
	>Delete comments 			(Administrator Privilage)     
	>Show comments created time       
	>Search with username 			(Administrator Privilage)        
 	>Logout

	


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
  	-	createblog.ejs
 	-	createcomment.ejs
  	-	edit.ejs
  	-	editcomment.ejs
 	-	list.ejs
  	-	login_out.ejs
	- 	logout.ejs
 	-	noresults.ejs
  	-	reset_password.ejs
  	-	success.ejs



# 3. The cloud-based server URL (your server host running on the cloud platform) for testing:

	http://iueight2020.synology.me:8080/



# 4. Operation guides (like a user flow) for your server
- the use of Login/Logout pages: a list of valid login information, sign in steps? 

	## **Login information**
	> - admin@admin.com/P@ssw0rd 	(Administrator)     
	> - lauboss@lauboss.com/P@ssw0rd 	(User)
	>    
	> Click the word "Login", enter the login information and click the login button below to sign in.    
    
	## **Administrator Privilage**
	>- Drop User
	>- Drop Blog
	>- Drop Comments
 	>- Find User username 	


- the use of your CRUD web pages: which button or UI is used to implement create, read, update, and delete?
	> On the main page, the login button has implemented read, while the sign up button has implemented read and create.    
	> On the login page, there are also a "Forget Password" button, this has implemented read and update.   
	> After successful login, there is a `Create a New Blog` button, it implemented create.    
	> When login as an admininstrator, you are able to delete comments, by clicking the blog that comments located and you'll see a Delete button, the delete button implements delete.   


- the use your RESTful CRUD services: the lists of APIs? HTTP request types? Path URI? How to test them? 
CURL testing commands?

	> `curl http://iueight2020.synology.me:8080/api/test` is a GET Method, it should return `{"message":"Hello world!"}` as respond
	         
 	> `curl http://iueight2020.synology.me:8080/api/user/showall` is a GET Method, it is used for returning blog account data
       
 	> `curl -X POST http://iueight2020.synology.me:8080/api/user/add -H "Content-Type: application/json" -d \'{{"email": "{email}", "username": "{username}", "password": "{password}"}}` is a POST Method, it is used for creating account on the blog
      
 	> `curl -X DELETE http://iueight2020.synology.me:8080/api/user/drop/{userid}` is a DELETE Method, this is used for deleting a blog user account
       
 	> `curl -X DELETE http://iueight2020.synology.me:8080/api/user/delete_blog/{userid}` is a DELETE Method and used for blog post by the user
        
 	> `curl -X DELETE http://iueight2020.synology.me:8080/api/user/delete_comment/{userid}` is a DELETE Method and used for blog comment by the user
        
 	> `curl -X PUT http://iueight2020.synology.me:8080/api/user/update/{userid} -H "Content-Type: application/json" -d \'{json_payload_str}\'` is a PUT Method and use for updating the user data.
    
 	> `curl http://iueight2020.synology.me:8080/api/blogs/get_all_blog` is a GET Method used to show all blogs.
        
 	> `curl http://iueight2020.synology.me:8080/api/blogs/get_blog_comment/{blog_id}` is a GET Method used to show all blogs comments.
     
 	> `curl -X DELETE http://iueight2020.synology.me:8080/api/blogs/delete_comment/{comment_id}` is a DELETE Method used to delete certain comments on blog.
         
 	> `curl -X DELETE http://iueight2020.synology.me:8080/api/blogs/delete_blog/{blog_id}` is a DELETE Method used to delete certain blog post on blog.    
