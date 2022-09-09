const chai = require('chai')
const sinon = require('sinon')

const errMw = require('../middleware/errors')

describe('Error handler',()=>{
    const res = {
        body:{},
    }
    beforeEach(function(){
        res.status = function(foo) {
                this.statusCode = foo
                return this
            }
        res.json = function(foo) {
            this.body.message = 'Error!'
            this.body.error = foo.error
        }
    })

    it('should return 500 if no status is set',()=>{
        const errObj = new Error('Something on server')

        errMw(errObj,{},res,()=>{
            chai.expect(res.statusCode).to.equal(500)
        })
    })

    it('should return an error object with no err stack',()=>{

        const errObj = new Error('No such post!')
        errMw(errObj,{},res,()=>{
            chai.expect(Object.keys(res.body).length).to.equal(2)
        })
    })



})