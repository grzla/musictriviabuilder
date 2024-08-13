describe('transformData', () => {
    it('should capture Release Year correctly', async () => {
      const { expect } = await import('chai');
      const { transformData } = await import('../lib/db/util/sqlScripts/importLibrary.js');
  
      const parsedData = [
        { 'Artist': 'Artist1', 'Title': 'Title1', 'Release Year': '1990' },
        { 'Artist': 'Artist2', 'Title': 'Title2', 'Release Year': 2000 },
        { 'Artist': 'Artist3', 'Title': 'Title3', 'Release Year': null },
      ];
  
      const transformedData = transformData(parsedData);
  
      expect(transformedData).to.deep.equal([
        { artist: 'Artist1', title: 'Title1', year: 1990 },
        { artist: 'Artist2', title: 'Title2', year: 2000 },
        { artist: 'Artist3', title: 'Title3', year: null },
      ]);
    });
  });