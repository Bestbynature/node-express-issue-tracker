'use strict';

const IssueModel = require('../model').Issue;
const ProjectModel = require('../model').Project

const mongoose = require('mongoose');
const { Issue } = require('../model');

module.exports = function (app) {

  app
    .route('/api/issues/:project')
    .get(async function (req, res) {
      let projectName = req.params.project;
      try {
        let project = await ProjectModel.findOne({ name: projectName }).exec();

        if (!project) {
          return res.status(200).json([{error: 'project not found'}]);
        }else{
          const issues = await Issue.find({ 
            projectId: project._id,
            ...req.query
          }).exec();

          if(!issues){
            return res.status(200).json([{error: 'no issues found'}]);
          }

          return res.status(200).json(issues);
        }
        
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'could not get', project: projectName });
      }
    })        
    .post(async function (req, res) {
      let projectName = req.params.project;
      let { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      try {
        let projectModel = await ProjectModel.findOne({ name: projectName }).exec();

        if (!projectModel) {
          projectModel = new ProjectModel({ name: projectName });
          projectModel = await projectModel.save();
        }

        const issueModel = new IssueModel({
          projectId: projectModel._id,
          issue_title: issue_title || '',
          issue_text: issue_text || '',
          created_by: created_by || '',
          assigned_to: assigned_to || '',
          status_text: status_text || '',
          open: true,
          created_on: new Date(),
          updated_on: new Date(),
        });

        const newIssue = await issueModel.save();


        return res.json(newIssue);
      } catch (error) {
        console.log(error);
        return res.json({
          error: 'could not create',
          projectName,
        });
      }
    })
    .put(async function (req, res) {
      let projectName = req.params.project;

      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.json({ error: 'could not update', _id });
      }

      if (!issue_text && !issue_title && !created_by && !assigned_to && !status_text && !open) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      try {
        const projectModel = await ProjectModel.findOne({ name: projectName }).exec();

        if (!projectModel) {
          return res.json({ error: 'could not update', _id });
        }

        const updateFields = {};

        Object.keys(req.body).forEach((key) => {
          if (req.body[key] !== '') {
            updateFields[key] = req.body[key];
          }
        })

        updateFields.updated_on = new Date();

        let issue = await IssueModel.findByIdAndUpdate(_id, updateFields, { new: true }).exec();

        return res.json({result: 'successfully updated', _id: issue._id ?? _id});
      }catch(error){
        console.error(error);
        return res.json({ error: 'could not update', _id });
      }
    })
    .delete(async function (req, res) {
      let projectName = req.params.project;
      let { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.json({ error: 'could not delete', _id });
      }

      try {
        const projectModel = await ProjectModel.findOne({ name: projectName }).exec();

        if (!projectModel) {
          return res.json({ error: 'could not delete', _id });
        }

        const deletedIssue = await IssueModel.findOneAndDelete({ _id, projectId: projectModel._id }).exec();

        if (!deletedIssue) {
          return res.json({ error: 'could not delete', _id });
        }

        return res.json({ result: 'successfully deleted', _id });
      } catch (error) {
        console.error(error);
        return res.json({ error: 'could not delete', _id });
      }
    });

};
