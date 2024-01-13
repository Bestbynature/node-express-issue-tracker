"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongodb = require("mongodb");

const uri = process.env.MONGO_URI;

module.exports = function (app) {
  mongoose.connect(uri);

  const issueSchema = new Schema({
    project: { type: String, required: true },
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: String,
    status_text: String,
    open: { type: Boolean, required: true },
    created_on: { type: Date, required: true },
    updated_on: { type: Date, required: true },
  }, {
    versionKey: false
  });

  const Issue = mongoose.model("Issue", issueSchema);

  module.exports = { Issue }

  app
    .route("/api/issues/:project")
    .get(async function (req, res) {
      try {
        let project = req.params.project;
        let { _id, ...searchFields } = req.query;
        let query = { project: project };
    
        if (_id) {
          query._id = _id;
        }
    
        // Check if there are no search fields provided; fetch all issues for the project
        if (Object.keys(searchFields).length === 0) {
          const issues = await Issue.find(query).exec();
          return res.status(200).json(issues);
        }
    
        // Iterating through URL query parameters to create the search query
        for (let field in searchFields) {
          if (Object.prototype.hasOwnProperty.call(searchFields, field)) {
            query[field] = searchFields[field];
          }
        }

        // console.log('Query:', query)
    
        const filteredIssues = await Issue.find(query).exec();
        // console.log('Filtered Issues:', filteredIssues)
        return res.status(200).json(filteredIssues);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "unexpected error occurred" });
      }
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
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || "",
          status_text: status_text || "",
          open: true,
          created_on: new Date().toUTCString(),
          updated_on: new Date().toUTCString(),
          _id: new mongodb.ObjectId().toString(),
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
    .put(async function (req, res) {
      try {
        let project = req.params.project;
        let { _id, ...updateFields } = req.body;
    
        if (!_id && Object.keys(updateFields).length !== 0) {
          return res.status(400).json({ error: "missing _id" });
        }
    
        if (Object.keys(updateFields).length === 0) {
          return res.status(400).json({
            error: "no update field(s) sent",
            _id,
          });
        }
    
        updateFields.updated_on = new Date().toUTCString();
    
        // Include the project in the query to find the existing issue
        const existingIssue = await Issue.findOne({ _id, project }).exec();
  
        if(existingIssue) console.log(existingIssue.updated_on)
        
        if (!existingIssue) {
          return res.status(404).json({ error: "issue not found", _id });
        }
    
        const option = { new: true };
        
        setTimeout(async() => {
          
          const updatedIssue = await Issue.findOneAndUpdate({ _id, project }, { $set: updateFields }, option).exec();
      
          if (!updatedIssue) {
            return res.status(404).json({ error: "could not update", _id });
          }
          

          console.log(updatedIssue.updated_on)


          return res.status(200).json({
            result: "successfully updated",
            '_id': updatedIssue._id.toString(),
          });

        }, 1000)
    
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'could not update' });
      }
    })
    .delete(async function (req, res) {
      try {
        let project = req.params.project;
        let { _id } = req.body;
    
        if (!_id) {
          return res.status(400).json({ error: "missing _id" });
        }
    
        if (!mongoose.Types.ObjectId.isValid(_id)) {
          return res.status(400).json({ error: "could not delete", _id });
        }
    
        const deletedIssue = await Issue.findOneAndDelete({ _id, project }).exec();
    
        if (!deletedIssue) {
          return res.status(404).json({ error: "could not delete", _id });
        }
    
        return res.status(200).json({ result: "successfully deleted", _id });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "could not delete", _id });
      }
    });

};
