const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
chai.use(chaiHttp);

suite("Functional Tests", function () {
  const project = "test_project";

  let id1 = "";
  let id2 = "";

  test("Create an issue with every field", function (done) {
    chai
      .request(server)
      .post(`/api/issues/${project}`)
      .send({
        issue_title: "Test Title",
        issue_text: "Test Text",
        created_by: "Test Creator",
        assigned_to: "Test Assignee",
        status_text: "Test Status",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "issue_title");
        assert.property(res.body, "issue_text");
        assert.property(res.body, "created_by");
        assert.property(res.body, "assigned_to");
        assert.property(res.body, "status_text");
        assert.property(res.body, "created_on");
        assert.property(res.body, "updated_on");
        assert.property(res.body, "open");
        assert.property(res.body, "_id");
        id1 = res.body._id;
        done();
      });
  });

  test("Create an issue with only required fields", function (done) {
    chai
      .request(server)
      .post(`/api/issues/${project}`)
      .send({
        issue_title: "Test Title 2",
        issue_text: "Test Text 2",
        created_by: "Test Creator 2",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "issue_title");
        assert.property(res.body, "issue_text");
        assert.property(res.body, "created_by");
        assert.property(res.body, "assigned_to");
        assert.property(res.body, "status_text");
        assert.property(res.body, "created_on");
        assert.property(res.body, "updated_on");
        assert.property(res.body, "open");
        assert.property(res.body, "_id");
        id2 = res.body._id;
        done();
      });
  });

  test("Create an issue with missing required fields", function (done) {
    chai
      .request(server)
      .post(`/api/issues/${project}`)
      .send({
        issue_title: "Test Title",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
  });

  test("View issues on a project", function (done) {
    chai
      .request(server)
      .get(`/api/issues/${project}`)
      .end(function (err, res) {
        try {
          assert.equal(
            res.status,
            200,
            `Expected status 200, but got ${res.status}`
          );
          assert.isArray(res.body, "Response body should be an array");
          assert.isAtLeast(
            res.body.length,
            1,
            "Expected at least one issue in the response"
          );
          done();
        } catch (error) {
          done(error);
        }
      });
  });

  test("View issues on a project with one filter", function (done) {
    chai
      .request(server)
      .get(`/api/issues/${project}`)
      .query({ issue_title: "Test Title" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test("View issues on a project with multiple filters", function (done) {
    chai
      .request(server)
      .get(`/api/issues/${project}`)
      .query({ issue_title: "Test Title", issue_text: "Test Text" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test("Update an issue with an invalid _id", function (done) {
    chai
      .request(server)
      .put(`/api/issues/${project}`)
      .send({ _id: "invalid", issue_title: "Updated Title" })
      .end(function (err, res) {
        assert.equal(res.status, 500);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "could not update");
        done();
      });
  });

  test("Update an issue with missing _id", function (done) {
    chai
      .request(server)
      .put(`/api/issues/${project}`)
      .send({ issue_title: "Updated Title", issue_text: "Updated Text" })
      .end(function (err, res) {
        assert.equal(res.status, 400);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });

  test("Update an issue with no fields to update", function (done) {
    chai
      .request(server)
      .put(`/api/issues/${project}`)
      .send({
        _id: id1,
      })
      .end(function (err, res) {
        assert.equal(res.status, 400);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "no update field(s) sent");
        done();
      });
  });

  test("Update one field on an issue", function (done) {
    chai
      .request(server)
      .put(`/api/issues/${project}`)
      .send({ _id: id1, issue_title: "Updated Title" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "result");
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, id1);
        done();
      });
  });

  test('Update multiple fields on an issue', function (done) {
    chai
      .request(server)
      .put(`/api/issues/${project}`)
      .send({ _id: id2, issue_title: 'Updated Title multiple', issue_text: 'Updated Text multiple' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'result');
        assert.equal(res.body.result, 'successfully updated');
        done();
      });
  });

  test('Delete an issue', function (done) {
    chai
      .request(server)
      .delete(`/api/issues/${project}`)
      .send({ _id: id1 })
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
      .delete(`/api/issues/${project}`)
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
      .delete(`/api/issues/${project}`)
      .end(function (err, res) {
        assert.equal(res.status, 400);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});
