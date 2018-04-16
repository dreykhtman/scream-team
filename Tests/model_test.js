'use strict';

const { expect } = require('chai');
const db = require('../Server/db/_db');
const Site = require('../Server/db/models/Site');

describe('Site model', () => {
  beforeEach(() => {
    return db.sync({ force: true });
  });

  describe('attributes definition', () => {
    let github;

    beforeEach(() => {
      return Site.create({
        url: 'github.com',
        goalHrs: 5,
        type: 'green'
      })
      .then(site => {
        github = site;
      });
    });

    it('includes `url`, `goalHrs`, `goalMins`, `type` fields', () => {
      expect(github.url).to.equal('github.com');
      expect(github.goalHrs).to.equal(5);
      expect(github.goalMins).to.equal(0);
      expect(github.type).to.equal('green');
    });

    it('assigns default goal time', () => {
      expect(github.goalMins).to.equal(0);
    });
  });// end describe('attributes definition')
}); // end describe('Site model')
