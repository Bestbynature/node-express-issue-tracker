const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

/**
 Create an issue with every field: POST request to /api/issues/{project}
Create an issue with only required fields: POST request to /api/issues/{project}
Create an issue with missing required fields: POST request to /api/issues/{project}
View issues on a project: GET request to /api/issues/{project}
View issues on a project with one filter: GET request to /api/issues/{project}
View issues on a project with multiple filters: GET request to /api/issues/{project}
Update one field on an issue: PUT request to /api/issues/{project}
Update multiple fields on an issue: PUT request to /api/issues/{project}
Update an issue with missing _id: PUT request to /api/issues/{project}
Update an issue with no fields to update: PUT request to /api/issues/{project}
Update an issue with an invalid _id: PUT request to /api/issues/{project}
Delete an issue: DELETE request to /api/issues/{project}
Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
Delete an issue with missing _id: DELETE request to /api/issues/{project}
 */

suite('Functional Tests', function () {
  test('Create an issue with every field', function (done) {
    chai
      .request(server)
      .post('/api/issues/test_project')
      .send({
        issue_title: 'Test Title',
        issue_text: 'Test Text',
        created_by: 'Test Creator',
        assigned_to: 'Test Assignee',
        status_text: 'Test Status',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'issue_title');
        assert.property(res.body, 'issue_text');
        assert.property(res.body, 'created_by');
        assert.property(res.body, 'assigned_to');
        assert.property(res.body, 'status_text');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'updated_on');
        assert.property(res.body, 'open');
        assert.property(res.body, '_id');
        done();
      });
  });

  test('Create an issue with only required fields', function (done) {
    chai
      .request(server)
      .post('/api/issues/test_project')
      .send({
        issue_title: 'Test Title',
        issue_text: 'Test Text',
        created_by: 'Test Creator',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'issue_title');
        assert.property(res.body, 'issue_text');
        assert.property(res.body, 'created_by');
        assert.property(res.body, 'assigned_to');
        assert.property(res.body, 'status_text');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'updated_on');
        assert.property(res.body, 'open');
        assert.property(res.body, '_id');
        done();
      });
  });

  test('Create an issue with missing required fields', function (done) {
    chai
      .request(server)
      .post('/api/issues/test_project')
      .send({
        issue_title: 'Test Title',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  test('View issues on a project', function (done) {
    chai
      .request(server)
      .get('/api/issues/test_project')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test('View issues on a project with one filter', function (done) {
    chai
      .request(server)
      .get('/api/issues/test_project')
      .query({ issue_title: 'Test Title' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test('View issues on a project with multiple filters', function (done) {
    chai
      .request(server)
      .get('/api/issues/test_project')
      .query({ issue_title: 'Test Title', issue_text: 'Test Text' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test('Update one field on an issue', function (done) {
    chai
      .request(server)
      .put('/api/issues/test_project')
      .send({ _id: 1, issue_title: 'Updated Title' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'result');
        assert.equal(res.body.result, 'successfully updated');
        done();
      });
  });

  test('Update multiple fields on an issue', function (done) {
    chai
      .request(server)
      .put('/api/issues/test_project')
      .send({ _id: 1, issue_title: 'Updated Title', issue_text: 'Updated Text' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'result');
        assert.equal(res.body.result, 'successfully updated');
        done();
      });
  });

  test('Update an issue with missing _id', function (done) {
    chai
      .request(server)
      .put('/api/issues/test_project')
      .send({ issue_title: 'Updated Title', issue_text: 'Updated Text' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('Update an issue with no fields to update', function (done) {
    chai
      .request(server)
      .put('/api/issues/test_project')
      .send({ _id: 1 })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  test('Update an issue with an invalid _id', function (done) {
    chai
      .request(server)
      .put('/api/issues/test_project')
      .send({ _id: 'invalid', issue_title: 'Updated Title' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  test('Delete an issue', function (done) {
    chai
      .request(server)
      .delete('/api/issues/test_project')
      .send({ _id: 1 })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'result');
        assert.equal(res.body.result, 'successfully deleted');
        done();
      });
  });

  test('Delete an issue with an invalid _id', function (done) {
    chai
      .request(server)
      .delete('/api/issues/test_project')
      .send({ _id: 'invalid' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });

  test('Delete an issue with missing _id', function (done) {
    chai
      .request(server)
      .delete('/api/issues/test_project')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});
