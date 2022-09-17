const chai = require('chai')
const sinon = require('sinon')
const mongoose = require('mongoose')
require('dotenv').config()
const bcrypt = require('bcrypt')
const User = require('../src/models/user')
const auth = require('../src/controllers/auth')
const errMw = require('../src/middleware/errors')

describe('Signup controller',()=>{
    before((done)=>{
        mongoose.connect(process.env.MONGO_TEST)
            .then(()=>{
             console.log('connected to test db')
                const user=new User({
                "name":"mister man",
                "tag":"cocker",
                "email":"cocker@something.com",
                "password":"cockerhugga"

            })
            user.save().then(
                ()=>{
                    done()
                }
            )
    })})
    const res = {
        body:{}
    }
    it('should return 409 if email already exists',function (done){
        const req = {
            body:{
                name:"mister dantag",
                tag:"docker",
                email:"cocker@something.com",
                password:"cockerhugga"
            }}

            res.status = function(foo) {
                this.statusCode = foo
                return this
            }
            res.json = function(foo) {
                this.body.message = 'Error!'
                this.body.error = foo.error
            }


        auth.signUp(req,res,()=>{})
            .then((result)=> {
                chai.expect(result).to.be.an('error')
                chai.expect(result).to.have.property('statusCode', 409)
                done()
        })
            .catch(err=>{
                done(err)
            })

    })

    it('should return 409 if tag already exists',function (done){
        const req = {
            body:{
                name:"mister dantag",
                tag:"cocker",
                email:"docker@something.com",
                password:"cockerhugga"
            }}

        res.status = function(foo) {
            this.statusCode = foo
            return this
        }
        res.json = function(foo) {
            this.body.message = 'Error!'
            this.body.error = foo.error
        }


        auth.signUp(req,res,()=>{})
            .then((result)=> {
                chai.expect(result).to.be.an('error')
                chai.expect(result).to.have.property('statusCode', 409)
                done()
            })
            .catch(err=>{
                done(err)
            })

    })

    it('should return 201 otherwise',function (done){
        const req = {
            body:{
                name:"mister dantag",
                tag:"docker",
                email:"docker@something.com",
                password:"dockerhugga"
            }}
        res.status = function(foo) {
            this.statusCode = foo
            return this
        }
        res.json = function(foo) {
            this.body.message = 'Error!'
            this.body.error = foo.error
        }


        auth.signUp(req,res,()=>{})
            .then((result)=> {

                chai.expect(result).to.not.be.an('error')
                chai.expect(result.statusCode).to.equal(201)
                done()
            })
            .catch(err=>{
                done(err)
            })

    })
    after((done)=> {
        User.deleteMany({}).then(() => {
            mongoose.disconnect().then(
                ()=>{done()}
            )
        })
    })
})

describe('Login controller',()=> {
    before((done) => {
        mongoose.connect(process.env.MONGO_TEST)
            .then(() => {
                console.log('connected to test db')
                return bcrypt.hash("cockerhugga",12)})
            .then(password=> {
                    const user = new User({
                        name: "mister man",
                        tag: "cocker",
                        email: "cocker@something.com",
                        password

                    })
                    return user.save()
                })
            .then(() => {
                        done()
                    })
            })


    const res = {
        body:{}
    }
    it('should return 401 if user doesn\'t exist',(done)=>{
        const req = {
            body:{
                name:"mister dantag",
                tag:"dddd",
                email:"docker@something.com",
                password:"dockerhugga"
            }}
            res.status = function(foo) {
                this.statusCode = foo
                return this
            }
            res.json = function(foo) {
                this.body.message = 'Error!'
                this.body.error = foo.error
            }

            auth.logIn(req,res,()=>{})
                .then(result=>{
                    chai.expect(result).to.be.an('error')
                    chai.expect(result).to.have.property('statusCode',401)
                    done()
                })
                .catch(err=>{
                    done(err)
                })

    })

    it('should return 401 if wrong password',(done)=>{
        const req = {
            body:{
                name: "mister man",
                tag: "cocker",
                email: "cocker@something.com",
                password: "asdasdadasd"
            }}
        res.status = function(foo) {
            this.statusCode = foo
            return this
        }
        res.json = function(foo) {
            this.body.message = 'Error!'
            this.body.error = foo.error
        }

        auth.logIn(req,res,()=>{})
            .then(result=>{
                chai.expect(result).to.be.an('error')
                chai.expect(result).to.have.property('statusCode',401)
                done()
            })
            .catch(err=>{
                done(err)
            })
    })

    it('should return 201 and jwt otherwise',(done)=>{
        const req = {
            body:{
                name: "mister man",
                tag: "cocker",
                email: "cocker@something.com",
                password: "cockerhugga"
            }}
        res.status = function(foo) {
            this.statusCode = foo
            return this
        }
        res.json = function(foo) {
            this.body={
                message:'foo',
                token:'token',
                userId:'userId'
            }
        }

        auth.logIn(req,res,()=>{})
            .then(result=>{
                chai.expect(result).to.not.be.an('error')
                chai.expect(result).to.have.property('statusCode',201)
                chai.expect(result.body).to.have.property('token')
                chai.expect(result.body).to.have.property('userId')
                done()
            })
            .catch(err=>{
                done(err)
            })
    })

    after(()=> {
        User.deleteMany({}).then(() => {
            mongoose.disconnect()
        })
    })
})