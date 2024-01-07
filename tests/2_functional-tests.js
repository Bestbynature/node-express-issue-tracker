const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const {Issue} = require('../routes/api')
chai.use(chaiHttp);

suite('Functional Tests', function () {

  let testId; 

  before(async function () {
    const issue = await Issue.findOne({}, '_id').exec();
    testId = issue._id;
  });


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
        try {
          assert.equal(res.status, 200, `Expected status 200, but got ${res.status}`);
          assert.isArray(res.body, 'Response body should be an array');
          assert.isAtLeast(res.body.length, 1, 'Expected at least one issue in the response');
          console.log(res.body[0]);
          done();
        } catch (error) {
          done(error); 
        }
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
      .send({ _id: testId, issue_title: 'Updated Title' })
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
      .send({ _id: testId, issue_title: 'Updated Title multiple', issue_text: 'Updated Text multiple' })
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
        assert.equal(res.status, 400);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('Update an issue with no fields to update', function (done) {
    chai
      .request(server)
      .put('/api/issues/test_project')
      .send({
      })
      .end(function (err, res) {
        assert.equal(res.status, 400);
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
        assert.equal(res.status, 500);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  test('Delete an issue', function (done) {
    chai
      .request(server)
      .delete('/api/issues/test_project')
      .send({ _id: testId })
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
        assert.equal(res.status, 400);
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
        assert.equal(res.status, 400);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});
