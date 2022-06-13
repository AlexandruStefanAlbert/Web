const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
var session=require('express-session');
const { use } = require('bcrypt/promises');
const { name } = require('body-parser');

const app = express();

const port = 6789;



const users = [
	{
		username: "user",
		password: "user"
	},
	
];
const admin = [
	{
		username: "admin",
		password: "admin"
	}
];

app.use(cookieParser());

app.use(session({
	secret:'secret',
	resave:false,
	saveUninitialized:false,
	cookie:{
	maxAge:10000
	}}));

const mysql = require('mysql2');
const { response } = require('express');
// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului este views/layout.ejs
app.use(expressLayouts);
// directorul 'public' va conține toate resursele accesibile direct de către client (e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în format json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));

// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "user"
  });

var shopItems = new Array; 

app.get ('/creare-bd', (req,res) =>
{
	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
	  });
	con.query("CREATE DATABASE jucarii", function(err, result){
		if (err) throw err;  
console.log("Database created"); 
	});
	con.query("USE jucarii");
	con.query("CREATE TABLE masini( idJucarie int NOT NULL PRIMARY KEY, Model VARCHAR(255), Pret int, cantitate int);", function(err, result){
		if (err) throw err;  
console.log("Table inserted"); 
	});
	res.redirect('/');

});

app.get('/inserare-bd', (req,res)=>
{
	con.query("USE jucarii");
	con.query("INSERT INTO masini VALUES( 2, 'Ferrari2', 400, 120 );", function(err, result){
		if (err) throw err;  
console.log("Values inserted"); 
	});
	

	
	res.redirect('/');

	res.render("index");
});
app.get('/', (req, res) => {

	//tema: 2.f
	/*
		res.render('index', 
		{
			u:req.cookies.utilizator
		})

	*/
		con.query("USE jucarii");

		let sql = "SELECT idJucarie, model, pret from masini";
		let query = con.query(sql, (err,result)=>{
			if(err)throw err;
			console.log(result);
			res.render('index', {u:req.cookies.user, cookie:req.cookies.admin, result});
		})
		//res.render('index', {u:req.cookies.user});
	
	
	
});
app.post('/golire-cos', (req,res)=>
{
	shopItems=[];
	console.log(shopItems);
	res.redirect('/vizualizare-cos');
});

app.get('/vizualizare-cos', (req,res)=>
{
	var items = shopItems;
	console.log(items);
	if(shopItems.length==0)
	{
		res.render('vizualizare-cos', {shopItems});
	}
	else
	{
		let sql = "SELECT idJucarie, model, pret from jucarii.masini where idJucarie IN (" +items+" )";
	let query = con.query(sql,items, (err,cos)=>{
		if(err)throw err;
		
		
		console.log(cos);
		res.render('vizualizare-cos', {cos, shopItems});
	})
	}
	
});
app.post('/adaugare-cos', (req, res)=>
{
	shopItems.push(req.body.id);
	
	console.log(shopItems);
	//res.redirect('/');
});
app.post('/adaugare-produse', (req,res)=>
{
	var id=req.body.idJucarie;
	var model=JSON.stringify(req.body.model);
	var pret=req.body.pret;
	var cantitate=req.body.cantitate;
	console.log(id,model,pret,cantitate);
	con.query("USE jucarii");

	con.query("INSERT INTO masini VALUES( "+id+", "+model+","+pret+","+cantitate+" );", function(err, result){
		if (err) throw err;  
console.log("Values inserted"); 
	});

	
	res.redirect('/');
	
});
app.get('/autentificare', (req,res) => 
{
		
	res.render('autentificare', {eroare:req.cookies.Eroare});
	
});

app.get ('/logout', (req, res) =>
{	
	res.clearCookie(req.cookies.Eroare);
	res.clearCookie(req.cookies.user);
	
	console.log("Cookie sters");
	res.redirect('/');
});
app.get ('/logout-admin', (req, res) =>
{	
	
	res.clearCookie(req.cookies.admin);
	console.log("Cookie admin sters");
	res.redirect('/');
});

app.post ('/verificare-autentificare', (req, res) =>
{
	
	var username = users.map(p=>p.username);
	var password = users.map(p=>p.password);

	var admin_username = admin.map(p=>p.username);
	var admin_password = admin.map(p=>p.password);

	if(admin_username==req.body.username && admin_password == req.body.pass)
	{
		console.log('good');
		res.cookie('admin', admin_username);
		res.redirect('/');
	}
		
	else if(username==req.body.username && password == req.body.pass)
		{
			res.cookie('user', username);
			
			res.redirect('/');
			
		}	
	else
	{	
		res.cookie('Eroare', 'Introduceti user si parola');	
		res.render('autentificare', {eroare:req.cookies.Eroare});
		res.redirect(302,'/autentificare');
		
	}		
	
	console.log(req.cookies);
});
const listaIntrebari = [
	{
		intrebare: 'Ce pret are jocul de domino?',
		variante: ['95 lei', '20 lei', '70 lei', '80 lei'],
		corect: 0
	},

	{
		intrebare: 'Ce culoare are camionul?',
		variante: ['Albastru', 'Galben', 'Verde', 'Rosu'],
		corect: 1

	},
	{
		intrebare: 'Cate carti sunt intr-un pachet de joc?',
		variante: ['52', '54', '50', '60'],
		corect: 2

	},
	{
		intrebare: 'Cand este ziua copilului?',
		variante: ['10 iunie', '1 august', '1 iulie', '1 iunie'],
		corect: 3

	},
	//...
];
// la accesarea din browser adresei http://localhost:6789/chestionar se va apela funcția specificată
app.get('/chestionar', (req, res) => {

	// în fișierul views/chestionar.ejs este accesibilă variabila 'intrebari' care conține vectorul de întrebări
	res.render('chestionar', {intrebari: listaIntrebari});
});

app.post('/rezultat-chestionar', (req, res) => {
	console.log(req.body);
	let c=0;
	if(listaIntrebari.corect==req.body.value)
	{
		c++
		console.log(c);
	}
	res.redirect('/chestionar');
	
	//res.send("formular: " + JSON.stringify(req.body));
});

app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:`));


