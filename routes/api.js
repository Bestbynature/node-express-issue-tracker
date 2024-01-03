"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongodb = require("mongodb");

const uri = process.env.MONGO_URI;

module.exports = function (app) {
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  const issueSchema = new Schema({
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: String,
    status_text: String,
    open: { type: Boolean, required: true },
    created_on: { type: Date, required: true },
    updated_on: { type: Date, required: true },
    project: String,
  });

  const Issue = mongoose.model("Issue", issueSchema);

  app
    .route("/api/issues/:project")
    .get(function (req, res) {
      let project = req.params.project;
      let { _id, ...searchFields } = req.query;
      let query = { projectId: project };

      if (_id) {
        query._id = _id;
      }

      Object.keys(searchFields).forEach((key) => {
        query[key] = searchFields[key];
      });

      IssueModel.find(query, (err, issues) => {
        if (err) {
          console.log(err);
          return res.json({ error: "could not get", projectName });
        }
        return res.json(issues);
      });
    })
    .post(function (req, res) {
      let project = req.params.project;
      let { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: "required field(s) missing" });
      }

      try {
        let newIssue = new Issue({
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || "",
          status_text: status_text || "",
          open: true,
          created_on: new Date().toUTCString(),
          updated_on: new Date().toUTCString(),
          project,
        });
        newIssue.save();
        return res.json(newIssue);
      } catch (error) {
        console.log(error);
        return res.json({
          error: "could not create",
          project,
        });
      }
    })
    .put(function (req, res) {
      let project = req.params.project;
    
      let updateObject = {};
    
      if(!req.body._id) {
        return res.json({ error: "missing _id" });
      }
    
      // Filter out _id field, then check if any fields remain for update
      Object.keys(req.body)
        .filter(key => key !== '_id')
        .forEach((key) => {
          if (req.body[key]) {
            updateObject[key] = req.body[key];
          }
        });
    
      if (Object.keys(updateObject).length === 0) {
        return res.json({
          error: "no update field(s) sent",
          _id: req.body._id,
        });
      }
    
      updateObject.updated_on = new Date().toUTCString();
    
      Issue.findByIdAndUpdate(
        req.body._id, 
        updateObject, 
        { new: true },
        (err, updatedIssue) => {
          if (err || !updatedIssue) {
            return res.json({ error: "could not update", _id: req.body._id });
          }
          return res.json({
            result: "successfully updated",
            _id: req.body._id,
          });
        }
      );
    })    
    .delete(function (req, res) {
      let project = req.params.project;
      let { _id } = req.body;

      if (!_id) {
        return res.json({ error: "missing _id" });
      }

      let issueIndex = issues.findIndex((issue) => issue._id === parseInt(_id));

      if (issueIndex === -1) {
        return res.json({ error: "could not delete", _id });
      }

      issues.splice(issueIndex, 1);
      res.json({ result: "successfully deleted", _id });
    });
};
