describe('The time converter function', function () {
  it('converts military time into standard format', function () {
    let result = convertTime('13:13');
    expect(result).toEqual('1:13PM');
  });
});

describe('The URL converter function', function () {
  it('extracts the domain from a long URL', function () {
    let result = getDomainNoPrefix('https://upload.wikimedia.org/wikipedia/commons/7/72/German_garden_gnome.jpg');
    expect(result).toEqual('wikimedia.org');
  });
});
