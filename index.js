const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const connection = require('./database/database')
const categoriesController = require('./categories/CategoriesController')
const articlesController = require('./articles/ArticlesController')
const usersController = require('./users/UsersController')
const Article = require('./articles/Article')
const Category = require('./categories/Category')
const User = require('./users/User')
const port = 8181

//View engine
app.set('view engine', 'ejs')

//Body parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser. json())

//Sessions
app.use(session({
    secret: 'byGeorghitonLuiz',
    cookie: { maxAge: 30000 }
}))

//Static
app.use(express.static('public'))

//Database
connection.authenticate().then(() => {
    console.log('Conexão feita com sucesso')
}).catch((error) => {
    console.log(error)
})

app.use('/', categoriesController)
app.use('/', articlesController)
app.use('/', usersController)

app.get('/', (req, res) => {

    Article.findAll({
        order:[
            ['id', 'DESC']
        ]
    }).then(articles => {

        Category.findAll().then(categories => {
            res.render('index', {articles: articles, categories: categories})
        })
        
    })    
})

app.get('/:slug', (req, res) => {
    let slug = req.params.slug
    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if (article != undefined) {
            Category.findAll().then(categories => {
                res.render('article', {article: article, categories: categories})
            })
        } else {
            res.redirect('/')
        }
    }).catch(erro => {
        res.redirect('/')
    })
})

app.get('/category/:slug', (req, res) => {
    let slug = req.params.slug
    Category.findOne({
        where: {
            slug:slug
        },
        include: [{model: Article}]
    }).then(category => {
        if(category != undefined){
            Category.findAll().then(categories => {
                res.render('index', {articles: category.articles, categories: categories})
            })
        }else{
            res.redirect('/')
        }
    }).catch(erro => {
        res.redirect('/')
    })
})

app.listen(port, () => {
    console.log(`O servidor está rodando na porta ${port}`)
})