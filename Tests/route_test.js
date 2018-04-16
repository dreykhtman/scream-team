'use strict';

const { expect } = require('chai');
const request = require('supertest-as-promised');
const app = require('../Server/server');
const db = require('../Server/db/_db');
const Package = require('../Server/db/models/Package');
const Site = require('../Server/db/models/Site');

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
          expect(res.body).to.have.length(0);
        });
    });

    it('returns a package if there is one in the database', async () => {

      let searchAddictPackage = await Package.build({
        name: 'Search Addict'
      }).save();

      let sites = await Site.build({
        url: 'www.google.com',
        goalHrs: 0,
        goalMins: 30,
        type: 'red'
      }).save();

      await searchAddictPackage.addSite(sites);

      () => {
        return agent
          .get('/packages')
          .expect(200)
          .expect((res) => {
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.length(1);
            expect(res.body[0].url).to.equal('www.google.com');
            expect(res.body[0].goalHrs).to.equal(0);
            expect(res.body[0].goalMins).to.equal(30);
            expect(res.body[0].type).to.equal('red');
          });
      };
    }); // end it('returns a package if there is one in the database')
  }); // end describe('GET /packages')
});
