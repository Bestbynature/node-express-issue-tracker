'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongodb = require('mongodb');

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
  });

  const Issue = mongoose.model('Issue', issueSchema);

  module.exports = { Issue }

  app
    .route('/api/issues/:project')
    .get(async function (req, res) {
      try {
        let project = req.params.project;
        let { _id, ...searchFields } = req.query;
        let query = { project: project };
    
        if (_id) {
          query._id = _id;
        }
    
        if (Object.keys(searchFields).length === 0) {
          const issues = await Issue.find(query).exec();
          console.log(issues)
          return res.status(200).json(issues);
        }
    
        for (let field in searchFields) {
          if (Object.prototype.hasOwnProperty.call(searchFields, field)) {
            query[field] = searchFields[field];
          }
        }

        const filteredIssues = await Issue.find(query).exec();
        return res.status(200).json(filteredIssues);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'unexpected error occurred' });
      }
    })        
    .post(function (req, res) {
      let project = req.params.project;
      let { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      try {
        let newIssue = new Issue({
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || '',
          open: true,
          created_on: new Date().toUTCString(),
          updated_on: new Date().toUTCString(),
        });
        newIssue.save();
        return res.json(newIssue);
      } catch (error) {
        console.log(error);
        return res.json({
          error: 'could not create',
          project,
        });
      }
    })
    .put(async function (req, res) {
      const updateFields = {};
      let errorOccurred = false;

      if(!req.body._id){
        return res.status(400).json({ error: 'missing _id' });
      }

      Object.keys(req.body).forEach((key) => {
       if(key === '_id'){
        if(mongoose.Types.ObjectId.isValid(req.body[key])){
          updateFields[key] = req.body[key]
        }else{
          errorOccurred = true;
        }
       }else{
        if(req.body[key] !== ''){
          updateFields[key] = req.body[key]
        }
       }
      })
      
      if (errorOccurred) {
        return res.status(500).json({ error: 'could not update', _id: req.body._id });
      }

      console.log(updateFields)

      if (!updateFields._id) {
        return res.status(400).json({ error: 'missing _id' });
      }

      if (Object.keys(updateFields).length === 1) {
        return res.status(400).json({
          error: 'no update field(s) sent',
          _id: updateFields._id,
        });
      }

      updateFields.updated_on = new Date().toUTCString();

      const option = { new: true };

      const updatedIssue = await Issue.findByIdAndUpdate(updateFields._id, updateFields, option);

      if (!updatedIssue) {
        return res.status(404).json({ error: 'could not update', _id: updateFields._id });
      }

      return res.status(200).json({
        result: 'successfully updated',
        '_id': updatedIssue._id.toString(),
      });
    })
    .delete(async function (req, res) {
      try {
        let project = req.params.project;
        let { _id } = req.body;
    
        if (!_id) {
          return res.status(400).json({ error: 'missing _id' });
        }
    
        if (!mongoose.Types.ObjectId.isValid(_id)) {
          return res.status(400).json({ error: 'could not delete', _id });
        }
    
        const deletedIssue = await Issue.findOneAndDelete({ _id, project }).exec();
    
        if (!deletedIssue) {
          return res.status(404).json({ error: 'could not delete', _id });
        }
    
        return res.status(200).send({ result: 'successfully deleted', _id });

      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'could not delete', _id });
      }
    });

};
