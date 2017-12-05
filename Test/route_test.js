'use strict';

const { expect } = require('chai');
const request = require('supertest-as-promised');
const app = require('../Server/server');
const db = require('../Server/db/_db');

describe('Packages Route:', () => {

  beforeEach(() => {
    return db.sync({ force: true });
  });

  describe('GET /packages', () => {
    it('responds with an array via JSON', () => {
      return request(app)
        .get('/api/packages')
        .expect(200)
        .then(res => {
          expect(res.body).to.be.an('array');
        });
    });
  });
});
