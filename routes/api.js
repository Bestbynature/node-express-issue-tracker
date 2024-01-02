'use strict';

// Assuming you have a variable 'issues' representing your data store
let issues = [];

module.exports = function (app) {
  app.route('/api/issues/:project')
    .get(function (req, res) {
      let project = req.params.project;
      // Retrieve all issues for the specified project
      let projectIssues = issues.filter(issue => issue.project === project);
      res.json(projectIssues);
    })
    .post(function (req, res) {
      let project = req.params.project;
      let {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      let newIssue = {
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true, // Default to open
        _id: issues.length + 1 // This can be improved for a real database
      };

      issues.push(newIssue);
      res.json(newIssue);
    })
    .put(function (req, res) {
      let project = req.params.project;
      let { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      let issueToUpdate = issues.find(issue => issue._id === parseInt(_id));

      if (!issueToUpdate) {
        return res.json({ error: 'could not update', _id });
      }

      // Update fields if provided in request body
      Object.keys(req.body)
        .filter(key => key !== '_id')
        .forEach(key => {
          issueToUpdate[key] = req.body[key];
        });

      issueToUpdate.updated_on = new Date();
      res.json({ result: 'successfully updated', _id });
    })
    .delete(function (req, res) {
      let project = req.params.project;
      let { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      let issueIndex = issues.findIndex(issue => issue._id === parseInt(_id));

      if (issueIndex === -1) {
        return res.json({ error: 'could not delete', _id });
      }

      issues.splice(issueIndex, 1);
      res.json({ result: 'successfully deleted', _id });
    });
};
