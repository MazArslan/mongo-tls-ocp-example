const express = require('express');
const app = express()

const taskRoute = express.Router();
let Task = require('../model/Task');

//get all books
taskRoute.route('/').get((req,res) => {
    Task.find((err, data) => {
        if (err) {
            return next(err)
        } else {
            res.json(data)
        }
    })
})

// add
taskRoute.route('/add-task').post((req,res, next) => {
    Task.create(req.body, (err, data) => {
        if (err) {
            return next(err)
        } else {
            res.json (data)
        }
    })
})

// update
taskRoute.route('/update-task/:id').post((req,res, next) => {
    Task.findByIdAndUpdate(req.params.id, {$set: req.body}, (err, data) => {
        if (err) {
            console.log(err)
            return next(err);
        } else {
            res.json (data)
            console.log("updated")
        }
    })
})

// delete
taskRoute.route('/delete-task/:id').post((req, res, next) => {
    Task.findByIdAndDelete(req.params.id, {$set: req.body}, (err, data) => {
        if (err) {
            console.log(err)
            return next(err);
        } else {
            res.status(200).json({msg: data})
        }
    })
})

module.exports = taskRoute;