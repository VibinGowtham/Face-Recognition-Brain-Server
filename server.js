const express=require('express');
const bodyparser=require('body-parser');
const cors=require('cors');
const knex=require('knex');
const bcrypt=require('bcrypt');
const salt=5;


const db=knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'vibin123vlv',
    database : 'smartbrain'
  }
});


const app=express();

app.use(bodyparser.json());

app.use(cors());


app.post('/signin', (req, res) => {
	const{ email, password }=req.body;
  if(password){
    db.select('email','id').from('login')
    .where('email', '=', email)
    .then(data => {
      if (data[0].id) {
        return db.select('*').from('users')
          .where('email', '=', email)
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json('unable to get user'))
      } else {
        res.status(400).json('wrongg credentials')
      }
    })
    .catch(err => res.status(400).json('failed promise'))
  }else{
    prompt("Please Enter Password");
  }
  
})




app.post('/register',(req,res)=>{
	const {name,password,email}=req.body;
  const hash = bcrypt.hashSync(password, salt);
	db.transaction(trx => {
		trx.insert({
			hash:hash,
			email:email
		})
		.into('login')
		.returning('email')
		.then(loginEmail=>{
			return trx('users')
			.returning('*')
			.insert({
				name: name,
				email: loginEmail[0],
				date:new Date() 
			})
			.then(user=>{
				res.json(user[0]);
			})
			
		})

        .then(trx.commit)
        .catch(trx.rollback)	
	})

		.catch(err=>res.json('unable to register'))

})

app.get('/profile/:id',(req,res)=>{
	const {id}=req.params;
	db.select('*').from('users').where({id})
	.then(user=>res.json(user[0]))
	.catch(err=>res.json(err))
})


app.put('/image',(req,res)=>{
	const {id}=req.body;
db('users')
  .where('id', '=', id)
  .increment('entries', 1)
  .returning('entries')
  .then(entries=>{
  	res.json(entries[0]);
  })
.catch(err=>res.json('err'))
})



app.listen(process.env.PORT || 3000,()=>{
  console.log(`App is running on $(process.env.PORT)`);
});



